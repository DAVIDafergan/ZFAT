const express = require('express');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const path = require('path');
const auth = require('../middleware/auth');
const { editorOrAbove } = require('../middleware/adminOnly');
const { hasS3Config, uploadFileToS3 } = require('../utils/s3Upload');

const router = express.Router();

const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'יותר מדי העלאות קבצים' },
});

const MAX_UPLOAD_BYTES = 80 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_UPLOAD_BYTES,
  },
  fileFilter: (req, file, callback) => {
    const normalizedName = (file.originalname || '').toLowerCase();
    const fileExtension = path.extname(normalizedName);
    const isPdfByExtension = fileExtension === '.pdf';
    const allowed = (
      file.mimetype.startsWith('image/')
      || file.mimetype.startsWith('video/')
      || file.mimetype === 'application/pdf'
      || (isPdfByExtension && file.mimetype === 'application/octet-stream')
    );
    if (!allowed) {
      return callback(new Error('סוג קובץ לא נתמך'));
    }
    return callback(null, true);
  },
});

const uploadSingle = (req, res, next) => upload.single('file')(req, res, (err) => {
  if (!err) return next();
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'הקובץ גדול מדי. ניתן להעלות עד 80MB.' });
  }
  return res.status(400).json({ message: err.message || 'העלאת הקובץ נכשלה' });
});

router.post('/', uploadLimiter, auth, editorOrAbove, uploadSingle, async (req, res) => {
  try {
    if (!hasS3Config) {
      return res.status(503).json({ message: 'S3 לא מוגדר בשרת' });
    }
    if (!req.file?.buffer) {
      return res.status(400).json({ message: 'לא נבחר קובץ להעלאה' });
    }

    const folder = typeof req.body?.folder === 'string' ? req.body.folder : 'admin';
    const uploaded = await uploadFileToS3({
      buffer: req.file.buffer,
      contentType: req.file.mimetype,
      originalName: req.file.originalname,
      folder,
    });

    return res.status(201).json({
      url: uploaded.url,
      key: uploaded.key,
      size: req.file.size,
      contentType: req.file.mimetype,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'העלאה נכשלה' });
  }
});

module.exports = router;

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
const crypto = require('crypto');

const s3Region = process.env.AWS_S3_REGION || process.env.AWS_REGION || '';
const s3Bucket = process.env.AWS_S3_BUCKET || '';
const s3PublicBaseUrl = (process.env.AWS_S3_PUBLIC_BASE_URL || '').trim().replace(/\/$/, '');
const s3UploadPrefix = (process.env.AWS_S3_UPLOAD_PREFIX || 'uploads').trim().replace(/^\/+|\/+$/g, '');

const hasS3Config = Boolean(s3Region && s3Bucket && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);

const s3Client = hasS3Config
  ? new S3Client({ region: s3Region })
  : null;

const buildObjectUrl = (key) => {
  if (s3PublicBaseUrl) {
    return `${s3PublicBaseUrl}/${key}`;
  }
  return `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${key}`;
};

const sanitizeFolder = (folder = 'admin') => (
  `${folder}`
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9/_-]/g, '')
    .replace(/^\/+|\/+$/g, '')
    || 'admin'
);

const buildObjectKey = (originalName, folder) => {
  const extension = path.extname(originalName || '').replace(/[^.a-zA-Z0-9]/g, '').toLowerCase();
  const safeExt = extension && extension.length <= 10 ? extension : '';
  const datePrefix = new Date().toISOString().slice(0, 10);
  const uniqueId = crypto.randomUUID();
  const cleanedFolder = sanitizeFolder(folder);
  return `${s3UploadPrefix}/${cleanedFolder}/${datePrefix}/${uniqueId}${safeExt}`;
};

const uploadFileToS3 = async ({ buffer, contentType, originalName, folder }) => {
  if (!s3Client || !hasS3Config) {
    throw new Error('S3 is not configured');
  }

  const key = buildObjectKey(originalName, folder);
  await s3Client.send(new PutObjectCommand({
    Bucket: s3Bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType || 'application/octet-stream',
    CacheControl: 'public, max-age=31536000, immutable',
  }));

  return {
    key,
    url: buildObjectUrl(key),
  };
};

module.exports = {
  hasS3Config,
  uploadFileToS3,
};

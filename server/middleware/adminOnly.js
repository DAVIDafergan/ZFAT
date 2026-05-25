const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'גישה מותרת למנהלים בלבד' });
  }
  next();
};

const editorOrAbove = (req, res, next) => {
  if (!req.user || !['admin', 'editor'].includes(req.user.role)) {
    return res.status(403).json({ message: 'גישה מותרת לעורכים ומנהלים בלבד' });
  }
  next();
};

module.exports = { adminOnly, editorOrAbove };

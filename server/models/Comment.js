const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  userId: { type: String, default: null },
  userName: { type: String, required: true },
  content: { type: String, required: true },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: String }],
  approved: { type: Boolean, default: false },
}, { timestamps: true });

commentSchema.index({ postId: 1, approved: 1, createdAt: -1 });
commentSchema.index({ approved: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);

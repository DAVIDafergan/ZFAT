const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const Agent = require('../models/Agent');
const BoardListing = require('../models/BoardListing');
const auth = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');
const validateObjectId = require('../middleware/validateObjectId');

const listLimiter = rateLimit({ windowMs: 60 * 1000, limit: 90, standardHeaders: true, legacyHeaders: false, message: { message: 'יותר מדי בקשות למתווכים' } });
const mutateLimiter = rateLimit({ windowMs: 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false, message: { message: 'יותר מדי פעולות ניהול מתווכים' } });

router.get('/', listLimiter, async (req, res) => {
  try {
    const agents = await Agent.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(agents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', mutateLimiter, auth, adminOnly, async (req, res) => {
  try {
    const agent = new Agent(req.body);
    await agent.save();
    res.status(201).json(agent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', mutateLimiter, auth, adminOnly, validateObjectId(), async (req, res) => {
  try {
    const objectId = mongoose.Types.ObjectId.createFromHexString(req.params.id);
    const agent = await Agent.findByIdAndDelete(objectId);
    if (!agent) return res.status(404).json({ message: 'המתווך לא נמצא' });

    await BoardListing.updateMany({ agentId: objectId }, { $unset: { agentId: '' } });

    res.json({ message: 'המתווך נמחק' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const ChallengeCompletion = require('../models/ChallengeCompletionSchema');
const mongoose = require('mongoose');

// Save a completed challenge
router.post('/complete', async (req, res) => {
  try {
    const { userId, challengeName, target, timeTaken } = req.body;
    const completion = new ChallengeCompletion({ userId, challengeName, target, timeTaken });
    await completion.save();
    res.status(201).json(completion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all completed challenges for a user
router.post('/getAllCompletions', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid userId' });
    }
    const completions = await ChallengeCompletion.find({ userId }).sort({ date: -1 });
    res.json(completions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get leaderboard for a challenge (or all)
router.get('/leaderboard/:challengeName', async (req, res) => {
  try {
    const { challengeName } = req.params;
    const completions = await ChallengeCompletion.find(
      challengeName === 'all' ? {} : { challengeName }
    )
      .populate('userId', 'firstName emailId')
      .sort({ timeTaken: 1 }); // Fastest first
    res.json(completions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 
const mongoose = require('mongoose');

const ChallengeCompletionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  challengeName: { type: String, required: true },
  target: { type: Number, required: true },
  timeTaken: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChallengeCompletion', ChallengeCompletionSchema); 
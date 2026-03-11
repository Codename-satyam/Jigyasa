const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: false, index: true },
    quizTitle: { type: String },
    name: { type: String },
    email: { type: String },
    score: { type: Number, min: 0 },
    percentage: { type: Number, min: 0, max: 100 },
    totalQuestions: { type: Number, min: 0 },
    correctAnswers: { type: Number, min: 0 },
    timeSpent: { type: Number, min: 0 },
    timestamp: { type: Date, default: Date.now },
});

ScoreSchema.index({ percentage: -1, score: -1, timeSpent: 1 });

module.exports = mongoose.model('Score', ScoreSchema);
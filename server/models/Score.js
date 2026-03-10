const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: false },
    quizTitle: { type: String },
    name: { type: String },
    email: { type: String },
    score: Number,
    percentage: Number,
    totalQuestions: Number,
    correctAnswers: Number,
    timeSpent: Number,
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Score', ScoreSchema);
const mongoose = require('mongoose');

const FlagSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    gameId: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' },
    reason: String,
    description: String,
    severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['open', 'reviewed', 'resolved'], default: 'open' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolution: String,
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Flag', FlagSchema);

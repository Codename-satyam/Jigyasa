const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    topicIndex: { type: Number, min: 0 },
    completedVideos: [Number],
    lastViewed: Number,
    lastViewedTime: Date,
    timestamp: { type: Date, default: Date.now },
});

ProgressSchema.index({ userId: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model('Progress', ProgressSchema);
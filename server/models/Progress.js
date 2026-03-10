const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject:String,
    topicIndex: Number,
    completedVideos: [Number],
    lastViewed: Number,
    lastViewedTime: Date,
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Progress', ProgressSchema);
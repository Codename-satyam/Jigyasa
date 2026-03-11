const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    topic: { type: String, required: true, index: true },
    difficulty: String,
    type: String,
    questions:[{
        id: String,
        question: { type: String, required: true },
        options: { type: [String], required: true },
        correct: { type: String, required: true },
        explanation: String,
    }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    createdByName: String,
    ispublished: { type: Boolean, default: false, index: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Quiz', QuizSchema);
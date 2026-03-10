const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
    title: String,
    description: String,
    topic: String,
    difficulty: String,
    type: String,
    questions:[{
        id: String,
        question: String,
        options: [String],
        correct: String,
        explanation: String,
    }],
    createdBy: mongoose.Schema.Types.ObjectId,
    createdByName: String,
    ispublished: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Quiz', QuizSchema);
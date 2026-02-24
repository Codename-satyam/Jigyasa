const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    gameId: String,
    gameName: String,
    score: Number,
    level: Number,
    timePlayed: Number,
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Game', GameSchema);
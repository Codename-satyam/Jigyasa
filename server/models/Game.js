const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    gameId: String,
    gameName: { type: String, index: true },
    score: { type: Number, min: 0 },
    level: { type: Number, min: 0 },
    timePlayed: { type: Number, min: 0 },
    timestamp: { type: Date, default: Date.now },
});

GameSchema.index({ gameName: 1, score: -1 });

module.exports = mongoose.model('Game', GameSchema);
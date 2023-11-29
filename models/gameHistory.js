const mongoose = require('mongoose')

const gameHistorySchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    battle_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Battle'
    },
    amount: {
        type: Number,
        trim: true
    },
    win_amount: {
        type: Number,
        trim: true
    },
    win_status: {
        type: Number,
        trim: true
    }

}, {
    timestamps: true
})

//win_status : 1-Win, 0-Loose
const GameHistory = mongoose.model('GameHistory', gameHistorySchema)

module.exports = GameHistory
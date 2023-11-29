const mongoose = require('mongoose')

const gameResultSchema = new mongoose.Schema({
    gameId: {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        trim: true,
        unique: true,
      },
      periodId: {
        required: true,
        type: String,
        trim: true,
        unique: true,
      },
      result: {
        type: Number,
        required: true,
      },
      declearstatus: {
        type: Number,
        default: 0,
      },
      resulttoken: {
        type: Number,
        required: true,
        unique: true,
      },

}, {
    timestamps: true
})

const GameResult = mongoose.model('GameResult', gameResultSchema)

module.exports = GameResult
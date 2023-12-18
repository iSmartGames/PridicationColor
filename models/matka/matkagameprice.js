const mongoose = require('mongoose')

const gamesSchema = new mongoose.Schema({
      gameType: {
        required: true,
        type: Number,
        unique: true,
      },
      gamePana: {
        required: true,
        type: String,
      },
      gamepoint: {
        required: true,
        type: Number,
      },
      gameprice: {
        required: true,
        type: Number,
      },
      status: {
        required: true,
        type: Number,
        default: 1,
      },
      
}, {
    timestamps: true
})

const MatkaGamePrice = mongoose.model('MatkaGamePrice', gamesSchema)

module.exports = MatkaGamePrice
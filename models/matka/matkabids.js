const mongoose = require('mongoose')

const gamesSchema = new mongoose.Schema({
    bid_id: {
        required: true,
        type: String,
        unique: true,
        trim: true,
      },
    game_id: {
        required: true,
        type: String,
      },
      gameId: {
        required: true,
        type: String,

      },
      user_id: {
        required: true,
        type: String,
      },
      gamename: {
        required: true,
        type: String,
      },
      pana: {
        required: true,
        type: String,
      },
      session: {
        type: String,
      },
      digits: {
        type: Number,
        required: true,
      },
      closedigits: {
        type: Number,
      },
      points: {
        type: Number,
        required: true,
      },
      bid_date: {
        type: String,
        required: true,
      },
      bid_tx_id: {
        unique: true,
        type: String,
        required: true,
      },
      status: {
        type: Number,
        required: true,
        default:1,
      },
      paystatus: {
        type: Number,
        required: true,
        default:0,
      },
      openresulttoken: {
        type: String,
      },
      closeresulttoken: {
        type: String,
      },
      
}, {
    timestamps: true
})

const MatkaBids = mongoose.model('MatkaBids', gamesSchema)

module.exports = MatkaBids
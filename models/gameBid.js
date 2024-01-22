const mongoose = require('mongoose')
var aggregatePaginate = require("mongoose-aggregate-paginate-v2")

const gameBidSchema = new mongoose.Schema({
      gameId: {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        trim: true,
      },
      periodId: {
        required: true,
        type: String,
        trim: true,
      },
      user_id: {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        trim: true,
        ref: 'User'
      },   
      periodcolor: {
        type: Number,
        required: true,
      },
      periodpoint: {
        type: Number,
        required: true,
      },
      bidtxn_order: {
        required: true,
        type: Number,
      },
      paystatus: {
        type: Number,
        default: 0,
      },
      resulttoken: {
        type: Number,
      },
}, {
    timestamps: true
})

const GameBid = mongoose.model('GameBid', gameBidSchema)

module.exports = GameBid
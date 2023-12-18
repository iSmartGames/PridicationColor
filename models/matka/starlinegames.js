const mongoose = require('mongoose')

const gamesSchema = new mongoose.Schema({
      gameId: {
        required: true,
        type: String,
        unique: true,
        trim: true,
      },
      opentime: {
        required: true,
        type: String,
      },
      closetime: {
        required: true,
        type: String,
      },
      gamename: {
        required: true,
        type: String,
      },
      status: {
        required: true,
        type: Number,
        default: 1,
      },
      imgicon: {
        type: String,
      },
      marketstatus: {
        required: true,
        type: Number,
        default: 0,
      },
      marketoffday: {
        type: String,
      },
      
}, {
    timestamps: true
})

const StarLinegames = mongoose.model('StarLinegames', gamesSchema)

module.exports = StarLinegames
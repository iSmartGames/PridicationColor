const mongoose = require('mongoose')

const gamesSchema = new mongoose.Schema({
      periodId: {
        required: true,
        type: String,
        unique: true,
        trim: true,
      },
      starttime: {
        required: true,
        type: Date,
      },
      bidstoptime: {
        required: true,
        type: Date,
      },
      stoptime: {
        required: true,
        type: Date,
      },
      status: {
        required: true,
        type: Number,
        default: 1,
      },
      resultstatus: {
        required: true,
        type: Number,
        default: 0,
      },
      result: {
        type: Number,
      },
      active: {
        type: Boolean,
        default: true,
        select: false,
      },

}, {
    timestamps: true
})

const Games = mongoose.model('Games', gamesSchema)

module.exports = Games
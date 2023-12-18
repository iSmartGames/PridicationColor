const mongoose = require('mongoose')

const gamesSchema = new mongoose.Schema({
    result_id: {
        required: true,
        type: String,
        unique: true,
        trim: true,
      },
      game_id: {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MatkaGames'
      },
      gameId: {
        required: true,
        type: String,
      },
      opennumber: {
        required: true,
        type: Number,
      },
      opendigit: {
        type: Number,
      },
      closenumber: {
        type: Number,
      },
      closedigit: {
        type: Number,
      },
      opendeclerestatus: {
        type: Number,
      },
      closedeclerestatus: {
        type: Number,
      },
      openresulttoken: {
        type: String,
      },
      closeresulttoken: {
        type: String,
      },
      gameDate: {
        type: Date,
      },
}, {
    timestamps: true
})

const MatkaResults = mongoose.model('MatkaResults', gamesSchema)

module.exports = MatkaResults
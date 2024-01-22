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
        ref: 'Galidiswargames'
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
      opendeclerestatus: {
        type: Number,
      },
      openresulttoken: {
        type: String,
      },
      gameDate: {
        required: true,
        type: Date,
      },
}, {
    timestamps: true
})

const GalidiswarResults = mongoose.model('GalidiswarResults', gamesSchema)

module.exports = GalidiswarResults
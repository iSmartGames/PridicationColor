const mongoose = require('mongoose')

const gamesSchema = new mongoose.Schema({
    bannernotice: {
        type: String,
      },
      bannerimage: {
        type: String,
      },
    
      
}, {
    timestamps: true
})

const Banner = mongoose.model('Banner', gamesSchema)

module.exports = Banner
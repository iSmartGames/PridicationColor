const mongoose = require('mongoose')

const howtoPlaySchema = new mongoose.Schema({

    app_play_title: {
        type: String,
        trim: true
    },
    app_play_description: {
        type: String,
        trim: true
    },
    app_play_link: {
        type: String,
        trim: true
    },
    app_play_status: {
        type: Boolean,
        default:true,
    },


}, {
    timestamps: true
})

const HowtoPlay = mongoose.model('HowtoPlay', howtoPlaySchema)

module.exports = HowtoPlay
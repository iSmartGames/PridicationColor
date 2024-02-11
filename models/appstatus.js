const mongoose = require('mongoose')

const appStatusSchema = new mongoose.Schema({

    app_status: {
        type: Boolean,
        default : true
    },
     
}, {
    timestamps: true
})

const AppStatus = mongoose.model('AppStatus', appStatusSchema)

module.exports = AppStatus
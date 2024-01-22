const mongoose = require('mongoose')

const appContactSchema = new mongoose.Schema({

    app_contact_whatsapp: {
        type: String,
        trim: true
    },
    app_contact_phone: {
        type: String,
        trim: true
    },
    app_contact_email: {
        type: String,
        trim: true
    },
    app_contact_telegram: {
        type: String,
        trim: true
    },


}, {
    timestamps: true
})

const AppContact = mongoose.model('AppContact', appContactSchema)

module.exports = AppContact
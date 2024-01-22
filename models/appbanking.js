const mongoose = require('mongoose')

const appBankingSchema = new mongoose.Schema({

    app_upi_address: {
        type: String,
        trim: true
    },
    app_upi_name: {
        type: String,
        trim: true
    },
    app_usdt_address: {
        type: String,
        trim: true
    },
    app_usdt_description: {
        type: String,
        trim: true
    },
    app_btc_address: {
        type: String,
        trim: true
    },
    app_btc_description: {
        type: String,
        trim: true
    },
    app_bnk_description: {
        type: String,
        trim: true
    },
   

}, {
    timestamps: true
})

const AppBanking = mongoose.model('AppBanking', appBankingSchema)

module.exports = AppBanking
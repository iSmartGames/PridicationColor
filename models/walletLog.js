const mongoose = require('mongoose')

const walletLogSchema = new mongoose.Schema({
    txn_order: {
        type: Number,
        trim: true,
        unique: true,
    },
    order_id: {
        type: String,
        trim: true
    },
    payment_id: {
        type: String,
        trim: true
    },
    signature: {
        type: String,
        trim: true
    },
    error_code: {
        type: String,
        trim: true
    },
    error_description: {
        type: String,
        trim: true
    },
    error_source: {
        type: String,
        trim: true
    },
    error_step: {
        type: String,
        trim: true
    },
    error_reason: {
        type: String,
        trim: true
    },
}, {
    timestamps: true
})

const WalletLog = mongoose.model('WalletLog', walletLogSchema)

module.exports = WalletLog
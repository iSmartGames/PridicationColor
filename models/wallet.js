const mongoose = require('mongoose')
 //----- txn_type 1- Credit ,2 -Debit
const walletSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    txn_order:{
        required: true,
        type: Number,
        trim: true,
        unique: true,
    },
    order_id: {
        type: String,
        trim: true
    },
    txn_type: {
        type: Number,
        trim: true
    },
    amount_status: {
        type: Number,
        trim:true
    },
    amount: {
        type: Number,
        trim: true
    },
    txnnote: {
        type: String,
        trim: true
    },
    currency: {
        type: String,
        trim: true
    },
    receipt: {
        type: String,
        trim: true
    },
    status: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true
})


const Wallet = mongoose.model('Wallet', walletSchema)

module.exports = Wallet
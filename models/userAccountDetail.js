const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const validator = require('validator')

const userAccountDetailSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    account_type: {
        type: String,
        trim: true
    },
    fa_id: {
        type: String,
        trim: true
    },
    vpa_address: {
        type: String,
        trim: true
    },
    vpa_name: {
        type: String,
        trim: true
    },
    
    vpa_type: {
        type: String,
        trim: true
    },
    btc_address: {
        type: String,
        trim: true
    },
    usdt_address: {
        type: String,
        trim: true
    }
    ,
    account_number: {
        type: Number,
        trim: true
    },
    account_ifsc: {
        type: String,
        trim: true
    },
    account_acholder: {
        type: String,
        trim: true
    }
    ,
    widrow_default: {
        type: Boolean,
        default:true
    }
    ,
    account_status: {
        type: Boolean,
        default:true
    }
}, {
    timestamps: true
})

const UserAccountDetail = mongoose.model('UserAccountDetail', userAccountDetailSchema)

module.exports = UserAccountDetail
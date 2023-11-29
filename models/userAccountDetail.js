const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const validator = require('validator')

const userAccountDetailSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: true,
        ref: 'User'
    },
    account_type: {
        type: String,
        required: true,
        trim: true
    },
    fa_id: {
        type: String,
        required: true,
        trim: true
    },
    vpa_address: {
        type: String,
        trim: true
    },
    vpa_name: {
        type: String,
        trim: true
    }

}, {
    timestamps: true
})

const UserAccountDetail = mongoose.model('UserAccountDetail', userAccountDetailSchema)

module.exports = UserAccountDetail
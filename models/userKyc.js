const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const validator = require('validator')

const userKycSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: true,
        ref: 'User'
    },
    first_name: {
        type: String,
        required: true,
        trim: true
    },
    email_id: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    dob: {
        type: String,
        trim: true,
        default: ""
    },
    aadhar_number: {
        type: String,
        trim: true,
    },
    aadhar_front: {
        type: String,
        trim: true,
    },
    aadhar_back: {
        type: String,
        trim: true,
    }

}, {
    timestamps: true
})

const UserKyc = mongoose.model('UserKyc', userKycSchema)

module.exports = UserKyc
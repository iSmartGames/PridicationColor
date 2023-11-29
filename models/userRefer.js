const mongoose = require('mongoose')

const userReferSchema = new mongoose.Schema({
    refer_by: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    refer_to: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    refer_code: {
        type: String,
        trim: true
    },
    amount: {
        type: Number,
        trim: true,
        required: true,
    }

}, {
    timestamps: true
})

const UserRefer = mongoose.model('UserRefer', userReferSchema)

module.exports = UserRefer
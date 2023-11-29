const mongoose = require('mongoose')

const userWalletSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    join_battle_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'JoinBattle'
    },
    admin_approval_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'AdminMaster'
    },
    wallet_type: {
        type: Number,
        trim: true
    },
    amount: {
        type: Number,
        trim: true
    }

}, {
    timestamps: true
})

//wallet_type : 1-Topup, 2-Payout, 3-Win, 4-Lose, 5-Cancel
const UserWallet = mongoose.model('UserWallet', userWalletSchema)

module.exports = UserWallet
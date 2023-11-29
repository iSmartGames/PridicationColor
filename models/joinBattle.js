const mongoose = require('mongoose')
var aggregatePaginate = require("mongoose-aggregate-paginate-v2")

const joinBattleSchema = new mongoose.Schema({
    battle_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Battle'
    },
    amount: {
        type: Number,
        required: true,
        trim: true
    },
    c_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    j_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    win_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'User'
    },
    lose_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'User'
    },
    cancel_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'User'
    },
    admin_commission: {
        type: Number,
        trim: true
    },
    admin_commission_value: {
        type: Number,
        trim: true
    }

}, {
    timestamps: true
})

joinBattleSchema.plugin(aggregatePaginate)


const JoinBattle = mongoose.model('JoinBattle', joinBattleSchema)

module.exports = JoinBattle
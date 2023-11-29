const mongoose = require('mongoose')

const battleResultSchema = new mongoose.Schema({
    battle_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Battle'
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    battle_result: {
        type: Number,
        trim: true
    },
    image: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    }

}, {
    timestamps: true
})

//battle_result : 1-Sucess, 0-Fail, 2-Cancel
const BattleResult = mongoose.model('BattleResult', battleResultSchema)

module.exports = BattleResult
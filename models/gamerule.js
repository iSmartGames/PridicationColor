const mongoose = require('mongoose')

const gameRuleSchema = new mongoose.Schema({

    app_rule_title: {
        type: String,
        trim: true
    },
    app_rule_description: {
        type: String,
        trim: true
    },

    app_rule_status: {
        type: Boolean,
        default:true,
    },


}, {
    timestamps: true
})

const GameRule = mongoose.model('GameRule', gameRuleSchema)

module.exports = GameRule
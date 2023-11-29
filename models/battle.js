const mongoose = require('mongoose')
var aggregatePaginate = require("mongoose-aggregate-paginate-v2")

const battleSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    amount: {
        type: Number,
        trim: true
    },
    room_code: {
        type: String,
        trim: true,
        default: ''
    },
    status: {
        type: Number,
        default: 0,
    }

}, {
    timestamps: true
})

// status : 0-Running Battle, 1-Completed Battle, 2-Cancel the battle by user, 3-Joined Battle, 4-Pending for Approval

battleSchema.plugin(aggregatePaginate)
const Battle = mongoose.model('Battle', battleSchema)
module.exports = Battle
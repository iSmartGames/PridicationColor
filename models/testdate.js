const mongoose = require('mongoose')

const TestTimeSchema = new mongoose.Schema({
    game_time: {
        type: String,
    },
 

}, {
    timestamps: true
})

const TestTime = mongoose.model('TestTime', TestTimeSchema)

module.exports = TestTime
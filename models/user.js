const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const validator = require('validator')
const Battle = require('./battle')
var aggregatePaginate = require("mongoose-aggregate-paginate-v2")


const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        trim: true
    },
    last_name: {
        type: String,
        trim: true
    },
    email_id: {
        type: String,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    mobile: {
        type: Number,
        trim: true,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        trim: true,
        required: true,
    },
    otp: {
        type: Number,
    },
    wallet_amount: {
        type: Number,
        trim: true,
        default: 0
    },
    razor_contact_id: {
        type: String,
        trim: true,
        default: ""
    },
    kyc: {
        type: Number,
        trim: true,
        default: 0
    },
    refer_code: {
        type: String,
        trim: true
    },
    playstatus: {
        type: Boolean,
        default: false,
    },
    status: {
        type: Boolean,
        default: true,
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]

}, {
    timestamps: true
})

// kyc: 0-Pending, 1-Completed, 2-Rejected, 3-Pending for approval

userSchema.virtual('battles', {
    ref: 'Battle',
    localField: '_id',
    foreignField: 'user_id'
})

userSchema.virtual('userKyc', {
    ref: 'UserKyc',
    localField: '_id',
    foreignField: 'user_id'
})

userSchema.methods.toJSON = function() {
    const user = this
    const userObject = user.toObject()

    delete userObject.password

    return userObject
}

// userSchema.virtual('joinBattles', {
//     ref: 'JoinBattle',
//     localField: '_id',
//     foreignField: 'c_user_id'
// })

// userSchema.virtual('joinBattles', {
//     ref: 'JoinBattle',
//     localField: '_id',
//     foreignField: 'j_user_id'
// })

// userSchema.virtual('joinBattles', {
//     ref: 'JoinBattle',
//     localField: '_id',
//     foreignField: 'win_user_id'
// })

// userSchema.virtual('joinBattles', {
//     ref: 'JoinBattle',
//     localField: '_id',
//     foreignField: 'lose_user_id'
// })

// userSchema.virtual('joinBattles', {
//     ref: 'JoinBattle',
//     localField: '_id',
//     foreignField: 'cancel_user_id'
// })


userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, "color-prdtct")
    user.tokens = user.tokens.concat({ token })
    await user.save()
}

// Hash the plain text password before saving
userSchema.pre('save', async function(next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

// Find user credentials in DB for login
userSchema.statics.findByCredentials = async(mobile, otp) => {

    const user = await User.findOne({ mobile })
    
    if (!user) {
        throw new Error('Unable to login')
    }
    console.log(user.otp);
    console.log("OTP -"+otp);
    
    if(user.otp!==otp) {
        throw new Error('Unable to login OTP')
    }

    return user
}

// Find user in DB
userSchema.statics.findByUsers = async(mobile) => {
    const user = await User.findOne({ mobile })
    if (!user) {
        throw new Error('Unable to login')
    }
    return user
}

userSchema.plugin(aggregatePaginate)

const User = mongoose.model('User', userSchema)

module.exports = User
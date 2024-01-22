const mongoose = require('mongoose')

const settingMasterSchema = new mongoose.Schema({
    sitename: {
        type: String,
        required: true,
        trim: true
    },
    admin_email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    smtp_host: {
        type: String,
        required: true,
        trim: true
    },
    smtp_user: {
        type: String,
        required: true,
        trim: true
    },
    smtp_pass: {
        type: String,
        required: true,
        trim: true
    },
    protocol: {
        type: String,
        required: true,
        trim: true
    },
    smtp_port: {
        type: String,
        required: true,
        trim: true
    },
    smtp_timeout: {
        type: String,
        required: true,
        trim: true
    },
    admin_commission: {
        type: Number,
        trim: true
    },
    
    admin_upidetails: {
        type: String,
        trim: true
    },
    threshold_limit_bid: {
        type: Number,
        trim: true
    },
    threshold_limit_topup: {
        type: Number,
        trim: true
    },
    threshold_min_limit_payout: {
        type: Number,
        trim: true
    },
    threshold_max_limit_payout: {
        type: Number,
        trim: true
    }

}, {
    timestamps: true
})

const SettingMaster = mongoose.model('SettingMaster', settingMasterSchema)

module.exports = SettingMaster
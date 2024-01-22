const express = require("express");
const session = require('express-session');
const router = express.Router();
const mongoose = require("mongoose")
const auth = require('../../middleware/auth')
const Settings = require('../../models/settingMaster')

// Update settings
router.post('/settings/update', async(req, res) => {
    const data = req.body
    try {
        const settings = {
            sitename: data.sitename,
            admin_email: data.admin_email,
            smtp_host: data.smtp_host,
            smtp_user: data.smtp_user,
            smtp_pass: data.smtp_pass,
            protocol: data.protocol,
            smtp_port: data.smtp_port,
            smtp_timeout: data.smtp_timeout,
            admin_commission: data.admin_commission,
            threshold_limit_topup: data.threshold_limit_topup,
            threshold_limit_payout: data.threshold_limit_payout,
            admin_upidetails:data.admin_upidetails,
            threshold_limit_bid:data.threshold_limit_bid,
        }
        await Settings.findOneAndUpdate({ _id: data._id }, settings)
        var response = {
            status: true
        }
        res.status(201).send(response)
    } catch (e) {
        var response = {
            status: false,
            error: e
        }
        res.status(202).send(response)
    }
});

// Update settings
router.get('/settings/get', async(req, res) => {
    try {
        const settings = await Settings.find().exec()
        var response = {
            settings: settings[0],
            status: true
        }
        res.status(201).send(response)
    } catch (e) {
        var response = {
            status: false,
            error: e
        }
        res.status(202).send(response)
    }
});


module.exports = router;
const express = require("express");
const session = require('express-session');
const router = express.Router();
const mongoose = require("mongoose")
const Admin = require('../../models/adminMaster')

// Admin Login
router.post('/admin/login', async(req, res) => {
    try {
        const admin = await Admin.findByCredentials(req.body.email_id, req.body.password)
        var response = {
            status: true,
            admin
        }
        res.status(200).send(response)
    } catch (e) {
        var response = {
            status: false,
            error: e,
        }
        res.status(401).send(response)
    }
});
module.exports = router;

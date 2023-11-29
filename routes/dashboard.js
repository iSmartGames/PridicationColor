const express = require("express");
const session = require('express-session');
const router = express.Router();
const User = require('../models/user')
const auth = require('../middleware/auth')
const { check, validationResult } = require('express-validator');
// const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account')


router.get('/dashboard', (req, res) => {
    res.render("dashboard")
})

module.exports = router;
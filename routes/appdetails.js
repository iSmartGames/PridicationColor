const express = require("express");
const session = require('express-session');
const router = express.Router();
const auth = require('../middleware/auth')
const { check, validationResult } = require('express-validator')
const mongoose = require("mongoose")

const  AppBanking = require("../models/appbanking");
const  AppContcat = require("../models/appcontact");
const  Settings = require('../models/settingMaster');
const  Howtoplay = require('../models/howtoplay');
const  Gamerule = require('../models/gamerule');


// App Get banking
router.get('/app/appbanking',auth, async(req, res) => {
    try {
        
        const settings = await AppBanking.find().exec()
        console.log(settings);
        var response = {
            appabnking: settings[0],
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

// App Get Contact Details
router.get('/app/contactdetails',auth, async(req, res) => {
    try {
        const contact = await AppContcat.find().exec()
        console.log(contact);
        var response = {
            appcontact: contact[0],
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

// App Get How to Play Details
router.get('/app/gethowtoplay',auth, async(req, res) => {
    try {
        const howtoplay = await Howtoplay.find();
        console.log(howtoplay);
        var response = {
            data: howtoplay,
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

// App Get Game Rules Details
router.get('/app/getgamerules',auth, async(req, res) => {
    try {
        const gamerule = await Gamerule.find();
        console.log(gamerule);
        var response = {
            data: gamerule,
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

// Get settings
router.get('/settings/getforuser',auth, async(req, res) => {
    try {
        
        const settings = await Settings.find().exec()
        console.log(settings);
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

// Function to generate a random OTP
function genTxnId() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

module.exports = router;
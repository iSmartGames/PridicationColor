const express = require("express");
const session = require('express-session');
const router = express.Router();
const mongoose = require("mongoose")
const AppBanking = require('../../models/appbanking')

// Admin Login

router.post('/admin/banking', async(req, res) => {
    try {

        const placeBid = await AppBanking.create({
            app_upi_address : req.body.appupiaddress,
            app_upi_name: req.body.appupiname,
            app_usdt_address:req.body.appusdtaddress,
            app_usdt_description:req.body.appusdtdescription,
            app_btc_address:req.body.appbtcaddress,
            app_btc_description:req.body.appbtcdescription,
            app_bnk_description:req.body.appbnkdescription,
          });
          
        var response = {
            status: true,
            placeBid
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

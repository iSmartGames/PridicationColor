const express = require("express");
const session = require('express-session');
const router = express.Router();
const mongoose = require("mongoose");
const Galidiswargames = require("../../../models/matka/galidiswargames");


// Matka Game Create
router.post('/galidiswar/create', async(req, res) => {

console.log("log");
    var game = await Galidiswargames.create({
        gameId: generateUniqueID(),
        opentime: req.body.opentime,
        closetime: req.body.closetime,
        gamename:req.body.gamename,
        status:1,
        marketstatus:1,
        marketoffday:1,
    });

      res.status(400).json({
        msg:"Succesfull",
      });

    });
    

    function generateUniqueID() {
        const timestamp = new Date().getTime();
        const randomPart = Math.floor(Math.random() * 100);
        return `${timestamp}`;
      }

module.exports = router;
const express = require("express");
const session = require('express-session');
const router = express.Router();
const mongoose = require("mongoose");
const StarLinegames = require("../../../models/matka/starlinegames");


// Matka Game Create
router.post('/starline/create', async(req, res) => {


    var game = await StarLinegames.create({
        gameId: generateUniqueID(),
        opentime: req.body.opentime,
        gamename:req.body.opentime,
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
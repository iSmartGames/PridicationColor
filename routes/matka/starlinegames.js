const express = require("express");
const session = require('express-session');
const router = express.Router();
const mongoose = require("mongoose")
const auth = require('../../middleware/auth');
const StarLinegames = require("../../models/matka/starlinegames");


// Get Matka Running Game
router.get('/starline/getmatkagame',auth, async(req, res) => {
  
    const games = await StarLinegames.find({status: 1,});

    if (games) {
        res.status(201).json({
          status: "success", 
          data:games,
        });
      } 
      else
      {
 
        res.status(2002).json({
            status: "fail", 
          });
      }
   
});


module.exports = router;
const express = require("express");
const session = require('express-session');
const router = express.Router();
const mongoose = require("mongoose")
const auth = require('../middleware/auth')
const Games = require('../models/games')
const User = require('../models/user')
const GameBid = require('../models/gameBid')
const Wallet = require('../models/wallet')
// Update settings


// Update settings
router.get('/games/getgames',auth, async(req, res) => {
  
    const games = await Games.findOne({status: 1,});
    if (games) {
        res.status(201).json({
          status: "success", 
          data:games,
        });
      } 
      else
      {
 

      }

   
});



// Play Pridication Games
router.post('/games/playgames',auth, async(req, res) => {
  
  var user = await User.findOne({ _id: req.user._id, });
  if (user.wallet_amount < req.body.point) {
    res.status(404).json({
      status: "fail", 
      msg:"Sufficient Points Not available",
    });
  }

  var game = await Games.findOne({ _id: req.body.gameid, });
  if(game.status!=1)
  {
    res.status(404).json({
      status: "fail", 
      msg:"Game is Not Active",
    });
  }

  if(new Date(game.bidstoptime)<new Date())
  {
    res.status(404).json({
      status: "fail", 
      msg:"Game is Stop Bid",
    });
  }





  const randomString = generaterendom();
  
  const placeBid = await GameBid.create({
    gameId: req.body.gameid,
    periodId:game.periodId,
    user_id:user._id,
    periodcolor:req.body.bidcolor,
    periodpoint:req.body.point,
    txn_order:randomString,
    paystatus:0,
  });


  const wallet = await Wallet.create({
    user_id: user._id,
    txn_order:randomString,
    txn_type:2,
    amount:req.body.point,
    txnnote:"Color Bid Placed"

  });


user.wallet_amount = user.wallet_amount-req.body.point;
await user.save();

  res.status(200).json({
    status: "Success", 
    msg:"Bid Placed Successfully",
    placeBid:user.wallet,
  });

 
});

// Function to generate a random OTP
function generaterendom() {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

/*
function generateRandomString(length) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    result += charset.charAt(randomIndex);
  }
  return result;
}
*/
module.exports = router;
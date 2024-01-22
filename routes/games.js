const express = require("express");
const session = require('express-session');
const router = express.Router();
const mongoose = require("mongoose")
const auth = require('../middleware/auth')
const Games = require('../models/games')
const User = require('../models/user')
const GameBid = require('../models/gameBid')
const Wallet = require('../models/wallet');
const GameResult = require("../models/gameResult");
const Battle = require("../models/battle");

// socketio service
//const { app, io, cors, server } = require('../services/socketio');

// Get Running Game
router.get('/games/getgames',auth, async(req, res) => {
  
    const games = await Games.findOne({status: 1,});
    if (games) {
        res.status(201).json({
          status: "success", 
          data:games,
        });
      } 
     
   
});


// Play Pridication Games
router.post('/games/playgames',auth, async(req, res) => {
  

  if(req.user.wallet_amount< req.body.point) {
    res.status(404).json({
      status: "fail", 
      msg:"Sufficient Points Not available",
    });
    return;
  }

  var game = await Games.findOne({ _id: req.body.gameid, });
  if(game.status!=1)
  {
    res.status(404).json({
      status: "fail", 
      msg:"Game is Not Active",
    });
    return;
  }

  if(new Date(game.bidstoptime)<new Date())
  {
    res.status(404).json({
      status: "fail", 
      msg:"Game is Stop Bid",
    });
    return;
  }





  const randomString = generaterendom();
  
  const placeBid = await GameBid.create({
    gameId: req.body.gameid,
    periodId:game.periodId,
    user_id:req.user._id,
    periodcolor:req.body.bidcolor,
    periodpoint:req.body.point,
    bidtxn_order:randomString,
    paystatus:0,
  });


  const wallet = await Wallet.create({
    user_id: req.user._id,
    txn_order:randomString,
    txn_type:2,
    amount:req.body.point,
    amount_status:14,
    txnnote:"Color Bid Placed"

  });


const user = await User.findByIdAndUpdate(req.user._id, { wallet_amount: req.user.wallet_amount-req.body.point });

  res.status(200).json({
    status: "Success", 
    msg:"Bid Placed Successfully",
    placeBid:user.wallet,
  });

 
});
/*
// Get Orders or Bids -
router.get('/games/getorders',auth, async(req, res) => {
  
  const games = await GameBid.find({user_id:req.user._id,});
  if (games) {
      res.status(201).json({
        status: "success", 
        data:games,
      });
    } 
    else
    {
      res.status(200).json({
        status: "fail", 
        msg:"Data Not Found",
      });

    }

 
});
*/
//Get Today Result
router.get('/games/gettodayresult',auth, async(req, res) => {
  
   // Get today's date
   const today = new Date();
   const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
   const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

   // Find documents where a date field matches today's date
   const documents = await GameResult.find({
    createdAt: {
       $gte: startOfToday,
       $lt: endOfToday
     }
   });

  if (documents.length!=0) {
      res.status(200).json({
        status: "success", 
        data:documents,
      });
    }
    else{
      res.status(400).json({
        status: "Not Found",
      });
    }
});


// Get Orders or Bids - Color Pridication
  router.get('/games/getorders',auth, async(req, res) => {

    console.log(req.user._id);

    const battle = await GameBid.aggregate([{
      $match: {
        user_id : req.user._id,
      }
  },
  {
    $lookup: {
      from: "wallets",
      localField: "bidtxn_order",
      foreignField: "txn_order",
      as: "pridicationbid"
    }
  },
  {
    $lookup: {
      from: "wallets",
      localField: "resulttoken",
      foreignField: "txn_order",
      as: "pridicationwin"
    }
  },
    ]);
  
    console.log(battle);
 
      res.status(200).json({
        status: "success", 
        msg:"Data Found",
        data:battle
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
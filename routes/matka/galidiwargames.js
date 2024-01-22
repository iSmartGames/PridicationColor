const express = require("express");
const session = require('express-session');
const router = express.Router();
const mongoose = require("mongoose")
const auth = require('../../middleware/auth');
const GalidiswarBids = require("../../models/matka/galidiswarbids");
const moment = require('moment-timezone');
const Wallet = require("../../models/wallet");
const User = require("../../models/user");
const Banner = require("../../models/matka/banner");
const GalidiswarResults = require("../../models/matka/galidiswarresults");
const { MongoClient, ObjectId } = require('mongodb');

const Galidiswargames = require("../../models/matka/galidiswargames");



// Get Gali Disawar Matka Running Game
router.get('/galidiswar/getmatkagame',auth, async(req, res) => {

  const utcDate =moment().tz("Asia/Kolkata").format();
  const matchDate = new Date(moment(utcDate).startOf('day').toISOString());
  
          const battle = await Galidiswargames.aggregate([
            {
              $lookup: {
                from: "galidiswarresults",
                localField: "_id", // Field from the products collection
                foreignField: "game_id",
                pipeline: [
                  {
                    $match:{
                      gameDate: matchDate                 
                    }
                     }], // Field from the orders collection
                as: "galidiswarresult"
              }
            }
            
          ]);
          
            res.status(201).json({
              status: "success", 
              data:battle,
            });
  });

// Get Matka Game Status
router.post('/galidiswar/getmatkagamestatus',auth, async(req, res) => {
  try {
    const utcDate =moment().tz("Asia/Kolkata").format();
    const matchDate = new Date(moment(utcDate).startOf('day').toISOString());
    const battle = await Galidiswargames.aggregate([
                {
                  $match: {
                    _id: new ObjectId(req.body._id)
                  },
                },

                  {
                  $lookup: {
                    from: "galidiswarresults",
                    localField: "_id", // Field from the products collection
                    foreignField: "game_id",
                    pipeline: [
                      {
                       $match:{
                    gameDate: matchDate                 
                  }
                        }], // Field from the orders collection
                    as: "galidiswarresult"
                  }
                }
              
                ]);

      res.status(200).json({
        status: "success", 
        data:battle,
      });

  } catch (error) {
    console.error('Error occurred:', error);
    return error; // Handle or return the error as required
  } 

});


// POST Play Gali Diswar Matka  game
router.post('/galidiswar/playmatkagame',auth, async(req, res) => {
  try {
   
    if(req.user.wallet_amount<req.body.totalpoint)
    {
      res.status(202).json({
        status: "fail", 
        msg:"Please Wallet Amount is less Please Add More for this"
      });
    }
    
    const games = await Galidiswargames.findOne({gameId: req.body.gameId,});
  
    if(!games)
    {
      res.status(202).json({
        status: "fail", 
        msg:"This Game Not Found"
      });
    }
  
  
    if(games.status==0)
    {
      res.status(202).json({
        status: "fail", 
        msg:"This Game Stopped"
      });
    }
  
  
    
    if(games.marketstatus==0)
    {
      res.status(202).json({
        status: "fail", 
        msg:"This Game Stopped"
      });
    }
  
    const currentTimeIST = moment().tz('Asia/Kolkata');
  
    var opentimestring = games.opentime;
    const openhours = opentimestring.substring(0, 2);
    const openminutes = opentimestring.substring(3);
    const opentimeToCompare = currentTimeIST.clone().set({ hour: openhours, minute: openminutes, second: 0 });
  
  
  
  
    if(req.body.gmetype== "2" )
    {
/*
      if (currentTimeIST.isAfter(opentimeToCompare, 'minute')) {
        res.status(202).json({
          status: "fail", 
          msg:"Market Bid Closed for Jodi"
        });
        return;
      }
  */
   
      const bidsData = JSON.parse(req.body.bids);
      const result =bidsData.forEach(async (data) => {
        try {
            
          const randomString = generaterendom();
          console.log("making placing Bid")
          const placeBid = await GalidiswarBids.create({
            bid_id : generaterendom(),
            game_id: req.body._id,
            gameId:req.body.gameId,
            user_id:req.user._id,
            gamename:req.body.gamename,
            pana:data.pana,
            digits:data.digit,
            closedigits:data.closedigits,
            points:data.Point,
            bid_date:new Date(),
            bid_tx_id:randomString,
            status:1,
            paystatus:0,
          });
  
          const wallet = await Wallet.create({
            user_id: req.user._id,
            txn_order:randomString,
            txn_type:2,
            amount:data.Point,
            txnnote:"Matka Bid Placed"
          
          });
          
          const user = await User.findByIdAndUpdate(req.user._id, { wallet_amount: req.user.wallet_amount-data.Point });
          
          console.log(`Successfully inserted: ${placeBid}`);
        } catch (error) {
            console.error(`Error inserting data: ${error}`);
        }
    });
  
    res.status(200).json({
      status: "Success", 
      msg:"Bid Placed Successfully",
      placeBid:result,
    });
      
  
    }
  
  

  
  } catch (error) {
   
  }
  });

    // Get Gali diswar Matka Game Bid History 
router.post('/galidiswar/matkagamehistory',auth, async(req, res) => {

  const battle = await GalidiswarBids.aggregate([{
    $match: {
      user_id : new ObjectId(req.user._id),
    }
},
{
  $lookup: {
    from: "wallets",
    localField: "bid_tx_id",
    foreignField: "txn_order",
    as: "matkabid"
  }
},
{
  $lookup: {
    from: "wallets",
    localField: "resultpaytoken",
    foreignField: "txn_order",
    as: "matkawin"
  }
},
  ]);

  /*console.log(req.body._id);
  var battle = await MatkaResults.find({game_id: new ObjectId(req.body._id)});

    res.status(200).json({
      status: "success", 
      msg:"Data Found",
      data:battle
    });
 */

    res.status(200).json({
      status: "success", 
      msg:"Data Found",
      data:battle
    });

});

//Get Gali Diswar Matka Result - Name - for Result
router.post('/galidiswar/matkaresulthistory',auth, async(req, res) => {
  // Assuming 'istDateString' is the IST date string received from the Android app
  moment.suppressDeprecationWarnings = true;
  const utcDate = moment.tz(req.body.decleredate, 'Asia/Kolkata').utc().format();
  const dateupdate = moment(utcDate).startOf('day').toISOString();
    const battle = await Galidiswargames.aggregate([
      {
        $lookup: {
          from: "galidiswarresults",
          localField: "_id", // Field from the products collection
          foreignField: "game_id",
          pipeline: [
            {
              $match:{
                gameDate: new Date(dateupdate),
            }
               }], // Field from the orders collection
          as: "matkaresult"
        }
      }
      
    ]);
    
      res.status(201).json({
        status: "success", 
        data:battle,
      });
      
  });

function generaterendom() {
  const timestamp = new Date().getTime();
  return `${timestamp}`;
}
module.exports = router;
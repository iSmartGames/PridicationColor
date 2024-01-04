const express = require("express");
const session = require('express-session');
const router = express.Router();
const mongoose = require("mongoose")
const auth = require('../../middleware/auth');
const MatkaGames = require("../../models/matka/matkagames");
const MatkaBids = require("../../models/matka/matkabids");
const moment = require('moment-timezone');
const Wallet = require("../../models/wallet");
const User = require("../../models/user");
const Banner = require("../../models/matka/banner");
const MatkaResults = require("../../models/matka/matkaresults");
const { MongoClient, ObjectId } = require('mongodb');

// Get Matka Running Game
router.get('/matkagame/getmatkagame',auth, async(req, res) => {
 
        // Get the current date
        const today = new Date();
        // Set the time to the beginning of the day
        today.setHours(0, 0, 0, 0);

        const battle = await MatkaGames.aggregate([
          {
            $lookup: {
              from: "matkaresults",
              localField: "_id", // Field from the products collection
              foreignField: "game_id",
              pipeline: [
                {
                  $match:{
                 createdAt: {
                    $gte: today, // Greater than or equal to today's start
                    $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // Less than tomorrow's start
                  }
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

// Get Matka App Banner-Text
router.get('/matkagame/banner',auth, async(req, res) => {
  var game = await Banner.findOne();
  if(game==null)
  {
    res.status(202).json(game);
  }else{
    res.status(200).json(game);
  }

});

// Get Matka Game Status
router.post('/matkagame/getmatkagamestatus',auth, async(req, res) => {
  try {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const battle = await MatkaGames.aggregate([
                {

                  $match: {
                    _id: new ObjectId(req.body._id)
                  },
                },

                  {
                  $lookup: {
                    from: "matkaresults",
                    localField: "_id", // Field from the products collection
                    foreignField: "game_id",
                    pipeline: [
                      {
                        $match:{
                        createdAt: {
                          $gte: today, // Greater than or equal to today's start
                          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // Less than tomorrow's start
                        }
                      }
                        }], // Field from the orders collection
                    as: "matkaresult"
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


// Get Matka playmatka game
router.post('/matkagame/playmatkagame',auth, async(req, res) => {
  
try {
  
  if(req.user.wallet_amount<req.body.totalpoint)
  {
    res.status(202).json({
      status: "fail", 
      msg:"Please Wallet Amount is less Please Add More for this"
    });
  }
  
  const games = await MatkaGames.findOne({gameId: req.body.gameId,});

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



  var closetimestring = games.closetime;
  const closehours = closetimestring.substring(0, 2);
  const closeminutes = closetimestring.substring(3);
  const closetimeToCompare = currentTimeIST.clone().set({ hour: closehours, minute: closeminutes, second: 0 });
  

  if(req.body.gmetype== "1" || req.body.gmetype == "3" || req.body.gmetype == "4" || req.body.gmetype == "5" || req.body.gmetype == "8"|| req.body.gmetype == "9")
  {

    if(req.body.session=='open')
    {
      
      if (currentTimeIST.isAfter(opentimeToCompare, 'minute')) {
        res.status(202).json({
          status: "fail", 
          msg:"Open Session Closed"
        });
        return;
      }

    }
    

    if(req.body.session=='close')
    {
      if (currentTimeIST.isAfter(closetimeToCompare, 'minute')) {
        res.status(202).json({
          status: "fail", 
          msg:"Close Session Closed"
        });
        return;
      }

    }
    
    const bidsData = JSON.parse(req.body.bids);
    const result =bidsData.forEach(async (data) => {
      try {
          
        const randomString = generaterendom();
        console.log("making placing Bid")
        const placeBid = await MatkaBids.create({
          bid_id : generaterendom(),
          game_id: req.body._id,
          gameId:req.body.gameId,
          user_id:req.user._id,
          gamename:req.body.gamename,
          pana:data.pana,
          session:req.body.session,
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
    
/*
  const randomString = generaterendom();
  console.log("making placing Bid")
  const placeBid = await MatkaBids.create({
    bid_id : generaterendom(),
    game_id: req.body._id,
    gameId:req.body.gameId,
    user_id:req.user._id,
    gamename:req.body.gamename,
    pana:req.body.pana,
    session:req.body.session,
    digits:req.body.digit,
    closedigits:req.body.closedigits,
    points:req.body.Point,
    bid_date:new Date(),
    bid_tx_id:randomString,
    status:1,
    paystatus:0,
  });
*/

  }

  if(req.body.gmetype== "2" )
  {
    if (currentTimeIST.isAfter(opentimeToCompare, 'minute')) {
      res.status(202).json({
        status: "fail", 
        msg:"Market Bid Closed for Jodi"
      });
      return;
    }

 
    const bidsData = JSON.parse(req.body.bids);
    const result =bidsData.forEach(async (data) => {
      try {
          
        const randomString = generaterendom();
        console.log("making placing Bid")
        const placeBid = await MatkaBids.create({
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


  if(req.body.gmetype== "6" )
  {
    if (currentTimeIST.isAfter(opentimeToCompare, 'minute')) {
      res.status(202).json({
        status: "fail", 
        msg:"Market Bid Closed for Jodi"
      });
      return;
    }

    const bidsData = JSON.parse(req.body.bids);
    const result =bidsData.forEach(async (data) => {
      try {
        const randomString = generaterendom();
        console.log("making placing Bid")
        const placeBid = await MatkaBids.create({
          bid_id : generaterendom(),
          game_id: req.body._id,
          gameId:req.body.gameId,
          user_id:req.user._id,
          gamename:req.body.gamename,
          pana:data.pana,
          digits:data.digit,
          closedigits:data.closedigits,
          session:req.body.session,
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



/*
  if(req.body.gmetype== "6")
  {

    if(req.body.session=='open')
    {
      
      if (currentTimeIST.isAfter(opentimeToCompare, 'minute')) {
        res.status(202).json({
          status: "fail", 
          msg:"Open Session Closed"
        });
        return;
      }

    }
    

    if(req.body.session=='close')
    {
      if (currentTimeIST.isAfter(closetimeToCompare, 'minute')) {
        res.status(202).json({
          status: "fail", 
          msg:"Close Session Closed"
        });
        return;
      }

    }

    
    

  const randomString = generaterendom();
  console.log("making placing Bid")
  const placeBid = await MatkaBids.create({
    bid_id : generaterendom(),
    game_id: req.body._id,
    gameId:req.body.gameId,
    user_id:req.user._id,
    gamename:req.body.gamename,
    pana:req.body.pana,
    session:req.body.session,
    digits:req.body.digit,
    closedigits:req.body.closedigits,
    points:req.body.Point,
    bid_date:new Date(),
    bid_tx_id:randomString,
    status:1,
    paystatus:0,
  });


  }
*/


  if(req.body.gmetype== "7")
  {
    if (currentTimeIST.isAfter(opentimeToCompare, 'minute')) {
      res.status(202).json({
        status: "fail", 
        msg:"Close Session Closed"
      });
      return;
    }

  const bidsData = JSON.parse(req.body.bids);
  const result =bidsData.forEach(async (data) => {
    try {
        
      const randomString = generaterendom();
      console.log("making placing Bid")
      const placeBid = await MatkaBids.create({
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

// Get Matka Result for Chart
router.post('/matkagame/matkaresult',auth, async(req, res) => {
  console.log(req.body._id);
  var battle = await MatkaResults.find({game_id: new ObjectId(req.body._id)});

    res.status(200).json({
      status: "success", 
      msg:"Data Found",
      data:battle
    });
 

});

// Function to generate a random OTP

function generaterendom() {
  const timestamp = new Date().getTime();
  return `${timestamp}`;
}

module.exports = router;
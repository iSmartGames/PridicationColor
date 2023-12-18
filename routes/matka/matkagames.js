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

// Get Matka Running Game
router.get('/matkagame/getmatkagame',auth, async(req, res) => {
  /*
    const games = await MatkaGames.find({status: 1,});



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
*/
        // Get the current date
        const currentDate = new Date();
        // Set the time to the beginning of the day
        currentDate.setHours(0, 0, 0, 0);
/*

      const battle = await MatkaGames.aggregate([{
        $match: {status: 1,}
    },
    {
      $lookup: {
        from: "matkagames",
        localField: "game_id", // Field from the products collection
        foreignField: "_id", // Field from the orders collection
        as: "related_orders"
      }
   
    },
          ]).exec() .catch(err => {
           
          });
*/


const battle = await MatkaGames.aggregate([
  {
    $lookup: {
      from: "matkaresults",
      localField: "_id", // Field from the products collection
      foreignField: "game_id", // Field from the orders collection
      as: "matkaresult"
    }
  }
  
]);

          res.status(201).json({
            status: "success", 
            data:battle,
          });


   
});



// Get Matka Game Status
router.post('/matkagame/getmatkagamestatus',auth, async(req, res) => {
  
  const games = await MatkaGames.find({gameId: req.body.gameId,});

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



// Get Matka playmatka game
router.post('/matkagame/playmatkagame',auth, async(req, res) => {
  
try {
  

  if(req.user.wallet_amount<req.body.Point)
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


  

  if(req.body.gmetype== "1" || req.body.gmetype == "3" || req.body.gmetype == "4" || req.body.gmetype == "5")
  {

    console.log("Hello I am ");
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

  if(req.body.gmetype== "2")
  {
    if (currentTimeIST.isAfter(closetimeToCompare, 'minute')) {
      res.status(202).json({
        status: "fail", 
        msg:"Close Session Closed"
      });
      return;
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
    digits:req.body.digit,
    closedigits:req.body.closedigits,
    points:req.body.Point,
    bid_date:new Date(),
    bid_tx_id:randomString,
    status:1,
    paystatus:0,
  });


//Update Wallet After Bid
  
const wallet = await Wallet.create({
  user_id: req.user._id,
  txn_order:randomString,
  txn_type:2,
  amount:req.body.Point,
  txnnote:"Matka Bid Placed"

});

const user = await User.findByIdAndUpdate(req.user._id, { wallet_amount: req.user.wallet_amount-req.body.Point });
res.status(200).json({
  status: "Success", 
  msg:"Bid Placed Successfully",
  placeBid:user.wallet_amount,
});

  }


  if(req.body.gmetype== "6")
  {

    console.log("Hello I am ");
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

  if(req.body.gmetype== "7")
  {
    if (currentTimeIST.isAfter(closetimeToCompare, 'minute')) {
      res.status(202).json({
        status: "fail", 
        msg:"Close Session Closed"
      });
      return;
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
    digits:req.body.digit,
    closedigits:req.body.closedigits,
    points:req.body.Point,
    bid_date:new Date(),
    bid_tx_id:randomString,
    status:1,
    paystatus:0,
  });


//Update Wallet After Bid
  
const wallet = await Wallet.create({
  user_id: req.user._id,
  txn_order:randomString,
  txn_type:2,
  amount:req.body.Point,
  txnnote:"Matka Bid Placed"

});

const user = await User.findByIdAndUpdate(req.user._id, { wallet_amount: req.user.wallet_amount-req.body.Point });
res.status(200).json({
  status: "Success", 
  msg:"Bid Placed Successfully",
  placeBid:user.wallet_amount,
});

  }



} catch (error) {
 
}
});

// Function to generate a random OTP
function generaterendom() {
  return Math.floor(1000000 + Math.random() * 9000000).toString();
}

module.exports = router;
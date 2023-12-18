const express = require("express");
const session = require('express-session');
const router = express.Router();
const mongoose = require("mongoose");
const MatkaGames = require("../../../models/matka/matkagames");
const MatkaResults = require("../../../models/matka/matkaresults");
const MatkaGamePrice = require("../../../models/matka/matkagameprice");
const MatkaBids = require("../../../models/matka/matkabids");
const Wallet = require("../../../models/wallet");
const User = require("../../../models/user");
// Matka Game Create
router.post('/matkagame/create', async(req, res) => {

    console.log("hello")
    var game = await MatkaGames.create({
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
    
// Matka Game Result Declare
router.post('/matkagame/resultdeclare', async(req, res) => {

  console.log("hello Result Declere")
  
  var results = await MatkaResults.create({
    
    result_id: generateUniqueID(),
    game_id:req.body.game_id,
    gameId:req.body.gameId,
    opennumber:req.body.opennumber,
    opendigit:req.body.opendigit,
    closenumber:req.body.closenumber,
    closedigit:req.body.closedigit,
    opendeclerestatus:req.body.opendeclerestatus,
    closedeclerestatus:req.body.closedeclerestatus,
    openresulttoken:generateUniqueID(),
    closeresulttoken:generateUniqueID(),

  });
    res.status(200).json({
      msg:"Succesfull",
      results:results,
    });
  

  });



// Matka Game Payment Distribution
router.post('/matkagame/matkapaymentDistribution', async(req, res) => {

  console.log("Hello Payment Distribution")
  
  const matkaresult  = await MatkaResults.findOne({_id: req.body._id});

if(matkaresult.length ==0)
{
  console.log('No data found');
}
else
{

  if(matkaresult.opendeclerestatus==0)
  {

    var opennumber = matkaresult.opennumber;
    var opendigit = matkaresult.opendigit;
/*
    const filter = {
      $or: [
        { pana: 'Single Digit' , session: 'open', digits: opendigit }, 
        { pana: 'Single Pana' , session: 'open', digits: opennumber }, 
        { pana: 'Double Pana' , session: 'open', digits: opennumber },
        { pana: 'Triple Pana' , session: 'open', digits: opennumber },
      ]
    };
    const battle = await MatkaBids.find(filter);
*/
    const battle = await MatkaBids.aggregate([{
      $match: {
        $or: [
          { pana: 'Single Digit' , session: 'open', digits: opendigit }, 
          { pana: 'Single Pana' , session: 'open', digits: opennumber }, 
          { pana: 'Double Pana' , session: 'open', digits: opennumber },
          { pana: 'Triple Pana' , session: 'open', digits: opennumber },
        ]
      }
  },
  {
    $lookup: {
      from: "matkagameprices",
      localField: "pana",
      foreignField: "gamePana",
      as: "matkagmprice"
    }
  },
  {
      $unwind: '$matkagmprice'
  }
  ,
  {
    $project: {
      _id:1,
      bid_id:1,
      user_id:1,
      points:1,
      pana:1,
      session:1,
      "updatepoint": { $multiply: ["$points", "$matkagmprice.gameprice"] },

  }
  },
        ]).exec() .catch(err => {
         
        });;

        battle.forEach(async (document) => {
          console.log("User Id :"+document.user_id); 
          var randomString = generateUniqueID();

          await  MatkaBids.findOneAndUpdate({ _id: document._id }, { paystatus: 1,  openresulttoken: randomString, });

          await Wallet.create({
            user_id: document.user_id,
            txn_order:randomString,
            txn_type:3,
            amount:document.updatepoint,
            txnnote:"Win Matka  : "+document.pana+'-'+document.session
          });

          await User.findOneAndUpdate({ _id: document.user_id }, { wallet_amount: user.wallet_amount+document.updatepoint });

        });


        res.status(200).json({
          msg:"Succesfull",
          battle:battle,
        });
       // return;

       /* .then(result => {

          if (result) {
            res.status(200).json({
              msg:"Succesfull",
              battle:result,
            });
            return;
          }

        })
        
        .catch(err => {
         
        });
        */
/*
    console.log('opennumber :'+opennumber);
    console.log('opendigit :'+opendigit);
    res.status(200).json({
      msg:"Succesfull",
      battle:battle,
    });
    return;
*/
  }
  
  console.log('data found');
}




  });



// Matka Game Price Enter
router.post('/matkagame/matkagameprice', async(req, res) => {
console.log("Hello Game Price")

const filter = { gameType: req.body.gameType }; // Filter criteria to check existence
const update = { 
  gameType: req.body.gameType,
  gamePana: req.body.gamePana,
  gamepoint: req.body.gamepoint,
  gameprice:req.body.gameprice,
  status:1,
 }; // New document fields


const options = {
  upsert: true
};

const result = await MatkaGamePrice.updateOne(filter, { $set: update }, options);
if (result.upsertedCount > 0) {
  console.log('New document created:', update);
  res.status(200).json({
    msg:"Succesfull",
    update:update,
  });
  return;
} else {
  console.log('Document already exists:', update);

  res.status(200).json({
    msg:"Already Exist",
    update:update,
  });
  return;

}


});




    function generateUniqueID() {
        const timestamp = new Date().getTime();
        return `${timestamp}`;
      }

module.exports = router;
const express = require("express");
const session = require('express-session');
const router = express.Router();
const mongoose = require("mongoose")
const auth = require('../../middleware/auth')
const Games = require('../../models/games')
const GameBid = require('../../models/gameBid');
const GameResult = require("../../models/gameResult");
const Wallet = require("../../models/wallet");
const User = require("../../models/user");
// Update settings

// status - 1 Active, 2-Not Active, 3-closed

// Game Create
router.post('/games/create', async(req, res) => {
    var game = await Games.create({
        periodId: generaterendom(),
        starttime: Date(),
        bidstoptime: Date(),
        stoptime:Date(),
        status:2,
    });

    res.status(201).json({
        status: "success", 
        data:{
            game,
        }
      });

});


// Result Declear By Admin
router.post('/games/resultdecleare', async(req, res) => {
  try {
  var gamecheck = await Games.findOne({ _id: req.body.gameId })
  if(!gamecheck)
  {
    res.status(404).json({
      msg: "Not Found", 
    });
    return;
  }

  if(new Date(gamecheck.bidstoptime)>new Date())
  {
    res.status(404).json({
      status: "fail", 
      msg:"Game Running Can't Declere Result",
    });
    return;
  }

  if(gamecheck.resultstatus==1)
  {
    res.status(404).json({
      msg: "Result Already Decleared", 
    });
    return;
  }

    const noUserFlagGreenTwo = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const noUserFlagGreenOneHalf = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const noUserFlagRedTwo = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const noUserFlagRedOneHalf = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const noUserFlagVioletFourFive = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const noUserFlagDirect = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    
    const countFlagGreenTwo = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const countFlagGreenOneHalf = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const countFlagRedTwo = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const countFlagRedOneHalf = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const countFlagVioletFourFive = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const countFlagDirect = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];


    let countAmountnameGreenTwo=[];
    let countAmountnameGreenOneHalf=[];
    let countAmountnameRedTwo=[];
    let countAmountnameRedOneHalf=[];
    let countAmountnameFourFive=[];
    let countAmountnameDirect=[];

    const flagGreenTwo = [1, 3, 7, 9];
    const flagGreenOneHalf = [5];
    const flagRedTwo = [2, 4, 6, 8];
    const flagRedOneHalf = [0];
    const flagVioletFourFive = [0, 5];

        // Get the current date
        const currentDate = new Date();
        // Set the time to the beginning of the day
        currentDate.setHours(0, 0, 0, 0);


        let  normalAmount = 0;
        let  avgDistrubAmount = 0;

        var gamebid = await GameBid.find({gameId: req.body.gameId, createdAt: {
            $gte: currentDate, // Greater than or equal to the beginning of the current date
            $lt: new Date(currentDate.getTime() + 86400000) // Less than the beginning of the next date (24 hours later)
        }});

gamebid.forEach((document) => {
normalAmount += document.periodpoint;
let i = 0;
    while (i < 10) {
      let luckyDraw = i;
      if (document.periodcolor === 10) {
        if (flagGreenTwo.includes(luckyDraw)) {
          countFlagGreenTwo[luckyDraw] += document.periodpoint * 2;
          noUserFlagGreenTwo[luckyDraw] += 1;

          const arr = matchArray(countAmountnameGreenTwo, luckyDraw, document.user_id);
          if (arr[0] === 'true') {
            countAmountnameGreenTwo[arr[1]] = {
              number: luckyDraw,
              user: document.user_id,
              amount: document.periodpoint * 2 + arr[2]
            };
          } else {
            countAmountnameGreenTwo.push({
              number: luckyDraw,
              user: document.user_id,
              amount: document.periodpoint * 2
            });
          }
        }

        if (flagGreenOneHalf.includes(luckyDraw)) {
          countFlagGreenOneHalf[luckyDraw] += document.periodpoint * 1.5;
          noUserFlagGreenOneHalf[luckyDraw] += 1;

          const arr = matchArray(countAmountnameGreenOneHalf, luckyDraw, document.user_id);
          if (arr[0] === 'true') {
            countAmountnameGreenOneHalf[arr[1]] = {
              number: luckyDraw,
              user: document.user_id,
              amount: document.periodpoint * 1.5 + arr[2]
            };
          } else {
            countAmountnameGreenOneHalf.push({
              number: luckyDraw,
              user: document.user_id,
              amount: document.periodpoint * 1.5
            });
          }
        }
      }
      else
      if (document.periodcolor === 11) {
        
        if (flagRedTwo.includes(luckyDraw)) {
          countFlagRedTwo[luckyDraw] += document.periodpoint * 2;
          noUserFlagRedTwo[luckyDraw] += 1;

          const arr = matchArray(countAmountnameRedTwo, luckyDraw, document.user_id);

          console.log(arr);
          if (arr[0] === 'true') {
            countAmountnameRedTwo[arr[1]] = {
              number: luckyDraw,
              user: document.user_id,
              amount: document.periodpoint * 2 + arr[2]
            };
          } else {
            countAmountnameRedTwo.push({
              number: luckyDraw,
              user: document.user_id,
              amount: document.periodpoint * 2
            });
          }
        }
        

        if (flagRedOneHalf.includes(luckyDraw)) {
          countFlagRedOneHalf[luckyDraw] += document.periodpoint * 1.5;
          noUserFlagRedOneHalf[luckyDraw] += 1;

          const arr = matchArray(countAmountnameRedOneHalf, luckyDraw, document.user_id);
          if (arr[0] === 'true') {
            countAmountnameRedOneHalf[arr[1]] = {
              number: luckyDraw,
              user: document.user_id,
              amount: document.periodpoint * 1.5 + arr[2]
            };
          } else {
            countAmountnameRedOneHalf.push({
              number: luckyDraw,
              user: document.user_id,
              amount: document.periodpoint * 1.5
            });
          }
        }
        
      }
      else
      if (document.periodcolor === 12) {
        
        if (flagVioletFourFive.includes(luckyDraw)) {
          countFlagVioletFourFive[luckyDraw] += document.periodpoint * 4.5;
          noUserFlagVioletFourFive[luckyDraw] += 1;

          const arr = matchArray(countAmountnameFourFive, luckyDraw, document.user_id);
          if (arr[0] === 'true') {
            countAmountnameFourFive[arr[1]] = {
              number: luckyDraw,
              user: document.user_id,
              amount: document.periodpoint * 4.5 + arr[2]
            };
          } else {
            countAmountnameFourFive.push({
              number: luckyDraw,
              user: document.user_id,
              amount: document.periodpoint * 4.5
            });
          }
        }

      }
      else{

        if (document.periodcolor === luckyDraw) {
          countFlagDirect[luckyDraw] += document.periodpoint * 9;
          noUserFlagDirect[luckyDraw] += 1;

          const arr = matchArray(countAmountnameDirect, luckyDraw, document.user_id);
          if (arr[0] === 'true') {
            countAmountnameDirect[arr[1]] = {
              number: luckyDraw,
              user: document.user_id,
              amount: document.periodpoint * 9 + arr[2]
            };
          } else {
            countAmountnameDirect.push({
              number: luckyDraw,
              user: document.user_id,
              amount: document.periodpoint * 9
            });
          }
        }

      }
     

      i++;
    }
  });
    
avgDistrubAmount = (normalAmount *90) / 100;

let count_finalamt_belo_total=[];
let count_finalamt_avg_total=[];
let count_finalamt_above_total=[];
let count = 0;
while (count < 10) {
  const arr1 = countUserFund(countAmountnameGreenTwo, count);
  const arr2 = countUserFund(countAmountnameGreenOneHalf, count);
  const arr3 = countUserFund(countAmountnameRedTwo, count);
  const arr4 = countUserFund(countAmountnameRedOneHalf, count);
  const arr5 = countUserFund(countAmountnameFourFive, count);
  const arr6 = countUserFund(countAmountnameDirect, count);

  const wallet = arr1[0] + arr2[0] + arr3[0] + arr4[0] + arr5[0] + arr6[0];
  const user = arr1[1] + arr2[1] + arr3[1] + arr4[1] + arr5[1] + arr6[1];

  if (wallet <= avgDistrubAmount) {
      count_finalamt_belo_total.push({ number: count, wallet, totaluser: user });
  } else if (wallet > avgDistrubAmount && wallet < normalAmount) {
      count_finalamt_avg_total.push({ number: count, wallet, totaluser: user });
  } else if (wallet >= normalAmount) {
      count_finalamt_above_total.push({ number: count, wallet, totaluser: user });
  }
  
  count++;
}


let maxval = 0;
let resultkey;

if (count_finalamt_belo_total.length > 0) {
    const abcd = Math.max(...count_finalamt_belo_total.map(item => item.totaluser));
    
    for (const val of count_finalamt_belo_total) {
        if (val.wallet > maxval && val.totaluser === abcd) {
            maxval = val.wallet;
            resultkey = val.number;
        }
    }
} else if (count_finalamt_avg_total.length > 0) {
    let maxuser = 0;
    const amout = Math.min(...count_finalamt_avg_total.map(item => item.wallet));
    
    for (const val of count_finalamt_avg_total) {
        if (val.wallet === amout && val.totaluser > maxuser) {
            maxval = val.wallet;
            maxuser = val.totaluser;
            resultkey = val.number;
        }
    }
} else {
    let maxuser = 0;
    const amout = Math.min(...count_finalamt_above_total.map(item => item.wallet));
    
    for (const val of count_finalamt_above_total) {
        if (val.wallet === amout && val.totaluser > maxuser) {
            maxval = val.wallet;
            maxuser = val.totaluser;
            resultkey = val.number;
        }
    }
}


if(!resultkey)
{
  res.status(404).json({
    status: "fail", 
    msg:"Result Points Not Matched",
  });
}


var gamerestcheck = await GameResult.findOne({ gameId: req.body.gameId })

if(gamerestcheck)
{
  gamecheck.resultstatus = 1;
  await gamecheck.save();

  res.status(404).json({
    msg:"Already Decleared",
  });
}

var gameResult = await GameResult.create({
  gameId:req.body.gameId,
  periodId: req.body.periodId,
  result:resultkey,
  resulttoken:generaterendom(),
});

gamecheck.resultstatus = 1;
await gamecheck.save();

res.status(200).json({
  status: "success", 
  data:{
    gameResult,
  }
});

}catch(err)
{
  return err;
}

});

// Result Payment Distribution

router.post('/games/paymentDistrubution', async(req, res) => {

 var status= await GameResult.find({gameId: req.body.gameId});

 const flagGreenTwo = [1, 3, 7, 9];
 const flagGreenOneHalf = [5];
 const flagRedTwo = [2, 4, 6, 8];
 const flagRedOneHalf = [0];
 const flagVioletFourFive = [0, 5];

  if(!status)
  {
    res.status(404).json({
      status: "Record Not Found", 
      data:status,
    });
    return;
  }
  if(status.declearstatus==1)
  {
    res.status(200).json({
      status: "Alreasy Distributed",
      data:status,
    });
    return;
  }

  var gamebid = await GameBid.find({gameId: req.body.gameId, paystatus:0});

  const resultnumber = req.body.resultnumber;



  for (const document of gamebid) {

    if (document.periodcolor === 10) {
      if (flagGreenTwo.includes(resultnumber)) {
         let updateAmount = document.periodpoint * 2;
         await distrubatepoint(document,updateAmount);
      }
  
      if (flagGreenOneHalf.includes(resultnumber)) {
        let updateAmount = document.periodpoint * 1.5;
        await distrubatepoint(document,updateAmount);
      }
  
    }else
    if (document.periodcolor === 11) {
      if (flagRedTwo.includes(resultnumber)) {
        let  updateAmount = document.periodpoint * 2;
        await distrubatepoint(document,updateAmount);
      }
      if (flagRedOneHalf.includes(resultnumber)) {
        let updateAmount = document.periodpoint * 1.5;
        await distrubatepoint(document,updateAmount);
      }
    }
    if (document.periodcolor === 12) {
    
      if (flagVioletFourFive.includes(resultnumber)) {
        let  updateAmount = document.periodpoint * 4.5;
        await distrubatepoint(document,updateAmount);
      }
    }
    else
      {
       if (document.periodcolor === resultnumber) { 
        let updateAmount = document.periodpoint * 9;
        await distrubatepoint(document,updateAmount);
      }
    }
  }

    res.status(400).json({
      status: "Done", 
      data:resultnumber,
    });
    return;

});

// Function to generate a random OTP
function generaterendom() {
    return Math.floor(10000 + Math.random() * 90000).toString();
  }
// Function to generate a random OTP
function generaterendom() {
    return Math.floor(10000 + Math.random() * 90000).toString();
  }
  
/*********************************** */
  function matchArray(countAmountname, luckyDraw, valuee) {
    for (let value in countAmountname) {
      if (countAmountname.hasOwnProperty(value)) {
        const item = countAmountname[value];
        if (item.number === luckyDraw && item.user === valuee) {
          return ['true', value, item.amount];
        }
      }
    }
    return ['false'];
  }
  
/*************************************** */
  function countUserFund(count_abcd, lucky_draw1) {
    let amount = 0;
    let totaluser = 0;
    count_abcd.forEach(item => {
        if (item.number === lucky_draw1) {
            amount += item.amount;
            totaluser += 1;
        }
    });

    return [amount, totaluser];
}

// Function
async function distrubatepoint(document,updateAmount) {

    /* txn type- Game Win - 3*/
    var randomString = generaterendom();
     /* document to save */
    await  GameBid.findOneAndUpdate({ _id: document._id }, { paystatus: 1,  resulttoken: randomString, });
    const user = await User.findOne({ _id: document.user_id });
    await User.findOneAndUpdate({ _id: document.user_id }, { wallet_amount: user.wallet_amount+updateAmount });

    await Wallet.create({
      user_id: document.user_id,
      txn_order:randomString,
      txn_type:3,
      amount:updateAmount,
      txnnote:"Color ID : "+document.periodId
    });
   
  }
 


module.exports = router;
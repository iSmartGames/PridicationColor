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
const Banner = require("../../../models/matka/banner");
const moment = require('moment-timezone');
const multer = require('multer');


const cron = require('node-cron');
cron.schedule('*/10 * * * * *', () => {
  marketstatuscheck();
  });


  
/* Matka App Banner Text - Image Enter */
router.post('/matkagame/banner', async(req, res) => {

  var game = await Banner.findOne();
  if(game==null)
  {

    var game = await Banner.create({
      bannernotice: req.body.bannernotice,
      bannerimage:req.body.bannerimage,
    });
  }
  else
  {

    const settings = {
      bannernotice: req.body.bannernotice,
      bannerimage:req.body.bannerimage,
  }
  var game = await Banner.findOneAndUpdate({ _id: game._id }, settings)
  }

    res.status(400).json({
      msg:"Succesfull",
      game:game,
    });

  });


/* Matka Game Create */
router.post('/matkagame/create', async(req, res) => {

  const daysArray = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
  //const document = { marketworkday: daysArray };
    
    var game = await MatkaGames.create({
        gameId: generateUniqueID(),
        opentime: req.body.opentime,
        closetime: req.body.closetime,
        gamename:req.body.gamename,
        status:1,
        marketstatus:1,
        marketworkday:daysArray
    });

      res.status(400).json({
        msg:"Succesfull",
      });

    });
    
/* Matka Game Result Declare */
router.post('/matkagame/resultdeclare', async(req, res) => {
// Assuming 'istDateString' is the IST date string received from the Android app
moment.suppressDeprecationWarnings = true;
const utcDate = moment.tz(req.body.decleredate, 'Asia/Kolkata').utc().format();
const dateupdate = moment(utcDate).startOf('day').toISOString();

/*
// Convert IST string to UTC
const utcDate = moment.tz(req.body.decleredate).utc().format();
const utcDate1 =moment().tz(utcDate,"Asia/Kolkata").format();
let dateupdate = moment(utcDate1).startOf('day').toISOString();
*/
  var results = await MatkaResults.create({     
    result_id: generateUniqueID(),
    game_id:req.body.game_id,
    gameId:req.body.gameId,
    opennumber:req.body.opennumber,
    opendigit:req.body.opendigit,
    closenumber:req.body.closenumber,
    closedigit:req.body.closedigit,
    opendeclerestatus:0,
    closedeclerestatus:0,
    openresulttoken:generateUniqueID(),
    gameDate:new Date(dateupdate),
  });
  
    res.status(200).json({
      msg:"Succesfull",
      results:results,
    });
  

  });



// Matka Game Payment Distribution
router.post('/matkagame/matkapaymentDistribution', async(req, res) => {

  console.log("Hello Payment Distribution")
  
  const matkaresult  = await MatkaResults.findOne({_id: new Object(req.body._id)});

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

    console.log("opennumber : "+opennumber);
    console.log("opendigit : "+opendigit);
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
        $and: [{
          $or: [
            { pana: 'Single Digit' , session: 'open', digits: opendigit }, 
            { pana: 'Single Pana' , session: 'open', digits: opennumber }, 
            { pana: 'Double Pana' , session: 'open', digits: opennumber },
            { pana: 'Triple Pana' , session: 'open', digits: opennumber },
          ]
        },
        {paystatus:0},
       
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

        console.log("Battels "+battle);

        battle.forEach(async (document) => {
          console.log("User Id :"+document.user_id); 
          var randomString = generateUniqueID();

          await  MatkaBids.findOneAndUpdate({ _id: new Object(document._id)}, { paystatus: 1,  resultpaytoken: randomString, openresulttoken:document.openresulttoken });

          await Wallet.create({
            user_id: new Object(document.user_id),
            txn_order:randomString,
            txn_type:1,
            amount_status:7,
            amount:document.updatepoint,
            txnnote:"Win Matka  : "+document.pana+'-'+document.session
          });

         // await User.findOneAndUpdate({ _id: new Object(document.user_id) }, { wallet_amount: user.wallet_amount+document.updatepoint });

         await User.findOneAndUpdate(
          { _id: new Object(document.user_id) },
          { $inc: { wallet_amount: document.updatepoint } },
          { new: true } // To return the updated document
        );

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


     async function marketstatuscheck()
      {
       
        const currentTimeInIndia = moment().tz('Asia/Kolkata'); // Get current time in Indian Local Time
        const currentTimeInUTC = currentTimeInIndia.clone().utc(); // Convert to UTC
        
        const currtime  = currentTimeInUTC.toDate();
     
        const dateObject = new Date(currtime);
 
        const hours = dateObject.getHours().toString().padStart(2, '0');
        const minutes = dateObject.getMinutes().toString().padStart(2, '0');
        
        const time = hours+":"+minutes;

        console.log(time);

      const result =   await MatkaGames.findOneAndUpdate({
        $and: [
          { marketstatus: 1 }, // Condition 1: field1 equals value1
          { closetime: {
            $lt: time
          },
         }, // Condition 2: field2 greater than value2
          
          // Add more conditions if needed...
        ]
      },
      { $set: { marketstatus: 0 } },
      )

      //exit;

/*
        const result =   await MatkaGames.aggregate([
          {
            $match: {
              closetime: {
                $gt: time
              },
              marketstatus : 1,
            }
          }
        ])
        */
      }


      // Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads'); // Destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // File name in the destination folder
  },
});

const upload = multer({ storage });


// Handle image upload endpoint
router.post('/matkagame/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Save image path to MongoDB
    const newImage = new Banner({
      bannerimage: req.file.path,
    });

    await newImage.save();

    res.status(201).json({ message: 'Image uploaded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading image' });
  }
});



module.exports = router;
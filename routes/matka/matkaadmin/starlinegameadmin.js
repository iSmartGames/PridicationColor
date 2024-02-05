const express = require("express");
const session = require('express-session');
const router = express.Router();
const mongoose = require("mongoose");
const StarLinegames = require("../../../models/matka/starlinegames");
const moment = require('moment-timezone');
const multer = require('multer');

const cron = require('node-cron');
cron.schedule('*/1 * * * * *', () => {
  starlinemarketstatuscheck();
  });



// Matka Game Create
router.post('/starline/create', async(req, res) => {


    var game = await StarLinegames.create({
        gameId: generateUniqueID(),
        opentime: req.body.opentime,
        gamename:req.body.gamename,
        status:1,
        marketstatus:1,
        marketoffday:1,
    });

      res.status(400).json({
        msg:"Succesfull",
      });

    });
    

    async function starlinemarketstatuscheck()
    {
     
      const currentTimeInIndia = moment().tz('Asia/Kolkata'); // Get current time in Indian Local Time
      const currentTimeInUTC = currentTimeInIndia.clone().utc(); // Convert to UTC
      
      const currtime  = currentTimeInUTC.toDate();
   
      const dateObject = new Date(currtime);

      const hours = dateObject.getHours().toString().padStart(2, '0');
      const minutes = dateObject.getMinutes().toString().padStart(2, '0');
      
      const time = hours+":"+minutes;

    const result =   await StarLinegames.findOneAndUpdate({
      $and: [
        { marketstatus: 1 }, // Condition 1: field1 equals value1
        { opentime: {
          $lt: time
        },
       }, // Condition 2: field2 greater than value2
        
        // Add more conditions if needed...
      ]
    },
    { $set: { marketstatus: 0 } },
    )


    }



    function generateUniqueID() {
        const timestamp = new Date().getTime();
        const randomPart = Math.floor(Math.random() * 100);
        return `${timestamp}`;
      }

module.exports = router;
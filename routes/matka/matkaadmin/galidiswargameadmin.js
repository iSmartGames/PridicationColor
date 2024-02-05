const express = require("express");
const session = require('express-session');
const router = express.Router();
const mongoose = require("mongoose");
const Galidiswargames = require("../../../models/matka/galidiswargames");
const moment = require('moment-timezone');
const multer = require('multer');

const cron = require('node-cron');
cron.schedule('*/1 * * * * *', () => {
  galimarketstatuscheck();
  });


// Matka Game Create
router.post('/galidiswar/create', async(req, res) => {

console.log("log");
    var game = await Galidiswargames.create({
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
    


    
    async function galimarketstatuscheck()
    {
     
      const currentTimeInIndia = moment().tz('Asia/Kolkata'); // Get current time in Indian Local Time
      const currentTimeInUTC = currentTimeInIndia.clone().utc(); // Convert to UTC
      
      const currtime  = currentTimeInUTC.toDate();
   
      const dateObject = new Date(currtime);

      const hours = dateObject.getHours().toString().padStart(2, '0');
      const minutes = dateObject.getMinutes().toString().padStart(2, '0');
      
      const time = hours+":"+minutes;

    const result =   await Galidiswargames.findOneAndUpdate({
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


    }


    function generateUniqueID() {
        const timestamp = new Date().getTime();
        const randomPart = Math.floor(Math.random() * 100);
        return `${timestamp}`;
      }

module.exports = router;
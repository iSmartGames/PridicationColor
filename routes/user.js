const express = require("express");
const session = require('express-session');
const router = express.Router();
const User = require('../models/user')
const UserRefer = require('../models/userRefer')
const UserKyc = require('../models/userKyc')
const Wallet = require('../models/wallet')
const JoinBattle = require("../models/joinBattle")
const auth = require('../middleware/auth')
const UserAccountDetail = require("../models/userAccountDetail")
const SettingMaster = require('../models/settingMaster')
const TestTime = require("../models/testdate");
const { addContact, addFundAccount } = require('../library/custom')
const { check, validationResult } = require('express-validator')
const axios = require('axios');

// const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account')

router.get('/users/me', auth, async(req, res) => {
    res.status(200).send(req.user)
})

// User Registration
router.post('/user/registration', async(req, res) => {
    const { mobile } = req.body; 
    // 2) check if user exist and password is correct
    const existingUser = await User.findOne({mobile});
    if (existingUser) {

        res.status(201).json({
          status: "success", 
          msg: "User Already Registered",
          data:{
            existingUser,
        }      
        });
      } else {

        const newUser = await User.create({
            ...req.body
        });
        await newUser.generateAuthToken();

       // sendMessage(mobile, 'Your OTP is '+otp); // Replace mobile number and message

        res.status(201).json({
            status: "success", 
            data:{
                newUser,
            }     
          });
    }
});

/*
// User Registration
router.post('/user/registration', async(req, res) => {
    const { mobile } = req.body; 
    // 2) check if user exist and password is correct
    const existingUser = await User.findOne({mobile});
    if (existingUser) {
        // Update the existing user
        const otp = 1234;
        
        existingUser.otp = otp;
        await existingUser.save();

      //  sendMessage(mobile, 'Your OTP is '+otp); // Replace mobile number and message

        res.status(201).json({
          status: "success", 
          data:{
            existingUser,
        }      
        });
      } else {

        const otp = 1234;

        const newUser = await User.create({
            ...req.body,
          otp:otp,
        });
        await newUser.generateAuthToken();

       // sendMessage(mobile, 'Your OTP is '+otp); // Replace mobile number and message

        res.status(201).json({
            status: "success", 
            data:{
                newUser,
            }     
          });
    }
});


// User Login
router.post('/user/login', async(req, res) => {

   // const user = new User(req.body)
      try {
        console.log(req.body.mobile);
        console.log(req.body.otp);
          const user = await User.findByCredentials(req.body.mobile, req.body.otp)
          var response = { 
              msg: "Login Successful",
              user
          }
          res.status(200).send(response)
      } catch (e) {
          var response = {
              msg: "Unable to Login",
              error: e,
          }
          res.status(401).send(response)
      }
  
});
*/
// User resendOtp
router.post('/user/resendotp', async(req, res) => {
    const { mobile } = req.body; 
    const existingUser = await User.findOne({mobile});
    if (existingUser) {
        existingUser.otp = generateOTP();
        await existingUser.save();
        res.status(201).json({
          status: "success", 
          data:{
            existingUser,
        }      
        });
      } 
 });
 
 // User UPI ADD -Update
router.post('/user/banking',auth, async(req, res) => {

    
        const data = req.body;
        console.log(data);
        try{
            let userAccountDetail;

        if(data.accountplan=='btc')
        {
            userAccountDetail = {
                btc_address: data.btc_address,
                widrow_default: true,
            }
        }


        if(data.accountplan=='usdt')
        {
            userAccountDetail = {
                usdt_address: data.usdt_address,
                widrow_default: true,
            }
        }

        
        if(data.accountplan=='upi')
        {

            userAccountDetail = {
                vpa_address: data.vpa_address,
                vpa_name: data.vpa_name,
                vpa_type: data.vpa_type,
                widrow_default: true,
            }
        }

        
        if(data.accountplan=='account')
        {
             userAccountDetail = {
                account_number: data.account_number,
                account_ifsc: data.account_ifsc,
                account_acholder: data.account_acholder,
                widrow_default: true,
            }
        }
/*
        console.log(userAccountDetail);
        const existingUser = await UserAccountDetail.findOne({user_id: req.user._id,});

       if(existingUser)
       {
        const userAccountDetaila = await UserAccountDetail.findOneAndUpdate({ user_id: req.user._id, }, userAccountDetail)
        res.status(201).json({
            status: "success", 
            userAccountDetaila             
          });
       }
       else{
        const userAccountDetaila = await UserAccountDetail.create({
            ...req.body,
            user_id:req.user._id,
        });
        res.status(201).json({
            status: "success", 
            userAccountDetaila
          });
       }
       */

       console.log(userAccountDetail);

       if (data._id !== null && data._id !== undefined) {
        
        await UserAccountDetail.updateMany({ user_id: req.user._id, }, { widrow_default: false})

        const userAccountDetaila = await UserAccountDetail.findOneAndUpdate({ _id: data._id, }, userAccountDetail)
        res.status(201).json({
            status: "success", 
            userAccountDetaila             
          });

       }
       else
       {
        await UserAccountDetail.updateMany({ user_id: req.user._id, }, { widrow_default: false})

        const userAccountDetaila = await UserAccountDetail.create({
            ...req.body,
            user_id:req.user._id,
        });

        res.status(201).json({
            status: "success", 
            userAccountDetaila
          });
       }



 
    }catch(err)
    {
            console.log(err);
    }
 
});

 // User UPI get Details
router.get('/user/banking',auth, async(req, res) => {
    const userAccountDetaila = await UserAccountDetail.find({user_id: req.user._id, account_status: true});
    if(userAccountDetaila)
    {
        res.status(200).json({
            status: "Success", 
            msg:"Data Found",
            data:userAccountDetaila,
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

 // User UPI get Details
 router.get('/user/bankingdefault',auth, async(req, res) => {

    const userAccountDetaila = await UserAccountDetail.find({user_id: req.user._id, widrow_default : true, account_status: true});
    if(userAccountDetaila)
    {
        res.status(200).json({
            status: "Success", 
            msg:"Data Found",
            data:userAccountDetaila,
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

/*
 // User UPI ADD -Update
 router.post('/user/banking',auth, async(req, res) => {

    
    const data = req.body;
    console.log(data);
    try{
        let userAccountDetail;

    if(data.accountplan=='btc')
    {
        userAccountDetail = {
            btc_address: data.btc_address,
        }
    }


    if(data.accountplan=='usdt')
    {
        userAccountDetail = {
            usdt_address: data.usdt_address,
        }
    }


   if (data._id !== null && data._id !== undefined) {
   
    const userAccountDetaila = await UserAccountDetail.findOneAndUpdate({ _id: data._id, }, userAccountDetail)
    res.status(201).json({
        status: "success", 
        userAccountDetaila             
      });

   }
   else
   {
    const userAccountDetaila = await UserAccountDetail.create({
        ...req.body,
        user_id:req.user._id,
    });

    res.status(201).json({
        status: "success", 
        userAccountDetaila
      });
   }




}catch(err)
{
        console.log(err);
}

});
*/
 // User UPI delete - status removed
 router.post('/user/bankingdelet',auth, async(req, res) => {
    
    const data = req.body;
    console.log(data);
    try{
        let userAccountDetail; 
        userAccountDetail = {
            account_status: false,
        }
        console.log(userAccountDetail);

        if (data._id !== null && data._id !== undefined) {
                const userAccountDetaila = await UserAccountDetail.findOneAndUpdate({ _id: data._id, }, userAccountDetail)
                res.status(201).json({
                    status: "success", 
                    userAccountDetaila             
                });

                    }

        }catch(err)
        {
                console.log(err);
        }

});

 // User UPI delete - status removed
 router.post('/user/bankingdefault',auth, async(req, res) => {
    
    const data = req.body;
    console.log(req.user._id);
    try{
        let userAccountDetail; 
        userAccountDetail = {
            widrow_default: false,
        }
        console.log(userAccountDetail);

        if (data._id !== null && data._id !== undefined) {

                await UserAccountDetail.updateMany({ user_id: req.user._id, }, userAccountDetail)

                const userAccountDetaila = await UserAccountDetail.findOneAndUpdate({ _id: data._id, }, {widrow_default : true,})
                res.status(201).json({
                    status: "success", 
                    userAccountDetaila             
                });

                    }

        }catch(err)
        {
                console.log(err);
        }

});

/*
// User Registration
router.post('/user/registration', async(req, res) => {
    const refer_code = Math.random().toString(36).substr(2,8).toUpperCase()
    const user = new User({
        ...req.body,
        refer_code
    })
    try {
        let userDetail = await user.save()
        await user.generateAuthToken()
        // sendWelcomeEmail(user.email_id, user.first_name)
        addContact(userDetail)

        var response = {
            msg: 'Successfully Registered!'
        }
        res.send(response)
    } catch (e) {
        var response = {
            msg: "Unable to Register, Please check Fields Properly",
            error: e,
        }
        res.status(202).send(response)
    }
});

// User Login
router.post('/user/login', async(req, res) => {
    const user = new User(req.body)
    try {
        const user = await User.findByCredentials(req.body.email_id, req.body.password)
        var response = {
            msg: "Login Successful",
            user
        }
        res.status(200).send(response)
    } catch (e) {
        var response = {
            msg: "Unable to Logins",
            error: e,
        }
        res.status(401).send(response)
    }
});

// User Forget Password
router.post('/user/forget_password', [
    check('email_id', 'Email is invalid')
    .isEmail()
], async(req, res) => {
    var validation = validationResult(req).array()

    var errors = validation.reduce(
        (obj, item) => Object.assign(obj, {
            [item.param]: item.msg
        }), {});

    var request = {
        email_id: req.body.email_id
    }

    if (Object.keys(errors).length !== 0) {
        req.session.errors = errors;
        req.session.success = false;
        req.session.request = request;
        res.redirect('/user/forget_password');
    } else {
        const user = new User(req.body)
        try {
            const user = await User.findByUsers(req.body.email_id)
            console.log(user.first_name);
            var message = {
                msg: 'Link send to registered email id!'
            }
            res.redirect("thanks")
        } catch (e) {
            res.status(400).send(e)
        }
    }
});

// User KYC
router.post('/user/kyc', auth, async(req, res) => {
    var user_id = req.user._id
    try
    {
        if (!req.files) {
            return res.status(500).send({ msg: "file is not found" })
        }

        const myFileFront = req.files.aadharFront
        const myFileBack = req.files.aadharBack
        aadharFront = new Date().getTime() +'_'+myFileFront.name;
        aadharBack = new Date().getTime() +'1_'+myFileBack.name;

        // Use the mv() method to place the file somewhere on your server
        myFileFront.mv(`${__dirname}/../public/kyc/${aadharFront}`, function (err) {
            if (err) {
                return res.status(500).send({ msg: "Upload error" });
            }
        });
        myFileBack.mv(`${__dirname}/../public/kyc/${aadharBack}`, function (err) {
            if (err) {
                return res.status(500).send({ msg: "Upload error" });
            }
        });

        const userKyc = new UserKyc({
            user_id,
            first_name: req.body.first_name,
            email_id: req.body.email_id,
            dob: req.body.dob,
            aadhar_number: req.body.aadharNumber,
            aadhar_front: aadharFront,
            aadhar_back: aadharBack
        })
        
        await userKyc.save()
        await User.findOneAndUpdate({ _id: user_id }, { kyc: 3 })

        var response = {
            msg: "Successfully Submitted KYC!"
        }
        res.status(200).send(response)
    } catch (e) {
        var response = {
            msg: "Sever Issue Contact Administrator!",
            error: e,
        }
        res.status(400).send(response)
    }  
});

// User Refer By
router.post('/users/referby', auth, async(req, res) => {
    var user_id = req.user._id

    var refer_code = req.body.refer_code
    try
    {
        // Check existance of referal code
        var referer = await User.findOne({ refer_code, _id: { $ne: user_id } })
        if(!referer)
        {
            var response = {
                msg: "Refer code is not valid!"
            }
            return res.status(203).send(response)
        }

        const userRefer = new UserRefer({
            refer_by: referer._id,
            refer_to: user_id,
            refer_code, 
            amount: 20
        })

        await userRefer.save()

        var user_wallet = referer.wallet_amount
        await User.findOneAndUpdate({ _id: referer._id }, { wallet_amount: (user_wallet+20) })


        var wallet = new Wallet({
            user_id,
            order_id: "",
            amount: 20,
            currency: "INR",
            receipt: "Refer",
            status: true
        })
        await wallet.save();

        var response = {
            msg: "Successfully added refer code!"
        }
        res.status(200).send(response)
    } catch (e) {
        var response = {
            msg: "Sever Issue Contact Administrator!",
            error: e,
        }
        res.status(400).send(response)
    }  
});

router.get('/myprofile', auth, async(req, res) => {
    var user_id = req.user._id
    try {
        const user = await User.aggregate([
            {
                $lookup: {
                    from: "userrefers",
                    localField: '_id',
                    foreignField: 'refer_to',
                    as: 'refer_by'
                },
            },
            {
                $unwind: { path: '$refer_by', preserveNullAndEmptyArrays: true }

            },
            {
                $match: { _id: user_id },
            },
            {
                $project: {
                    _id: 1,
                    first_name: 1,
                    last_name: 1,
                    email_id: 1,
                    mobile: 1,
                    wallet_amount: 1,
                    kyc: 1,
                    refer_code: 1,
                    status: 1,
                    "refer_by.refer_by": 1
                },
            }       
        ])

        const userRefer = await User.aggregate([
            {
                $lookup: {
                    from: "userrefers",
                    localField: '_id',
                    foreignField: 'refer_by',
                    as: 'referBy'
                },
            },
            {
                $unwind: '$referBy'
            },
            {
                $match: { _id: user[0].refer_by.refer_by },
            },
            {
                $project: {
                    first_name: 1,
                    last_name: 1,
                    refer_code:1
                },
            }       
        ])
        
        const battlePlayed = await JoinBattle.find( { $or: [ { c_user_id: user_id }, { j_user_id: user_id } ] } ).count()

        const referralEarning = await Wallet.aggregate([
        {
                $match: { user_id, receipt: 'Refer' }
            },
            { $group: { _id : null, sum : { $sum: "$amount" } } },
            { $project: { _id: 0, sum: 1 } }
        ])

        user[0].refer_by = userRefer[0]
        user[0].battlePlayed = battlePlayed
        user[0].referralEarning = referralEarning[0].sum
        res.status(200).send(user[0])

    } catch (e) {
        var response = {
            msg: "Failed to fetch record",
            error: e,
        }
        res.status(202).send(response)
    }
})

// User add account details
router.post('/users/add_account', auth, async(req, res) => {
    var user_id = req.user._id
    let dataRequest = req.body
    let userDetail = {
        _id: user_id,
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        email_id: req.user.email_id,
        mobile: req.user.mobile,
        vpa_account: dataRequest.vpa_account,
        account_type: dataRequest.account_type,
    }

    if(req.user.razor_contact_id)
        razor_contact_id = req.user.razor_contact_id
    else{
        let razor_contact_id = await addContact(userDetail)
    }

    if(razor_contact_id){
        let response = await addFundAccount(userDetail, razor_contact_id)
        res.status(response.status ? 201 : 203).send(response)
    }
    else{
        res.status(203).send({ msg : 'Something went wrong! Please contact Administartor' })
    }

})

// User add account details
router.get('/users/fetch_account', auth, async(req, res) => {
    var user_id = req.user._id
    let accountDetails = await UserAccountDetail.find({ user_id })
    res.status(200).send(accountDetails)
})

// User payout from wallet
router.post('/users/withdraw_amount', auth, async(req, res) => {
    var user_id = req.user._id
    let dataRequest = req.body

    // Check user has KYC done or not
    if(req.user.kyc == 1)
    {
        // Get threshold payout limit from admin setting
        var adminSetting = await SettingMaster.findOne()
        if(adminSetting.threshold_limit_payout <= dataRequest.withdraw_amount){
            if(dataRequest.withdraw_amount <= req.user.wallet_amount){
                
                res.status(200).send({ msg : 'Done' })
            }
            else{
                res.status(203).send({ msg : 'Insufficent wallet balance' })
            }
        }
        else{
            res.status(203).send({ msg : 'You can with draw minimum '+ adminSetting.threshold_limit_payout + ' amount' })
        }
    }
    else
    {
        res.status(203).send({ msg : 'Please update your KYC information!' })
    }
})
*/

// Function to generate a random OTP
function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }
 
  async function sendMessage(mobile, message) {
    try {
      const response = await axios.post('http://www.pushpaksms.com/api_v2/message/send', 
      'sender_id=JODSMS&dlt_template_id=1207168680839278353&message=' + message + ' is the OTP verify your mobile number for . NEVER SHARE YOUR OTP WITH ANYONE. JSHPL&mobile_no=' + mobile, {
        headers: {
          'authorization': 'Bearer 0BGjhGd-8QAqgC-iH_9rb0_sffZ85s-Toj0W_MXKJOR299uvyhPdTGBuEdV55Qu8',
          'cache-control': 'no-cache',
          'content-type': 'application/x-www-form-urlencoded'
        }
      });
      
      //console.log(response.data); 
      // Log the response data
      return "1";
    } catch (error) {
      //console.error('Error:', error);
      return "0";
    }
  }
  
  // Example usage:
 
   // User UPI delete - status removed
 router.post('/user/testtime', async(req, res) => {
    
    console.log(new Date().toISOString().slice(11, 23));

    await TestTime.create({
        game_time: new Date().toISOString().slice(11, 23),
      });

    // Retrieve the document
var document = await TestTime.findOne();

// Convert the stored UTC time to a Date object
var storedUTCTime = new Date(`1970-01-01T${document.game_time}Z`);
console.log(storedUTCTime);

/*
    try{
        const timeinsert = await TestTime.create({
            game_time: new Date().toISOString().slice(11, 23),
          });
      
               res.status(201).json({
                    status: "success", 
                    timeinsert             
                });

                    

        }catch(err)
        {
                console.log(err);
        }
*/
});
  
module.exports = router;

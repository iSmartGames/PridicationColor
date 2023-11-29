const express = require("express");
const session = require('express-session');
const router = express.Router();
const User = require('../models/user')
const Wallet = require('../models/wallet')
const WalletLog = require('../models/walletLog')
const auth = require('../middleware/auth')
const { check, validationResult } = require('express-validator')
const mongoose = require("mongoose")

// socketio service
//const { app, io, cors, server } = require('../services/socketio')



// Add wallet Amount
router.post('/wallet/add', auth, async(req, res) => {
//----- txn_type 1- Credit ,2 -Debit
//----- amount_status 1-UPI ,2 -RazorPay Add, 3 - Game Win , 4 - Bonus Amount, 6-Refer Amount

    var wallet = await Wallet.create({
        user_id: req.user._id,
        txn_order:genTxnId(),
        order_id: req.body.order_id,
        txn_type:1,
        amount_status:req.body.amount_status,
        amount: req.body.amount,
        txnnote:"ADD POINT",
        currency: req.body.currency,
        receipt: req.body.receipt,
        status: false
    });




    if(req.body.amount_status===1)
    {
        var wallet_log = await WalletLog.create({
            txn_order: wallet.txn_order,
            order_id:req.body.order_id,
            payment_id: req.body.payment_id
            
        });        
    }
            var user = await User.findOne({ _id: wallet.user_id })
            var updated_wallet = user.wallet_amount + (wallet.amount)
            await User.findOneAndUpdate({ _id: wallet.user_id }, { wallet_amount: updated_wallet })
/*
            //update user wallet in user collection
            var user = await User.findOne({ _id: user_id })
            var updated_wallet = user.wallet_amount + (data.amount / 100)
            await User.findOneAndUpdate({ _id: user_id }, { wallet_amount: updated_wallet })
*/
    res.status(201).json({
        status: "success", 
        data:{
            user,
        }     
      });

      res.status(400).json({
        status: "fail", 
        data:{
            res,
        }     
      });

    //await wallet.save();

    
});

/*
// Add wallet Amount
router.post('/wallet/add', auth, async(req, res) => {
    const data = req.body
    const amount = data.wallet_amount
    try {
        // const createdBattle = await battle.save()

        // Razorpay razorpayInstance
        const Razorpay = require('razorpay');
        var razorpayInstance = new Razorpay({
            key_id: process.env.RAZOR_PAY_KEY,
            key_secret: process.env.RAZOR_PAY_SECRET
        });

        var options = {
            amount: amount * 100, // amount in the smallest currency unit
            currency: "INR",
            receipt: "Order",
            notes: {
                user_id: req.user._id.toString()
            }
        };
        await razorpayInstance.orders.create(options, async function(err, order) {
            if (!err) {
                var response = {
                    order: {
                        order_id: order.id,
                        amount: order.amount,
                        currency: order.currency
                    }
                }
                var wallet = new Wallet({
                    user_id: req.user._id,
                    order_id: order.id,
                    amount: order.amount / 100,
                    currency: order.currency,
                    receipt: order.receipt,
                    status: false
                })
                await wallet.save();
                res.status(202).send(response)
            } else {
                var response = {
                    msg: err,
                }
                res.status(400).send(response)
            }
        });
    } catch (e) {
        var response = {
            msg: "Unable to add wallet amount!",
            error: e,
        }
        res.status(400).send(response)
    }
});
*/
// Update wallet
router.post('/wallet/update', auth, async(req, res) => {
    const data = req.body
    const order = req.body.order
    const user_id = req.user._id
    if (data.status) {
        var wallet = {
            user_id,
            order_id: order.razorpay_order_id,
            status: data.status
        }
        var wallet_log = new WalletLog({
            order_id: order.razorpay_order_id,
            payment_id: order.razorpay_payment_id,
            signature: order.razorpay_signature
        })

        //update user wallet in user collection
        var user = await User.findOne({ _id: user_id })
        var updated_wallet = user.wallet_amount + (data.amount / 100)
        await User.findOneAndUpdate({ _id: user_id }, { wallet_amount: updated_wallet })
    } else {
        var wallet = {
            user_id,
            order_id: order.error.metadata.order_id,
            status: data.status
        }
        var wallet_log = new WalletLog({
            order_id: order.error.metadata.order_id,
            payment_id: order.error.metadata.payment_id,
            error_code: order.error.code,
            error_description: order.error.description,
            error_source: order.error.source,
            error_step: order.error.step,
            error_reason: order.error.reason
        })
    }
    var order_id = order.razorpay_order_id ? order.razorpay_order_id : order.error.metadata.order_id
    var order_status = {
        status: data.status
    }
    try {
        const filter = { order_id };
        const updatedWallet = await Wallet.findOneAndUpdate(filter, order_status);
        await wallet_log.save();
        let response = {
            wallet: updatedWallet,
            status: data.status,
            msg: data.status ? 'Wallet amount added successfully!' : 'Unable to add wallet amount!'
        }
        io.emit("updatedUser", await User.findOne({ _id: user_id }))
        io.emit("updatedWalletTransactions")
        res.status(202).send(response)
    } catch (e) {
        console.log(e)
        var response = {
            msg: "Unable to add wallet amount!",
            error: e,
        }
        res.status(400).send(response)
    }
});

// Wallet transactions
router.get('/wallet/transactions', auth, async(req, res) => {
    try {
        const wallet = await Wallet.find({ user_id: req.user._id})
        var response = {
            msg: "Success",
            data: wallet,
        }
        res.status(201).send(response)
        //console.log(wallet);
    } catch (e) {
        var response = {
            msg: "Failed to fetch record",
            error: e,
        }
        res.status(204).send(response)
    }
})


// Widrow wallet Amount
router.post('/wallet/widrow', auth, async(req, res) => {
    //----- txn_type 1- Credit ,2 -Debit
    //----- amount_status 1-UPI ,2 -RazorPay Add, 3 - Game Win , 4 - Bonus Amount, 6-Refer Amount , 7- widrow amount pending

    var user = await User.findOne({ _id: req.user._id, })
    if (user.wallet_amount >= req.body.amount) {

        var wallet = await Wallet.create({
            user_id: req.user._id,
            txn_order:genTxnId(),
            txn_type:2,
            amount_status:7,
            amount: req.body.amount,
            txnnote:"WTHDRAW REQUEST",
            currency: "INR",
            status: false
        });

        var updated_wallet = user.wallet_amount - (req.body.amount)
        await User.findOneAndUpdate({ _id: wallet.user_id }, { wallet_amount: updated_wallet })

        var status = 202
        var response = {
            msg: "Withdraw Request Submitted!"
        }
    }else {
        var status = 200
        var response = {
            msg: "You don't have sufficient wallet balance!"
        }
    }
    res.status(status).send(response)
    
    /*
        var wallet = await Wallet.create({
            user_id: req.user._id,
            txn_order:genTxnId(),
            order_id: req.body.order_id,
            txn_type:2,
            amount_status:req.body.amount_status,
            amount: req.body.amount,
            currency: req.body.currency,
            receipt: req.body.receipt,
            status: false
        });
    
    
    
    
        if(req.body.amount_status===1)
        {
            var wallet_log = await WalletLog.create({
                txn_order: wallet.txn_order,
                order_id:req.body.order_id,
                payment_id: req.body.payment_id
                
            });        
        }
                var user = await User.findOne({ _id: wallet.user_id })
                var updated_wallet = user.wallet_amount + (wallet.amount)
                await User.findOneAndUpdate({ _id: wallet.user_id }, { wallet_amount: updated_wallet })
    /*
                //update user wallet in user collection
                var user = await User.findOne({ _id: user_id })
                var updated_wallet = user.wallet_amount + (data.amount / 100)
                await User.findOneAndUpdate({ _id: user_id }, { wallet_amount: updated_wallet })
    */
      
    
        //await wallet.save();
    
        
    });
// Function to generate a random OTP
function genTxnId() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

module.exports = router;


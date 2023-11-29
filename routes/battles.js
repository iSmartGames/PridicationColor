const express = require("express");
const session = require('express-session');
const router = express.Router();
const User = require('../models/user')
const Battle = require('../models/battle')
const JoinBattle = require("../models/joinBattle")
const BattleResult = require('../models/battleResult')
const SettingMaster = require('../models/settingMaster')
const auth = require('../middleware/auth')
const { check, validationResult } = require('express-validator')
const mongoose = require("mongoose")
const { Types } = require("mongoose")

// socketio service
const { app, io, cors, server } = require('../services/socketio');

// Create Battle 
router.post('/battle/create', auth, async(req, res) => {
    var user_id = req.user._id
    const battle = new Battle({
        ...req.body,
        user_id
    })
    try {
        var user = await User.findOne({ _id: user_id })
        var adminSetting = await SettingMaster.findOne()
        if (user.wallet_amount >= req.body.amount) {
            var updated_wallet = user.wallet_amount - req.body.amount
            await User.findOneAndUpdate({ _id: user_id }, { wallet_amount: updated_wallet })
            const createdBattle = await battle.save()
            let admin_commission = adminSetting.admin_commission
            var newBattle = {
                _id: createdBattle._id,
                user_id: createdBattle.user_id,
                users: {
                    first_name: req.user.first_name,
                    last_name: req.user.last_name,
                },
                amount: createdBattle.amount,
                admin_commission,
                status: createdBattle.status,
                createdAt: createdBattle.createdAt
            }
            io.emit("createdBattle", newBattle)
            io.emit("updatedUser")
            io.emit("updateBattleStatus")
            var status = 202
            var response = {
                msg: "Battle created Successfully!"
            }
        } else {
            var status = 200
            var response = {
                msg: "You don't have sufficient wallet balance!"
            }
        }
        res.status(status).send(response)
    } catch (e) {
        var response = {
            msg: "Unable to create battle",
            error: e,
        }
        res.status(400).send(response)
    }
});

// Join Battle 
router.post('/battle/join', auth, async(req, res) => {
    var user_id = req.user._id
    var battle_id = req.body.battle_id

    try {
        var user = await User.findOne({ _id: user_id })
        var battle = await Battle.findOne({ _id: battle_id })
        var adminSetting = await SettingMaster.findOne()
        if (user.wallet_amount >= battle.amount) {
            //insert into join battle collection
            var admin_commission = adminSetting.admin_commission
            var join_battle = new JoinBattle({
                battle_id,
                amount: battle.amount,
                c_user_id: battle.user_id,
                j_user_id: user_id,
                win_user_id: mongoose.Schema.Types.ObjectId[''],
                lose_user_id: mongoose.Schema.Types.ObjectId[''],
                cancel_user_id: mongoose.Schema.Types.ObjectId[''],
                admin_commission,
                admin_commission_value: Math.ceil(((battle.amount * 2) * admin_commission) / 100),
            })
            await join_battle.save()
            await Battle.findOneAndUpdate({ _id: battle_id }, { status: 3 })
            var updatedBattle = await Battle.find({ $or: [ { status: 0 }, { status: 3 } ] })

            var updated_wallet = user.wallet_amount - battle.amount
            await User.findOneAndUpdate({ _id: user_id }, { wallet_amount: updated_wallet })

            io.emit("updateOpenBattles", updatedBattle)
            io.emit("updateRunningBattle")

            var status = 202
            var response = {
                msg: "Battle joined successfully!"
            }
        } else {
            var status = 200
            var response = {
                msg: "You don't have sufficient wallet balance!"
            }
        }
        res.status(status).send(response)
    } catch (e) {
        var response = {
            msg: "Unable to join battle",
            error: e,
        }
        res.status(400).send(response)
    }
});

// Cancel Battle 
router.post('/battle/cancel', auth, async(req, res) => {
    var user_id = req.user._id
    var battle_id = req.body.battle_id

    var user = await User.findOne({ _id: user_id })
    var battle = await Battle.findOne({ _id: battle_id })

    try {
        await Battle.findOneAndUpdate({ _id: battle_id, user_id }, { status: 2 })

        var updated_wallet = user.wallet_amount + battle.amount
        await User.findOneAndUpdate({ _id: user_id }, { wallet_amount: updated_wallet })
        io.emit("updateBattles")
        io.emit("updatedUser")

        var response = {
            msg: "Your battle has been cancelled!"
        }
        res.status(200).send(response)
    } catch (e) {
        var response = {
            msg: "Unable to cancel the battle, contact to administrator!",
            error: e,
        }
        res.status(400).send(response)
    }
});

// Get Play Battles List
router.get('/battles/playBattles', auth, async(req, res) => {
    try {
        const adminSetting = await SettingMaster.findOne()

        const battle1 = await Battle.aggregate([{
                $match: {
                    status: 0,
                    user_id: { $ne: req.user._id }
                },
            }, {
                $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'users'
                },
            },
            {
                $unwind: '$users',
            },
            {
                $project: {
                    _id: 1,
                    user_id: 1,
                    amount: 1,
                    status: 1,
                    "users.first_name": 1,
                    "users.last_name": 1,
                    "users.email_id": 1,
                    "users.mobile": 1,
                    "users.wallet_amount": 1,
                    "users.status": 1
                }
            }

        ])

        const battle2 = await Battle.aggregate([{
                $match: {
                    status: 3,
                    user_id: { $ne: req.user._id }
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'users'
                },
            },
            {
                $lookup: {
                    from: 'joinbattles',
                    localField: '_id',
                    foreignField: 'battle_id',
                    pipeline: [{
                        $match: {
                             j_user_id: req.user._id
                        }
                    }],
                    as: 'BattleInfo'
                },
            },
            {
                $unwind: '$users',
            },
            { 
                $unwind: "$BattleInfo" 
            },
            {
                $project: {
                    _id: 1,
                    user_id: 1,
                    amount: 1,
                    status: 1,
                    "BattleInfo.admin_commission": 1,
                    "BattleInfo.admin_commission_value": 1,
                    "BattleInfo.j_user_id": 1,
                    "users.first_name": 1,
                    "users.last_name": 1,
                    "users.email_id": 1,
                    "users.mobile": 1,
                    "users.wallet_amount": 1,
                    "users.status": 1
                }
            }

        ])

        let battle = [...battle1, ...battle2]

        if (battle) {
            battle.forEach((element)=>{
                element["admin_commission"] = adminSetting.admin_commission
            })
            res.status(200).send(JSON.stringify(battle))
        }
    } catch (e) {
        var response = {
            msg: "Failed to fetch record",
            error: e,
        }
        res.status(202).send(response)
    }
});

// Get Completed Battles List
router.get('/completeBattles', auth, async(req, res) => {
    try {
        const battle = await Battle.aggregate([{
                $match: {
                    $or: [{ status: 1}, { status: 4 }],
                },
            }, {
                $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'users'
                },
            },
            {
                $unwind: '$users',
            },
            {
                $lookup: {
                    from: 'joinbattles',
                    localField: '_id',
                    foreignField: 'battle_id',
                    pipeline: [{
                        $match: {
                            $or: [{ c_user_id: req.user._id }, { j_user_id: req.user._id }]
                        }
                    }],
                    as: 'joined'
                },
            },
            {
                $unwind: '$joined',
            },
            {
                $project: {
                    _id: 1,
                    user_id: 1,
                    amount: 1,
                    status: 1,
                    "users.first_name": 1,
                    "users.last_name": 1,
                    "users.email_id": 1,
                    "users.mobile": 1,
                    "users.wallet_amount": 1,
                    "users.status": 1,
                    "joined._id": 1,
                    "joined.c_user_id": 1,
                    "joined.j_user_id": 1,
                    "joined.win_user_id": 1,
                    createdAt: 1
                }
            }

        ]).exec((err, result) => {
            if (err) {
                res.status(202).send(err)
            }
            if (result) {
                res.status(200).send(JSON.stringify(result))
            }
        });
    } catch (e) {
        var response = {
            msg: "Failed to fetch record",
            error: e,
        }
        res.status(202).send(response)
    }
});

// Get Open Battles List
router.get('/battles/openBattles', auth, async(req, res) => {
    try {
        const adminSetting = await SettingMaster.findOne()

        const battle = await Battle.aggregate([{
            $match: {
                $or: [{ status: 0 },{ status: 3 }], user_id: req.user._id
            ,}
        }, {
            $lookup: {
                from: 'users',
                localField: 'user_id',
                foreignField: '_id',
                as: 'CreatedBy'
            },
        },
        {
            $lookup: {
                from: 'joinbattles',
                localField: '_id',
                foreignField: 'battle_id',
                as: 'BattleInfo'
            },
        },
        {
            $unwind: '$CreatedBy'
        },
        { 
            $unwind: { path: "$BattleInfo", preserveNullAndEmptyArrays: true } 
        },
        {
            $project: {
                _id: 1,
                user_id: 1,
                amount: 1,
                status: 1,
                "BattleInfo.admin_commission": 1,
                "BattleInfo.admin_commission_value": 1,
                "CreatedBy._id": 1,
                "CreatedBy.first_name": 1,
                "CreatedBy.last_name": 1,
                createdAt: 1
            }
        }
        ]).exec((err, result) => {
            if (err) {
                res.status(202).send(err)
            }
            if (result) {
                result.forEach((element)=>{
                    element["admin_commission"] = adminSetting.admin_commission
                })
                res.status(200).send(JSON.stringify(result))
            }
        });
        // const battle = await Battle.find({ $or: [{ status: 0 },{ status: 3 }], user_id: req.user._id })
        // res.status(200).send(battle)
    } catch (e) {
        var response = {
            msg: "Failed to fetch record",
            error: e,
        }
        res.status(202).send(response)
    }
});

// Get Running Battles List
router.get('/battles/runningBattles', auth, async(req, res) => {
    var user_id = req.user._id
    try {
        const battle = await JoinBattle.aggregate([{
            $match: {
                $and: [{ c_user_id: { $ne: user_id } }, { j_user_id: { $ne: user_id } }]
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'c_user_id',
                foreignField: '_id',
                as: 'CreatedBy'
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'j_user_id',
                foreignField: '_id',
                as: 'AcceptedBy'
            },
        },
        {
            $unwind: '$CreatedBy'
        },
        {
            $unwind: '$AcceptedBy'
        },
        {
            $project: {
                _id: 1,
                user_id: 1,
                amount: 1,
                status: 1,
                admin_commission_value: 1,
                "CreatedBy._id": 1,
                "CreatedBy.first_name": 1,
                "CreatedBy.last_name": 1,
                "AcceptedBy._id": 1,
                "AcceptedBy.first_name": 1,
                "AcceptedBy.last_name": 1,
                createdAt: 1
            }
        }
        ]).exec((err, result) => {
            if (err) {
                res.status(202).send(err)
            }
            if (result) {
                console.log(result)
                res.status(200).send(JSON.stringify(result))
            }
        })
    } catch (e) {
        var response = {
            msg: "Failed to fetch record",
            error: e,
        }
        res.status(202).send(response)
    }
})

// Validate battle
router.post('/battle/info', auth, async(req, res) => {
    var user_id     = req.user._id
    var battle_id   = req.body.battle_id
    try {
        const battle = await JoinBattle.aggregate([{
            $match: { battle_id: Types.ObjectId(battle_id) }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'c_user_id',
                foreignField: '_id',
                as: 'CreatedBy'
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'j_user_id',
                foreignField: '_id',
                as: 'AcceptedBy'
            },
        },
        {
            $lookup: {
                from: 'battles',
                localField: 'battle_id',
                foreignField: '_id',
                as: 'Battles'
            },
        },
        {
            $unwind: '$CreatedBy'
        },
        {
            $unwind: '$AcceptedBy'
        },
        {
            $unwind: '$Battles'
        },
        {
            $project: {
                _id: 1,
                user_id: 1,
                "Battles.status": 1,
                "Battles.amount": 1,
                "Battles.room_code": 1,
                "CreatedBy._id": 1,
                "CreatedBy.first_name": 1,
                "CreatedBy.last_name": 1,
                "AcceptedBy._id": 1,
                "AcceptedBy.first_name": 1,
                "AcceptedBy.last_name": 1,
                createdAt: 1
            }
        }
        ]).exec((err, result) => {
            if (err) {
                res.status(202).send(err)
            }
            if (result) {
                res.status(200).send(JSON.stringify(result[0]))
            }
        })

    } catch (e) {
        var response = {
            msg: "Failed to fetch record",
            error: e,
        }
        res.status(202).send(response)
    }
});

// Validate battle
router.post('/battle/validate', auth, async(req, res) => {
    try {
        var user_id = req.user._id
        var battle_id = req.body.battle_id
        const battle = await Battle.findOne({ _id: battle_id, user_id })
        var valid = battle == null ? false : true
        var response = {
            room_code: valid ? battle.room_code : '',
            valid
        }
        res.status(200).send(response)
    } catch (e) {
        var response = {
            msg: "Failed to fetch record",
            error: e
        }
        res.status(400).send(response)
    }
});

// Validate battle
router.post('/battle/roomcode/create', auth, async(req, res) => {
    var user_id = req.user._id
    try {
        var user_id = req.user._id
        var battle_id = req.body.battle_id
        var room_code = req.body.room_code
        const battle = await Battle.findOneAndUpdate({ _id: battle_id, user_id }, { room_code })
        var response = {
            msg: "Your room code has been created!",
            room_code
        }
        res.status(200).send(response)
    } catch (e) {
        var response = {
            msg: "Failed to fetch record",
            error: e,
        }
        res.status(202).send(response)
    }
});

// Validate battle
router.post('/battle/result/update', auth, async(req, res) => {
    var user_id = req.user._id
    var battle_id = req.body.battleId
    try
    {
        var file_name = ""
        if(req.body.battleResult == 1)
        {
            if (!req.files) {
                return res.status(500).send({ msg: "file is not found" })
            }
            const myFile = req.files.file
            file_name = new Date().getTime() +'_'+myFile.name;

            // Use the mv() method to place the file somewhere on your server
            myFile.mv(`${__dirname}/../public/${file_name}`, function (err) {
                if (err) {
                    return res.status(500).send({ msg: "Upload error" });
                }
                // return res.status(202).send({ file: myFile.name, path: `/${myFile.name}`, ty: myFile.type });
            });
        }

        const battleResult = new BattleResult({
            battle_id,
            user_id,
            battle_result: req.body.battleResult,
            image: file_name,
            description: req.body.battleDescription
        })
        
        await battleResult.save()
        await Battle.findOneAndUpdate({ _id: battle_id }, { status: 4 })

        var response = {
            msg: "Successfully updated!"
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

module.exports = router;
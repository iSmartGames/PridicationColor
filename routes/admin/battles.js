const express = require("express");
const session = require('express-session');
const router = express.Router();
const mongoose = require("mongoose")
const User = require('../../models/user')
const Battle = require('../../models/battle')
const JoinBattle = require("../../models/joinBattle")
const BattleResult = require('../../models/battleResult')
const GameHistory = require('../../models/gameHistory')
const { responseData } = require("../../helpers/responseData")
var { isEmpty } = require("lodash")

// Battle List
router.get('/admin/getUserBattles', async(req, res) => {
    try {
            let { page, limit, sort_by, keyword, direction, battleStatusfilter } = req.query
            const sortOptions = {
                [sort_by || "createdAt"]: direction === "asc" ? 1 : -1,
            }
            const options = {
                page: page || 1,
                limit: limit || 10,
                sort_by: sortOptions
            }
            
            var match = {  }
            if (battleStatusfilter) {
                if (battleStatusfilter == 5) {
                    match.status = 0
                } else{
                    match.status = parseInt(battleStatusfilter)
                }
            }
            
            if (keyword) {
                match["$or"] = [
                    { room_code: { $regex: keyword, $options: 'i' } }
                ]
            }

            const query = Battle.aggregate([
                {
                    $match: match,
                },
                /*{
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
                },*/
                {
                    $project: {
                        _id: 1,
                        user_id: 1,
                        amount: 1,
                        status: 1,
                        room_code: 1,
                        /*"CreatedBy._id": 1,
                        "CreatedBy.first_name": 1,
                        "CreatedBy.last_name": 1,
                        "AcceptedBy._id": 1,
                        "AcceptedBy.first_name": 1,
                        "AcceptedBy.last_name": 1,*/
                        createdAt: 1
                    }
                },
                {
                    $sort: sortOptions,
                },
            ])
            var finaldata = await Battle.aggregatePaginate(query, options)
            if (!isEmpty(finaldata)) {
                return res.json(responseData("GET_LIST", finaldata, req, true))
            } else {
                return res.json(responseData("NOT_FOUND", {}, req, false))
            }
        } catch (error) {
            return res.json(
                responseData("ERROR_OCCUR", error.message, req, false)
            )
        }
});

// Battle Details
router.get('/admin/getBattleDetails', async(req, res) => {
    try {
        let { battle_id } = req.query
        const battleDetail = await Battle.aggregate([
            {
                $match: { 
                    _id: mongoose.Types.ObjectId(battle_id)
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'userDetail'
                },
            },
            {
                $lookup: {
                    from: 'joinbattles',
                    localField: '_id',
                    foreignField: 'battle_id',
                    pipeline: [{
                        $lookup: {
                            from: 'users',
                            localField: 'j_user_id',
                            foreignField: '_id',
                            as: 'userDetail'
                        },
                    },{
                        $unwind: "$userDetail" 
                    }],
                    as: 'joinDetail'
                },
            },
            {
                $lookup: {
                    from: 'battleresults',
                    localField: '_id',
                    foreignField: 'battle_id',
                    pipeline: [{
                        $lookup: {
                            from: 'users',
                            localField: 'user_id',
                            foreignField: '_id',
                            as: 'userDetail'
                        },
                    },{
                        $unwind: "$userDetail" 
                    }],
                    as: 'BattleResult'
                },
            },
            {
                $lookup: {
                    from: 'gamehistories',
                    localField: '_id',
                    foreignField: 'battle_id',
                    pipeline: [{
                        $lookup: {
                            from: 'users',
                            localField: 'user_id',
                            foreignField: '_id',
                            as: 'gameuserDetail'
                        },
                    },{
                        $unwind: "$gameuserDetail" 
                    }],
                    as: 'gameHistory'
                },
            },
            { 
                $unwind: "$userDetail"
            },
            { 
                $unwind: { path: "$joinDetail", preserveNullAndEmptyArrays: true } 
            },
            {
                $project: {
                    _id: 1,
                    user_id: 1,
                    amount: 1,
                    status: 1,
                    room_code: 1,
                    "userDetail.first_name": 1,
                    "userDetail.last_name": 1,
                    "userDetail.email_id": 1,
                    "userDetail.mobile": 1,
                    "joinDetail.j_user_id": 1,
                    "joinDetail.admin_commission": 1,
                    "joinDetail.admin_commission_value": 1,
                    "joinDetail.userDetail.first_name": 1,
                    "joinDetail.userDetail.last_name": 1,
                    "joinDetail.userDetail.email_id": 1,
                    "joinDetail.userDetail.mobile": 1,
                    "BattleResult.battle_result": 1,
                    "BattleResult.description": 1,
                    "BattleResult.user_id": 1,
                    "BattleResult.image": 1,
                    "BattleResult.userDetail.first_name": 1,
                    "BattleResult.userDetail.last_name": 1,
                    "gameHistory.win_status": 1,
                    "gameHistory.win_amount": 1,
                    "gameHistory.gameuserDetail.first_name": 1,
                    "gameHistory.gameuserDetail.last_name": 1,
                    createdAt: 1,
                    updatedAt: 1,
                    __v: 1,
                },
            }
        ])
        if (!isEmpty(battleDetail)) {
            return res.json(responseData("GET_DETAIL", battleDetail, req, true))
        } else {
            return res.json(responseData("NOT_FOUND", {}, req, false))
        }
    } catch (error) {
        return res.json(
            responseData("ERROR_OCCUR", error.message, req, false)
        )
    }

});

// Battle update result
router.get('/admin/battleResultUpdate', async(req, res) => {
    try {
        let { w_user_id, battle_id, amount, admin_commission, admin_commission_value, c_user_id, j_user_id } = req.query
        let win_amount = (amount * 2) - ((amount * 2) * admin_commission) / 100

        if(w_user_id == c_user_id)
        {
            win_user_id     = w_user_id
            lose_user_id    = j_user_id
        }
        else
        {
            win_user_id     = w_user_id
            lose_user_id    = c_user_id    
        }
        const winnergameHistory = new GameHistory({
            user_id: win_user_id,
            battle_id,
            amount,
            win_amount,
            win_status: 1
        })
        await winnergameHistory.save()

        const losergameHistory = new GameHistory({
            user_id: lose_user_id,
            battle_id,
            amount,
            win_amount: 0,
            win_status: 0
        })
        await losergameHistory.save()
        
        // Update Battle status
        const battle = await Battle.findOneAndUpdate({ _id: mongoose.Types.ObjectId(battle_id) }, { status: 1 })

        //Get Details of user for updating wallet amount 
        const userDetail = await User.findOne({ _id: mongoose.Types.ObjectId(win_user_id) })
        let updateWalletAmount = userDetail.wallet_amount + win_amount
        
        // Update win user wallet
        await User.findOneAndUpdate( { _id: mongoose.Types.ObjectId(w_user_id) }, { wallet_amount: updateWalletAmount } )

        if (!isEmpty(battle)) {
            return res.json(responseData("GET_DETAIL", battle, req, true))
        } else {
            return res.json(responseData("NOT_FOUND", {}, req, false))
        }
    } catch (error) {
        return res.json(
            responseData("ERROR_OCCUR", error.message, req, false)
        )
    }

});


module.exports = router;

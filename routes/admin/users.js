const express = require("express");
const session = require('express-session');
const router = express.Router();
const mongoose = require("mongoose")
const User = require('../../models/user')
const UserKyc = require('../../models/userKyc')
const Battle = require('../../models/battle')
const { responseData } = require("../../helpers/responseData")
var { isEmpty } = require("lodash")

// User List
router.get('/admin/getUsers', async(req, res) => {
    try {
            let { page, limit, sort_by, keyword, direction, kycfilter } = req.query
            const sortOptions = {
                [sort_by || "createdAt"]: direction === "asc" ? 1 : -1,
            }
            const options = {
                page: page || 1,
                limit: limit || 10,
                sort_by: sortOptions
            }
            
            var match = {  }
            if (kycfilter) {
                if (kycfilter == 1) {
                    match.kyc = 1
                } else{
                    match.kyc = 0
                }
            }
            
            if (keyword) {
                match["$or"] = [
                    { first_name: { $regex: keyword, $options: 'i' } },
                    { last_name: { $regex: keyword, $options: 'i' } },
                    { email_id: { $regex: keyword, $options: 'i' } },
                    { mobile: { $regex: keyword, $options: 'i' } }
                ]
            }

            const query = User.aggregate([
                {
                    $match: match,
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
                        status: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        __v: 1,
                    },
                },
                {
                    $sort: sortOptions,
                },
            ])
            var finaldata = await User.aggregatePaginate(query, options)
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

// User Details
router.get('/admin/getUserDetails', async(req, res) => {
    try {
        let { id } = req.query
        const userDetail = await User.aggregate([
            {
                $match: { 
                    _id: mongoose.Types.ObjectId(id)
                }
            },
            {
                $lookup: {
                    from: 'userkycs',
                    localField: '_id',
                    foreignField: 'user_id',
                    pipeline: [{
                        $sort: {
                            createdAt: -1
                        }
                    },
                    { 
                        $limit: 1
                    }],
                    as: 'userkyc'
                },
            },
            { 
                $unwind: { path: "$userkyc", preserveNullAndEmptyArrays: true } 
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
                    status: 1,
                    "userkyc.first_name": 1,
                    "userkyc.email_id": 1,
                    "userkyc.dob": 1,
                    "userkyc.aadhar_number": 1,
                    "userkyc.aadhar_front": 1,
                    "userkyc.aadhar_back": 1,
                    createdAt: 1,
                    updatedAt: 1,
                    __v: 1,
                },
            }
        ])

        if (!isEmpty(userDetail)) {
            return res.json(responseData("GET_DETAIL", userDetail, req, true))
        } else {
            return res.json(responseData("NOT_FOUND", {}, req, false))
        }
    } catch (error) {
        return res.json(
            responseData("ERROR_OCCUR", error.message, req, false)
        )
    }

});

// User Details
router.get('/admin/userKycUpdate', async(req, res) => {
    try {
        let { user_id, status } = req.query
        const user = await User.findOneAndUpdate({ _id: user_id }, { kyc: status })
        
        if (!isEmpty(user)) {
            return res.json(responseData("GET_DETAIL", user, req, true))
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

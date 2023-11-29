const axios = require('axios')
const User = require('../models/user')
const UserAccountDetail = require('../models/userAccountDetail')

module.exports = {
    addContact: async(userDetail) => {
        const url = 'https://api.razorpay.com/v1/contacts'
        const username = process.env.RAZOR_PAY_KEY;
        const password = process.env.RAZOR_PAY_SECRET;
        const encodedBase64Token = Buffer.from(`${username}:${password}`).toString('base64');
        const authorization = `Basic ${encodedBase64Token}`;
        const data = {
            "name": userDetail.first_name + ' ' + userDetail.last_name,
            "email": userDetail.email_id,
            "contact": userDetail.mobile,
            "reference_id": userDetail._id
        }

        const response = await axios({
            url,
            method: 'post',
            headers: {
                Authorization: authorization,
            },
            data
        });

        await User.findOneAndUpdate({ _id: userDetail._id }, { razor_contact_id: response.data.id ?? '' })
        return response?.data?.id
    },
    addFundAccount: async(userDetail, razor_contact_id) => {
        const url = 'https://api.razorpay.com/v1/fund_accounts'
        const username = process.env.RAZOR_PAY_KEY;
        const password = process.env.RAZOR_PAY_SECRET;
        const encodedBase64Token = Buffer.from(`${username}:${password}`).toString('base64');
        const authorization = `Basic ${encodedBase64Token}`;
        const data = {
              "account_type": userDetail.account_type,
              "contact_id": razor_contact_id,
              "vpa":{
                "address": userDetail.vpa_account
              }
        }

        const response = await axios({
            url,
            method: 'post',
            headers: {
                Authorization: authorization,
            },
            data
        })

        let apiResposne = {}
        if(response?.data?.id){
            let userAccount = await UserAccountDetail.find({ user_id: userDetail._id, fa_id: response.data.id}).count()
            if(!userAccount){
                const fundAccount = new UserAccountDetail({
                    user_id: userDetail._id,
                    account_type: userDetail.account_type,
                    fa_id: response.data.id,
                    vpa_address: response.data.vpa.address
                })
                await fundAccount.save()
                apiResposne = {
                    status: true,
                    msg: userDetail.account_type + 'created successfully!' 
                }
            }
            else {
                apiResposne = {
                    status: false,
                    msg: userDetail.account_type + 'already exist!' 
                }
            }
        }
        else{
            apiResposne = {
                status: false,
                msg: 'Something went wrong! Please contact Administartor' 
            }
        }
        return apiResposne
    },
    userPayout: async(userDetail) => {
        const url = 'https://api.razorpay.com/v1/payouts'
        const username = process.env.RAZOR_PAY_KEY;
        const password = process.env.RAZOR_PAY_SECRET;
        const encodedBase64Token = Buffer.from(`${username}:${password}`).toString('base64');
        const authorization = `Basic ${encodedBase64Token}`;
        const data = {
            "account_number": "7878780080316316",
            "fund_account_id": "fa_00000000000001",
            "amount": 1000000,
            "currency": "INR",
            "mode": "IMPS",
            "purpose": "refund",
            "queue_if_low_balance": true
        }

        const response = await axios({
            url,
            method: 'post',
            headers: {
                Authorization: authorization,
            },
            data
        })

        let apiResposne = {}
        if(response?.data?.id){
            let userAccount = await UserAccountDetail.find({ user_id: userDetail._id, fa_id: response.data.id}).count()
            if(!userAccount){
                const fundAccount = new UserAccountDetail({
                    user_id: userDetail._id,
                    account_type: userDetail.account_type,
                    fa_id: response.data.id,
                    vpa_address: response.data.vpa.address
                })
                await fundAccount.save()
                apiResposne = {
                    status: true,
                    msg: userDetail.account_type + 'created successfully!' 
                }
            }
            else {
                apiResposne = {
                    status: false,
                    msg: userDetail.account_type + 'already exist!' 
                }
            }
        }
        else{
            apiResposne = {
                status: false,
                msg: 'Something went wrong! Please contact Administartor' 
            }
        }
        return apiResposne
    }
}

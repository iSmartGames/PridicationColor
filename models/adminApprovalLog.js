const mongoose = require('mongoose')

const adminApprovalLogSchema = new mongoose.Schema({
    admin_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Admin'
    },
    join_battle_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'JoinBattle'
    }

}, {
    timestamps: true
})

//battle_status : 1-Cancel the battle, 2-Approval pending from admin to credit amount in user wallet, 0-Running Battle
const AdminApprovalLog = mongoose.model('AdminApprovalLog', adminApprovalLogSchema)

module.exports = AdminApprovalLog
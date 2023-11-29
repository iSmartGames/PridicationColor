const bcrypt = require('bcryptjs')
const validator = require('validator')
const mongoose = require('mongoose')

const adminMasterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email_id: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    super_admin: {
        type: Number,
        default: true,
    },
    status: {
        type: Boolean,
        default: true,
    }

}, {
    timestamps: true
})

//super_admin : 0-super admin, 1-Normal admin
// NOTE: There will be one super admin so that this admin will be not deleted by any one from admin panel

// Hash the plain text password before saving
/*adminMasterSchema.pre('save', async function(next) {
    const admin = this

    if (admin.isModified('password')) {
        admin.password = await bcrypt.hash(admin.password, 8)
    }
    next()
})*/

// Find user credentials in DB for login
adminMasterSchema.statics.findByCredentials = async(email_id, password) => {
    const admin = await AdminMaster.findOne({ email_id })
    if (!admin) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, admin.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return admin
}

const AdminMaster = mongoose.model('AdminMaster', adminMasterSchema)

module.exports = AdminMaster
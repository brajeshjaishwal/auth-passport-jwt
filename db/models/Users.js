const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')

const UserSchema = new Schema({
    name: {
        type:String,
        required: true,
    },
    email: {
        type:String,
        required:true,
        unique: true,
    },
    password: String,
    token: String,
    role: {
        type: String,
        enum: ["admin", "guest", "customer"],
        default: "guest",
    },
    updatedAt: Date,
})

async function hashPassword() {
    const user = this;
    if (user && user.isModified('password')) {
        try {
            const salt = await bcrypt.genSalt(5);
            user.password = await bcrypt.hash(user.password, salt);
        } 
        catch (err) {
            throw err
        }
    }
}

UserSchema.pre('save', hashPassword)

UserSchema.methods.comparePassword = async function comparePassword(password) {
    try{
        return await bcrypt.compare(password, this.password)
    }
    catch(err)
    {
        throw err
    }
}

UserSchema.statics.findUserByToken = async function (token) {
    try{
        return await Users.findOne({token})
    }
    catch(err)
    {
        throw err
    }
}

UserSchema.statics.findUserByEmail = async function (email) {
    try{
        return await Users.findOne({email})
    }
    catch(err)
    {
        throw err
    }
}

var Users = module.exports = mongoose.model('User', UserSchema)
const mongoose = require("mongoose")
const UserSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    mobilenumber:{
        type:String,
        required:true,
        unique:true,
    }
})
const UserModel = mongoose.model("user", UserSchema )
module.exports = UserModel
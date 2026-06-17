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
    },
    // Stored as a bcrypt hash, never the plaintext. `select:false` keeps it out
    // of every default query so it is never accidentally returned to the client.
    password:{
        type:String,
        required:true,
        select:false,
    },
    age:{
        type:Number,
    }
})
const UserModel = mongoose.model("user", UserSchema )
module.exports = UserModel
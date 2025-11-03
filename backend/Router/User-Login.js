const Router = require("express");
const UserModel = require("../Model/UserSchema");
const LoginRouter = Router();
const jwt = require("jsonwebtoken")
LoginRouter.post("/user-login" , async(req , res)=>{
    const {name , mobilenumber} = req.body;
    const newUser = await UserModel.findOne({mobilenumber:`+91${mobilenumber}`});
    if(!newUser){
        return res.status(404).json("please Register First")
    }
    res.clearCookie("token", "26020451202", { path: "/", domain: "localhost", httplOnly: true, signed: true })
    const expires = new Date()
    expires.setDate(expires.getDate() + 7)
    const payload = {newUser};
    const token = jwt.sign({payload} , "26020451202")
    res.cookie("token", token, "26020451202", { path: "/", domain: "localhost", httplOnly: false, signed: true, expires })
    console.log(req.cookies.token);
    
    res.status(200).json(newUser)
})
module.exports = LoginRouter
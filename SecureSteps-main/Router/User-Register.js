const Router = require("express");
const UserModel = require("../Model/UserSchema");
const { body, validationResult } = require('express-validator');
const jwt = require("jsonwebtoken")
const USerRouter = Router();
USerRouter.post("/user-register" , [
    body("name").isLength({min:4}).withMessage("username must be of minimun length 4"),
    body("mobilenumber").isLength({min:10} , {max:10}).withMessage("enter the valid Number"),
    body("mobilenumber").isNumeric().withMessage("mobilenumber only contains numeric value")
], async(req , res)=>{
    const error= validationResult(req)
    if(!error.isEmpty()){
        res.status(400).json({erros:error.array()});
    }
    try{
     const {name , mobilenumber} = req.body;
    const user = await UserModel.findOne({mobilenumber:`+91${mobilenumber}`});
    if(user){
        return res.status(501).json("user already exist please login");
    }
    const newUser = await UserModel.create({name, mobilenumber: `+91${mobilenumber}`});
    res.clearCookie("token" , "26020451202" , {path : "/" , domain : "localhost" , httpOnly: true , signed: true} )
    const expires = new Date()
    expires.setDate(expires.getDate() + 7)
    const payload = {newUser};
    const token = jwt.sign({payload} , "26020451202");
    res.cookie("token" , token , "26020451202" , {path : "/" , domain : "localhost" , httpOnly: true , signed: true})
    res.status(200).json(newUser);
    }
    catch(e){
        console.log("error");
    }
})
module.exports = USerRouter
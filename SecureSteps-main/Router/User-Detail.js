const Router = require("express");
const UserModel = require("../Model/UserSchema");
const { body, validationResult } = require('express-validator');
const detailModel = require("../Model/UserDetailSchema");
const USerDetailRouter = Router();
USerDetailRouter.post("/user-detail" , async(req , res)=>{
    const body = req.body;
  
    const newDetails = await detailModel.create(body);
    console.log(newDetails);
    res.status(200).json(newDetails);
   
} )
module.exports = USerDetailRouter
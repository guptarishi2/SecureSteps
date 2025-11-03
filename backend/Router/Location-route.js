const verifytoken = require("../Middleware/verifytoken")
const Router = require("express");
const detailModel = require("../Model/UserDetailSchema");
const createCall = require("../Controller/Call");
const createMessage = require("../Controller/SMS");
const LocationRouter = Router()
LocationRouter.post("/post-location", verifytoken, async (req, res) => {
   try {
     const userMobileNumber = req.userid.payload.newUser.mobilenumber;
     console.log(userMobileNumber);
 
     const users = await detailModel.findOne({ mobileNumber: userMobileNumber });
     
     if (!users) {
       return res.status(404).json({ message: "User not found" });
     }
 
     console.log(users);
     const numbers = [users.fatherMobile, users.motherMobile, users.guardianMobile];
 
     // Assuming createCall and createMessage return promises, add await
     await createCall(numbers);
     await createMessage(numbers);
 
     res.status(200).json("success");
   } catch (error) {
     console.error(error);
     res.status(500).json({ message: "Server error" });
   }
 });
 
module.exports = LocationRouter
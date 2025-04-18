const express = require("express");
const createMessage = require("./Controller/SMS");
const createCall = require("./Controller/Call");
const connectiona = require("./Connect");
const USerRouter = require("./Router/User-Register");
const cors = require("cors");
const cookiParser = require("cookie-parser")
const USerDetailRouter = require("./Router/User-Detail");
const LoginRouter = require("./Router/User-Login");
const LocationRouter = require("./Router/Location-route");
const app = express();
app.use(express.json());
app.use(cors({
    credentials:true,
    origin:"http://localhost:3000"
    }))

app.use(cookiParser("26020451202"))


/*app.post("/post-coordinates"  , async(req , res)=>{
    const {number} = req.body;
    try{
    createMessage(number);
    createCall(number);
    res.status(200).json("success")
    }
    catch(e){
        console.log("error" , e);
    }
})
app.post("//user-login" , async(req , res)=>{
    const {name , mobilenumber} = req.body;
})*/
app.use( "/user" , USerRouter)
app.use("/user" , USerDetailRouter)
app.use("/user" , LoginRouter)
app.use("/user" , LocationRouter)
connectiona()
.then(()=>{
    app.listen(1042 , ()=>{
        console.log("listening to Port " , 1042);
    })
})
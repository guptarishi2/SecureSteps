// const twilio = require("twilio"); // Or, for ESM: import twilio from "twilio";

// // Find your Account SID and Auth Token at twilio.com/console
// // and set the environment variables. See http://twil.io/secure
// const accountSid = process.env.Sid;
// const authToken = process.env.auth_token;
// const client = twilio(accountSid, authToken);
// const numbers = ["+919910143711" , "+919889385255"]
// async function createCall() {
//   numbers.forEach(async(number)=>{
//     await client.calls.create({
//       from: "+12565874362",
//       to: number,
//     twiml: "<Response><Say>Teri Maa ki chut</Say></Response>",
//   })
//   .then((call)=>console.log(call.sid))
//   })
//   }
//   //createCall(numbers)

// async function createMessage() {
//   numbers.forEach(async(number)=>{
//     await client.messages.create({
//       body: "hi boys",
//       from: "+12565874362",
//       to: number,
//   })
//   })
// }

// //createMessage(numbers);

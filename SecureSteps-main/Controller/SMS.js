const twilio = require("twilio");
const accountSid = process.env.Sid;
const authToken = process.env.auth_token;
const client = twilio(accountSid, authToken);
async function createMessage(numbers) {
  numbers.forEach(async(number)=>{
    await client.messages.create({
      body: "hi boys",
      from: "+12565874362",
      to: number,
  })
  })
}
module.exports = createMessage;  

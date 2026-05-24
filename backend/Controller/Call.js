// require("dotenv").config();
const twilio = require("twilio");
const accountSid = process.env.Sid;
const authToken = process.env.auth_token;
const client = twilio(accountSid, authToken);
async function createCall(numbers) {
  numbers.forEach(async (number) => {
    await client.calls
      .create({
        from: "+12565874362",
        to: number,
        twiml: "<Response><Say>Hi</Say></Response>",
      })
      .then((call) => console.log(call.sid));
  });
}
module.exports = createCall;

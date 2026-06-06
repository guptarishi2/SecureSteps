const twilio = require("twilio");

const accountSid = process.env.Sid;
const authToken = process.env.auth_token;
const fromNumber = process.env.TWILIO_FROM || "+12565874362";
const client = twilio(accountSid, authToken);

async function createCall(numbers) {
  const list = Array.isArray(numbers) ? numbers.filter(Boolean) : [numbers].filter(Boolean);

  await Promise.allSettled(
    list.map((number) =>
      client.calls
        .create({
          from: fromNumber,
          to: number,
          twiml:
            "<Response><Say>This is an emergency alert from Secure Steps. Someone you know may be in danger and is sharing their live location with you. Please check your messages.</Say></Response>",
        })
        .then((call) => console.log("Call placed:", call.sid))
        .catch((err) => console.error(`Call to ${number} failed:`, err.message))
    )
  );
}

module.exports = createCall;

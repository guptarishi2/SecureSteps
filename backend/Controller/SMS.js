const twilio = require("twilio");

const accountSid = process.env.Sid;
const authToken = process.env.auth_token;
const fromNumber = process.env.TWILIO_FROM || "+12565874362";
const client = twilio(accountSid, authToken);

async function createMessage(numbers, body = "Emergency alert from SecureSteps.") {
  const list = Array.isArray(numbers) ? numbers.filter(Boolean) : [numbers].filter(Boolean);

  await Promise.allSettled(
    list.map((number) =>
      client.messages
        .create({ body, from: fromNumber, to: number })
        .then((msg) => console.log("SMS sent:", msg.sid))
        .catch((err) => console.error(`SMS to ${number} failed:`, err.message))
    )
  );
}

module.exports = createMessage;

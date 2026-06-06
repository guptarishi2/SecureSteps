const twilio = require("twilio");

const accountSid = process.env.Sid;
const authToken = process.env.auth_token;
// Number your Twilio account owns. Defaults to the project's purchased number
// and can be overridden with the TWILIO_FROM env var.
const fromNumber = process.env.TWILIO_FROM || "+14788127071";
const client = twilio(accountSid, authToken);

// Sends `body` to every number and returns a per-recipient result array
// [{ to, success, sid?, error?, code? }] so the caller can report failures.
async function createMessage(numbers, body = "Emergency alert from SecureSteps.") {
  const list = Array.isArray(numbers) ? numbers.filter(Boolean) : [numbers].filter(Boolean);

  if (!fromNumber) {
    return list.map((to) => ({
      to,
      success: false,
      error: "TWILIO_FROM is not configured (no Twilio sender number).",
    }));
  }

  return Promise.all(
    list.map(async (number) => {
      try {
        const msg = await client.messages.create({ body, from: fromNumber, to: number });
        console.log("SMS sent:", msg.sid);
        return { to: number, success: true, sid: msg.sid };
      } catch (err) {
        console.error(`SMS to ${number} failed:`, err.message);
        return { to: number, success: false, error: err.message, code: err.code };
      }
    })
  );
}

module.exports = createMessage;

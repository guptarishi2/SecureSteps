const twilio = require("twilio");

const accountSid = process.env.Sid;
const authToken = process.env.auth_token;
const fromNumber = process.env.TWILIO_FROM; // must be a number your Twilio account owns
const client = twilio(accountSid, authToken);

const TWIML =
  "<Response><Say>This is an emergency alert from Secure Steps. Someone you know may be in danger and is sharing their live location with you. Please check your messages.</Say></Response>";

// Places a call to every number and returns a per-recipient result array
// [{ to, success, sid?, error?, code? }].
async function createCall(numbers) {
  const list = Array.isArray(numbers) ? numbers.filter(Boolean) : [numbers].filter(Boolean);

  if (!fromNumber) {
    return list.map((to) => ({
      to,
      success: false,
      error: "TWILIO_FROM is not configured (no Twilio caller number).",
    }));
  }

  return Promise.all(
    list.map(async (number) => {
      try {
        const call = await client.calls.create({ from: fromNumber, to: number, twiml: TWIML });
        console.log("Call placed:", call.sid);
        return { to: number, success: true, sid: call.sid };
      } catch (err) {
        console.error(`Call to ${number} failed:`, err.message);
        return { to: number, success: false, error: err.message, code: err.code };
      }
    })
  );
}

module.exports = createCall;

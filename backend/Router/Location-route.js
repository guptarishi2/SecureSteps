const Router = require("express");
const verifytoken = require("../Middleware/verifytoken");
const detailModel = require("../Model/UserDetailSchema");
const createCall = require("../Controller/Call");
const createMessage = require("../Controller/SMS");
const { localDigits } = require("../utils/phone");

const LocationRouter = Router();

// Frontend base used to build the live-tracking link inside the alert.
// Defaults to the production frontend so a missing CLIENT_URL env doesn't
// produce useless "http://localhost:3000" links in deployed alerts.
const FRONTEND_URL = (
  process.env.CLIENT_URL ||
  (process.env.CLIENT_URLS || "").split(",")[0] ||
  "https://secure-steps-djqj.vercel.app"
)
  .trim()
  .replace(/\/+$/, "");

LocationRouter.post("/post-location", verifytoken, async (req, res) => {
  try {
    const userMobileNumber = req.userid.user.mobilenumber;

    const userDetails = await detailModel.findOne({ mobileNumber: userMobileNumber });
    if (!userDetails) {
      return res.status(404).json({ message: "Please fill in your details first" });
    }

    // Emergency contacts (already stored in E.164 by the detail route).
    const numbers = [
      userDetails.fatherMobile,
      userDetails.motherMobile,
      userDetails.guardianMobile,
    ].filter(Boolean);

    // Live-tracking link the contacts open — the room is the user's bare digits,
    // which is exactly what the frontend uses as the socket room name.
    const room = localDigits(userMobileNumber);
    const trackingLink = `${FRONTEND_URL}/maplocation/${room}`;

    if (numbers.length === 0) {
      return res.status(200).json({
        message: "No emergency contacts saved. Share this tracking link manually.",
        room,
        trackingLink,
        alerts: [],
      });
    }

    const messageBody = `${userDetails.name} may be in danger and is sharing a live location with you. Track here: ${trackingLink}`;

    const [smsResults, callResults] = await Promise.all([
      createMessage(numbers, messageBody),
      createCall(numbers),
    ]);

    const alerts = numbers.map((to) => ({
      to,
      sms: smsResults.find((r) => r.to === to) || null,
      call: callResults.find((r) => r.to === to) || null,
    }));

    const anyDelivered = smsResults.some((r) => r.success) || callResults.some((r) => r.success);

    // Socket location sharing works regardless, so always return room + link.
    if (!anyDelivered) {
      const firstError =
        smsResults.find((r) => !r.success && r.error)?.error ||
        callResults.find((r) => !r.success && r.error)?.error ||
        "Unknown Twilio error";
      return res.status(502).json({
        message: `Could not alert your contacts (${firstError}). You can still share the tracking link manually.`,
        room,
        trackingLink,
        alerts,
      });
    }

    return res.status(200).json({
      message: "Alert sent to your emergency contacts",
      room,
      trackingLink,
      alerts,
    });
  } catch (error) {
    console.error("post-location error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = LocationRouter;

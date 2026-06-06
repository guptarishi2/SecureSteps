const Router = require("express");
const verifytoken = require("../Middleware/verifytoken");
const detailModel = require("../Model/UserDetailSchema");
const createCall = require("../Controller/Call");
const createMessage = require("../Controller/SMS");
const { localDigits } = require("../utils/phone");

const LocationRouter = Router();

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
    const frontendUrl = (process.env.CLIENT_URL || "http://localhost:3000").replace(/\/$/, "");
    const trackingLink = `${frontendUrl}/maplocation/${room}`;
    const messageBody = `${userDetails.name} may be in danger and is sharing a live location with you. Track here: ${trackingLink}`;

    await Promise.allSettled([
      createCall(numbers),
      createMessage(numbers, messageBody),
    ]);

    return res.status(200).json({ message: "Alert sent to your emergency contacts", room });
  } catch (error) {
    console.error("post-location error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = LocationRouter;

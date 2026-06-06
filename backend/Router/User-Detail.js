const Router = require("express");
const detailModel = require("../Model/UserDetailSchema");
const { formatPhone } = require("../utils/phone");

const USerDetailRouter = Router();

USerDetailRouter.post("/user-detail", async (req, res) => {
  try {
    const body = { ...req.body };

    // Normalise every phone field to E.164 so the location lookup (which uses
    // the registered "+91..." number) matches and Twilio receives valid targets.
    body.mobileNumber = formatPhone(body.mobileNumber);
    body.fatherMobile = formatPhone(body.fatherMobile);
    body.motherMobile = formatPhone(body.motherMobile);
    if (body.guardianMobile) body.guardianMobile = formatPhone(body.guardianMobile);

    // Upsert so re-submitting details for the same user updates instead of
    // creating duplicates that would break the single-result location lookup.
    const newDetails = await detailModel.findOneAndUpdate(
      { mobileNumber: body.mobileNumber },
      body,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json(newDetails);
  } catch (e) {
    console.error("Detail save error:", e.message);
    return res.status(500).json({ message: "Server error saving details" });
  }
});

module.exports = USerDetailRouter;

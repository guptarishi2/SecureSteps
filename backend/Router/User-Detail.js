const Router = require("express");
const detailModel = require("../Model/UserDetailSchema");
const verifytoken = require("../Middleware/verifytoken");
const { formatPhone } = require("../utils/phone");

const USerDetailRouter = Router();

// Returns whether the logged-in user has already filled their family details.
// The frontend uses this after login to decide between the Details form (first
// time) and the Share-Location screen (returning user). Also returns the saved
// details so the Details form can pre-fill when the user chooses to edit them.
USerDetailRouter.get("/user-detail", verifytoken, async (req, res) => {
  try {
    const mobileNumber = formatPhone(req.userid.user.mobilenumber);
    const details = await detailModel.findOne({ mobileNumber });
    return res.status(200).json({ exists: !!details, details: details || null });
  } catch (e) {
    console.error("Detail fetch error:", e.message);
    return res.status(500).json({ message: "Server error fetching details" });
  }
});

USerDetailRouter.post("/user-detail", verifytoken, async (req, res) => {
  try {
    const body = { ...req.body };

    // Key the record off the authenticated user's number, not whatever the body
    // claims, so a user can only ever write/overwrite their own details.
    body.mobileNumber = formatPhone(req.userid.user.mobilenumber);

    // Normalise the contact phone fields to E.164 so the location lookup (which
    // uses the registered "+91..." number) matches and Twilio receives valid targets.
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

const Router = require("express");
const UserModel = require("../Model/UserSchema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { formatPhone } = require("../utils/phone");

const LoginRouter = Router();

// A real bcrypt hash of a value no user can supply. We compare against it on the
// "no such user" path so that path does the same expensive work as the wrong-
// password path — otherwise response timing would reveal whether a number is
// registered even when the status/body are identical.
const DUMMY_HASH = bcrypt.hashSync("securesteps-not-a-real-password", 10);

// One identical failure for every credential problem (unknown number, no hash,
// or wrong password). Returning different statuses/messages would let anyone
// probe which phone numbers have an account — a privacy risk for a safety app.
const INVALID_CREDENTIALS = { message: "Invalid phone number or password" };

LoginRouter.post("/user-login", async (req, res) => {
  try {
    const { mobilenumber, password } = req.body;

    if (!mobilenumber || typeof password !== "string" || !password) {
      return res.status(400).json({ message: "Phone number and password are required" });
    }

    const phone = formatPhone(mobilenumber);

    // password has `select:false`, so explicitly pull it in for the compare.
    const user = await UserModel.findOne({ mobilenumber: phone }).select("+password");

    // Unknown number, or an old account created before passwords existed: spend
    // the same time as a real compare, then return the identical generic error.
    if (!user || !user.password) {
      await bcrypt.compare(password, DUMMY_HASH);
      return res.status(401).json(INVALID_CREDENTIALS);
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json(INVALID_CREDENTIALS);
    }

    const token = jwt.sign(
      { user: { id: user._id, name: user.name, mobilenumber: user.mobilenumber } },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const safeUser = {
      _id: user._id,
      name: user.name,
      mobilenumber: user.mobilenumber,
      age: user.age,
    };

    return res.status(200).json({ user: safeUser, token });
  } catch (e) {
    console.error("Login error:", e.message);
    return res.status(500).json({ message: "Server error during login" });
  }
});

module.exports = LoginRouter;

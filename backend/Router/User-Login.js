const Router = require("express");
const UserModel = require("../Model/UserSchema");
const jwt = require("jsonwebtoken");
const { formatPhone } = require("../utils/phone");

const LoginRouter = Router();

LoginRouter.post("/user-login", async (req, res) => {
  try {
    const { mobilenumber } = req.body;
    const phone = formatPhone(mobilenumber);

    const user = await UserModel.findOne({ mobilenumber: phone });
    if (!user) {
      return res.status(404).json({ message: "Please register first" });
    }

    const token = jwt.sign(
      { user: { id: user._id, name: user.name, mobilenumber: user.mobilenumber } },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({ user, token });
  } catch (e) {
    console.error("Login error:", e.message);
    return res.status(500).json({ message: "Server error during login" });
  }
});

module.exports = LoginRouter;

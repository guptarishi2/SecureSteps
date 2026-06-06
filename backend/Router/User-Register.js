const Router = require("express");
const UserModel = require("../Model/UserSchema");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { formatPhone } = require("../utils/phone");

const USerRouter = Router();

USerRouter.post(
  "/user-register",
  [
    body("name").isLength({ min: 4 }).withMessage("username must be of minimum length 4"),
    body("mobilenumber").isLength({ min: 10, max: 10 }).withMessage("enter a valid 10 digit number"),
    body("mobilenumber").isNumeric().withMessage("mobilenumber only contains numeric value"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, mobilenumber, age } = req.body;
      const phone = formatPhone(mobilenumber);

      const existing = await UserModel.findOne({ mobilenumber: phone });
      if (existing) {
        return res.status(409).json({ message: "User already exists, please login" });
      }

      const newUser = await UserModel.create({
        name,
        mobilenumber: phone,
        age: age ? Number(age) : undefined,
      });

      const token = jwt.sign(
        { user: { id: newUser._id, name: newUser.name, mobilenumber: newUser.mobilenumber } },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.status(201).json({ user: newUser, token });
    } catch (e) {
      console.error("Register error:", e.message);
      return res.status(500).json({ message: "Server error during registration" });
    }
  }
);

module.exports = USerRouter;

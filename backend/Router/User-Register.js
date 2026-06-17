const Router = require("express");
const UserModel = require("../Model/UserSchema");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { formatPhone } = require("../utils/phone");

const USerRouter = Router();

USerRouter.post(
  "/user-register",
  [
    body("name").isLength({ min: 4 }).withMessage("username must be of minimum length 4"),
    body("mobilenumber").isLength({ min: 10, max: 10 }).withMessage("enter a valid 10 digit number"),
    body("mobilenumber").isNumeric().withMessage("mobilenumber only contains numeric value"),
    body("password").isString().withMessage("password must be text"),
    body("password").isLength({ min: 6 }).withMessage("password must be at least 6 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, mobilenumber, password, age } = req.body;
      const phone = formatPhone(mobilenumber);

      const existing = await UserModel.findOne({ mobilenumber: phone });
      if (existing) {
        return res.status(409).json({ message: "User already exists, please login" });
      }

      // Hash the password before it ever touches the database.
      const passwordHash = await bcrypt.hash(password, 10);

      const newUser = await UserModel.create({
        name,
        mobilenumber: phone,
        password: passwordHash,
        age: age ? Number(age) : undefined,
      });

      const token = jwt.sign(
        { user: { id: newUser._id, name: newUser.name, mobilenumber: newUser.mobilenumber } },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Never return the password hash to the client.
      const safeUser = {
        _id: newUser._id,
        name: newUser.name,
        mobilenumber: newUser.mobilenumber,
        age: newUser.age,
      };

      return res.status(201).json({ user: safeUser, token });
    } catch (e) {
      console.error("Register error:", e.message);
      return res.status(500).json({ message: "Server error during registration" });
    }
  }
);

module.exports = USerRouter;

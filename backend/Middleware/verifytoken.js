// require("dotenv").config();
const jwt = require("jsonwebtoken")
const verifytoken = (req, res, next) => {
    const token = req.cookies.token
    console.log(token);
    try {
        if (!token) return res.status(400).json({ msg: "Not found" })
        jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
          if (err) return res.status(401).json({ msg: "token is not valid" });
          req.userid = payload;
          console.log(payload);

          next();
        });
    }
    catch (e) {

    }
}
module.exports = verifytoken

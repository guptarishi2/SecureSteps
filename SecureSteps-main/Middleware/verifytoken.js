const jwt = require("jsonwebtoken")
const verifytoken = (req, res, next) => {
    const token = req.cookies.token
    console.log(token);
    try {
        if (!token) return res.status(400).json({ msg: "Not found" })
        jwt.verify(token, "26020451202", async (err, payload) => {
            if (err) return res.status(401).json({ msg: "token is not valid" })
            req.userid = payload;
        console.log(payload);
        
            next();
        })
    }
    catch (e) {

    }
}
module.exports = verifytoken
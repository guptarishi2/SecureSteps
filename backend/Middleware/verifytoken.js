const jwt = require("jsonwebtoken");

// Reads the JWT from the Authorization header ("Bearer <token>") first, and
// falls back to a cookie. Header-based auth works reliably across separate
// frontend/backend domains where third-party cookies are often blocked.
const verifytoken = (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ msg: "Authentication required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) return res.status(401).json({ msg: "Token is not valid" });
    req.userid = payload;
    next();
  });
};

module.exports = verifytoken;

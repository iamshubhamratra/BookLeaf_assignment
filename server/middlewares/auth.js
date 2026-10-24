const jwt = require("jsonwebtoken");
const User = require("../models/users");

async function authFn(req, res, next) {
  const userCookie = req.cookies?.bookleaf;
  if (!userCookie) {
    return res.status(401).json({ success: false, message: "unauthorized" });
  }

  try {
    const decoded = jwt.verify(userCookie, process.env.SECRET_KEY);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: "user not found" });
    }
    req.userId = decoded.id;
    req.user = user; // has role and authorId
    next();
  } catch {
    return res.status(401).json({ success: false, message: "invalid token" });
  }
}

module.exports = authFn;
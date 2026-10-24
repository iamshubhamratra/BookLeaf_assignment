const express = require("express");
const signupValidator = require("../validations/signupValidator");
const loginValidator = require("../validations/loginValidator");
const logoutValidator = require("../validations/logoutValidator");
const signup = require("../controllers/signupController");
const login = require("../controllers/loginController");
const logout = require("../controllers/logoutController");
const authFn = require("../middlewares/auth");

const router = express.Router();

router.post("/signup", signupValidator, signup);
router.post("/login", loginValidator, login);
router.post("/logout", logoutValidator, logout);

// Used by the frontend on page load to restore the logged-in user
router.get("/me", authFn, async (req, res) => {
  const User = require("../models/users");
  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "user not found" });
  }
  return res.status(200).json({
    success: true,
    message: "user found",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      authorId: user.authorId,
    },
  });
});

module.exports = router;

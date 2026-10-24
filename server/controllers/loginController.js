const jwt = require("jsonwebtoken");
const User = require("../models/users");
const encPass = require("../helper/encPassword");

async function login(req, res) {
  try {
    const { email, password } = req.body;

    // password is hidden by default, so select it explicitly for the comparison
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "invalid email or password" });
    }

    const isMatch = await encPass(password, "decrypt", user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id.toString() },
      process.env.SECRET_KEY,
      { expiresIn: "1d" },
    );
    res.cookie("bookleaf", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "logged in",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        authorId: user.authorId,
      },
    });
  } catch (error) {
    console.error("login error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "something went wrong" });
  }
}

module.exports = login;

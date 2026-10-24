const jwt = require("jsonwebtoken");
const User = require("../models/users");
const encPass = require("../helper/encPassword");

async function signup(req, res) {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "email already registered" });
    }

    const hashedPass = await encPass(password, "encrypt");
    if (!hashedPass) {
      return res
        .status(500)
        .json({ success: false, message: "could not secure password" });
    }

    const user = await User.create({ name, email, password: hashedPass });

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

    return res.status(201).json({
      success: true,
      message: "account created",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        authorId: user.authorId,
      },
    });
  } catch (error) {
    console.error("signup error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "something went wrong" });
  }
}

module.exports = signup;

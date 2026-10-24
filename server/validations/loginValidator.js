const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function loginValidator(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required" });
  }
  if (typeof email !== "string" || !emailRegex.test(email.trim())) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid email format" });
  }
  if (typeof password !== "string") {
    return res
      .status(400)
      .json({ success: false, message: "Password must be text" });
  }

  req.body.email = email.trim().toLowerCase();
  next();
}

module.exports = loginValidator;

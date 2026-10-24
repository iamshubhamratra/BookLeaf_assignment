const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

function signupValidator(req, res, next) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Name, email and password are required",
    });
  }
  if (typeof name !== "string" || !name.trim()) {
    return res
      .status(400)
      .json({ success: false, message: "Name must be valid text" });
  }
  if (typeof email !== "string" || !emailRegex.test(email.trim())) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid email format" });
  }
  if (typeof password !== "string" || !passRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message:
        "Password must be 8+ characters with uppercase, lowercase, number and one of @$!%*?&",
    });
  }

  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  next();
}

module.exports = signupValidator;

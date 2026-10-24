function logout(req, res) {
  res.clearCookie("bookleaf", { httpOnly: true, sameSite: "lax" });
  return res.status(200).json({ success: true, message: "logged out" });
}

module.exports = logout;
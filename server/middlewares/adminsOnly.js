// Use after authFn. Blocks anyone who is not an admin.
function adminOnly(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "admins only" });
  }
  next();
}

module.exports = adminOnly;
// Logout only needs an existing session cookie to clear
const logoutValidator = (req, res, next) => {
  if (!req.cookies || !req.cookies.bookleaf) {
    return res.status(401).json({
      success: false,
      message: 'You are not logged in',
    });
  }
  next();
};

module.exports = logoutValidator;
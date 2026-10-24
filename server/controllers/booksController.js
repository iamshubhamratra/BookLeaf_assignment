const Book = require("../models/books");

async function getBooks(req, res) {
  try {
    // Admin sees all books. An author sees only their own.
    const filter =
      req.user.role === "admin" ? {} : { authorId: req.user.authorId };
    const books = await Book.find(filter);
    return res.status(200).json({ success: true, books });
  } catch (error) {
    console.error("getBooks error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "something went wrong" });
  }
}

module.exports = { getBooks };

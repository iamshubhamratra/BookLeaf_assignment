const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  authorId: { type: String, required: true, index: true }, // e.g. "AUTH001"
  book_id: String,
  title: String,
  isbn: String,
  genre: String,
  publication_date: String, // null for books still in production
  status: String,
  mrp: Number,
  author_royalty_per_copy: Number,
  total_copies_sold: Number,
  total_royalty_earned: Number,
  royalty_paid: Number,
  royalty_pending: Number,
  last_royalty_payout_date: String,
  print_partner: String,
  available_on: [String],
});

module.exports = mongoose.model("book", bookSchema);

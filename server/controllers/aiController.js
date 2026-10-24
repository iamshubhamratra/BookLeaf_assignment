const Ticket = require("../models/tickets");
const Book = require("../models/books");
const User = require("../models/users");
const { draftReply } = require("../ai/aiService");

// POST /api/tickets/:id/draft  (admin only)
async function getDraft(req, res) {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "ticket not found" });
    }

    // If a draft is already saved, reuse it (saves money)
    if (ticket.aiDraft && req.query.regenerate !== "true") {
      return res.status(200).json({ success: true, draft: ticket.aiDraft });
    }

    // Get only the books that matter for this ticket
    let books;
    if (ticket.bookId) {
      books = await Book.find({ book_id: ticket.bookId });
    } else {
      books = await Book.find({ authorId: ticket.authorId });
    }

    const author = await User.findOne({ authorId: ticket.authorId });
    const draft = await draftReply(ticket, books, author ? author.name : "there");

    ticket.aiDraft = draft;
    await ticket.save();

    return res.status(200).json({ success: true, draft });
  } catch (error) {
    console.error("getDraft error:", error.message);
    // If the AI fails, the admin can still write the reply by hand
    return res.status(503).json({
      success: false,
      message: "AI is not available. Please write the reply manually.",
    });
  }
}

module.exports = { getDraft };
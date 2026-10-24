const Ticket = require("../models/tickets");
const Book = require("../models/books");
const { classifyTicket } = require("../ai/aiService"); // Edit 1: import the AI function

// Edit 3: fields that authors must never see
const AUTHOR_HIDDEN_FIELDS = "-internalNotes -aiDraft";

// Used to sort tickets: most urgent first
const PRIORITY_RANK = { Critical: 0, High: 1, Medium: 2, Low: 3 };

// ---------- AUTHOR ----------

// POST /api/tickets
async function createTicket(req, res) {
  try {
    const { bookId, subject, description } = req.body;

    if (!subject || !description) {
      return res
        .status(400)
        .json({
          success: false,
          message: "subject and description are required",
        });
    }

    // If a book is chosen, it must belong to this author
    if (bookId) {
      const book = await Book.findOne({
        book_id: bookId,
        authorId: req.user.authorId,
      });
      if (!book) {
        return res
          .status(400)
          .json({ success: false, message: "invalid book" });
      }
    }

    const ticket = await Ticket.create({
      authorId: req.user.authorId,
      bookId: bookId || null,
      subject,
      description,
    });

    // Edit 2: ask the AI for category and priority in the background.
    // We do not use await, so the author does not wait for the AI.
    // If the AI fails, the ticket keeps its default category and priority.
    classifyTicket(subject, description)
      .then((result) => {
        return Ticket.findByIdAndUpdate(ticket._id, {
          category: result.category,
          priority: result.priority,
          aiClassified: true,
        });
      })
      .catch((err) => console.log("AI classify failed:", err.message));

    return res
      .status(201)
      .json({ success: true, message: "ticket created", ticket });
  } catch (error) {
    console.error("createTicket error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "something went wrong" });
  }
}

// GET /api/tickets/mine
async function getMyTickets(req, res) {
  try {
    const tickets = await Ticket.find({ authorId: req.user.authorId })
      .select(AUTHOR_HIDDEN_FIELDS)
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, tickets });
  } catch (error) {
    console.error("getMyTickets error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "something went wrong" });
  }
}

// ---------- ADMIN ----------

// GET /api/tickets?status=Open&category=...&priority=...
async function getAllTickets(req, res) {
  try {
    const { status, category, priority } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const tickets = await Ticket.find(filter);

    // Most urgent first, and oldest first when priority is the same
    tickets.sort((a, b) => {
      return (
        PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
        a.createdAt - b.createdAt
      );
    });

    return res.status(200).json({ success: true, tickets });
  } catch (error) {
    console.error("getAllTickets error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "something went wrong" });
  }
}

// GET /api/tickets/:id  (admin sees everything, author sees only their own ticket)
async function getTicketById(req, res) {
  try {
    const ticket = await Ticket.findById(req.params.id).populate("assignedTo", "name");
    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "ticket not found" });
    }

    if (req.user.role !== "admin") {
      if (ticket.authorId !== req.user.authorId) {
        return res
          .status(403)
          .json({ success: false, message: "not your ticket" });
      }

      // Edit 3: remove the hidden fields before sending to the author
      const safe = ticket.toObject();
      delete safe.internalNotes;
      delete safe.aiDraft;
      return res.status(200).json({ success: true, ticket: safe });
    }

    return res.status(200).json({ success: true, ticket });
  } catch (error) {
    console.error("getTicketById error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "something went wrong" });
  }
}

// PATCH /api/tickets/:id  (change status, category, priority, or assign to me)
async function updateTicket(req, res) {
  try {
    const { status, category, priority, assignToMe } = req.body;

    const update = {};
    if (status) update.status = status;
    if (category) update.category = category;
    if (priority) update.priority = priority;
    if (assignToMe) update.assignedTo = req.userId;

    // runValidators rejects values that are not in the allowed lists
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, update, {
  new: true,
  runValidators: true,
}).populate("assignedTo", "name");

    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "ticket not found" });
    }
    return res.status(200).json({ success: true, ticket });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

// POST /api/tickets/:id/reply  (admin sends a reply the author can see)
async function replyToTicket(req, res) {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "message is required" });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "ticket not found" });
    }

    ticket.responses.push({ message: message.trim() });

    // First reply moves the ticket from Open to In Progress
    if (ticket.status === "Open") ticket.status = "In Progress";

    await ticket.save();
    return res.status(200).json({ success: true, ticket });
  } catch (error) {
    console.error("replyToTicket error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "something went wrong" });
  }
}

// POST /api/tickets/:id/notes  (internal note, the author cannot see it)
async function addInternalNote(req, res) {
  try {
    const { note } = req.body;
    if (!note || !note.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "note is required" });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "ticket not found" });
    }

    ticket.internalNotes.push({ note: note.trim() });
    await ticket.save();

    return res.status(200).json({ success: true, ticket });
  } catch (error) {
    console.error("addInternalNote error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "something went wrong" });
  }
}

module.exports = {
  createTicket,
  getMyTickets,
  getAllTickets,
  getTicketById,
  updateTicket,
  replyToTicket,
  addInternalNote,
};

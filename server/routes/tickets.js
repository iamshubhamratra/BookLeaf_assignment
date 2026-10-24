const express = require("express");
const authFn = require("../middlewares/auth");
const adminOnly = require("../middlewares/adminsOnly");
const t = require("../controllers/ticketController");
const { getDraft } = require("../controllers/aiController");


const router = express.Router();

// Author routes
router.post("/", authFn, t.createTicket);
router.get("/mine", authFn, t.getMyTickets); // must come before "/:id"

// Admin routes
router.get("/", authFn, adminOnly, t.getAllTickets);
router.post("/:id/draft", authFn, adminOnly, getDraft);
router.patch("/:id", authFn, adminOnly, t.updateTicket);
router.post("/:id/reply", authFn, adminOnly, t.replyToTicket);
router.post("/:id/notes", authFn, adminOnly, t.addInternalNote);

// Author (own ticket) or admin
router.get("/:id", authFn, t.getTicketById);

module.exports = router;

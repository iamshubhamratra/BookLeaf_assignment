const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    authorId: { type: String, required: true, index: true },
    bookId: { type: String, default: null }, // null means "General / Account Level"
    subject: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },

    // AI fills these in Step 3. Defaults are used if the AI is down.
    category: {
      type: String,
      enum: [
        "Royalty & Payments",
        "ISBN & Metadata Issues",
        "Printing & Quality",
        "Distribution & Availability",
        "Book Status & Production Updates",
        "General Inquiry",
      ],
      default: "General Inquiry",
    },
    priority: {
      type: String,
      enum: ["Critical", "High", "Medium", "Low"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },

    aiClassified: { 
        type: Boolean, 
        default: false 
    }, // true if AI set category/priority

    aiDraft: { 
        type: String, 
        default: ""
     }, // saved AI draft (admin only)

    // Visible to the author
    responses: [
      { message: String, createdAt: { type: Date, default: Date.now } },
    ],

    // Visible to admins only
    internalNotes: [
      { note: String, createdAt: { type: Date, default: Date.now } },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("ticket", ticketSchema);

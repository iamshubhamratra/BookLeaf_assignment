const CATEGORIES = [
  "Royalty & Payments",
  "ISBN & Metadata Issues",
  "Printing & Quality",
  "Distribution & Availability",
  "Book Status & Production Updates",
  "General Inquiry",
];

const PRIORITIES = ["Critical", "High", "Medium", "Low"];

// Sent with every request
const tone = `Tone: be empathetic and professional. Acknowledge the concern first.
Use real numbers and statuses. If it is BookLeaf's fault, admit it.
Give a clear timeline. End with a clear next step.`;

// Only the matching block is sent, to save tokens
const policies = {
  "Royalty & Payments": `Royalty: 80% of net profit goes to the author. Net profit = MRP - printing - platform commission - shipping. Royalties are calculated quarterly and paid within 45 days after the quarter ends. Minimum payout is Rs 1000, otherwise it rolls over. Paid by bank transfer.`,
  "ISBN & Metadata Issues": `ISBN: every book gets a unique ISBN from BookLeaf. ISBN errors are high priority and go to the production team. Promise a 48 hour resolution. Metadata updates take 3-5 business days.`,
  "Printing & Quality": `Printing: normal turnaround is 5-7 business days. For quality problems BookLeaf gives a free reprint after verification. Ask the author for photos of the defective copy.`,
  "Distribution & Availability": `Distribution: books are on Amazon India, Flipkart, Amazon US, Amazon UK and BookLeaf Store. New listings go live in 7-10 business days. If a book shows unavailable, it is a stock sync issue. A re-sync takes 24-48 hours.`,
  "Book Status & Production Updates": `Stages: Manuscript Received, Editing, Cover Design, Typesetting, Proofreading, ISBN Assignment, Printing, Distribution Setup, Published & Live. Delays usually happen at Cover Design and Proofreading. Be honest about the delay and never blame the author.`,
  "General Inquiry": `General: metadata updates can be sent through the dashboard or by email and show on platforms in 3-5 business days.`,
};

module.exports = { CATEGORIES, PRIORITIES, tone, policies };

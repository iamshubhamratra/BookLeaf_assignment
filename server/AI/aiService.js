const { CATEGORIES, PRIORITIES, tone, policies } = require("./knowledgeBase");

// Helper: sends messages to the AI and returns the text answer
async function askAI(messages, maxTokens) {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, // key stays on the server
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || "openai/gpt-4o-mini",
        messages: messages,
        max_tokens: maxTokens, // limits the answer length, so it limits cost
      }),
    },
  );

  // If the AI is down or rate limited, this throws an error
  if (!response.ok) {
    throw new Error("AI request failed with status " + response.status);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// 1. Decide the category and priority of a ticket
async function classifyTicket(subject, description) {
  const prompt = `You sort support tickets for BookLeaf Publishing.
Reply with JSON only, like {"category": "...", "priority": "..."}

Categories: ${CATEGORIES.join(", ")}
Priorities: ${PRIORITIES.join(", ")}

Priority rules:
- Critical: money overdue for many months, wrong or duplicate ISBN
- High: royalty looks wrong, book unavailable, defective printed copies
- Medium: production delays, general royalty questions
- Low: simple questions like updating an author bio`;

  const answer = await askAI(
    [
      { role: "system", content: prompt },
      {
        role: "user",
        content: `Subject: ${subject}\nDescription: ${description}`,
      },
    ],
    60,
  );

  // Turn the text into an object
  const result = JSON.parse(answer.replace(/```json|```/g, "").trim());

  // Safety check: only accept values from our own lists
  if (
    !CATEGORIES.includes(result.category) ||
    !PRIORITIES.includes(result.priority)
  ) {
    throw new Error("AI gave an invalid category or priority");
  }

  return result;
}

// 2. Write a draft reply for the admin
async function draftReply(ticket, books, authorName) {
  // Turn the book records into short text
  const bookText = books
    .map(
      (b) =>
        `${b.title}: status ${b.status}, copies sold ${b.total_copies_sold}, royalty earned ${b.total_royalty_earned}, paid ${b.royalty_paid}, pending ${b.royalty_pending}, last payout ${b.last_royalty_payout_date || "never"}`,
    )
    .join("\n");

  const prompt = `You are a support person at BookLeaf Publishing replying to an author.
Use ONLY the information below. Do not invent policies, dates or numbers.
Start with "Hi ${authorName}," and end with "Warm regards, BookLeaf Support Team". Max 180 words.

${policies[ticket.category]}

${tone}`;

  return askAI(
    [
      { role: "system", content: prompt },
      {
        role: "user",
        content: `Author's books:\n${bookText || "No book linked"}\n\nSubject: ${ticket.subject}\nMessage: ${ticket.description}`,
      },
    ],
    400,
  );
}

module.exports = { classifyTicket, draftReply };

# 📚 BookLeaf — Author Support & Communication Portal

A full-stack web application built for **BookLeaf Publishing** to streamline author communications at scale. The platform features two dedicated interfaces: an **Author Portal** for tracking books, royalties, and support queries, and an **Admin Portal** powered by AI-assisted auto-classification, priority scoring, and policy-grounded draft responses.

---

## 📑 Table of Contents

- [Overview & Portals](#-overview--portals)
- [Tech Stack](#-tech-stack)
- [Architecture Decisions](#-architecture-decisions)
- [AI Integration Strategy](#-ai-integration-strategy)
- [API Documentation](#-api-documentation)
- [Approach & Trade-offs (Brief Write-Up)](#-approach--trade-offs-brief-write-up)
- [Known Limitations & Future Improvements](#-known-limitations--future-improvements)
- [Setup & Installation](#-setup--installation)
- [Test Credentials](#-test-credentials)
- [Security Features](#-security-features)

---

## 🧭 Overview & Portals

BookLeaf processes 1,200+ books monthly across a catalog of 22,000+ titles. This system resolves author query backlogs through intelligent automation:

### 1. Author Portal (Author-Facing)
- **Authentication:** Simple email/password login with strict data isolation. Authors only access their own records.
- **My Books Dashboard:** Detailed book statistics including status (`Published & Live` vs `In Production`), ISBN, genre, MRP, copies sold, total royalty earned, royalty paid, and royalty pending.
- **Submit Query:** Structured ticket form linking to specific author books or "General / Account Level", with optional attachment support.
- **My Tickets:** Real-time / near real-time tracking (5-second polling) of ticket status (`Open`, `In Progress`, `Resolved`, `Closed`), original query, and BookLeaf team responses.

### 2. Admin Portal (Admin-Facing)
- **Ticket Queue:** Filterable by status, category, priority, and submission date. Sorted to highlight urgent and unresolved tickets first.
- **AI Auto-Classification:** Incoming queries are automatically categorized into one of 6 canonical BookLeaf categories. Admins can override the classification at any time.
- **AI Priority Scoring:** Automatic urgency assignment (`Critical`, `High`, `Medium`, `Low`) based on real-world business impact (e.g., overdue royalties or duplicate ISBNs).
- **AI-Drafted Responses:** One-click response drafting grounded in BookLeaf's Knowledge Base. Admins can edit and refine the message before sending.
- **Ticket Lifecycle Management:** Status updates, manual reassignment, and private **Internal Notes** (strictly stripped from author responses).

---

## 🛠 Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 19 + React Router 7 | Fast, minimal SPA with native hooks (`useState`, `useEffect`) |
| **Styling** | Custom CSS Variables | Clean, professional palette (navy, warm accent, semantic badges) |
| **Bundler** | Vite 8 | Instant HMR and optimized production builds |
| **Backend** | Node.js + Express 5 | RESTful API with modular controllers, routes, and middleware |
| **Database** | MongoDB + Mongoose 9 | Flexible schema design supporting both local MongoDB and MongoDB Atlas |
| **Auth** | JWT in `httpOnly` Cookies | Secure cookie session management preventing XSS token leaks |
| **AI Integration** | OpenRouter (`gpt-4o-mini`) | Token-capped, policy-targeted completion prompts |

---

## 🏗 Architecture Decisions

### 1. `httpOnly` Cookies Over LocalStorage
JWTs are stored in secure, `httpOnly` cookies. This eliminates client-side JavaScript access to auth tokens, preventing XSS-based session hijacking.

### 2. Non-Blocking (Fire-and-Forget) AI Classification
When an author submits a ticket, the database record is created immediately and returned in milliseconds. The AI classification call runs asynchronously in the background. If the AI is slow or rate-limited, the ticket remains safely created with default status (`General Inquiry` / `Medium`), ensuring zero author downtime.

### 3. Sliced Knowledge Base Injection (Cost & Token Awareness)
Instead of injecting the entire BookLeaf employee handbook into every prompt, the system injects **only the specific policy slice** corresponding to the query category (e.g., only injecting royalty splits and payment timelines for `Royalty & Payments`). This reduces prompt token usage by ~70%.

### 4. AI Draft Caching
AI draft responses are saved in `ticket.aiDraft`. Opening a ticket repeatedly reuses the cached draft at **zero API cost**. Admins can explicitly click "Regenerate" (`?regenerate=true`) if a fresh draft is needed.

### 5. HTTP Polling vs. WebSockets
For near real-time updates (5s for authors, 10s for admin queue), simple polling was chosen over WebSockets. Polling requires no persistent socket servers, reconnect state machines, or sticky load balancers, making it resilient, scalable, and easy to deploy.

---

## 🤖 AI Integration Strategy

### Model Choice & Justification
* **Model:** `openai/gpt-4o-mini` (via OpenRouter API).
* **Rationale:** Provides sub-second response times, deterministic JSON output formatting, strong instruction-following for tone guidelines, and extreme cost efficiency (~95% cheaper than GPT-4o).

### Prompt Engineering & Knowledge Base Grounding
Prompts are structured to maintain BookLeaf's brand voice:
* **Tone:** Empathetic, professional, partner-oriented (not treating authors as "tickets to close").
* **Policy Grounding:** Explicit constraints ensuring the AI never fabricates dates or rates. It references the 80/20 net profit split, 45-day quarterly payout cycle, ₹1,000 threshold, 5–7 business days print turnaround, and 24–48 hour stock re-sync SLAs.
* **Token Capping:** Hard `max_tokens` limits (60 tokens for classification JSON, 400 tokens for draft replies).

### Graceful Degradation
| Failure Case | System Behavior |
|---|---|
| AI API down / timeout | Ticket creation succeeds with fallback defaults (`General Inquiry` / `Medium`). |
| Invalid AI JSON output | Caught safely by parser; defaults retained; logged to server console. |
| AI draft service unavailable | Returns clear 503 message; admin is prompted to write reply manually. |

---

## 📡 API Documentation

Base URL: `http://localhost:8080/api`

### Authentication Routes

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/signup` | Public | Register new user. Body: `{ name, email, password }` |
| `POST` | `/auth/login` | Public | Authenticate user. Body: `{ email, password }`. Sets cookie |
| `POST` | `/auth/logout` | Authenticated | Clears the `bookleaf` session cookie |
| `GET` | `/auth/me` | Authenticated | Validates session cookie and returns current user info |

### Books Routes

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/books` | Authenticated | Authors receive their own books; Admins receive full catalog |

### Ticket Routes

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/tickets` | Author | Create a new ticket. Body: `{ bookId?, subject, description }` |
| `GET` | `/tickets/mine` | Author | Retrieve tickets submitted by current author (notes & AI drafts stripped) |
| `GET` | `/tickets` | Admin | List all tickets with query filters (`status`, `category`, `priority`) |
| `GET` | `/tickets/:id` | Author / Admin | Get ticket details. RBAC enforced: authors only view own tickets |
| `PATCH` | `/tickets/:id` | Admin | Update ticket (`status`, `category`, `priority`, `assignToMe`) |
| `POST` | `/tickets/:id/reply` | Admin | Send reply to author. Transitions status from `Open` to `In Progress` |
| `POST` | `/tickets/:id/notes` | Admin | Add internal private note (hidden from author) |
| `POST` | `/tickets/:id/draft` | Admin | Fetch or generate AI draft reply (`?regenerate=true` forces new call) |

---

## 📝 Approach & Trade-offs (Brief Write-Up)

### What We Prioritised
1. **Rock-Solid Core Support Workflow:** Ensuring an author can report an issue, the system correctly classifies it, and the support representative can respond with an accurate, empathetic draft.
2. **AI Reliability & Graceful Failure:** The application never breaks or hangs if the AI provider experiences outages or rate limits.
3. **Data Security & Privacy:** Strict separation of internal operational notes and AI draft data from author visibility.

### Key Trade-offs Made
* **HTTP Polling vs. WebSockets:** Opted for HTTP polling (5s/10s intervals). While WebSockets offer instant push notifications, polling dramatically reduces architectural complexity, works effortlessly through firewalls and proxies, and is well-suited for ticket response timelines.
* **CSS Variables vs. Heavy UI Libraries:** Used clean vanilla CSS rather than bringing in Tailwind or component libraries (Chakra/MUI). This keeps the bundle tiny, build times under 2 seconds, and code easy to maintain and inspect.

### Evolution to Production Scale
If evolving this into enterprise production at BookLeaf:
1. **Message Broker / Queue (BullMQ / Redis):** Move AI classification and automated email notifications to background worker queues.
2. **Embeddings & Vector Search (RAG):** Index BookLeaf's complete policy repository into vector embeddings (Pinecone/pgvector) for dynamic retrieval across thousands of FAQ articles.
3. **File Upload Storage (S3 / Cloudflare R2):** Connect the ticket attachment input to pre-signed S3 upload URLs for defect photos and manuscript proofs.
4. **Analytics Dashboard:** Expose SLA breach tracking, average resolution time by category, and author satisfaction ratings.

---

## ⚠️ Known Limitations & Future Improvements

- **Attachments:** The ticket creation UI includes an attachment file picker; in this version, file uploads are UI-only (actual cloud storage upload was listed as bonus in requirements).
- **Date Filtering:** Currently filtered client-side on the admin queue; can be moved to MongoDB `$gte` query parameters for very large datasets.
- **Email Notifications:** Authors currently view updates via dashboard polling; adding transactional email alerts (Resend/SendGrid) would be the next operational enhancement.

---

## 🚀 Setup & Installation

### Prerequisites
- **Node.js** ≥ 18
- **MongoDB** (Local instance on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)
- **OpenRouter API Key**

### 1. Clone & Install
```bash
# Clone the repository
git clone <repo-url>
cd BookLeaf_assignment

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables
Inside `server/`, create a `.env` file (or use `.env.example`):
```env
PORT=8080
OPENROUTER_API_KEY=your_openrouter_api_key ------(Please use you Openrouter Api key)
MONGO_URI=mongodb://127.0.0.1:27017/bookleaf
SECRET_KEY=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
```
*(Note: If using MongoDB Atlas, update `MONGO_URI` with your cluster connection string and ensure your IP is whitelisted in Atlas Network Access).*

### 3. Seed Database
From the `server` directory, run:
```bash
npm run seed
```
This imports the full sample dataset (`bookleaf_sample_data.json`) with **10 authors**, **18 books**, and an **admin user**.

### 4. Run Development Servers
```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

Open your browser at **`http://localhost:5173`** (or Vite's assigned port).

---

## 🔑 Test Credentials

All pre-seeded test accounts use the password: **`Test@1234`**

| Role | Account Name | Email Address |
|---|---|---|
| **Admin** | BookLeaf Admin | `admin@bookleaf.com` |
| **Author** | Priya Sharma | `priya.sharma@email.com` |
| **Author** | Rohit Kapoor | `rohit.kapoor@email.com` |
| **Author** | Ananya Reddy | `ananya.reddy@email.com` |
| **Author** | Vikram Joshi | `vikram.joshi@email.com` |
| **Author** | Meera Nair | `meera.nair@email.com` |
| **Author** | Arjun Malhotra | `arjun.malhotra@email.com` |
| **Author** | Sneha Kulkarni | `sneha.kulkarni@email.com` |
| **Author** | Farhan Sheikh | `farhan.sheikh@email.com` |
| **Author** | Kavita Deshmukh | `kavita.deshmukh@email.com` |
| **Author** | Diya Chatterjee | `diya.chatterjee@email.com` |

---

## 🔒 Security Features

- **Password Security:** Salted hashing with `bcrypt` (10 rounds).
- **Data Protection:** `select: false` prevents accidental exposure of password hashes in queries.
- **Rate Limiting:** `express-rate-limit` protects against brute-force attacks.
- **RBAC Enforcement:** Authors cannot access admin routes or view other authors' books/tickets.
- **Internal Note Privacy:** Server sanitizes tickets to strip `internalNotes` and `aiDraft` fields before returning them to author clients.
- **CORS Protection:** Configured with specific `CLIENT_URL` whitelist and `credentials: true`.

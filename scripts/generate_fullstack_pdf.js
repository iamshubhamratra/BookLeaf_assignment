const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const outputPath = path.join(__dirname, "..", "BookLeaf_FullStack_Frontend_Interview_Guide.pdf");

const doc = new PDFDocument({
  size: "A4",
  margins: { top: 48, bottom: 48, left: 48, right: 48 },
  bufferPages: true,
  autoFirstPage: true,
});

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// Theme Colors
const COLOR_PRIMARY = "#1A2332"; // Deep Navy
const COLOR_ACCENT = "#D97706"; // Warm Amber/Orange
const COLOR_TEXT = "#2D3748"; // Dark gray body
const COLOR_MUTED = "#718096"; // Slate secondary
const COLOR_BG_BOX = "#F8FAFC"; // Very light box
const COLOR_BORDER = "#E2E8F0"; // Subtle border
const COLOR_CODE = "#0F172A"; // Code dark

function drawHeader() {
  doc.fontSize(8).fillColor(COLOR_MUTED).text("BOOKLEAF PUBLISHING — FRONTEND & FULLSTACK ARCHITECTURE GUIDE", 48, 25, {
    align: "left",
  });
  doc.strokeColor(COLOR_BORDER).lineWidth(0.5).moveTo(48, 38).lineTo(547, 38).stroke();
  doc.y = 52;
}

function checkPageSpace(needed = 60) {
  if (doc.y + needed > doc.page.height - 55) {
    doc.addPage();
    drawHeader();
  }
}

function title1(text) {
  checkPageSpace(50);
  doc.moveDown(0.6);
  doc.fontSize(15).fillColor(COLOR_PRIMARY).font("Helvetica-Bold").text(text);
  doc.strokeColor(COLOR_ACCENT).lineWidth(2).moveTo(48, doc.y + 2).lineTo(150, doc.y + 2).stroke();
  doc.moveDown(0.5);
}

function title2(text) {
  checkPageSpace(38);
  doc.moveDown(0.4);
  doc.fontSize(11.5).fillColor(COLOR_ACCENT).font("Helvetica-Bold").text(text);
  doc.moveDown(0.2);
}

function paragraph(text) {
  checkPageSpace(25);
  doc.fontSize(9.2).fillColor(COLOR_TEXT).font("Helvetica").text(text, {
    align: "justify",
    lineGap: 2.3,
  });
  doc.moveDown(0.3);
}

function bullet(boldPrefix, text) {
  checkPageSpace(22);
  doc.fontSize(9.2).fillColor(COLOR_PRIMARY).font("Helvetica-Bold").text("• " + boldPrefix + " ", {
    continued: true,
  });
  doc.fillColor(COLOR_TEXT).font("Helvetica").text(text, {
    align: "justify",
    lineGap: 2,
  });
  doc.moveDown(0.2);
}

function qaBlock(q, a) {
  checkPageSpace(55);
  doc.moveDown(0.3);
  doc.fontSize(9.8).fillColor(COLOR_PRIMARY).font("Helvetica-Bold").text("Q: " + q, {
    lineGap: 2,
  });
  doc.moveDown(0.15);
  doc.fontSize(9).fillColor(COLOR_TEXT).font("Helvetica").text("Answer: " + a, {
    align: "justify",
    lineGap: 2.3,
  });
  doc.moveDown(0.35);
}

// ==========================================
// COVER TITLE
// ==========================================
doc.fontSize(22).fillColor(COLOR_PRIMARY).font("Helvetica-Bold").text("BookLeaf Publishing", { align: "center" });
doc.moveDown(0.2);
doc.fontSize(13.5).fillColor(COLOR_ACCENT).font("Helvetica-Bold").text("Frontend & Full-Stack Integration Master Guide", { align: "center" });
doc.moveDown(0.1);
doc.fontSize(9.5).fillColor(COLOR_MUTED).font("Helvetica").text("Line-by-Line Code Walkthrough, Integration Protocol, and Interview Q&A", { align: "center" });
doc.moveDown(0.8);
doc.strokeColor(COLOR_BORDER).lineWidth(1).moveTo(48, doc.y).lineTo(547, doc.y).stroke();
doc.moveDown(0.6);

// SECTION 1
title1("1. Full-Stack Integration & Connection Architecture");

paragraph("The application operates as two decoupled environments: the Client Single Page Application (SPA) powered by React 19 + Vite running on port 5173, and the REST API Server powered by Express 5 running on port 8080. They communicate over HTTP/JSON with stateful cookie sessions.");

title2("The Authentication Handshake & Session Lifecycle");
bullet("1. Login Submission:", "The author or admin submits credentials via POST /api/auth/login. The payload travels over JSON body { email, password }.");
bullet("2. Cookie Issuance:", "Upon bcrypt password verification, Express signs a JWT with user ID and issues an HTTP response header: Set-Cookie: bookleaf=<token>; HttpOnly; SameSite=Lax; Max-Age=86400; Path=/.");
bullet("3. Automatic Cookie Transmission:", "Because client/src/api.js sets 'credentials: include', the browser automatically attaches the 'bookleaf' cookie to all subsequent API calls without any manual Authorization headers.");
bullet("4. Session Hydration (/api/auth/me):", "On application load, React calls GET /api/auth/me inside an initial useEffect. The backend validates the cookie and returns the user's role and profile. If valid, the user state is populated; if invalid or absent, loading completes and displays the Login screen.");

title2("Cross-Origin Resource Sharing (CORS) Mechanics");
bullet("Why credentials: true matters:", "By default, browsers block cross-origin requests from reading cookies or sending them to a different port (5173 -> 8080). Express explicitly sets origin: CLIENT_URL and credentials: true. In response to preflight OPTIONS requests, the server returns Access-Control-Allow-Credentials: true and Access-Control-Allow-Origin: http://localhost:5173.");

title2("Near Real-Time Updates via HTTP Polling");
bullet("Author Portal (5s interval):", "MyTickets.jsx executes a polling loop every 5,000ms. If an admin drafts and sends a response, the author sees it update automatically without reloading.");
bullet("Admin Portal (10s interval):", "AdminQueue.jsx polls /api/tickets every 10,000ms. New tickets submitted by authors appear in the queue automatically.");
bullet("Memory Leak Prevention:", "Both components store the timer ID returned by setInterval and return a cleanup callback: return () => clearInterval(timer). This prevents ghost network calls when navigating away.");

// SECTION 2
title1("2. Frontend Design Decisions: Why We Chose This Stack");

bullet("React 19 + Vite vs. Next.js:", "Next.js (App Router/SSR) introduces server components, node server runtimes, and hydration mismatches for authenticated internal dashboards. A client-side Vite SPA compiles in <1.5s, provides instant Hot Module Replacement (HMR), produces static assets deployable on any CDN/Vercel, and keeps the code simple and readable.");

bullet("Native React State (useState) vs. Redux / Zustand:", "For an application with clean route separation, a global Redux store creates unnecessary boilerplate (actions, reducers, dispatchers). Role-based session state is hoisted in App.jsx and passed to Navbar; page-level data lives cleanly inside each component's local state.");

bullet("Centralized api.js vs. Axios:", "Modern browser fetch is native and requires zero external bundle size. Our custom api() wrapper standardizes base URLs, headers, error handling, and 'credentials: include' in just 15 lines of easily explainable code.");

bullet("Vanilla CSS Custom Properties vs. Tailwind / Component Libraries:", "Using custom CSS variables (--primary, --accent, --border) keeps the build size under 12KB, eliminates class clutter in JSX, and gives the UI a bespoke BookLeaf publishing brand identity without depending on heavy third-party UI libraries.");

// SECTION 3
title1("3. Detailed Line-by-Line Code Walkthrough (Every Frontend File)");

title2("A. Application Entry: client/src/main.jsx");
paragraph("Initializes the React DOM root at document.getElementById('root'). Wraps the application in <StrictMode> (which in development helps detect accidental side effects by double-invoking lifecycles) and <BrowserRouter> (providing the client-side URL history stack).");

title2("B. Root Routing & Auth Orchestrator: client/src/App.jsx");
bullet("const [user, setUser] = useState(null):", "Holds the currently authenticated user object (name, email, role, authorId). If null, user is considered logged out.");
bullet("const [loading, setLoading] = useState(true):", "Controls initial boot state. While verifying cookie with /api/auth/me, renders a clean loading screen.");
bullet("useEffect with .finally(() => setLoading(false)):", "Ensures loading is ALWAYS flipped to false regardless of whether the network succeeded or failed. This eliminates the 'stuck on loading' bug if the backend is temporarily offline.");
bullet("Role-Based Route Branching:", "If user.role === 'admin', the router strictly exposes <AdminQueue /> at '/' and <AdminTicket /> at '/admin/tickets/:id'. If user.role === 'author', it strictly exposes <Books /> at '/', <SubmitTicket /> at '/submit', and <MyTickets /> at '/tickets'. Any unrecognized route redirects to '/'.");

title2("C. Fetch Wrapper: client/src/api.js");
bullet("const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api':", "Uses Vite's environment variable syntax to allow dynamic production API routing while defaulting to local port 8080.");
bullet("credentials: 'include':", "Mandates that the browser transmits cookies on all cross-origin requests.");
bullet("try...catch block:", "Catches network failure exceptions (e.g. server offline) and returns { success: false, message: 'Could not connect to server' } rather than unhandled promise rejections.");

title2("D. Global Navigation: client/src/components/Navbar.jsx");
bullet("useLocation() hook:", "Inspects location.pathname to apply the 'active' CSS class to the current navigation link.");
bullet("Role-Aware Links:", "Displays Ticket Queue for admins, or My Books / Submit Query / My Tickets for authors.");
bullet("User Avatar & Badge:", "Renders user.name.charAt(0) inside an avatar circle, user's name, and their role badge.");
bullet("logout handler:", "Calls POST /api/auth/logout (which instructs the backend to clear the cookie) and resets local user state via setUser(null).");

title2("E. Login View: client/src/pages/Login.jsx");
bullet("Controlled Inputs:", "Maintains email and password state, updated via onChange={(e) => set...(e.target.value)}.");
bullet("handleSubmit (e.preventDefault):", "Prevents native HTML form reload, calls api('/auth/login', 'POST', { email, password }), and upon success calls setUser(data.user). If invalid, populates error message.");

title2("F. Author Books Dashboard: client/src/pages/Books.jsx");
bullet("Catalogue Summary:", "Renders author's published titles in a responsive grid.");
bullet("Edge Case Handling (Books in Production):", "Evaluates b.publication_date. If published, renders a 4-column financial grid (Copies Sold, Royalty Earned, Royalty Paid, Royalty Pending). If in production (like BK013 Midnight in Mysore), displays an 'In Production' badge and clarifies that royalty figures appear once live, preventing NaN display.");

title2("G. Ticket Creation Form: client/src/pages/SubmitTicket.jsx");
bullet("Dynamic Book Dropdown:", "Fetches author's books on mount and maps them into <option> elements, defaulting to 'General / Account Level' (value='').");
bullet("Submitting State:", "Sets submitting = true during the POST call, disabling the button and displaying 'Submitting...' to prevent accidental duplicate submissions.");
bullet("useNavigate('/tickets'):", "Upon successful ticket creation, smoothly navigates the author to their ticket list.");

title2("H. Author Tickets View: client/src/pages/MyTickets.jsx");
bullet("5-Second Polling Loop:", "Calls api('/tickets/mine') every 5 seconds. Replaces state when new replies arrive.");
bullet("Status Badging:", "statusClass(t.status) applies semantic color classes (status-Open, status-In-Progress, status-Resolved).");
bullet("Conversation Thread:", "Renders admin responses inside .reply bubbles with whiteSpace: pre-wrap and formatted timestamps.");

title2("I. Admin Ticket Queue: client/src/pages/AdminQueue.jsx");
bullet("Filter Bar:", "Controlled dropdowns for Status, Category, Priority, and Date. Appends non-empty filters into URLSearchParams.");
bullet("10-Second Auto-Refresh:", "Refetches filtered tickets every 10 seconds.");
bullet("Age Calculation:", "ageInDays calculates age from createdAt timestamp in days, helping reps spot aging queries.");
bullet("Priority Highlighting:", "Tags Critical (red), High (orange), Medium (yellow), Low (green).");

title2("J. Admin Ticket Management & AI Detail: client/src/pages/AdminTicket.jsx");
bullet("useParams():", "Extracts ticket MongoDB _id from URL path.");
bullet("In-Place Updates (update):", "Sends PATCH /api/tickets/:id on status, category, or priority changes, or when clicking 'Assign to me'. Shows instant feedback.");
bullet("AI Draft Generation (getDraft):", "Calls POST /api/tickets/:id/draft. If regenerate=true, requests a fresh completion. Puts draft text directly into reply textarea for editing.");
bullet("Send Reply (sendReply):", "Disables button with 'Sending Reply...'. Posts to /api/tickets/:id/reply. On success, updates ticket responses, clears textarea, and triggers a green confirmation banner ('✓ Reply sent to author successfully!') that auto-dismisses after 4 seconds.");
bullet("Internal Notes (addNote):", "Adds private notes visible strictly to administrators.");

// SECTION 4
title1("4. Full-Stack Interview Questions & Senior Answers");

qaBlock(
  "How does client/src/api.js work, and why did you choose it over Axios?",
  "api.js is a lightweight wrapper around the standard Fetch API. It handles URL resolution via import.meta.env, attaches 'Content-Type: application/json', mandates 'credentials: include' so HTTP-only session cookies are sent automatically, and wraps calls in a try/catch block to return safe error objects if the server is unreachable. We avoided Axios because native Fetch is built into every modern browser, adding zero kilobytes to our JavaScript bundle while fulfilling all our requirements."
);

qaBlock(
  "Why did you use polling in useEffect and how did you prevent memory leaks and zombie network calls?",
  "We used setInterval inside useEffect to poll endpoints (5s for authors, 10s for admins) to deliver near-real-time updates without page refreshes. Crucially, we prevent memory leaks by returning a cleanup function from the useEffect hook: return () => clearInterval(timer). When the user navigates to another page, React unmounts the component and cancels the interval, guaranteeing no background network calls persist."
);

qaBlock(
  "Why was the screen previously stuck on 'Loading...', and how did your fix resolve it?",
  "Initially, App.jsx called api('/auth/me').then(...) without a .catch() or .finally(). When the backend server failed to connect to MongoDB, the fetch promise rejected with a network error. Because the rejection was unhandled, setLoading(false) was never called, keeping loading=true permanently. We fixed this by wrapping fetch in a try/catch inside api.js and attaching .finally(() => setLoading(false)) in App.jsx, ensuring the login screen always renders cleanly even if the backend is down."
);

qaBlock(
  "How does role-based routing work in App.jsx to prevent authors from accessing admin pages?",
  "In App.jsx, we conditionally render distinct <Route> trees based on user.role === 'admin'. If an author is logged in, the admin routes (/admin/tickets/:id) do not even exist in the React Router route tree. If an author manually types an admin URL into their browser, the wildcard <Route path='*' element={<Navigate to='/' />} /> immediately redirects them to their home page. Furthermore, our backend API strictly guards all admin endpoints with adminsOnly middleware."
);

qaBlock(
  "Why did you use controlled components for all form inputs instead of uncontrolled refs?",
  "Controlled components bind input values directly to React state via value={state} and onChange={(e) => setState(e.target.value)}. This enables instant validation, character length tracking, conditional submit button disabling (e.g. disabled={!reply.trim()}), and programmatic clearing of fields upon successful submission (e.g. setReply(''))."
);

qaBlock(
  "How did you resolve the issue where clicking 'Send Reply to Author' showed 'Reply sent' in red like an error?",
  "Originally, AdminTicket.jsx shared a single state variable called 'message' that was rendered inside a <p className='error'> element in the Manage card. We refactored this by giving each action its own dedicated state (replySuccess, replyError, manageMsg, noteSuccess). Now, sending a reply sets a green banner (<p className='msg-success'>✓ Reply sent to author successfully!</p>) right below the button, disables the button during in-flight requests, and clears itself automatically after 4 seconds."
);

qaBlock(
  "What is the difference between process.env in Node.js and import.meta.env in Vite?",
  "Node.js runs on a server with direct operating system access, reading environment variables from process.env via the dotenv package. Vite, however, is a client-side build tool that runs in the browser where process.env does not exist. Vite uses modern ECMAScript module metadata (import.meta.env) and only exposes variables prefixed with VITE_ (such as VITE_API_URL) to client-side code for security."
);

qaBlock(
  "How would you upgrade this system if BookLeaf required instant push notifications instead of polling?",
  "We would implement Server-Sent Events (SSE) or WebSockets. For this one-way server-to-client push use case, Server-Sent Events (SSE) is the cleanest choice: it runs over standard HTTP, automatically handles reconnections, and works seamlessly through proxies without the duplex overhead of WebSockets. The backend would keep an open res connection per author, and whenever an admin replied, the ticket controller would emit a JSON event directly to the client's EventSource."
);

qaBlock(
  "How does the frontend handle edge cases like books with no royalties or books in production?",
  "In Books.jsx, we evaluate b.publication_date. For published titles, we render the full 4-stat financial grid. For books still in production (such as BK013 and BK015 in the sample data), publication_date and mrp are null. Our code detects this, renders an 'In Production' badge, and displays a friendly notice stating that royalty figures will populate once the book goes live, preventing broken tables or NaN calculations."
);

// Add Page Numbers (safe loop without margin overflow)
const range = doc.bufferedPageRange();
for (let i = range.start; i < range.start + range.count; i++) {
  doc.switchToPage(i);
  const oldBottom = doc.page.margins.bottom;
  doc.page.margins.bottom = 0;
  doc.fontSize(7.5).fillColor(COLOR_MUTED).font("Helvetica").text(
    `Page ${i + 1} of ${range.count}`,
    48,
    doc.page.height - 28,
    { align: "center", width: doc.page.width - 96, lineBreak: false }
  );
  doc.page.margins.bottom = oldBottom;
}

doc.end();

writeStream.on("finish", () => {
  console.log("Full-stack PDF generated successfully at:", outputPath);
});

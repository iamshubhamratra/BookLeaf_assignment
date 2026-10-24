import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";
import { CATEGORIES, PRIORITIES, STATUSES } from "../constants";

function AdminTicket() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [reply, setReply] = useState("");
  const [note, setNote] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [sending, setSending] = useState(false);
  const [addingNote, setAddingNote] = useState(false);

  // Separate feedback messages for each action
  const [manageMsg, setManageMsg] = useState("");
  const [replySuccess, setReplySuccess] = useState("");
  const [replyError, setReplyError] = useState("");
  const [noteSuccess, setNoteSuccess] = useState("");
  const [noteError, setNoteError] = useState("");

  const load = () => api(`/tickets/${id}`).then((data) => data.success && setTicket(data.ticket));

  useEffect(() => {
    load();
  }, [id]);

  // Change status, category, priority, or assign to me
  const update = async (changes) => {
    setManageMsg("");
    const data = await api(`/tickets/${id}`, "PATCH", changes);
    if (data.success) {
      setTicket(data.ticket);
      setManageMsg("Updated successfully");
      setTimeout(() => setManageMsg(""), 3000);
    } else {
      setManageMsg(data.message || "Update failed");
    }
  };

  const getDraft = async (regenerate = false) => {
    setDrafting(true);
    setReplyError("");
    const data = await api(`/tickets/${id}/draft${regenerate ? "?regenerate=true" : ""}`, "POST");
    if (data.success) {
      setReply(data.draft);
    } else {
      setReplyError(data.message || "AI is unavailable. Please write reply manually.");
    }
    setDrafting(false);
  };

  const sendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    setReplyError("");
    setReplySuccess("");

    const data = await api(`/tickets/${id}/reply`, "POST", { message: reply });
    setSending(false);

    if (data.success) {
      setTicket(data.ticket);
      setReply("");
      setReplySuccess("✓ Reply sent to author successfully!");
      setTimeout(() => setReplySuccess(""), 4000);
    } else {
      setReplyError(data.message || "Failed to send reply");
    }
  };

  const addNote = async () => {
    if (!note.trim()) return;
    setAddingNote(true);
    setNoteError("");
    setNoteSuccess("");

    const data = await api(`/tickets/${id}/notes`, "POST", { note });
    setAddingNote(false);

    if (data.success) {
      setTicket(data.ticket);
      setNote("");
      setNoteSuccess("✓ Internal note added");
      setTimeout(() => setNoteSuccess(""), 4000);
    } else {
      setNoteError(data.message || "Failed to add note");
    }
  };

  if (!ticket) return <p className="loading">Loading...</p>;

  // helper for status CSS
  const statusClass = (s) => "status-" + s.replace(" ", "-");

  return (
    <div className="ticket-detail">
      <Link to="/" className="back-link">← Back to queue</Link>

      {/* Ticket Info */}
      <div className="section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <h2 style={{ fontSize: "1.2rem" }}>{ticket.subject}</h2>
          <span className={`tag ${statusClass(ticket.status)}`}>{ticket.status}</span>
        </div>

        <p className="info-pair">
          <b>Author:</b> {ticket.authorId} &nbsp;·&nbsp;
          <b>Book:</b> {ticket.bookId || "General / Account Level"} &nbsp;·&nbsp;
          <b>Created:</b> {new Date(ticket.createdAt).toLocaleString()}
        </p>

        <div className="card" style={{ marginTop: 12, background: "var(--bg)", border: "none" }}>
          <p style={{ margin: 0 }}>{ticket.description}</p>
        </div>

        <div className="section-title" style={{ marginTop: 20 }}>Manage</div>

        <div className="field-row">
          <div>
            <label>Status</label>
            <select value={ticket.status} onChange={(e) => update({ status: e.target.value })}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label>Category {ticket.aiClassified ? "(AI)" : "(default)"}</label>
            <select value={ticket.category} onChange={(e) => update({ category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label>Priority</label>
            <select value={ticket.priority} onChange={(e) => update({ priority: e.target.value })}>
              {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div className="assign-row">
          <span className="info-pair">
            <b>Assigned to:</b> {ticket.assignedTo ? ticket.assignedTo.name : "Nobody yet"}
          </span>
          <button className="btn btn-secondary btn-sm" onClick={() => update({ assignToMe: true })}>
            Assign to me
          </button>
        </div>

        {manageMsg && (
          <p className={manageMsg.includes("failed") ? "msg-error" : "msg-success"} style={{ marginTop: 10 }}>
            {manageMsg}
          </p>
        )}
      </div>

      {/* Conversation */}
      <div className="section">
        <div className="section-title">Conversation</div>

        {ticket.responses.length === 0 && (
          <p style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "0.85rem" }}>No replies yet.</p>
        )}
        {ticket.responses.map((r, i) => (
          <div className="reply" key={i}>
            <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{r.message}</pre>
            {r.createdAt && <div className="reply-time">{new Date(r.createdAt).toLocaleString()}</div>}
          </div>
        ))}

        <div className="section-title" style={{ marginTop: 20 }}>Write a Reply</div>

        <div className="draft-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => getDraft(false)} disabled={drafting}>
            {drafting ? "Generating..." : "Get AI Draft"}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => getDraft(true)} disabled={drafting}>
            Regenerate
          </button>
        </div>

        <textarea
          rows="8"
          placeholder="Write your reply, or click Get AI Draft and edit it..."
          value={reply}
          onChange={(e) => setReply(e.target.value)}
        />
        <button
          className="btn btn-primary"
          onClick={sendReply}
          disabled={!reply.trim() || sending}
        >
          {sending ? "Sending Reply..." : "Send Reply to Author"}
        </button>

        {replySuccess && <p className="msg-success">{replySuccess}</p>}
        {replyError && <p className="msg-error">{replyError}</p>}
      </div>

      {/* Internal Notes */}
      <div className="section">
        <div className="section-title">Internal Notes (hidden from author)</div>

        {ticket.internalNotes.length === 0 && (
          <p style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "0.85rem" }}>No notes yet.</p>
        )}
        {ticket.internalNotes.map((n, i) => (
          <div className="note" key={i}>
            {n.note}
            {n.createdAt && <div className="note-time">{new Date(n.createdAt).toLocaleString()}</div>}
          </div>
        ))}

        <textarea
          rows="3"
          placeholder="Add an internal note..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{ marginTop: 12 }}
        />
        <button
          className="btn btn-secondary"
          onClick={addNote}
          disabled={!note.trim() || addingNote}
        >
          {addingNote ? "Adding Note..." : "Add Note"}
        </button>

        {noteSuccess && <p className="msg-success">{noteSuccess}</p>}
        {noteError && <p className="msg-error">{noteError}</p>}
      </div>
    </div>
  );
}

export default AdminTicket;

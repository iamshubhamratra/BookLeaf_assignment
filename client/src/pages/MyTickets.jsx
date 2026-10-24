import { useEffect, useState } from "react";
import { api } from "../api";

function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = () =>
      api("/tickets/mine").then((data) => {
        if (data.success) setTickets(data.tickets);
        setLoading(false);
      });

    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, []);

  if (loading) return <p className="loading">Loading...</p>;

  if (tickets.length === 0) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-icon">🎫</div>
          <p>You have not submitted any tickets yet.</p>
          <p className="empty-sub">Use "Submit Query" to create one.</p>
        </div>
      </div>
    );
  }

  // helper to get the right class name for status
  const statusClass = (s) => "status-" + s.replace(" ", "-");

  return (
    <div>
      <div className="page-header">
        <h2>My Tickets</h2>
        <p>{tickets.length} ticket{tickets.length !== 1 && "s"}</p>
      </div>

      {tickets.map((t) => (
        <div className="card" key={t._id}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <h3>{t.subject}</h3>
            <span className={`tag ${statusClass(t.status)}`}>{t.status}</span>
          </div>
          <p>{t.description}</p>
          <small style={{ color: "var(--text-muted)" }}>Submitted: {new Date(t.createdAt).toLocaleString()}</small>

          {t.responses.length === 0 && (
            <p style={{ marginTop: 12, color: "var(--text-muted)", fontStyle: "italic", fontSize: "0.85rem" }}>
              No response yet. Our team will reply soon.
            </p>
          )}
          {t.responses.map((r, i) => (
            <div className="reply" key={i}>
              <b style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>BookLeaf Team</b>
              <pre style={{ whiteSpace: "pre-wrap", margin: "4px 0 0" }}>{r.message}</pre>
              {r.createdAt && <div className="reply-time">{new Date(r.createdAt).toLocaleString()}</div>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default MyTickets;

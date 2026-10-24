import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { CATEGORIES, PRIORITIES, STATUSES } from "../constants";

function AdminQueue() {
  const [tickets, setTickets] = useState([]);
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [fromDate, setFromDate] = useState("");

  useEffect(() => {
    const load = () => {
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (category) params.append("category", category);
      if (priority) params.append("priority", priority);

      api("/tickets?" + params.toString()).then((data) => data.success && setTickets(data.tickets));
    };

    load();
    const timer = setInterval(load, 10000);
    return () => clearInterval(timer);
  }, [status, category, priority]);

  const ageInDays = (date) => Math.floor((Date.now() - new Date(date)) / (1000 * 60 * 60 * 24));

  const shown = fromDate ? tickets.filter((t) => new Date(t.createdAt) >= new Date(fromDate)) : tickets;

  // helper to get CSS class for status
  const statusClass = (s) => "status-" + s.replace(" ", "-");

  return (
    <div>
      <div className="page-header">
        <h2>Ticket Queue</h2>
        <p>{shown.length} ticket{shown.length !== 1 && "s"}</p>
      </div>

      <div className="filter-bar">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
        </select>
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
      </div>

      {shown.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>No tickets match these filters.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Priority</th>
                <th>Subject</th>
                <th>Category</th>
                <th>Status</th>
                <th>Author</th>
                <th>Age</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((t) => (
                <tr key={t._id}>
                  <td><span className={`tag ${t.priority}`}>{t.priority}</span></td>
                  <td><Link to={`/admin/tickets/${t._id}`}>{t.subject}</Link></td>
                  <td>{t.category}{!t.aiClassified && " (default)"}</td>
                  <td><span className={`tag ${statusClass(t.status)}`}>{t.status}</span></td>
                  <td>{t.authorId}</td>
                  <td>{ageInDays(t.createdAt)}d</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminQueue;

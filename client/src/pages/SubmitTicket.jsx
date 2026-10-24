import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

function SubmitTicket() {
  const [books, setBooks] = useState([]);
  const [bookId, setBookId] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api("/books").then((data) => data.success && setBooks(data.books));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const data = await api("/tickets", "POST", { bookId: bookId || null, subject, description });
    if (data.success) navigate("/tickets");
    else setError(data.message);
    setSubmitting(false);
  };

  return (
    <div>
      <div className="page-header">
        <h2>Submit a Support Query</h2>
        <p>Our team will respond as soon as possible</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <label>Which book is this about?</label>
          <select value={bookId} onChange={(e) => setBookId(e.target.value)}>
            <option value="">General / Account Level</option>
            {books.map((b) => (
              <option key={b._id} value={b.book_id}>{b.title}</option>
            ))}
          </select>

          <label>Subject</label>
          <input placeholder="Brief summary of your issue" value={subject} onChange={(e) => setSubject(e.target.value)} />

          <label>Description</label>
          <textarea rows="6" placeholder="Describe your issue in detail..." value={description} onChange={(e) => setDescription(e.target.value)} />

          <label>Attachment (optional)</label>
          <input type="file" />

          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Query"}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}

export default SubmitTicket;

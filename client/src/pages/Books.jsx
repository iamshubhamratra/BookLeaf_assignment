import { useEffect, useState } from "react";
import { api } from "../api";

function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/books").then((data) => {
      if (data.success) setBooks(data.books);
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="loading">Loading...</p>;

  if (books.length === 0) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <p>You have no books yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2>My Books</h2>
        <p>{books.length} book{books.length !== 1 && "s"} in your catalog</p>
      </div>

      <div className="book-grid">
        {books.map((b) => (
          <div className="book-card" key={b._id}>
            <div className="book-header">
              <div>
                <h3>{b.title}</h3>
                <div className="book-genre">{b.genre}</div>
              </div>
              <span className={`tag ${b.status.includes("Published") ? "tag-live" : "tag-production"}`}>
                {b.status.includes("Published") ? "Live" : b.status.replace("In Production - ", "")}
              </span>
            </div>

            {b.publication_date ? (
              <div className="book-stats">
                <div className="stat">
                  <div className="stat-value">{b.total_copies_sold}</div>
                  <div className="stat-label">Sold</div>
                </div>
                <div className="stat">
                  <div className="stat-value">₹{b.total_royalty_earned}</div>
                  <div className="stat-label">Earned</div>
                </div>
                <div className="stat">
                  <div className="stat-value">₹{b.royalty_paid}</div>
                  <div className="stat-label">Paid</div>
                </div>
                <div className="stat">
                  <div className="stat-value">₹{b.royalty_pending}</div>
                  <div className="stat-label">Pending</div>
                </div>
              </div>
            ) : (
              <div className="book-stats">
                <div className="stat" style={{ gridColumn: "1 / -1" }}>
                  <div className="stat-label">Royalty details will appear once your book is live</div>
                </div>
              </div>
            )}

            <div className="book-footer">
              <span className="isbn-tag">{b.isbn}</span>
              <span>{b.publication_date ? `Published ${b.publication_date}` : "In production"} · MRP {b.mrp ? `₹${b.mrp}` : "TBD"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Books;

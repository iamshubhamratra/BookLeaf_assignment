import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { api } from "./api";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Books from "./pages/Books";
import SubmitTicket from "./pages/SubmitTicket";
import MyTickets from "./pages/MyTickets";
import AdminQueue from "./pages/AdminQueue";
import AdminTicket from "./pages/AdminTicket";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On page load, ask the server if the cookie is still valid
  useEffect(() => {
    api("/auth/me")
      .then((data) => {
        if (data.success) setUser(data.user);
      })
      .catch((err) => {
        console.error("Auth check failed:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!user) return <Login setUser={setUser} />;

  const isAdmin = user.role === "admin";

  return (
    <div>
      <Navbar user={user} setUser={setUser} />
      <div className="page">
        <Routes>
          {isAdmin ? (
            <>
              <Route path="/" element={<AdminQueue />} />
              <Route path="/admin/tickets/:id" element={<AdminTicket />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Books />} />
              <Route path="/submit" element={<SubmitTicket />} />
              <Route path="/tickets" element={<MyTickets />} />
            </>
          )}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
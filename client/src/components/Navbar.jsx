import { Link, useLocation } from "react-router-dom";
import { api } from "../api";

function Navbar({ user, setUser }) {
  const location = useLocation();
  const logout = async () => {
    await api("/auth/logout", "POST");
    setUser(null);
  };

  // simple helper to highlight the current page link
  const isActive = (path) => location.pathname === path ? "active" : "";

  return (
    <div className="navbar">
      <div className="logo">
        <div className="logo-icon">B</div>
        BookLeaf
      </div>

      <div className="divider" />

      {user.role === "admin" ? (
        <Link to="/" className={isActive("/")}>Ticket Queue</Link>
      ) : (
        <>
          <Link to="/" className={isActive("/")}>My Books</Link>
          <Link to="/submit" className={isActive("/submit")}>Submit Query</Link>
          <Link to="/tickets" className={isActive("/tickets")}>My Tickets</Link>
        </>
      )}

      <span className="right">
        <span className="user-badge">
          <span className="avatar">{user.name.charAt(0)}</span>
          {user.name}
          <span className="role-tag">{user.role}</span>
        </span>
        <button onClick={logout}>Logout</button>
      </span>
    </div>
  );
}

export default Navbar;

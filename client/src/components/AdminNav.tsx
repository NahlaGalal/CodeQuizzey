import React from "react";
import { Link } from "react-router-dom";

const AdminNav: React.FC<{ logout: () => void }> = ({ logout }) => (
  <nav className="Admin_nav">
    <h1 className="logo">
      <Link to="/admin"> CodeQuizzey </Link>
    </h1>
    <ul>
      <li>
        <Link to="/add-admin">Add Admin</Link>{" "}
      </li>
      <li>
        <Link to="/add-quiz">Add Quiz</Link>
      </li>
      <li>
        <Link to="/add-circle">Add Circle</Link>
      </li>
      <li>
        <button onClick={logout}>Logout</button>
      </li>
    </ul>
  </nav>
);

export default AdminNav;

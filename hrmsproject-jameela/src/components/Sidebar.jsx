import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const menu = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Employees", path: "/employees" },
    { label: "Teams", path: "/teams" },
    { label: "Logs", path: "/logs" }
  ];

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">HRMS</h2>

      <ul className="sidebar-menu">
        {menu.map((item) => (
          <li
            key={item.path}
            className={location.pathname.startsWith(item.path) ? "active" : ""}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </li>
        ))}
      </ul>

      <button className="logout-btn" onClick={() => navigate("/")}>
        Logout
      </button>
    </div>
  );
};

export default Sidebar;

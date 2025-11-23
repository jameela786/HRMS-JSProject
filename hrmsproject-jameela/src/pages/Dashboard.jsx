import React, { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "./Dashboard.css";

const Dashboard = () => {
  const [employeeCount, setEmployeeCount] = useState(0);
  const [teamCount, setTeamCount] = useState(0);
  const [logs, setLogs] = useState([]);

  const API ="https://hrms-jsproject.onrender.com/api";

  const user = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;

  useEffect(() => {
    const token = Cookies.get("jwt_token");
    const headers = { Authorization: `Bearer ${token}` };

    // Fetch employees count
    fetch(`${API}/employees`, { headers })
      .then((res) => res.json())
      .then((data) => setEmployeeCount(data.length || 0));

    // Fetch teams count
    fetch(`${API}/teams`, { headers })
      .then((res) => res.json())
      .then((data) => setTeamCount(data.length || 0));

    // Fetch recent logs
    fetch(`${API}/logs?limit=5`, { headers })
      .then((res) => res.json())
      .then((data) => setLogs(data || []))
      .catch(() => setLogs([]));
  }, []);

  return (
    <div className="dashboard-container">
      <Sidebar />


      <div className="dashboard-content">

        {/* TOP SUMMARY CARDS */}
        <div className="summary-cards">
          <div className="summary-card">
            <h3>Total Employees</h3>
            <p>{employeeCount}</p>
          </div>

          <div className="summary-card">
            <h3>Total Teams</h3>
            <p>{teamCount}</p>
          </div>

          <div className="summary-card">
          <h3>Welcome</h3>
            <p>{user?.name || "User"}</p>
          </div>
        </div>

        <div className="dashboard-main">
          
          {/* RECENT ACTIVITY LOG */}
          <div className="activity-section">
            <h3>Recent Activity</h3>

            {logs.length === 0 ? (
              <p className="no-logs">No recent activity found</p>
            ) : (
              <ul className="activity-list">
                {logs.map((log) => (
                  <li key={log.id}>
                    <span className="log-action">{log.action}</span>
                    <p className="log-meta">{(() => {
    try {
      const d = JSON.parse(log.details);
      return d.message ?? JSON.stringify(d, null, 2);
    } catch {
      return log.details;
    }
  })()}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* QUICK ACTIONS */}
          <div className="quick-actions">
            <h3>Quick Actions</h3>

            <button
              className="quick-btn"
              onClick={() => window.location.href = "/employees/add"}
            >
              + Add Employee
            </button>

            <button
              className="quick-btn"
              onClick={() => window.location.href = "/teams/add"}
            >
              + Create Team
            </button>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;

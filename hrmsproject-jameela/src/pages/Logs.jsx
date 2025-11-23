import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "./Logs.css";

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const API = "https://hrms-jsproject.onrender.com/api";

  useEffect(() => {
    const token = Cookies.get("jwt_token");

    fetch(`${API}/logs`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Logs API RESPONSE:", data); 
        setLogs(data || []);
        setLoading(false);
      })
  
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="logs-container">
      <Sidebar />
      <Header title="Activity Logs" />

      <div className="logs-content">
        <h2 className="logs-title">System Activity Logs</h2>

        {loading ? (
          <p className="loading">Loading...</p>
        ) : logs.length === 0 ? (
          <p className="empty-msg">No logs available.</p>
        ) : (
          <div className="logs-table-wrapper">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Details</th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.timestamp}</td>
                    <td>{log.user_name || "Unknown"}</td>
                    <td>{log.action}</td>
                    <td >
  {(() => {
    try {
      const d = JSON.parse(log.details);
      return d.message ?? JSON.stringify(d, null, 2);
    } catch {
      return log.details;
    }
  })()}
</td>


                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Logs;

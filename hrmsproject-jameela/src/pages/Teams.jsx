import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "./Teams.css";

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const API = "https://hrms-jsproject.onrender.com/api";

  useEffect(() => {

      fetchTeams();
  }, []);

  const fetchTeams = () => {
    const token = Cookies.get("jwt_token");

    fetch(`${API}/teams`, {
      headers: { Authorization: `Bearer ${token}` },
    })  
      .then((res) => res.json())
      // .then((data) => setTeams(data || []));
      .then((data) => {
        console.log("teams API RESPONSE:", data);  // 👈 ADD THIS
        setTeams(data || []);
      });
  };
  const deleteTeam = async (teamId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this team?"
    );
    if (!confirmDelete) return;

    const token = Cookies.get("jwt_token");

    try {
      const response = await fetch(`${API}/teams/${teamId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to delete team");
        return;
      }

      alert("Team deleted successfully");
      fetchTeams(); // refresh team list

    } catch (error) {
      console.error("Delete error:", error);
      alert("Something went wrong");
    }
  };

  return (
    <div className="teams-container">
      <Sidebar />

      <div className="teams-content">
        <div className="teams-top-bar">
          <h2>Teams</h2>

          <button
            className="add-team-btn"
            onClick={() => (window.location.href = "/teams/add")}
          >
            + Add Team
          </button>
        </div>

        <div className="team-grid">
          {teams.length === 0 ? (
            <p className="empty-msg">No teams created yet.</p>
          ) : (
            teams.map((team) => (
              <div className="team-card" key={team.id}>
                <h3>{team.name}</h3>
                <p className="desc">{team.description || "No description"}</p>

                <p className="members">
                  Members: <b>{team.member_count || 0}</b>
                </p>

                <div className="team-actions">
                  <button
                    className="edit-btn"
                    onClick={() => (window.location.href = `/teams/edit/${team.id}`)}
                  >
                    Edit
                  </button>

                                    {/* DELETE TEAM BUTTON */}
                                    <button
                    className="delete-btn"
                    onClick={() => deleteTeam(team.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Teams;

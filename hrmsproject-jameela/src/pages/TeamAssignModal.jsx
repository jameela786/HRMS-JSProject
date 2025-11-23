import React, { useState } from "react";
import Cookies from "js-cookie";
import "./TeamAssignModal.css";

const TeamAssignModal = ({ employee, teams, closeModal, refresh }) => {
  const [selectedTeams, setSelectedTeams] = useState(employee.team_names || []);

  const API = "https://hrms-jsproject.onrender.com/api";
  const token = Cookies.get("jwt_token");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const toggleTeam = (teamName) => {
    setSelectedTeams((prev) =>
      prev.includes(teamName)
        ? prev.filter((t) => t !== teamName) // Remove
        : [...prev, teamName]               // Add
    );
  };

  const handleSave = async () => {
    try {
      for (let team of teams) {
        const isChecked = selectedTeams.includes(team.name);
        const wasOriginallyAssigned = employee.team_names?.includes(team.name);

        // ASSIGN LOGIC
        if (isChecked && !wasOriginallyAssigned) {
          await fetch(`${API}/teams/${team.id}/assign`, {
            method: "POST",
            headers,
            body: JSON.stringify({ employeeId: employee.id }),
          });
        }

        // UNASSIGN LOGIC
        if (!isChecked && wasOriginallyAssigned) {
          await fetch(`${API}/teams/${team.id}/unassign`, {
            method: "DELETE",
            headers,
            body: JSON.stringify({ employeeId: employee.id }),
          });
        }
      }

      refresh();
      closeModal();
    } catch (err) {
      console.error("Team assignment error:", err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="team-modal">
        <h2>Assign Teams to {employee.first_name}</h2>

        <div className="team-checkbox-list">
          {teams.map((team) => (
            <label key={team.id} className="team-check-item">
              <input
                type="checkbox"
                checked={selectedTeams.includes(team.name)}
                onChange={() => toggleTeam(team.name)}
              />
              {team.name}
            </label>
          ))}
        </div>

        <div className="modal-actions">
          <button className="save-btn" onClick={handleSave}>Save</button>
          <button className="cancel-btn" onClick={closeModal}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default TeamAssignModal;

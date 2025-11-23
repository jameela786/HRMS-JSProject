import React, { useState } from "react";
import Cookies from "js-cookie";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "./TeamForm.css";

const TeamAdd = () => {
  const [teamData, setTeamData] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const API = "https://hrms-jsproject.onrender.com/api";

  const handleChange = (e) => {
    setTeamData({ ...teamData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    const token = Cookies.get("jwt_token");

    await fetch(`${API}/teams`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(teamData),
    });

    setLoading(false);
    window.location.href = "/teams";
  };

  return (
    <div className="team-form-container">
      <Sidebar />
      <Header title="Add Team" />

      <div className="team-form-content">
        <div className="team-form-card">
          <h2>Add New Team</h2>

          <form onSubmit={handleSubmit}>
            <label>Team Name</label>
            <input
              type="text"
              name="name"
              value={teamData.name}
              onChange={handleChange}
              required
            />

            <label>Description</label>
            <textarea
              name="description"
              value={teamData.description}
              onChange={handleChange}
            />

            <button type="submit" className="submit-team-btn">
              {loading ? "Saving..." : "Create Team"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeamAdd;

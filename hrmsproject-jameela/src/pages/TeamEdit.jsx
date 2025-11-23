import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useParams } from "react-router-dom";
import "./TeamForm.css";

const TeamEdit = () => {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const API = "https://hrms-jsproject.onrender.com/api";

  useEffect(() => {
    const token = Cookies.get("jwt_token");

    fetch(`${API}/teams/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setTeam(data));
  }, [id]);

  const updateTeam = async (e) => {
    e.preventDefault();
    const token = Cookies.get("jwt_token");

    await fetch(`${API}/teams/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(team),
    });

    window.location.href = "/teams";
  };

  if (!team) return <p>Loading...</p>;

  return (
    <div className="team-form-container">
      <Sidebar />
      <Header title="Edit Team" />

      <div className="team-form-content">
        <div className="team-form-card">
          <h2>Edit Team</h2>

          <form onSubmit={updateTeam}>
            <label>Team Name</label>
            <input
              type="text"
              name="name"
              value={team.name}
              onChange={(e) => setTeam({ ...team, name: e.target.value })}
            />

            <label>Description</label>
            <textarea
              name="description"
              value={team.description}
              onChange={(e) =>
                setTeam({ ...team, description: e.target.value })
              }
            />

            <button type="submit" className="submit-team-btn">
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeamEdit;

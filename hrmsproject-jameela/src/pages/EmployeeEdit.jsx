import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "./EmployeeAdd.css"; 

const EmployeeEdit = () => {
  const { id } = useParams();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    teamIds: [],
  });

  const [teams, setTeams] = useState([]);
  const [existingTeamIds, setExistingTeamIds] = useState([]); // For comparing diff
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(true);

  const API = "https://hrms-jsproject.onrender.com/api";

  useEffect(() => {
    const token = Cookies.get("jwt_token");
    const headers = { Authorization: `Bearer ${token}` };

    const fetchData = async () => {
      try {
        // 1. Fetch employee info
        const empRes = await fetch(`${API}/employees/${id}`, { headers });
        const emp = await empRes.json();

        // 2. Fetch teams
        const teamRes = await fetch(`${API}/teams`, { headers });
        const teamData = await teamRes.json();

        setTeams(teamData || []);
        // const assignedTeams = emp.team_ids || []; // Ensure backend returns this
        const assignedTeams = Array.isArray(emp.team_ids) ? emp.team_ids : [];

        setExistingTeamIds(assignedTeams);

        setFormData({
          first_name: emp.first_name,
          last_name: emp.last_name,
          email: emp.email,
          phone: emp.phone,
          teamIds: assignedTeams,
        });
      } catch (err) {
        setApiError("Failed to load employee");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.first_name.trim()) newErrors.first_name = "First name required";
    if (!formData.last_name.trim()) newErrors.last_name = "Last name required";
    if (!formData.email.trim()) newErrors.email = "Email required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email";
    // if (!formData.phone.trim()) newErrors.phone = "Phone required";
    if (!formData.phone.trim() || formData.phone.trim().length !== 10) {
      newErrors.phone = "Phone number is required and must be 10 digits.";
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        teamIds: checked
          ? [...prev.teamIds, Number(value)]
          : prev.teamIds.filter((id) => id !== Number(value)),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const token = Cookies.get("jwt_token");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      // STEP 1 — Update base employee fields
      const updateRes = await fetch(`${API}/employees/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
        }),
      });

      const updateData = await updateRes.json();
      if (!updateRes.ok) {
        setApiError(updateData.error || "Failed to update employee");
        return;
      }

      // STEP 2 — Determine team assignment changes
      const newTeamIds = formData.teamIds;
      const currentTeams = existingTeamIds;

      const addedTeams = newTeamIds.filter((id) => !currentTeams.includes(id));
      const removedTeams = currentTeams.filter((id) => !newTeamIds.includes(id));

      // STEP 3 — Sync team changes
      for (const teamId of addedTeams) {
        await fetch(`${API}/teams/${teamId}/assign`, {
          method: "POST",
          headers,
          body: JSON.stringify({ employeeId: Number(id) }),
        });
      }

      for (const teamId of removedTeams) {
        await fetch(`${API}/teams/${teamId}/unassign`, {
          method: "DELETE",
          headers,
          body: JSON.stringify({ employeeId: Number(id) }),
        });
      }

      window.location.href = "/employees";
    } catch {
      setApiError("Unexpected error. Try again.");
    }
  };

  if (loading) return <div className="loader">Loading...</div>;

  return (
    <div className="employee-add-container">
      <Sidebar />

      <div className="employee-add-content">
        <Header title="Edit Employee" />

        <div className="form-wrapper">
          {apiError && <div className="error-alert">{apiError}</div>}

          <form onSubmit={handleSubmit} className="employee-form">

            <div className="form-group">
              <label>First Name</label>
              <input
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={errors.first_name ? "error" : ""}
              />
              {errors.first_name && (
                <p className="error-message">{errors.first_name}</p>
              )}
            </div>

            <div className="form-group">
              <label>Last Name</label>
              <input
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className={errors.last_name ? "error" : ""}
              />
              {errors.last_name && (
                <p className="error-message">{errors.last_lastname}</p>
              )}
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "error" : ""}
              />
              {errors.email && <p className="error-message">{errors.email}</p>}
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? "error" : ""}
              />
              {errors.phone && <p className="error-message">{errors.phone}</p>}
            </div>

            {/* TEAM CHECKBOXES */}
            <div className="form-group">
              <label>Assign Teams</label>
              <div className="teams-checkbox-list">
                {teams.map((team) => (
                  <label key={team.id} className="team-item">
                    <input
                      type="checkbox"
                      value={team.id}
                      checked={formData.teamIds.includes(team.id)}
                      onChange={handleChange}
                    />
                    {team.name}
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="submit-button">
              Update Employee
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeeEdit;

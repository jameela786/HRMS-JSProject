import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "./EmployeeAdd.css";

const EmployeeAdd = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    teamIds: [],
  });

  const [teams, setTeams] = useState([]);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(true);

  const API = "https://hrms-jsproject.onrender.com/api";

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const token = Cookies.get("jwt_token");
        const headers = { Authorization: `Bearer ${token}` };

        const res = await fetch(`${API}/teams`, { headers });
        const data = await res.json();
        setTeams(data || []);
      } catch {
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) newErrors.first_name = "First name is required";
    if (!formData.last_name.trim()) newErrors.last_name = "Last name is required";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";

    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

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

      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    try {
      const token = Cookies.get("jwt_token");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      // Step 1: Create Employee
      const res = await fetch(`${API}/employees`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
        }),
      });

      const created = await res.json();

      if (!res.ok) {
        setApiError(created.error || "Failed to create employee");
        return;
      }

      // Step 2: Assign teams (if selected)
      for (const teamId of formData.teamIds) {
        await fetch(`${API}/teams/${teamId}/assign`, {
          method: "POST",
          headers,
          body: JSON.stringify({ employeeId: created.id }),
        });
      }

      window.location.href = "/employees";
    } catch (err) {
      setApiError("Unexpected error. Please try again.");
    }
  };

  if (loading) return <div className="loader">Loading...</div>;

  return (
    <div className="employee-add-container">
      <Sidebar />

      <div className="employee-add-content">
        
      <Header title="Add Employee" />
        <div className="form-wrapper">
          {apiError && <div className="error-alert">{apiError}</div>}

          <form onSubmit={handleSubmit} className="employee-form">

            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
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
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className={errors.last_name ? "error" : ""}
              />
              {errors.last_name && (
                <p className="error-message">{errors.last_name}</p>
              )}
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "error" : ""}
              />
              {errors.email && <p className="error-message">{errors.email}</p>}
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? "error" : ""}
              />
              {errors.phone && <p className="error-message">{errors.phone}</p>}
            </div>

            <div className="form-group">
              <label>Assign Teams</label>
              <div className="teams-checkbox-list">
                {teams.length === 0 && <p>No teams available</p>}

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
              Save Employee
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAdd;

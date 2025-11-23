import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import TeamAssignModal from "./TeamAssignModal";
import "./Employees.css";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const API = "https://hrms-jsproject.onrender.com/api";

  const fetchEmployees = () => {
    const token = Cookies.get("jwt_token");

    fetch(`${API}/employees`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      // .then((data) => setEmployees(data || []));
      .then((data) => {
        console.log("EMPLOYEE API RESPONSE:", data);  // 👈 ADD THIS
        setEmployees(data || []);
      });
  };

  const fetchTeams = () => {
    const token = Cookies.get("jwt_token");

    fetch(`${API}/teams`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setTeams(data || []));
  };

  useEffect(() => {
    fetchEmployees();
    fetchTeams();
  }, []);

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.first_name.toLowerCase().includes(search.toLowerCase()) ||
      emp.last_name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase());

    const matchesTeam =
      teamFilter === "all" ||
      emp.team_names?.includes(teamFilter);

    return matchesSearch && matchesTeam;
  });

  const deleteEmployee = async (id) => {
    if (!window.confirm("Delete this employee?")) return;

    const token = Cookies.get("jwt_token");

    await fetch(`${API}/employees/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchEmployees();
  };

  return (
    <div className="employees-container">
      <Sidebar />
     

      <div className="employees-content">

        {/* Top Bar */}
        <div className="employees-actions">
          <input
            type="text"
            placeholder="Search employees..."
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="team-filter"
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
          >
            <option value="all">All Teams</option>
            {teams.map((team) => (
              <option key={team.id} value={team.name}>
                {team.name}
              </option>
            ))}
          </select>

          <button
            className="add-btn"
            onClick={() => (window.location.href = "/employees/add")}
          >
            + Add Employee
          </button>
        </div>

        {/* Employee Table */}
        <div className="table-container">
          <table className="employee-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Teams</th>
                <th>Assign</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-records">
                    No employees found
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.first_name} {emp.last_name}</td>
                    <td>{emp.email}</td>
                    <td>{emp.phone}</td>
                    <td>{emp.team_names ? emp.team_names.join(", ") : "—"}</td>

                    <td>
                      <button
                        className="assign-btn"
                        onClick={() => setSelectedEmployee(emp)}
                      >
                        Assign
                      </button>
                    </td>

                    <td>
                      <button
                        className="edit-btn"
                        onClick={() =>
                          (window.location.href = `/employees/edit/${emp.id}`)
                        }
                      >
                        Edit
                      </button>
                    </td>

                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => deleteEmployee(emp.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>

      </div>

      {/* Team Assign Modal */}
      {selectedEmployee && (
        <TeamAssignModal
          employee={selectedEmployee}
          teams={teams}
          closeModal={() => setSelectedEmployee(null)}
          refresh={fetchEmployees}
        />
      )}

    </div>
  );
};

export default Employees;

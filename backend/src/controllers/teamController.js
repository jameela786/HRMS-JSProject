const connectDB = require("../db");
const { createLog } = require("../models/log");

// ------------------------------------------------------
// GET ALL TEAMS  (with member count)
// ------------------------------------------------------
exports.getTeams = async (req, res) => {
  try {
    const db = await connectDB();
    const orgId = req.user.orgId;

    const rows = await db.all(
      `SELECT 
          t.*, 
          COUNT(et.employee_id) AS member_count
       FROM teams t
       LEFT JOIN employee_teams et ON t.id = et.team_id
       WHERE t.organisation_id = ?
       GROUP BY t.id
       ORDER BY t.id DESC`,
      [orgId]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch teams", details: err.message });
  }
};

// ------------------------------------------------------
// GET SINGLE TEAM BY ID
// ------------------------------------------------------
exports.getTeamById = async (req, res) => {
  try {
    const db = await connectDB();
    const orgId = req.user.orgId;
    const id = Number(req.params.id);

    const team = await db.get(
      `SELECT * FROM teams WHERE id = ? AND organisation_id = ?`,
      [id, orgId]
    );

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    res.json(team);
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch team",
      details: err.message,
    });
  }
};

// ------------------------------------------------------
// CREATE TEAM
// ------------------------------------------------------
exports.createTeam = async (req, res) => {
  try {
    const db = await connectDB();
    const orgId = req.user.orgId;
    const userId = req.user.userId;

    const { name, description } = req.body;

    const result = await db.run(
      `INSERT INTO teams (organisation_id, name, description)
       VALUES (?, ?, ?)`,
      [orgId, name, description]
    );

    const created = await db.get(`SELECT * FROM teams WHERE id = ?`, [
      result.lastID,
    ]);

    await createLog(orgId, userId, "TEAM_CREATED", {
      message: `Team '${name}' created.`,
    });

    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: "Failed to create team", details: err.message });
  }
};

// ------------------------------------------------------
// UPDATE TEAM
// ------------------------------------------------------
exports.updateTeam = async (req, res) => {
  try {
    const db = await connectDB();
    const orgId = req.user.orgId;
    const userId = req.user.userId;

    const id = Number(req.params.id);
    const { name, description } = req.body;

    const existing = await db.get(
      `SELECT * FROM teams WHERE id = ? AND organisation_id = ?`,
      [id, orgId]
    );

    if (!existing)
      return res.status(404).json({ error: "Team not found" });

    await db.run(
      `UPDATE teams
       SET name = COALESCE(?, name),
           description = COALESCE(?, description)
       WHERE id = ?`,
      [name, description, id]
    );

    const updated = await db.get(`SELECT * FROM teams WHERE id = ?`, [id]);

    await createLog(orgId, userId, "TEAM_UPDATED", {
      message: `Team '${updated.name}' updated.`,
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update team", details: err.message });
  }
};

// ------------------------------------------------------
// DELETE TEAM
// ------------------------------------------------------
exports.deleteTeam = async (req, res) => {
  try {
    const db = await connectDB();
    const orgId = req.user.orgId;
    const userId = req.user.userId;

    const id = Number(req.params.id);

    const existing = await db.get(
      `SELECT * FROM teams WHERE id = ? AND organisation_id = ?`,
      [id, orgId]
    );

    if (!existing)
      return res.status(404).json({ error: "Team not found" });

    // Remove assignments
    await db.run(`DELETE FROM employee_teams WHERE team_id = ?`, [id]);

    // Delete team
    await db.run(`DELETE FROM teams WHERE id = ?`, [id]);

    await createLog(orgId, userId, "TEAM_DELETED", {
      message: `Team '${existing.name}' deleted.`,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete team", details: err.message });
  }
};

// ------------------------------------------------------
// ASSIGN EMPLOYEES TO TEAM
// ------------------------------------------------------
exports.assignEmployees = async (req, res) => {
  try {
    const db = await connectDB();
    const orgId = req.user.orgId;
    const userId = req.user.userId;

    const teamId = Number(req.params.teamId);
    const { employeeId, employeeIds } = req.body;

    // Normalize request
    const ids = employeeIds?.length
      ? employeeIds
      : employeeId
      ? [employeeId]
      : [];

    if (!ids.length)
      return res.status(400).json({ error: "employeeId(s) required" });

    const team = await db.get(`SELECT name FROM teams WHERE id = ?`, [teamId]);

    const assigned = [];

    for (const id of ids) {
      const emp = await db.get(
        `SELECT first_name, last_name FROM employees WHERE id = ?`,
        [id]
      );

      await db.run(
        `INSERT OR IGNORE INTO employee_teams (employee_id, team_id)
         VALUES (?, ?)`,
        [id, teamId]
      );

      assigned.push(id);

      await createLog(orgId, userId, "TEAM_ASSIGNED", {
        message: `Employee '${emp.first_name} ${emp.last_name}' assigned to team '${team.name}'.`,
      });
    }

    res.json({ assigned });
  } catch (err) {
    res.status(500).json({ error: "Failed to assign employees", details: err.message });
  }
};

// ------------------------------------------------------
// UNASSIGN EMPLOYEES FROM TEAM
// ------------------------------------------------------
exports.unassignEmployees = async (req, res) => {
  try {
    const db = await connectDB();
    const orgId = req.user.orgId;
    const userId = req.user.userId;

    const teamId = Number(req.params.teamId);
    const { employeeId, employeeIds } = req.body;

    const ids = employeeIds?.length
      ? employeeIds
      : employeeId
      ? [employeeId]
      : [];

    const team = await db.get(
      `SELECT name FROM teams WHERE id = ?`,
      [teamId]
    );

    const removed = [];

    for (const id of ids) {
      const emp = await db.get(
        `SELECT first_name, last_name FROM employees WHERE id = ?`,
        [id]
      );

      await db.run(
        `DELETE FROM employee_teams
         WHERE employee_id = ? AND team_id = ?`,
        [id, teamId]
      );

      removed.push(id);

      await createLog(orgId, userId, "TEAM_UNASSIGNED", {
        message: `Employee '${emp.first_name} ${emp.last_name}' removed from team '${team.name}'.`,
      });
    }

    res.json({ removed });
  } catch (err) {
    res.status(500).json({ error: "Failed to unassign employees", details: err.message });
  }
};

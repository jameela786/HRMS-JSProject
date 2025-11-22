const connectDB = require("../db");
const { createLog } = require("../models/log");

exports.getTeams = async (req, res) => {
    try {
        const db = await connectDB();
        const orgId = req.user.orgId;

        const rows = await db.all(
            `SELECT * FROM teams WHERE organisation_id = ? ORDER BY id DESC`,
            [orgId]
        );

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch teams", details: err.message });
    }
};

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

        await createLog(orgId, userId, "create_team", { teamId: result.lastID });

        const created = await db.get(`SELECT * FROM teams WHERE id = ?`, [
            result.lastID,
        ]);

        res.status(201).json(created);
    } catch (err) {
        res.status(500).json({ error: "Failed to create team", details: err.message });
    }
};

exports.updateTeam = async (req, res) => {
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

        const { name, description } = req.body;

        await db.run(
            `UPDATE teams
             SET name = COALESCE(?, name),
                 description = COALESCE(?, description)
             WHERE id = ?`,
            [name, description, id]
        );

        await createLog(orgId, userId, "update_team", { teamId: id });

        const updated = await db.get(`SELECT * FROM teams WHERE id = ?`, [id]);

        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: "Failed to update team", details: err.message });
    }
};

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

        await db.run(`DELETE FROM employee_teams WHERE team_id = ?`, [id]);
        await db.run(`DELETE FROM teams WHERE id = ?`, [id]);

        await createLog(orgId, userId, "delete_team", { teamId: id });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete team", details: err.message });
    }
};

exports.assignEmployees = async (req, res) => {
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

        if (!ids.length)
            return res.status(400).json({ error: "employeeId(s) required" });

        const assigned = [];

        for (const id of ids) {
            await db.run(
                `INSERT OR IGNORE INTO employee_teams (employee_id, team_id)
                 VALUES (?, ?)`,
                [id, teamId]
            );
            assigned.push(id);
        }

        await createLog(orgId, userId, "assign_team", {
            teamId,
            assigned,
        });

        res.json({ assigned });
    } catch (err) {
        res.status(500).json({ error: "Failed to assign employees", details: err.message });
    }
};

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

        const removed = [];

        for (const id of ids) {
            await db.run(
                `DELETE FROM employee_teams
                 WHERE employee_id = ? AND team_id = ?`,
                [id, teamId]
            );
            removed.push(id);
        }

        await createLog(orgId, userId, "unassign_team", {
            teamId,
            removed,
        });

        res.json({ removed });
    } catch (err) {
        res.status(500).json({ error: "Failed to unassign employees", details: err.message });
    }
};

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
        details: err.message
      });
    }
  };
  
  
  
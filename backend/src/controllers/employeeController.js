const connectDB = require("../db");
const { createLog } = require("../models/log");

// ------------------ GET ALL EMPLOYEES ------------------
exports.getEmployees = async (req, res) => {
  try {
    const db = await connectDB();
    const orgId = req.user.orgId;

    const rows = await db.all(
      `SELECT e.*,
        GROUP_CONCAT(t.name, ', ') AS team_names
       FROM employees e
       LEFT JOIN employee_teams et ON e.id = et.employee_id
       LEFT JOIN teams t ON et.team_id = t.id
       WHERE e.organisation_id = ?
       GROUP BY e.id
       ORDER BY e.id DESC`,
      [orgId]
    );

    // Convert comma string → array
    const formatted = rows.map(emp => ({
      ...emp,
      team_names: emp.team_names ? emp.team_names.split(", ") : []
    }));

    res.json(formatted);

  } catch (err) {
    res.status(500).json({ error: "Failed to fetch employees", details: err.message });
  }
};


// ------------------ GET SINGLE EMPLOYEE ------------------
exports.getEmployeeById = async (req, res) => {
  try {
    const db = await connectDB();
    const orgId = req.user.orgId;
    const id = Number(req.params.id);

    const emp = await db.get(
      `SELECT * FROM employees WHERE id = ? AND organisation_id = ?`,
      [id, orgId]
    );

    if (!emp)
      return res.status(404).json({ error: "Employee not found" });

    res.json(emp);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve employee", details: err.message });
  }
};

// ------------------ CREATE EMPLOYEE ------------------
exports.createEmployee = async (req, res) => {
  try {
    const db = await connectDB();
    const orgId = req.user.orgId;
    const userId = req.user.userId;

    const { first_name, last_name, email, phone } = req.body;

    const result = await db.run(
      `INSERT INTO employees (organisation_id, first_name, last_name, email, phone)
       VALUES (?, ?, ?, ?, ?)`,
      [orgId, first_name, last_name, email, phone]
    );

    const created = await db.get(`SELECT * FROM employees WHERE id = ?`, [
      result.lastID,
    ]);

    await createLog(
      orgId,
      userId,
      "EMPLOYEE_CREATED",
      { message: `Employee '${first_name} ${last_name}' created.` }
    );

    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: "Failed to create employee", details: err.message });
  }
};

// ------------------ UPDATE EMPLOYEE ------------------
exports.updateEmployee = async (req, res) => {
  try {
    const db = await connectDB();
    const orgId = req.user.orgId;
    const userId = req.user.userId;
    const id = Number(req.params.id);

    const existing = await db.get(
      `SELECT * FROM employees WHERE id = ? AND organisation_id = ?`,
      [id, orgId]
    );

    if (!existing)
      return res.status(404).json({ error: "Employee not found" });

    const { first_name, last_name, email, phone } = req.body;

    await db.run(
      `UPDATE employees
         SET first_name = COALESCE(?, first_name),
             last_name = COALESCE(?, last_name),
             email = COALESCE(?, email),
             phone = COALESCE(?, phone)
       WHERE id = ?`,
      [first_name, last_name, email, phone, id]
    );

    const updated = await db.get(`SELECT * FROM employees WHERE id = ?`, [id]);

    await createLog(
      orgId,
      userId,
      "EMPLOYEE_UPDATED",
      { message: `Employee '${updated.first_name} ${updated.last_name}' updated.` }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update employee", details: err.message });
  }
};

// ------------------ DELETE EMPLOYEE ------------------
exports.deleteEmployee = async (req, res) => {
  try {
    const db = await connectDB();
    const orgId = req.user.orgId;
    const userId = req.user.userId;
    const id = Number(req.params.id);

    const existing = await db.get(
      `SELECT * FROM employees WHERE id = ? AND organisation_id = ?`,
      [id, orgId]
    );

    if (!existing)
      return res.status(404).json({ error: "Employee not found" });

    await db.run(`DELETE FROM employees WHERE id = ?`, [id]);

    await createLog(
      orgId,
      userId,
      "EMPLOYEE_DELETED",
      { message: `Employee '${existing.first_name} ${existing.last_name}' deleted.` }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete employee", details: err.message });
  }
};

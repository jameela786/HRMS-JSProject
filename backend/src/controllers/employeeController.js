const connectDB = require("../db");
const { createLog } = require("../models/log");

exports.getEmployees = async (req, res) => {
    try {
        const db = await connectDB();
        const orgId = req.user.orgId;

        const rows = await db.all(
            `SELECT * FROM employees WHERE organisation_id = ? ORDER BY id DESC`,
            [orgId]
        );

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch employees", details: err.message });
    }
};

exports.getEmployeeById = async (req, res) => {
    try {
        const db = await connectDB();
        const orgId = req.user.orgId;
        const id = Number(req.params.id);

        const emp = await db.get(
            `SELECT * FROM employees WHERE id = ? AND organisation_id = ?`,
            [id, orgId]
        );

        if (!emp) return res.status(404).json({ error: "Employee not found" });

        res.json(emp);
    } catch (err) {
        res.status(500).json({ error: "Failed to retrieve employee", details: err.message });
    }
};

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

        await createLog(orgId, userId, "create_employee", { employeeId: result.lastID });

        const created = await db.get(`SELECT * FROM employees WHERE id = ?`, [
            result.lastID,
        ]);

        res.status(201).json(created);
    } catch (err) {
        res.status(500).json({ error: "Failed to create employee", details: err.message });
    }
};

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

        await createLog(orgId, userId, "update_employee", { employeeId: id });

        const updated = await db.get(`SELECT * FROM employees WHERE id = ?`, [id]);

        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: "Failed to update employee", details: err.message });
    }
};

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

        await createLog(orgId, userId, "delete_employee", { employeeId: id });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete employee", details: err.message });
    }
};

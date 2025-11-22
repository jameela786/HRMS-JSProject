const connectDB = require("../db");

exports.getLogs = async (req, res) => {
  try {
    const db = await connectDB();
    const limit = req.query.limit ? Number(req.query.limit) : 50;

    const logs = await db.all(
      `
      SELECT 
        logs.*, 
        users.name AS user_name
      FROM logs
      LEFT JOIN users ON logs.user_id = users.id
      WHERE logs.organisation_id = ?
      ORDER BY logs.timestamp DESC
      LIMIT ?
      `,
      [req.user.orgId, limit]
    );

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch logs", details: err.message });
  }
};

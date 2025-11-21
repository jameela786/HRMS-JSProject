const connectDB = require("../db");

async function createLog(organisation_id, user_id, action, meta = {}) {
    const db = await connectDB();
    return db.run(
        `INSERT INTO logs (organisation_id, user_id, action, meta)
         VALUES (?, ?, ?, ?)`,
        [organisation_id, user_id, action, JSON.stringify(meta)]
    );
}

module.exports = { createLog };

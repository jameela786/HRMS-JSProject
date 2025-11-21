const connectDB = require("../db");

async function createTeam(orgId, name, description) {
    const db = await connectDB();
    return db.run(
        `INSERT INTO teams (organisation_id, name, description)
         VALUES (?, ?, ?)`,
        [orgId, name, description]
    );
}

module.exports = { createTeam };

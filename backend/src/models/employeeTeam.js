const connectDB = require("../db");

async function assignEmployee(employeeId, teamId) {
    const db = await connectDB();
    return db.run(
        `INSERT INTO employee_teams (employee_id, team_id)
         VALUES (?, ?)`,
        [employeeId, teamId]
    );
}

module.exports = { assignEmployee };

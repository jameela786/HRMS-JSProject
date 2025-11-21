const connectDB = require("../db");

async function createEmployee(orgId, data) {
    const db = await connectDB();
    return db.run(
        `INSERT INTO employees (organisation_id, first_name, last_name, email, phone)
         VALUES (?, ?, ?, ?, ?)`,
        [orgId, data.first_name, data.last_name, data.email, data.phone]
    );
}

module.exports = { createEmployee };

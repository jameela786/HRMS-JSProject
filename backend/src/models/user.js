const connectDB = require("../db");

async function findUserByEmail(email) {
    const db = await connectDB();
    return db.get(`SELECT * FROM users WHERE email = ?`, [email]);
}

async function createUser(orgId, name, email, passwordHash) {
    const db = await connectDB();
    return db.run(
        `INSERT INTO users (organisation_id, name, email, password_hash)
         VALUES (?, ?, ?, ?)`,
        [orgId, name, email, passwordHash]
    );
}

module.exports = {
    findUserByEmail,
    createUser
};

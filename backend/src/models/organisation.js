const connectDB = require("../db");

async function createOrganisation(name) {
    const db = await connectDB();
    return db.run(
        `INSERT INTO organisations (name) VALUES (?)`,
        [name]
    );
}

module.exports = { createOrganisation };

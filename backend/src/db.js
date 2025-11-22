const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const dbPath = path.join(__dirname, "../hrms_db.sqlite");

let db;

async function connectDB() {
    if (!db) {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });
        await db.exec("PRAGMA foreign_keys = ON;");
        console.log("✔ SQLite connected");

        // TABLE CREATION
        await db.exec(`
            CREATE TABLE IF NOT EXISTS organisations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                created_at DATETIME DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                organisation_id INTEGER,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                name TEXT,
                created_at DATETIME DEFAULT (datetime('now')),
                FOREIGN KEY (organisation_id) REFERENCES organisations(id)
            );

            CREATE TABLE IF NOT EXISTS employees (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                organisation_id INTEGER,
                first_name TEXT,
                last_name TEXT,
                email TEXT,
                phone TEXT,
                created_at DATETIME DEFAULT (datetime('now')),
                FOREIGN KEY (organisation_id) REFERENCES organisations(id)
            );

            CREATE TABLE IF NOT EXISTS teams (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                organisation_id INTEGER,
                name TEXT NOT NULL,
                description TEXT,
                created_at DATETIME DEFAULT (datetime('now')),
                FOREIGN KEY (organisation_id) REFERENCES organisations(id)
            );

            CREATE TABLE IF NOT EXISTS employee_teams (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_id INTEGER,
                team_id INTEGER,
                assigned_at DATETIME DEFAULT (datetime('now')),
                FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
                FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                organisation_id INTEGER,
                user_id INTEGER,
                action TEXT,
                meta TEXT,
                timestamp DATETIME DEFAULT (datetime('now')),
                FOREIGN KEY (organisation_id) REFERENCES organisations(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
        `);

        console.log("✔ Tables created (if not exist)");
    }
    return db;
}

module.exports = connectDB;

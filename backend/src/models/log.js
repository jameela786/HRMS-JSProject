const connectDB = require("../db");

// async function createLog(organisation_id, user_id, action, meta = {}) {
//     const db = await connectDB();
//     return db.run(
//         `INSERT INTO logs (organisation_id, user_id, action, meta)
//          VALUES (?, ?, ?, ?)`,
//         [organisation_id, user_id, action, JSON.stringify(meta)]
//     );
    
// }

// module.exports = { createLog };
// exports.createLog = async (orgId, userId, action, meta = {}) => {
//     const db = await connectDB();
  
//     await db.run(
//       `INSERT INTO logs (organisation_id, user_id, action, details, timestamp)
//        VALUES (?, ?, ?, ?, datetime('now'))`,
//       [orgId, userId, action, JSON.stringify(meta)]
//     );
//   };

exports.createLog = async (orgId, userId, action, details = {}) => {
  const db = await connectDB();
  const timestamp = new Date().toISOString();

  await db.run(
    `INSERT INTO logs (organisation_id, user_id, action, details, timestamp)
     VALUES (?, ?, ?, ?, ?)`,
    [orgId, userId, action, JSON.stringify(details), timestamp]
  );
};


// function errorHandler(err, req, res, next) {
//     console.error("🔥 ERROR:", err);
//     res.status(500).json({ error: "Server Error", details: err.message });
// }

// module.exports = errorHandler;


module.exports = (err, req, res, next) => {
    console.error("🔥 SERVER ERROR:", err);    // <-- ADD THIS
    res.status(err.statusCode || 500).json({
      error: err.message || "Server Error",
      details: err.details || null
    });
  };
  
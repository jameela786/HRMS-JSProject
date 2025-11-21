function errorHandler(err, req, res, next) {
    console.error("🔥 ERROR:", err);
    res.status(500).json({ error: "Server Error", details: err.message });
}

module.exports = errorHandler;

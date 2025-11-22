const express = require("express");
const router = express.Router();
const { getLogs } = require("../controllers/logController");
const auth = require("../middlewares/authMiddleware");

router.get("/", auth, getLogs);

module.exports = router;

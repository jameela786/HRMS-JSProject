const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");

const {
    getTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    assignEmployees,
    unassignEmployees,
} = require("../controllers/teamController");

router.get("/", auth, getTeams);
router.post("/", auth, createTeam);
router.put("/:id", auth, updateTeam);
router.delete("/:id", auth, deleteTeam);

router.post("/:teamId/assign", auth, assignEmployees);
router.delete("/:teamId/unassign", auth, unassignEmployees);

module.exports = router;

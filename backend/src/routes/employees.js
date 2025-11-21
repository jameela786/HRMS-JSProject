const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const {
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
} = require("../controllers/employeeController");

router.get("/", auth, getEmployees);
router.get("/:id", auth, getEmployeeById);
router.post("/", auth, createEmployee);
router.put("/:id", auth, updateEmployee);
router.delete("/:id", auth, deleteEmployee);

module.exports = router;

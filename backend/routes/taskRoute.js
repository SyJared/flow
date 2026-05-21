const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {createTask} = require("../controller/taskController");

const validate = require("../middleware/validationMiddleware");
const {taskSchema} = require("../validations/taskSchema");

router.post("/create-task/:id", authMiddleware, roleMiddleware, validate(taskSchema), createTask);

module.exports = router;
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {createTask, getTasksByWorkspaceId, getAllTaskByUserId} = require("../controller/taskController");

const validate = require("../middleware/validationMiddleware");
const {taskSchema} = require("../validations/taskSchema");

router.post("/create-task/:id", authMiddleware, roleMiddleware, validate(taskSchema), createTask);
router.get("/get-tasks/:workspaceId", authMiddleware, getTasksByWorkspaceId);
router.get("/all-task/:userId", authMiddleware, getAllTaskByUserId);

module.exports = router;
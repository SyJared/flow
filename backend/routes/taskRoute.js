const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const workspaceMemberMiddleware = require("../middleware/workspaceMemberMiddleware");
const {createTask, updateTask, getTasksByWorkspaceId, getAllTaskByUserId, bestMember, getPastDue} = require("../controller/taskController");

const validate = require("../middleware/validationMiddleware");
const {taskSchema} = require("../validations/taskSchema");
const { updateTaskSchema } = require("../validations/updateTaskSchema");

router.post("/create-task/:id", authMiddleware, roleMiddleware, validate(taskSchema), createTask);
router.put("/update-task/:id/:taskId", authMiddleware, roleMiddleware, validate(updateTaskSchema), updateTask);
router.get("/get-tasks/:workspaceId", authMiddleware, workspaceMemberMiddleware, getTasksByWorkspaceId);
router.get("/all-task/:userId", authMiddleware, getAllTaskByUserId);
router.get("/best-member/:id", authMiddleware, workspaceMemberMiddleware, bestMember);
router.get("/past-due", authMiddleware, getPastDue)
module.exports = router;

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const taskUpdateController = require('../controller/taskUpdateController');
const assignedMiddleware = require('../middleware/assignedMiddleware');
const workspaceMemberMiddleware = require('../middleware/workspaceMemberMiddleware');
const validate = require("../middleware/validationMiddleware");
const { taskUpdateSchema } = require('../validations/taskUpdateSchema');

router.put('/update', authMiddleware, assignedMiddleware, validate(taskUpdateSchema), taskUpdateController.updateTask);
router.get('/get-updates/:workspaceId/:taskId', authMiddleware, workspaceMemberMiddleware, taskUpdateController.getTaskUpdates);

module.exports = router;

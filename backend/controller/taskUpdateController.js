const taskUpdateService = require('../services/taskUpdateService');

const updateTask = async (req, res, next) => {
  const { id, taskId, workspaceId, message, progress } = req.body;
  try {
    const taskUpdate = await taskUpdateService.updateTask(id, taskId, workspaceId, message, progress);
    return res.status(200).json({
      success: true,
      data: taskUpdate.update,
      message: taskUpdate.message
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { updateTask };
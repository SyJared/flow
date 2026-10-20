const taskUpdateService = require('../services/taskUpdateService');
const updateTask = async (req, res, next) => {
  const { taskId, workspaceId, message, progress } = req.body;
  const userId = req.user.id;
  try {
    const taskUpdate = await taskUpdateService.updateTask(userId, taskId, workspaceId, message, progress);
    return res.status(200).json({
      success: true,
      update: taskUpdate.update,
      message: taskUpdate.message
    });
  } catch (err) {
    next(err);
  }
};

const getTaskUpdates = async(req, res, next)=>{
  const {workspaceId, taskId} = req.params;
  try {
    const taskUpdates = await taskUpdateService.getTaskUpdates(workspaceId, taskId);
    return res.status(200).json({
      success: true,
      results: taskUpdates,
      message: "task updates retrieved successfully"
    });
  } catch (err) {
    next(err);
  }
}
module.exports = { updateTask, getTaskUpdates };

const taskUpdateService = require('../services/taskUpdateService');
const appError = require('../utils/appError');

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

const getTaskUpdates = async(req, res, next)=>{
  const {workspaceId, taskId} = req.params;
  try {
    const taskUpdates = await taskUpdateService.getTaskUpdates(workspaceId, taskId);
    if(taskUpdates.length === 0){
      return res.status(404).json({
        success: false,
        message: "No updates found for the specified task"
      });
    }
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
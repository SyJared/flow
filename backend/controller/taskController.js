const taskService = require("../services/taskService");

const appError = require("../utils/appError");

const createTask = async (req,res,next) =>{
  const { workspaceId, title, description, priority, dueDate, assignedTo } = req.body;
  const userId = req.user.id;

  try {
    const task = await taskService.createTask(
      workspaceId,
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      userId
    );

    return res.status(200).json({
      success: true,
      data: task,
      message: task.message
    });
  } catch (err) {
    next(err);
  }
}

const getTasksByWorkspaceId = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const tasks = await taskService.getTaskByWorkspaceId(workspaceId);

   
    if (tasks.length === 0){
      throw new appError("No tasks found for the specified workspace", 404);
    }

    return res.status(200).json({
      success: true,
      tasks: tasks
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { createTask, getTasksByWorkspaceId }
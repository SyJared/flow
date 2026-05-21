const taskService = require("../services/taskService");

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

module.exports = { createTask }
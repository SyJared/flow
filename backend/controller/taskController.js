
const { success } = require("zod");
const taskService = require("../services/taskService");
const exportTrainingData = require('../utils/export-training-data')

const appError = require("../utils/appError");
const { response } = require("express");

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

const getAllTaskByUserId = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const tasks = await taskService.getAllTaskByUserId(userId);
    if(tasks.length === 0){
      throw new appError("No tasks found for the user", 404);
    }
    return res.status(200).json({
      success: true,
      results: tasks
    });
  } catch (err) {
    next(err);
  }
}

const bestMember = async (req, res, next) => {
  try {
    console.log("controller params:", req.params);

    const { id } = req.params;

    // 1. get data from DB
    const tasksInfo = await taskService.bestMember(id);

    if (!tasksInfo || tasksInfo.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No completed tasks yet",
      });
    }

    // 2. prepare features for ML
    const features = tasksInfo.map(task => ({
      assigned_to: task.assigned_to,
      task_id: task.task_id,       // ← from t.id AS task_id
      priority: task.priority,
      total_hours: task.total_hours, // ← from u.hours_spent
      planned_days: task.planned_days, 
      num_updates: task.num_updates ,
      days_late: task.days_late,
      on_time_completion: task.on_time_completion
    }));

    // 3. call Python ML API
    const response = await fetch("http://ml-service:5001/predict-members", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ features }),
    });
    if (!response.ok) {
  throw new Error(`ML service error: ${response.status}`);
}

    const data = await response.json();
console.log("ML response:", data);
    // 4. return result to frontend
    return res.json({
      success: true,
      recommendation: data.ranking,
      message: "Recommendation retrievedsss",
    });

  } catch (err) {
    next(err);
  }
};
module.exports = { createTask, getTasksByWorkspaceId , getAllTaskByUserId, bestMember};
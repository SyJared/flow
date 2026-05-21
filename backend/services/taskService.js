const db = require("../config/db");
const addNotificationReceivers = require("../utils/addNotificationReceivers");
const createNotification = require("../utils/createNotification");

const createTask = async (
  workspaceId,
  title,
  description,
  priority,
  dueDate,
  assignedTo,
  userId
) => {

  return new Promise((resolve, reject) => {

    const sql = `
      INSERT INTO tasks 
      (workspace_id, title, description, priority, due_date, assigned_to, assigned_by, created_by) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        workspaceId,
        title,
        description,
        priority,
        dueDate,
        assignedTo,
        userId,
        userId
      ],

      async (err, results) => {

        if (err) {
          return reject(err);
        }

        try {

          const notifId = await createNotification(db, {
            actor_id: userId,
            task_id: results.insertId,
            workspace_id: workspaceId,
            type: "create_task",
            message: "Created a task"
          });

          await addNotificationReceivers(
            db,
            notifId,
            workspaceId,
            userId
          );

          resolve({
            message: "Task created successfully",
            taskId: results.insertId
          });

        } catch (err) {

          resolve({
            message: "Task created but failed to create notification",
            taskId: results.insertId
          });

        }
      }
    );
  });
};

module.exports = { createTask };
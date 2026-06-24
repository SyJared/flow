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

const getTaskByWorkspaceId = async (workspaceId)=>{
  return new Promise((resolve, reject)=>{
  const sql = "SELECT * FROM tasks WHERE workspace_id = ?";
    db.query(sql, [workspaceId], (err, results)=>{
      if(err){
        return reject(err);
      }
      resolve(results);
    })
  })
}

const getAllTaskByUserId = async (userId) => {
  return new Promise((resolve, reject)=>{
    const sql = `
    SELECT
      t.id,
      t.title,
      t.description,
      t.status,
      t.priority,
      t.due_date,
      t.created_at,
      t.workspace_id,
      t.assigned_to,
      w.workspace_name
    FROM tasks t
    JOIN workspaces w
      ON t.workspace_id = w.id
    WHERE t.assigned_to = ?
  `;
    db.query(sql,[userId],(err, results)=>{
      if(err){
        return reject(err);
      }
      resolve(results);
    })
  })
}

const bestMember = async(id)=>{
  return new Promise((resolve, reject)=>{
    const sql =`
   SELECT
    t.id AS task_id,
    t.assigned_to,
    t.priority,

    DATEDIFF(t.due_date, t.created_at) AS planned_days,
    SUM(COALESCE(u.hours_spent,0)) AS total_hours,
    COUNT(u.id) AS num_updates,

    t.days_late,
    t.on_time_completion

FROM tasks t
JOIN task_updates u
    ON u.task_id = t.id

WHERE t.status = 'done'
AND t.workspace_id = ?

GROUP BY
    t.id,
    t.assigned_to,
    t.priority,
    t.days_late,
    t.on_time_completion;
`;
    db.query(sql, [id], (err,result)=>{
      console.log("service workspaceId:", id);
      if(err){
        return reject(err)
      }
      resolve(result)
    })
  })
}
module.exports = { createTask, getTaskByWorkspaceId, getAllTaskByUserId, bestMember};
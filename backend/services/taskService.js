const db = require("../config/db");
const appError = require("../utils/appError");
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

    db.query("SELECT 1 FROM workspace_members WHERE workspace_id = ? AND user_id = ? LIMIT 1", [workspaceId, assignedTo], (memberError, members) => {
      if (memberError) return reject(memberError);
      if (!members.length) return reject(new appError("Choose an assignee who belongs to this workspace.", 400));

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

const updateTask = async (workspaceId, taskId, { title, description, priority, dueDate, assignedTo }) => {
  return new Promise((resolve, reject) => {
    db.query("SELECT 1 FROM workspace_members WHERE workspace_id = ? AND user_id = ? LIMIT 1", [workspaceId, assignedTo], (memberError, members) => {
      if (memberError) return reject(memberError);
      if (!members.length) return reject(new appError("Choose an assignee who belongs to this workspace.", 400));
    const sql = `
      UPDATE tasks
      SET title = ?, description = ?, priority = ?, due_date = ?, assigned_to = ?
      WHERE workspace_id = ? AND id = ?
    `;
    db.query(sql, [title, description || null, priority, dueDate || null, assignedTo, workspaceId, taskId], (err) => {
      if (err) return reject(err);
      resolve({ id: Number(taskId), workspace_id: Number(workspaceId), title, description: description || "", priority, due_date: dueDate || null, assigned_to: Number(assignedTo) });
    });
    });
  });
};

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

    DATEDIFF(t.due_date, DATE(t.created_at)) AS planned_days,
    SUM(COALESCE(u.hours_spent,0)) AS total_hours,
    COUNT(u.id) AS num_updates,

    DATEDIFF(completion.completed_at, t.due_date) AS days_late,
    CASE WHEN completion.completed_at <= t.due_date THEN 1 ELSE 0 END AS on_time_completion

FROM tasks t
JOIN task_updates u
    ON u.task_id = t.id
JOIN (
    SELECT task_id, MAX(created_at) AS completed_at
    FROM task_updates
    WHERE status = 'done'
    GROUP BY task_id
) completion ON completion.task_id = t.id

WHERE t.status = 'done'
AND t.workspace_id = ?

GROUP BY
    t.id,
    t.assigned_to,
    t.priority,
    completion.completed_at,
    t.due_date;
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

const getPastDueCount = async (userId) => {
  return new Promise((resolve, reject) => {
    const sql1 = `
      SELECT COUNT(*) AS completed_past_due
      FROM tasks t
      JOIN (
        SELECT task_id, MAX(created_at) AS completed_at
        FROM task_updates
        WHERE status = 'done'
        GROUP BY task_id
      ) completion ON completion.task_id = t.id
      WHERE t.assigned_to = ? AND t.status = 'done' AND t.due_date IS NOT NULL
        AND completion.completed_at > t.due_date;
    `;

    const sql2 = `
      SELECT
          id,
          title,
          status,
          due_date,
          DATEDIFF(due_date, CURDATE()) AS days_remaining
      FROM tasks
      WHERE assigned_to = ? AND due_date IS NOT NULL
        AND status IN ('todo', 'doing')
      ORDER BY due_date ASC
      LIMIT 1;
    `;

    db.query(sql1, [userId], (err, pastDueResult) => {
      if (err) return reject(err);

      db.query(sql2, [userId], (err, urgentTaskResult) => {
        if (err) return reject(err);

        resolve({
          completedPastDue: pastDueResult[0].completed_past_due,
          urgentTask: urgentTaskResult.length > 0
            ? urgentTaskResult[0]
            : null
        });
      });
    });
  });
};
module.exports = { createTask, updateTask, getTaskByWorkspaceId, getAllTaskByUserId, bestMember, getPastDueCount};

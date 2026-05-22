const db = require("../config/db");
const createNotification = require("../utils/createNotification");
const addNotificationReceivers = require("../utils/addNotificationReceivers");

const updateTask = ( id, taskId, workspaceId, message, progress ) =>{
  return new Promise((resolve, reject)=>{
    const sql = `
    INSERT INTO task_updates 
    (user_id, task_id, workspace_id, progress, message, hours_spent) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const getLastSql = `
  SELECT created_at 
  FROM task_updates 
  WHERE task_id = ? 
  ORDER BY created_at DESC 
  LIMIT 1
`;
db.query(getLastSql, [taskId], (err, results) => {
  if(err){
    return reject(err);
  }
  let hoursSpent = 0;

  if (results.length > 0) {
      const lastTime = new Date(results[0].created_at);
      const now = new Date();

      hoursSpent = (now - lastTime) / (1000 * 60 * 60);
    }
    db.query(sql, [id, taskId, workspaceId, Number(progress), message, hoursSpent],async (err,results)=>{
      if(err){
        return reject(err);
      }
      try {
          const notifId = await createNotification(db, {
            actor_id: id,
            task_id: taskId,
            workspace_id: workspaceId,
            type: "task_update",
            message: "made progress on a task"
          });

          await addNotificationReceivers(
            db,
            notifId,
            workspaceId,
            id
          );

          resolve({
  message: "Successfully inserted update",
  update: {
    id: results.insertId,
    taskId,
    workspaceId,
    userId: id,
    progress: Number(progress),
    message,
    hours_spent: hoursSpent,
    created_at: new Date()
  }
});
        } catch (err) {

          resolve({
            message: "Task update created but failed to create notification",
            update: {
    id: results.insertId,
    taskId,
    workspaceId,
    userId: id,
    progress: Number(progress),
    message,
    hours_spent: hoursSpent,
    created_at: new Date()
  }
          });
        }
      
    })
})
  })
}

const getTaskUpdates = (workspaceId, taskId) => {
  return new Promise((resolve, reject)=>{
    const sql = "SELECT id, progress, message, created_at, hours_spent from task_updates WHERE workspace_id =? AND task_id =? ORDER BY created_at DESC";
    db.query(sql, [workspaceId, taskId], (err, results)=>{
      if(err){
        return reject(err)
      }
      return resolve(results)
    })
  })
}
module.exports = {updateTask, getTaskUpdates} 

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./middleware/authMiddleware");
const roleMiddleware = require("./middleware/roleMiddleware")
const db = require("./config/db");
const app = express();
const createNotification = require("./utils/createNotification")
const addNotificationReceivers = require('./utils/addNotificationReceivers')

app.use(cors());
app.use(express.json());

// db
const bcrypt = require("bcrypt");

const assignedMiddleware = require("./middleware/assignedMiddleware");
const errorMiddleware = require("./middleware/errorMiddleware");


console.log("DB_HOST =", process.env.DB_HOST);


// TEST ROUTE
app.get("/", (req, res) => {
  res.send("API is running");
});


// LOGIN and REGISTER ROUTE
const loginRoute = require('./routes/loginRoute');
app.use("/api/auth", loginRoute);

// PROTECTED ROUTE
app.get("/api/auth/me", authMiddleware, (req, res) => {
  const userId = req.user.id;
  const sql = "SELECT * FROM users WHERE id =?"
  db.query(sql, [userId],(err, results)=>{
    if(err){
      return res.status(500).json({message: "error from auth/me"})
    }
    if(results.length === 0){
      return res.status(201).json({message: "user not found"})
    }
    const user = results[0];
    return res.json({user: {
    id: user.id,
    name: user.name,
    email: user.email,
  }, message: 'Welcome'})
  })
});


// START SERVER
const PORT = 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

//create workspace edit workspace delete workspace
const workspaceRoute = require("./routes/workspaceRoute");
app.use("/api/workspaces", workspaceRoute);

// search user by name
app.get("/api/auth/search", authMiddleware, (req, res)=>{
  const {name} = req.query;
  const sql = "SELECT id, name, email FROM users WHERE name LIKE ?";
  db.query(sql, [`%${name}%`], (err, results)=>{
    if(err){
      return res.status(500).json({message: "Server error"});
    }
    if(results.length === 0){
      return res.json({message: "No users found"});
    }
    return res.json({users: results, message: "Users found"});
  })
})
//member route
const workspaceMemberRoute = require("./routes/workspaceMemberRoute");
app.use("/api/member", workspaceMemberRoute);


// CREATE TASK
const taskRoute = require("./routes/taskRoute");
app.use("/api/tasks", taskRoute);




// mark as doing
app.post("/api/auth/status-doing/:id", authMiddleware, assignedMiddleware, (req, res) => {
  const { id, status, workspaceId, taskId } = req.body;

  if (!taskId || !workspaceId || !id) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  

  const updateTaskSql = "UPDATE tasks SET status=? WHERE id=?";
  const insertUpdateSql = `
    INSERT INTO task_updates 
    (task_id, workspace_id, user_id, status, message, progress) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ message: "Transaction error" });

    db.query(updateTaskSql, [status || "doing", taskId], (err) => {
      if (err) {
        return db.rollback(() =>
          res.status(500).json({ message: "Failed to update task" })
        );
      }

      db.query(
        insertUpdateSql,
        [taskId, workspaceId, id, status || "doing", "Started Doing", 0],
        (err) => {
          if (err) {
            return db.rollback(() =>
              res.status(500).json({ message: "Failed to insert update" })
            );
          }

          db.commit((err) => {
            if (err) {
              return db.rollback(() =>
                res.status(500).json({ message: "Commit failed" })
              );
            }

            return res.json({ message: "Successfully marked as doing" });
          });
        }
      );
    });
  });
});
// task update table
const taskUpdateRoute = require("./routes/taskUpdateRoute");
app.use("/api/task-update", taskUpdateRoute);

//mark task as done
app.post("/api/auth/mark-done/:id", authMiddleware, roleMiddleware, (req, res) => {
  const userId = req.user.id;
  const { workspaceId, taskId, status } = req.body;

  const progress = 100;
  const doneMessage = "Marked as done";

  const updateTaskSql = "UPDATE tasks SET status=? WHERE id=?";
  const getLastSql = `
    SELECT created_at 
    FROM task_updates 
    WHERE task_id = ? 
    ORDER BY created_at DESC 
    LIMIT 1
  `;
  const insertSql = `
    INSERT INTO task_updates 
    (workspace_id, user_id, task_id, message, status, progress, hours_spent) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  // 1. update task
  db.query(updateTaskSql, [status, taskId], (err) => {
    if (err) return res.status(500).json({ message: "server error" });

    // 2. get last update
    db.query(getLastSql, [taskId], (err2, results) => {
      if (err2) return res.status(500).json({ message: "server error" });

      let hoursSpent = 0;

      if (results.length > 0) {
        const lastTime = new Date(results[0].created_at);
        const now = new Date();
        hoursSpent = (now - lastTime) / (1000 * 60 * 60);
      }

      // 3. insert update
      db.query(
        insertSql,
        [workspaceId, userId, taskId, doneMessage, status, progress, hoursSpent],
        async (err3, result3) => { // ✅ make async
          if (err3) return res.status(500).json({ message: "server error" });

          try {
            // 🔔 notification
            const notifId = await createNotification(db, {
              actor_id: userId,
              task_id: taskId,
              workspace_id: workspaceId,
              type: "task_done",
              message: "is done with the task"
            });

            await addNotificationReceivers(db, notifId, workspaceId, userId);

            return res.status(201).json({
              message: "Marked as done",
              update: {
                id: result3.insertId,
                workspace_id: workspaceId,
                user_id: userId,
                task_id: taskId,
                message: doneMessage,
                status,
                progress,
                hours_spent: hoursSpent,
                created_at: new Date()
              }
            });

          } catch (notifErr) {
            console.error("Notification error:", notifErr);

            return res.status(201).json({
              message: "Marked as done (notification failed)",
              update: {
                id: result3.insertId,
                workspace_id: workspaceId,
                user_id: userId,
                task_id: taskId,
                message: doneMessage,
                status,
                progress,
                hours_spent: hoursSpent,
                created_at: new Date()
              }
            });
          }
        }
      );
    });
  });
});

// getnotif
app.get("/api/auth/get-notification", authMiddleware, (req,res)=>{
  const userId = req.user.id;
  const sql = "SELECT n.id, n.type, n.message, n.created_at, nu.is_read, u.name AS actor_name, t.title AS task_title FROM notifications n JOIN notification_users nu on n.id = nu.notification_id JOIN users u on n.actor_id = u.id LEFT JOIN tasks t on n.task_id = t.id WHERE nu.user_id =? ORDER BY n.created_at DESC";

  db.query(sql, [userId], (err, results)=>{
    if(err){
      return res.status(500).json({message: "server error"})
    }
    if(results.length === 0){
      return res.json({results: []})
    }
    return res.json({results})
  })
})

//mark as read notif
app.post("/api/auth/read-notif", authMiddleware, (req,res)=>{
  const userId= req.user.id;
  const sql = "UPDATE notification_users set is_read = 1 where user_id =?"

  db.query(sql, [userId], (err, results)=>{
    if(err){return res.status(500).json({message: "server error readnotif"})}
    if(results.affectedRows===0){
      return res.json({message: 'All notif is marked as read', success: false})
    }
    return res.json({message: 'All notif is marked as read', success: true})
  })
})

// recent activity
app.get("/api/auth/get-recent-activity", authMiddleware, (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT 
  tu.id,
  tu.progress,
  tu.message,
  tu.created_at,
  tu.hours_spent,
  t.title AS task_title,
  w.workspace_name
FROM task_updates tu
JOIN tasks t ON tu.task_id = t.id
JOIN workspaces w ON tu.workspace_id = w.id
WHERE tu.user_id = ?
ORDER BY tu.created_at DESC
LIMIT 5`;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "server error" });
    }

    return res.json({ results });
  });
});
app.use(errorMiddleware);
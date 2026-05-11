const db = require("../config/db");

module.exports = (req, res, next) => {
  const userId = req.user.id;
  const { id, taskId, workspaceId } = req.body;

  const sql = "SELECT assigned_to FROM tasks WHERE id =?";

  db.query(sql, [taskId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    const assignedTo = results[0].assigned_to;

    if (assignedTo !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    next();
  });
};
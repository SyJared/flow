const db = require("../config/db");

module.exports = (req, res, next) => {
  const workspaceId = req.params.workspaceId || req.params.id;
  if (!workspaceId) return res.status(400).json({ success: false, message: "Workspace is required" });

  db.query("SELECT 1 FROM workspace_members WHERE user_id = ? AND workspace_id = ? LIMIT 1", [req.user.id, workspaceId], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: "Could not verify workspace access" });
    if (!rows.length) return res.status(403).json({ success: false, message: "Workspace access denied" });
    next();
  });
};

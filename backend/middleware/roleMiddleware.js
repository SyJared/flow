const db = require("../config/db");

module.exports = (req, res, next) => {
  const userId = req.user.id
  const workspaceId = req.params.id;

  const sql = "SELECT role FROM workspace_members WHERE user_id = ? AND workspace_id =?"

  db.query(sql, [userId, workspaceId], (err, results)=>{
    if(err){
      return res.status(500).json({message: "Server error from rolemiddleware"})
    }
    if(results.length === 0){
      return res.status(403).json({message: "You are not a member of this workplace"})
    }
    const role = results[0].role

    if(role !== 'owner' && role !== 'admin'){
      return res.status(403).json({message: "Not allowed"})
    }
    next();
  })
}
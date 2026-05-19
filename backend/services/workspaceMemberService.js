const db = require("../config/db")

const getWorkspaceMembers = async (workspaceId) => {
  return new Promise((resolve, reject)=>{
    const sql = "SELECT u.id, u.name, u.email, wm.role FROM users u JOIN workspace_members wm on u.id = wm.user_id WHERE wm.workspace_id = ?";
    db.query(sql, [workspaceId], (err, results)=>{
      if(err){return reject(err)}
      if(results.length === 0){
        return reject(new Error("No members found for this workspace"))
      }
      resolve({members: results})
    })
  }
)}

module.exports = {getWorkspaceMembers}
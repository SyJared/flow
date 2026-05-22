const db = require("../config/db")

const createWorkspace = async (userId, name) => {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO workspaces (owner_id, workspace_name) VALUES (?,?)"
    db.query(sql, [userId, name], (err,results)=>{
      if (err){
        return reject(err)
      }
      const workspaceId = results.insertId;
      const sql2 = "INSERT INTO workspace_members (workspace_id, user_id, role) VALUES (?,?,?)"
      db.query(sql2, [workspaceId, userId, 'owner'], (err2, results2)=>{
        if (err2){
          return reject(err2)
        }
        resolve({
          workspaceId,
          name
        })
      })
    })
  }
)}

const editWorkspace = async (id, name)=>{
  return new Promise ((resolve,reject)=>{
    const sql ="UPDATE workspaces SET workspace_name=? WHERE id=?"
    db.query(sql, [name, id], (err,results)=>{
      if(err){return reject(err)}
      resolve({ id, workspace_name: name })
    })
  })
}

const deleteWorkspace = async (id)=>{
  return new Promise ((resolve, reject)=>{
    const sql = "DELETE FROM workspaces WHERE id =?"
    db.query(sql, [id], (err,results)=>{
      if(err){return reject(err)}
      resolve({message: "workspace deleted successfully"})
    })
  })
}

const getWorkspaceById = async (id, userId)=>{
  return new Promise((resolve, reject)=>{
    const sql = "SELECT * FROM workspaces w JOIN workspace_members wm ON w.id = wm.workspace_id JOIN users u ON wm.user_id = u.id WHERE w.id = ? AND wm.user_id = ?";
    db.query(sql,[id, userId],(err,results)=>{
      if(!id){return reject(new Error("Invalid workspace ID"))}
      if(!userId){return reject(new Error("User ID is required"))}
      if(err){return reject(err)}
      if(results.length === 0){
        return reject(new Error("Workspace not found or access denied"))
      }
      resolve({workspace: results[0]})
    })
  })
}

const getAllworkspaceForUser = async (userId)=>{
  return new Promise((resolve,reject)=>{
     const sql = "SELECT w.id, w.workspace_name, w.created_at, wm.role FROM workspaces w JOIN workspace_members wm ON w.id = wm.workspace_id WHERE wm.user_id = ?";
  db.query(sql, [userId], (err, results)=>{
    if(err){return reject(err)}
    resolve({workspaces: results})
  })
  })
}

module.exports = {createWorkspace, editWorkspace, deleteWorkspace, getWorkspaceById, getAllworkspaceForUser};
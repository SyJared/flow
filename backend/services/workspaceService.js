const db = require("../config/db")

const createWorkspace = async (userId, name) => {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO workspaces (owner_id, workspace_name) VALUES (?,?)"
    db.query(sql, [userId, name], (err,results)=>{
      if (err){
        return reject(err)
      }
      const workspaceId = results.insertId;
      const sql2 = "INSERT INTO workspace_members (workspace_id, user_id) VALUES (?,?)"
      db.query(sql2, [workspaceId, userId], (err2, results2)=>{
        if (err2){
          return reject(err2)
        }
        resolve({
          id: workspaceId,
          workspace_name: name
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

module.exports = {createWorkspace, editWorkspace};
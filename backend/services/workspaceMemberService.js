const db = require("../config/db")
const AppError = require("../utils/appError");

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

const editWorkspaceMemberRole = async (
  workspaceId,
  role,
  memberId
) => {
  return new Promise((resolve, reject) => {

    const checkSql =
      "SELECT role FROM workspace_members WHERE user_id = ? AND workspace_id = ?";

    db.query(
      checkSql,
      [memberId, workspaceId],
      (err, results) => {

        if (err) {
          return reject(err);
        }

        if (results.length === 0) {
          return reject(
            new AppError("Member not found", 404)
          );
        }

        if (results[0].role === "owner") {
          return reject(
            new AppError(
              "Owner role cannot be changed",
              403
            )
          );
        }

        const updateSql =
          "UPDATE workspace_members SET role = ? WHERE user_id = ? AND workspace_id = ?";

        db.query(
          updateSql,
          [role, memberId, workspaceId],
          (err) => {

            if (err) {
              return reject(err);
            }

            resolve({
              message:
                "Member role updated successfully"
            });
          }
        );
      }
    );
  });
};

const addWorkspaceMember = async (workspaceId, userId, role) => {
  return new Promise((resolve, reject)=>{
    const sql = "INSERT INTO workspace_members (workspace_id, user_id, role) VALUES (?, ?, ?)";
  const checkSql = "SELECT * FROM workspace_members WHERE workspace_id = ? AND user_id = ?";
  db.query(checkSql, [workspaceId, userId], (err, results)=>{
    if(err){return reject(err)}
    if(results.length > 0){
      return reject(new AppError("User is already a member of this workspace", 400))
    }
    db.query(sql, [workspaceId, userId, role], (err, result)=>{
      if(err){return reject(err)}
      resolve({message: "Member assigned successfully", data: result})
    })
  })
  })
}
module.exports = {getWorkspaceMembers, editWorkspaceMemberRole, addWorkspaceMember}
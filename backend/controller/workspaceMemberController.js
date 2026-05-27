const workspaceMemberService = require("../services/workspaceMemberService");

const getWorkspaceMembers = async(req, res)=>{
  try {
    const {id}= req.params;
    const members = await workspaceMemberService.getWorkspaceMembers(id);

    return res.status(200).json({
      success: true,
      members: members.members,
      message: "Members retrieved successfully"
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving workspace members"
    })
  }
}

const editWorkspaceMemberRole = async(req, res, next)=>{
  try {
    const workspaceId = req.params.id;
    const {role, memberId} = req.body;

    const result = await workspaceMemberService.editWorkspaceMemberRole(workspaceId, role, memberId);

    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (err) {
    next(err);
  }
}

const addWorkspaceMember = async(req, res, next)=>{
  try {
    const {workspaceId, userId, role} = req.body;
    
    const result = await workspaceMemberService.addWorkspaceMember(workspaceId, userId, role);
    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {getWorkspaceMembers, editWorkspaceMemberRole, addWorkspaceMember}
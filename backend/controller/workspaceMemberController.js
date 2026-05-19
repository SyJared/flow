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

module.exports = {getWorkspaceMembers}
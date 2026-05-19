const { get } = require("../routes/loginRoute");
const workspaceService = require("../services/workspaceService");

const createWorkspace = async(req, res)=>{
  try {
    const userId = req.user.id;
    const {name} = req.body;
    const workspace = await workspaceService.createWorkspace(userId, name);

    return res.status(200).json({
      success: true,
      data: {id: workspace.workspaceId, workspace_name: workspace.name, role: "owner", created_at: new Date()},
      message: "workspace created successfully"
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to create workspace",
      error: err.message
    })
  }
}

const editWorkspace = async(req, res)=>{
  try {
    const {id} = req.params;
    const {name} = req.body;
    const workspace = await workspaceService.editWorkspace(id, name);

    return res.status(200).json({
      success: true,
      data: workspace,
      message: "workspace edited successfully"
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to edit workspace",
      error: err.message
    })
  }
}

const deleteWorkspace = async(req, res)=>{
  try {
    const {id} = req.params;
    const result = await workspaceService.deleteWorkspace(id);

    return res.status(200).json({
      success: true,
      message: result.message
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete workspace",
      error: err.message
    })
  }
}

const getWorkspaceById = async(req, res)=>{
  try {
    const userId = req.user.id;
    const {id} = req.params;
    const workspace = await workspaceService.getWorkspaceById(id, userId);

    return res.status(200).json({
      success: true,
      workspace: workspace.workspace,
      message: "workspace retrieved successfully"
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve workspace",
      error: err.message
    })
  }
}
  module.exports={createWorkspace, editWorkspace, deleteWorkspace, getWorkspaceById};
const workspaceService = require("../services/workspaceService");

const createWorkspace = async(req, res, next)=>{
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
   next(err);
  }
}

const editWorkspace = async(req, res, next)=>{
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
    next(err);
  }
}

const deleteWorkspace = async(req, res, next)=>{
  try {
    const {id} = req.params;
    const result = await workspaceService.deleteWorkspace(id);

    return res.status(200).json({
      success: true,
      message: result.message
    })
  } catch (err) {
    next(err);
  }
}

const getWorkspaceById = async(req, res, next)=>{
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
    next(err);
  }
}

const getAllWorkspacesForUser = async(req, res, next)=>{
  try {
    const userId = req.user.id;
    const workspaces = await workspaceService.getAllworkspaceForUser(userId);

    return res.status(200).json({
      success: true,
      workspaces: workspaces.workspaces,
      message: "workspaces retrieved successfully"
    })
  } catch (err) {
    next(err);
  }
}
module.exports={createWorkspace, editWorkspace, deleteWorkspace, getWorkspaceById, getAllWorkspacesForUser};
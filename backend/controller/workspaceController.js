const workspaceService = require("../services/workspaceService");

const createWorkspace = async(req, res)=>{
  try {
    const userId = req.user.id;
    const {name} = req.body;
    const workspace = await workspaceService.createWorkspace(userId, name);

    return res.status(201).json({
      success: true,
      data: workspace,
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
  module.exports={createWorkspace, editWorkspace};
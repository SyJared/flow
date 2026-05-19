const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {createWorkspace, editWorkspace, deleteWorkspace, getWorkspaceById} = require("../controller/workspaceController");

router.post("/create-workspace", authMiddleware, createWorkspace);
router.put("/edit-workspace/:id", authMiddleware, roleMiddleware, editWorkspace);
router.delete("/delete-workspace/:id", authMiddleware, roleMiddleware, deleteWorkspace);
router.get("/get-workspace/:id", authMiddleware, getWorkspaceById);

module.exports = router;
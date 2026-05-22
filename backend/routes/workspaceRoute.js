const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {createWorkspace, editWorkspace, deleteWorkspace, getWorkspaceById, getAllWorkspacesForUser} = require("../controller/workspaceController");
const validate = require("../middleware/validationMiddleware");
const { createWorkspaceSchema } = require("../validations/workspaceSchema");


router.post("/create-workspace", authMiddleware, validate(createWorkspaceSchema), createWorkspace);
router.put("/edit-workspace/:id", authMiddleware, roleMiddleware, editWorkspace);
router.delete("/delete-workspace/:id", authMiddleware, roleMiddleware, deleteWorkspace);
router.get("/get-workspace/:id", authMiddleware, getWorkspaceById);
router.get("/all-workspace", authMiddleware, getAllWorkspacesForUser);
module.exports = router;
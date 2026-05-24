const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {getWorkspaceMembers, editWorkspaceMemberRole, addWorkspaceMember} = require("../controller/workspaceMemberController");
const validate = require("../middleware/validationMiddleware");
const {workspaceMemberSchema} = require("../validations/workspaceMemberSchema");

router.put("/edit-role/:id", authMiddleware, roleMiddleware, validate(workspaceMemberSchema), editWorkspaceMemberRole);

router.get("/get-members/:id", authMiddleware, getWorkspaceMembers);

router.post("/add-member/:id", authMiddleware, roleMiddleware, addWorkspaceMember);

module.exports = router;
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {getWorkspaceMembers} = require("../controller/workspaceMemberController");

router.get("/get-members/:id", authMiddleware, getWorkspaceMembers);

module.exports = router;
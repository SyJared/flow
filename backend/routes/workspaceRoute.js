const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {createWorkspace, editWorkspace} = require("../controller/workspaceController");

router.post("/create-workspace", authMiddleware, createWorkspace);
router.put("/edit-workspace/:id", authMiddleware, roleMiddleware, editWorkspace);

module.exports = router;
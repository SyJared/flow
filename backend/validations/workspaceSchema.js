const {z} = require('zod');

const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required")
})

module.exports = { createWorkspaceSchema }
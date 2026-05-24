const {z} = require("zod");

const workspaceMemberSchema = z.object({
  role: z.enum([ "admin", "member"], {message: "Role must be one of 'owner', 'admin', or 'member'"}),
});

const addMemberSchema = z.object({
  userId: z.number({required_error: "User ID is required"}),
  role: z.enum(["admin", "member"], {message: "Role must be one of 'admin' or 'member'"}),
})

module.exports = { workspaceMemberSchema, addMemberSchema }
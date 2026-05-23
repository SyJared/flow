const {z} = require("zod");

const workspaceMemberSchema = z.object({
  role: z.enum([ "admin", "member"], {message: "Role must be one of 'owner', 'admin', or 'member'"}),
});

module.exports = { workspaceMemberSchema }
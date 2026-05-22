const {z} = require('zod');

const taskUpdateSchema = z.object({
  id: z.coerce.number(),
  taskId: z.coerce.number(),
  workspaceId: z.coerce.number(), 
   progress: z.coerce.number().refine(num => num > 0, "progress must be greater than 0").refine(num => num <= 100, "progress must be less than or equal to 100"),
  message: z.string().min(5, "Message must be at least 5 characters long").max(200, "Message must be at most 200 characters long")
})

module.exports = { taskUpdateSchema }
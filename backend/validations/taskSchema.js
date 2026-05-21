const {z} = require('zod');

const taskSchema = z.object({
  workspaceId: z.coerce.number(),
  title: z.string().min(5, "Title must be at least 5 characters long").max(50, "Title must be at most 50 characters long"),
  description: z.string().min(10, "Description must be at least 10 characters long").max(100, "Description must be at most 100 characters long"),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().refine(date => {
    const parsedDate = Date.parse(date);
    return !isNaN(parsedDate) && parsedDate > Date.now();
  }, "Due date must be a valid future date"),
  assignedTo: z.coerce.number()
});


module.exports = { taskSchema }
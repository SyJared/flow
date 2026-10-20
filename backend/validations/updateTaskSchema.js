const { z } = require("zod");

const updateTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255, "Title must be at most 255 characters"),
  description: z.string().max(5000, "Description must be at most 5000 characters").nullable().optional(),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z.union([z.string().refine(value => !value || !Number.isNaN(Date.parse(value)), "Due date must be a valid date"), z.null()]).optional(),
  assignedTo: z.coerce.number().int().positive(),
});

module.exports = { updateTaskSchema };

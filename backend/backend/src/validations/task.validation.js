import { z } from "zod";

/*
|--------------------------------------------------------------------------
| BUG-15 FIX: updateTaskStatusSchema included "REVIEW" in the status enum.
| "REVIEW" is NOT in the Task model ENUM (TODO,IN_PROGRESS,COMPLETED,
| APPROVED,REJECTED). Passing status="REVIEW" would clear Zod but fail
| at the DB layer with a Sequelize constraint error.
| Fix: removed "REVIEW" from the Zod enum.
|--------------------------------------------------------------------------
*/

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  assignedTo: z.number().int().positive().optional(),
  reviewerId: z.number().int().positive().optional(),
  dueDate: z.string().optional(),
});

export const assignTaskSchema = z.object({
  assignedTo: z.number().int().positive(),
});

// BUG-15 fix: "REVIEW" removed — not a valid Task model status
export const updateTaskStatusSchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED", "APPROVED", "REJECTED"]),
  reviewReason: z.string().trim().optional(),
});

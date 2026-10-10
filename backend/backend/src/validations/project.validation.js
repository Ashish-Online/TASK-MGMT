import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required").max(150),
  key: z.string().trim().max(20).optional(),
  description: z.string().trim().optional(),
  status: z.enum(["PLANNED", "ACTIVE", "COMPLETED", "ON_HOLD", "CANCELLED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(1).max(150).optional(),
  key: z.string().trim().max(20).optional(),
  description: z.string().trim().optional(),
  status: z.enum(["PLANNED", "ACTIVE", "COMPLETED", "ON_HOLD", "CANCELLED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

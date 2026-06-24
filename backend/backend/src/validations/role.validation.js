import { z } from 'zod';

// create role validation
export const createRoleSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(100),

  description: z
    .string()
    .max(255)
    .optional()
});


// update role validation
export const updateRoleSchema = z.object({

  name: z
    .string()
    .min(2)
    .max(100)
    .optional(),

  description: z
    .string()
    .max(255)
    .optional()

}).refine(
  data =>
    Object.keys(data).length > 0,
  {
    message:
      'At least one field is required'
  }
);


// assignPermission Validation
export const assignPermissionsSchema = z.object({
  permissionIds: z
    .array(z.number().int().positive())
    .min(1)
});


import { z } from 'zod';

export const registerOrganizationSchema = z.object({
  organizationName: z
    .string()
    .min(3)
    .max(150),

  adminName: z
    .string()
    .min(3)
    .max(100),

  email: z
    .email(),

  password: z
    .string()
    .min(8)
    .max(50)
});



export const loginSchema = z.object({

  email: z.email(),

  password: z
    .string()
    .min(6)

});
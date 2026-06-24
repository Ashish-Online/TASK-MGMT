import { z } from "zod";

// create user validation
export const createUserSchema = z.object({
  firstName: z.string().trim().min(2).max(100),

  lastName: z.string().trim().max(100).optional(),

  email: z.email(),

  password: z.string().min(8).max(50),

  roleId: z.number().int().positive(),
});

// get user validation
export const getUsersSchema = z.object({
  page: z.coerce.number().min(1).default(1),

  limit: z.coerce.number().min(1).max(100).default(10),

  search: z.string().optional(),

  roleId: z.coerce.number().optional(),

  isActive: z.enum(["true", "false"]).optional(),
});

// update user validation
export const updateUserSchema = z.object({
    firstName: z.string().trim().min(2).max(100).optional(),

    lastName: z.string().trim().max(100).optional(),

    email: z.email().optional(),
})
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
});


// update user role validation
export const changeUserRoleSchema = z.object({

    roleId: z
      .number()
      .int()
      .positive()

}); 

// // update status
// export const updateUserStatusSchema =
//   z.object({

//     isActive:
//       z.boolean()

//   });

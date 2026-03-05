import { z } from "zod";

const createAdminProfileSchema = z.object({
  body: z.object({
    userId: z.string({ message: "User ID is required" }),
    address: z
      .string()
      .trim()
      .max(255, "Address must not exceed 255 characters")
      .optional(),
  }),
});

const updateAdminProfileSchema = z.object({
  body: z
    .object({
      address: z
        .string()
        .trim()
        .max(255, "Address must not exceed 255 characters")
        .optional(),
    })
    .refine(
      (data) => Object.keys(data).length > 0,
      "At least one field must be provided for update",
    ),
});

export const AdminProfileValidation = {
  createAdminProfileSchema,
  updateAdminProfileSchema,
};

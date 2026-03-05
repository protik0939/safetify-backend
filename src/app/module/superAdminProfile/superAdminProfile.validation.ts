import { z } from "zod";

const createSuperAdminProfileSchema = z.object({
  body: z.object({
    userId: z.string({ message: "User ID is required" }),
  }),
});

const updateSuperAdminProfileSchema = z.object({
  body: z.object({}).refine(
    (data) => Object.keys(data).length > 0,
    "No updatable fields available",
  ),
});

export const SuperAdminProfileValidation = {
  createSuperAdminProfileSchema,
  updateSuperAdminProfileSchema,
};

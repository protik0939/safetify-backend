import { z } from "zod";
import { BloodGroup } from "@prisma/client";

const bloodGroupSchema = z.nativeEnum(BloodGroup, {
  message: "Invalid blood group",
});

const createUserProfileSchema = z.object({
  body: z.object({
    userId: z.string({ message: "User ID is required" }),
    bio: z
      .string()
      .trim()
      .max(500, "Bio must not exceed 500 characters")
      .optional(),
    address: z
      .string()
      .trim()
      .max(255, "Address must not exceed 255 characters")
      .optional(),
    bloodGroup: bloodGroupSchema.optional(),
  }),
});

const updateUserProfileSchema = z.object({
  body: z
    .object({
      bio: z
        .string()
        .trim()
        .max(500, "Bio must not exceed 500 characters")
        .optional(),
      address: z
        .string()
        .trim()
        .max(255, "Address must not exceed 255 characters")
        .optional(),
      bloodGroup: bloodGroupSchema.optional(),
    })
    .refine(
      (data) => Object.keys(data).length > 0,
      "At least one field must be provided for update",
    ),
});

export const UserProfileValidation = {
  createUserProfileSchema,
  updateUserProfileSchema,
};

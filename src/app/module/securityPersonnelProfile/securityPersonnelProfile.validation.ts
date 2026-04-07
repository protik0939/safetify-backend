import { z } from "zod";
import { BloodGroup, PoliceRank } from "@prisma/client";

const bloodGroupSchema = z.nativeEnum(BloodGroup, {
  message: "Invalid blood group",
});

const rankSchema = z.nativeEnum(PoliceRank, {
  message: "Invalid police rank",
});

const createSecurityPersonnelProfileSchema = z.object({
  body: z.object({
    userId: z.string({ message: "User ID is required" }),
    address: z
      .string()
      .trim()
      .max(255, "Address must not exceed 255 characters")
      .optional(),
    rank: rankSchema.optional(),
    bloodGroup: bloodGroupSchema.optional(),
  }),
});

const updateSecurityPersonnelProfileSchema = z.object({
  body: z
    .object({
      address: z
        .string()
        .trim()
        .max(255, "Address must not exceed 255 characters")
        .optional(),
      rank: rankSchema.optional(),
      bloodGroup: bloodGroupSchema.optional(),
    })
    .refine(
      (data) => Object.keys(data).length > 0,
      "At least one field must be provided for update",
    ),
});

export const SecurityPersonnelProfileValidation = {
  createSecurityPersonnelProfileSchema,
  updateSecurityPersonnelProfileSchema,
};

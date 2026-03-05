import { z } from "zod";

const nameSchema = z
  .string({ message: "Name is required" })
  .trim()
  .min(2, "Name must be at least 2 characters long")
  .max(100, "Name must not exceed 100 characters")
  .regex(
    /^[a-zA-Z\s'-]+$/,
    "Name must only contain letters, spaces, hyphens, or apostrophes",
  );

const relationshipSchema = z
  .string({ message: "Relationship is required" })
  .trim()
  .min(2, "Relationship must be at least 2 characters long")
  .max(50, "Relationship must not exceed 50 characters")
  .regex(
    /^[a-zA-Z\s'-]+$/,
    "Relationship must only contain letters, spaces, hyphens, or apostrophes",
  );

// Accepts Bangladeshi phone number formats:
// +8801XXXXXXXXX (14 chars), 8801XXXXXXXXX (13 chars), 01XXXXXXXXX (11 chars)
const phoneNumberSchema = z
  .string({ message: "Phone number is required" })
  .trim()
  .regex(
    /^(\+8801|8801|01)[3-9]\d{8}$/,
    "Phone number must be a valid Bangladeshi number (e.g. +8801XXXXXXXXX, 8801XXXXXXXXX, or 01XXXXXXXXX)",
  );

const createEmergencyContactSchema = z.object({
  body: z.object({
    userId: z
      .string({ message: "User ID is required" }),
    name: nameSchema,
    relationship: relationshipSchema,
    phoneNumber: phoneNumberSchema,
  }),
});

const updateEmergencyContactSchema = z.object({
  body: z
    .object({
      name: nameSchema.optional(),
      relationship: relationshipSchema.optional(),
      phoneNumber: phoneNumberSchema.optional(),
    })
    .refine(
      (data) => Object.keys(data).length > 0,
      "At least one field must be provided for update",
    ),
});

export const EmergencyContactValidation = {
  createEmergencyContactSchema,
  updateEmergencyContactSchema,
};

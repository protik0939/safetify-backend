import { z } from "zod";
import { BloodGroup } from "@prisma/client";

const bloodGroupSchema = z.nativeEnum(BloodGroup, {
  message: "Invalid blood group",
});

const createUserProfileSchema = z.object({
  body: z.object({
    userId: z.string({ message: "User ID is required" }),
    name: z.string().trim().optional(),
    image: z.string().trim().nullable().optional().or(z.literal("")),
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
    contactNo: z
      .string()
      .trim()
      .regex(
        /^(?:\+8801|01)[3-9]\d{8}$/,
        "Invalid contact number, must be a valid Bangladeshi number starting with +8801 or 01 followed by 3-9 and 8 digits"
      )
      .optional(),
    location: z
      .string()
      .trim()
      .max(255, "Location must not exceed 255 characters")
      .optional(),
    bloodGroup: bloodGroupSchema.optional(),
    gender: z
      .string()
      .trim()
      .transform((val) => val.charAt(0).toUpperCase() + val.slice(1).toLowerCase())
      .refine(
        (val) => ["Male", "Female", "Others"].includes(val),
        { message: "Gender must be Male, Female, or Others" }
      )
      .optional(),
    privacy: z.string().trim().optional(),
    riskScore: z.number().int().min(0).max(100).optional(),
  }),
});

const updateUserProfileSchema = z.object({
  body: z
    .object({
      name: z.string().trim().optional(),
      image: z.string().trim().nullable().optional().or(z.literal("")),
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
      contactNo: z
        .string()
        .trim()
        .regex(
          /^(?:\+8801|01)[3-9]\d{8}$/,
          "Invalid contact number, must be a valid Bangladeshi number starting with +8801 or 01 followed by 3-9 and 8 digits"
        )
        .optional(),
      location: z
        .string()
        .trim()
        .max(255, "Location must not exceed 255 characters")
        .optional(),
      gender: z
        .string()
        .trim()
        .transform((val) => val.charAt(0).toUpperCase() + val.slice(1).toLowerCase())
        .refine(
          (val) => ["Male", "Female", "Others"].includes(val),
          { message: "Gender must be Male, Female, or Others" }
        )
        .optional(),
      privacy: z.string().trim().optional(),
      riskScore: z.number().int().min(0).max(100).optional(),
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

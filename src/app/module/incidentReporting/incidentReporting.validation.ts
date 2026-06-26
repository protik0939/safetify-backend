import { z } from "zod";

const createIncidentSchema = z.object({
  body: z.object({
    userId: z.string({ message: "User ID is required" }),
    title: z
      .string()
      .trim()
      .max(200, "Title must not exceed 200 characters")
      .optional(),
    description: z
      .string()
      .trim()
      .max(2000, "Description must not exceed 2000 characters")
      .optional(),
    latitude: z
      .number({ message: "Latitude is required" })
      .min(-90, "Latitude must be between -90 and 90")
      .max(90, "Latitude must be between -90 and 90"),
    longitude: z
      .number({ message: "Longitude is required" })
      .min(-180, "Longitude must be between -180 and 180")
      .max(180, "Longitude must be between -180 and 180"),
    severityLevel: z
      .string()
      .trim()
      .optional(),
    timing: z
      .string({ message: "Timing is required" })
      .trim()
      .min(1, "Timing must not be empty"),
    victim: z.string().trim().optional(),
    attackers: z.string().trim().optional(),
    deathToll: z.number().int().min(0).optional(),
    injuryCount: z.number().int().min(0).optional(),
    peopleHelped: z.number().int().min(0).optional(),
    stories: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
  }),
});

const updateIncidentSchema = z.object({
  body: z
    .object({
      title: z
        .string()
        .trim()
        .min(1, "Title must not be empty")
        .max(200, "Title must not exceed 200 characters")
        .optional(),
      description: z
        .string()
        .trim()
        .max(2000, "Description must not exceed 2000 characters")
        .optional(),
      latitude: z
        .number()
        .min(-90, "Latitude must be between -90 and 90")
        .max(90, "Latitude must be between -90 and 90")
        .optional(),
      longitude: z
        .number()
        .min(-180, "Longitude must be between -180 and 180")
        .max(180, "Longitude must be between -180 and 180")
        .optional(),
      severityLevel: z.string().trim().optional(),
      timing: z.string().trim().optional(),
      status: z.string().trim().optional(),
      victim: z.string().trim().optional(),
      attackers: z.string().trim().optional(),
      deathToll: z.number().int().min(0).optional(),
      injuryCount: z.number().int().min(0).optional(),
      peopleHelped: z.number().int().min(0).optional(),
      stories: z.array(z.string()).optional(),
      images: z.array(z.string()).optional(),
    })
    .refine(
      (data) => Object.keys(data).length > 0,
      "At least one field must be provided for update",
    ),
});

export const IncidentReportingValidation = {
  createIncidentSchema,
  updateIncidentSchema,
};

import { z } from "zod";

const predictPointSchema = z.object({
  body: z.object({
    latitude: z.number({ message: "Latitude must be a number" }),
    longitude: z.number({ message: "Longitude must be a number" }),
    weekday: z.string({ message: "Weekday is required" }).trim(),
    part_of_day: z.string({ message: "Part of day is required" }).trim(),
    radius: z.number().int().positive().optional().default(300),
  }),
});

const predictRouteSchema = z.object({
  body: z.object({
    weekday: z.string({ message: "Weekday is required" }).trim(),
    part_of_day: z.string({ message: "Part of day is required" }).trim(),
    radius: z.number().int().positive().optional().default(300),
    route: z.array(
      z.object({
        latitude: z.number({ message: "Route point latitude must be a number" }),
        longitude: z.number({ message: "Route point longitude must be a number" }),
      }),
      { message: "Route array of coordinate points is required" }
    ),
  }),
});

const predictHotspotsSchema = z.object({
  body: z.object({
    weekday: z.string({ message: "Weekday is required" }).trim(),
    part_of_day: z.string({ message: "Part of day is required" }).trim(),
    radius: z.number().int().positive().optional().default(300),
  }),
});

export const MLValidation = {
  predictPointSchema,
  predictRouteSchema,
  predictHotspotsSchema,
};

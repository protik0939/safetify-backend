import { z } from "zod";

const updateUserStatusSchema = z.object({
  body: z.object({
    accountStatus: z.enum(["ACTIVE", "BANNED", "DEACTIVATED", "DELETIONPENDING"], {
      message: "Invalid account status",
    }),
  }),
});

const updateUserRoleSchema = z.object({
  body: z.object({
    role: z.enum(["USER", "ADMIN", "SUPERADMIN", "SECURITYPERSON"], {
      message: "Invalid role",
    }),
  }),
});

const broadcastSchema = z.object({
  body: z.object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(200, "Title must not exceed 200 characters"),
    body: z
      .string()
      .trim()
      .min(1, "Body is required")
      .max(2000, "Body must not exceed 2000 characters"),
  }),
});

const updateIncidentStatusSchema = z.object({
  body: z.object({
    status: z.enum(["PENDING", "APPROVED", "RESOLVED", "REJECTED"], {
      message: "Invalid incident status",
    }),
  }),
});

export const AdminValidation = {
  updateUserStatusSchema,
  updateUserRoleSchema,
  broadcastSchema,
  updateIncidentStatusSchema,
};

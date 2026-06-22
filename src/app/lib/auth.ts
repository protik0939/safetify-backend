import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { AccountStatus, Role } from "@prisma/client";

export const auth = betterAuth({
  basePath: "/api/v1/auth",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5000",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  trustedOrigins: [
    "safetify://",
    process.env.BETTER_AUTH_URL || "http://localhost:5000",
  ],
  session: {
    cookieCache: {
      enabled: false,
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  advanced: {
    cookiePrefix: "better-auth",
    useSecureCookies: process.env.NODE_ENV === "production" || !!process.env.BETTER_AUTH_URL?.includes("ngrok-free.dev"),
    crossSubDomainCookies: {
      enabled: false,
    },
    disableCSRFCheck: true,
    generateSessionToken: undefined,
    defaultCookieAttributes: {
      sameSite: (process.env.NODE_ENV === "production" || !!process.env.BETTER_AUTH_URL?.includes("ngrok-free.dev")) ? "none" : "lax",
      secure: process.env.NODE_ENV === "production" || !!process.env.BETTER_AUTH_URL?.includes("ngrok-free.dev"),
      httpOnly: true,
      path: "/",
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: Role.USER,
      },
      contactNo: {
        type: "string",
        required: false,
        defaultValue: null,
      },
      bio: {
        type: "string",
        required: false,
        defaultValue: "Safetify User",
      },
      address: {
        type: "string",
        required: false,
        defaultValue: null,
      },
      bloodGroup: {
        type: "string",
        required: false,
        defaultValue: null,
      },
      accountStatus: {
        type: "string",
        required: true,
        defaultValue: AccountStatus.ACTIVE,
      },
      deletedAt: {
        type: "date",
        required: false,
        defaultValue: null,
      },
      location: {
        type: "string",
        required: false,
        defaultValue: null,
      },
      gender :{
        type: "string",
        required: false,
        defaultValue: null,
      }
    },
  },
});

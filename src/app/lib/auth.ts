import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { AccountStatus, Role } from "@prisma/client";

export const auth = betterAuth({
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

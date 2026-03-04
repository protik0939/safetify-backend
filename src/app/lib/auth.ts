import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { AccountStatus, Role } from "../../generated/prisma/enums";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: Role.USER,
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
    },
  },
});

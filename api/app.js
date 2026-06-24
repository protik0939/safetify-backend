// src/app.ts
import express from "express";

// src/app/routes/index.ts
import { Router as Router9 } from "express";

// src/app/module/emergencyContact/emergencyContact.route.ts
import { Router } from "express";

// src/app/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/app/module/emergencyContact/emergencyContact.service.ts
var createEmergencyContact = async (Payload) => {
  const emergencyContact = await prisma.emergencyContact.create({
    data: Payload
  });
  return emergencyContact;
};
var getEmergencyContactByUserId = async (userId) => {
  const emergencyContacts = await prisma.emergencyContact.findMany({
    where: {
      user: {
        id: userId
      }
    }
  });
  return emergencyContacts;
};
var updateEmergecyContact = async (id, data) => {
  const emergencyContact = await prisma.emergencyContact.update({
    // TODO: Need to authenticate the user and check if the emergency contact belongs to the user before updating
    where: {
      id
    },
    data
  });
  return emergencyContact;
};
var deleteEmergencyContact = async (id) => {
  await prisma.emergencyContact.delete({
    where: {
      id
    }
  });
};
var EmergencyContactService = {
  createEmergencyContact,
  getEmergencyContactByUserId,
  updateEmergecyContact,
  deleteEmergencyContact
};

// src/app/shared/catchAsync.ts
var catchAsync = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

// src/app/shared/sendResponse.ts
var sendResponse = (res, responseData) => {
  const { httpStatusCode, success, message, data, meta } = responseData;
  res.status(httpStatusCode).json({
    success,
    message,
    data,
    meta
  });
};

// src/app/module/emergencyContact/emergencyContact.controller.ts
var createEmergencyContact2 = catchAsync(
  async (req, res) => {
    const payload = req.body;
    const result = await EmergencyContactService.createEmergencyContact(payload);
    sendResponse(res, {
      httpStatusCode: 201,
      success: true,
      message: "Emergency contact created successfully",
      data: result
    });
  }
);
var getEmergencyContactByUserId2 = catchAsync(
  async (req, res) => {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    const result = await EmergencyContactService.getEmergencyContactByUserId(userId);
    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Emergency contacts retrieved successfully",
      data: result
    });
  }
);
var updateEmergencyContact = catchAsync(
  async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const payload = req.body;
    const result = await EmergencyContactService.updateEmergecyContact(id, payload);
    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Emergency contact updated successfully",
      data: result
    });
  }
);
var deleteEmergencyContact2 = catchAsync(
  async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await EmergencyContactService.deleteEmergencyContact(id);
    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Emergency contact deleted successfully"
    });
  }
);
var EmergencyContactController = {
  createEmergencyContact: createEmergencyContact2,
  getEmergencyContactByUserId: getEmergencyContactByUserId2,
  updateEmergencyContact,
  deleteEmergencyContact: deleteEmergencyContact2
};

// src/app/middleware/validateRequest.ts
var validateRequest = (zodSchema) => {
  return (req, res, next) => {
    if (req.body?.data) {
      req.body = JSON.parse(req.body.data);
    }
    const parsedResult = zodSchema.safeParse({
      body: req.body,
      cookies: req.cookies,
      params: req.params,
      query: req.query
    });
    if (!parsedResult.success) {
      return next(parsedResult.error);
    }
    req.body = parsedResult.data.body;
    next();
  };
};

// src/app/module/emergencyContact/emergencyContact.validation.ts
import { z } from "zod";
var nameSchema = z.string({ message: "Name is required" }).trim().min(2, "Name must be at least 2 characters long").max(100, "Name must not exceed 100 characters").regex(
  /^[a-zA-Z\s'-]+$/,
  "Name must only contain letters, spaces, hyphens, or apostrophes"
);
var relationshipSchema = z.string({ message: "Relationship is required" }).trim().min(2, "Relationship must be at least 2 characters long").max(50, "Relationship must not exceed 50 characters").regex(
  /^[a-zA-Z\s'-]+$/,
  "Relationship must only contain letters, spaces, hyphens, or apostrophes"
);
var phoneNumberSchema = z.string({ message: "Phone number is required" }).trim().regex(
  /^(\+8801|8801|01)[3-9]\d{8}$/,
  "Phone number must be a valid Bangladeshi number (e.g. +8801XXXXXXXXX, 8801XXXXXXXXX, or 01XXXXXXXXX)"
);
var createEmergencyContactSchema = z.object({
  body: z.object({
    userId: z.string({ message: "User ID is required" }),
    name: nameSchema,
    relationship: relationshipSchema,
    phoneNumber: phoneNumberSchema
  })
});
var updateEmergencyContactSchema = z.object({
  body: z.object({
    name: nameSchema.optional(),
    relationship: relationshipSchema.optional(),
    phoneNumber: phoneNumberSchema.optional()
  }).refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided for update"
  )
});
var EmergencyContactValidation = {
  createEmergencyContactSchema,
  updateEmergencyContactSchema
};

// src/app/module/emergencyContact/emergencyContact.route.ts
var router = Router();
router.post("/", validateRequest(EmergencyContactValidation.createEmergencyContactSchema), EmergencyContactController.createEmergencyContact);
router.get("/user/:userId", EmergencyContactController.getEmergencyContactByUserId);
router.put("/:id", validateRequest(EmergencyContactValidation.updateEmergencyContactSchema), EmergencyContactController.updateEmergencyContact);
router.delete("/:id", EmergencyContactController.deleteEmergencyContact);
var EmergencyContactRoute = router;

// src/app/module/userProfile/userProfile.route.ts
import { Router as Router2 } from "express";

// src/generated/prisma/client.ts
import * as path from "path";
import { fileURLToPath } from "url";

// src/generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.4.2",
  "engineVersion": "94a226be1cf2967af2541cca5529f0f7ba866919",
  "activeProvider": "postgresql",
  "inlineSchema": 'model AdminProfile {\n  id        String   @id\n  userId    String   @unique\n  address   String?\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@map("admin_profile")\n}\n\nmodel User {\n  id                       String                    @id @default(uuid())\n  name                     String\n  email                    String\n  emailVerified            Boolean                   @default(false)\n  image                    String?\n  createdAt                DateTime                  @default(now())\n  updatedAt                DateTime                  @updatedAt\n  role                     String                    @default("USER")\n  accountStatus            String                    @default("ACTIVE")\n  deletedAt                DateTime?\n  sessions                 Session[]\n  accounts                 Account[]\n  userProfile              UserProfile?\n  adminProfile             AdminProfile?\n  superAdminProfile        SuperAdminProfile?\n  securityPersonnelProfile SecurityPersonnelProfile?\n  emergencyContacts        EmergencyContact[]\n\n  @@unique([email])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n\nmodel EmergencyContact {\n  id           String   @id @default(uuid())\n  userId       String\n  name         String\n  relationship String\n  phoneNumber  String\n  createdAt    DateTime @default(now())\n  updatedAt    DateTime @updatedAt\n\n  user User @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@map("emergency_contact")\n}\n\nenum Role {\n  SUPERADMIN\n  ADMIN\n  SECURITYPERSON\n  USER\n}\n\nenum AccountStatus {\n  ACTIVE\n  DEACTIVATED\n  BANNED\n  DELETIONPENDING\n  DELETED\n}\n\nenum BloodGroup {\n  A_POSITIVE\n  A_NEGATIVE\n  B_POSITIVE\n  B_NEGATIVE\n  AB_POSITIVE\n  AB_NEGATIVE\n  O_POSITIVE\n  O_NEGATIVE\n}\n\nenum PoliceRank {\n  IGP\n  ADDITIONAL_IGP\n  DIG\n  ADDITIONAL_DIG\n  POLICE_COMMISSIONER\n  ADDITIONAL_POLICE_COMMISSIONER\n  SP\n  ADDITIONAL_SP\n  SENIOR_ASP\n  ASP\n  INSPECTOR\n  SUB_INSPECTOR\n  SERGEANT\n  ASSISTANT_SUB_INSPECTOR\n  NAYEK\n  CONSTABLE\n}\n\n// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../../src/generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel SecurityPersonnelProfile {\n  id         String      @id\n  userId     String      @unique\n  address    String?\n  rank       PoliceRank?\n  bloodGroup BloodGroup?\n  user       User        @relation(fields: [userId], references: [id], onDelete: Cascade)\n  createdAt  DateTime    @default(now())\n  updatedAt  DateTime    @updatedAt\n\n  @@map("security_personnel_profile")\n}\n\nmodel SuperAdminProfile {\n  id        String   @id\n  userId    String   @unique\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@map("super_admin_profile")\n}\n\nmodel UserProfile {\n  id         String      @id\n  userId     String      @unique\n  user       User        @relation(fields: [userId], references: [id], onDelete: Cascade)\n  bio        String?\n  address    String?\n  bloodGroup BloodGroup?\n  createdAt  DateTime    @default(now())\n  updatedAt  DateTime    @updatedAt\n\n  @@map("user_profile")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"AdminProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"address","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AdminProfileToUser"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"admin_profile"},"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"role","kind":"scalar","type":"String"},{"name":"accountStatus","kind":"scalar","type":"String"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"userProfile","kind":"object","type":"UserProfile","relationName":"UserToUserProfile"},{"name":"adminProfile","kind":"object","type":"AdminProfile","relationName":"AdminProfileToUser"},{"name":"superAdminProfile","kind":"object","type":"SuperAdminProfile","relationName":"SuperAdminProfileToUser"},{"name":"securityPersonnelProfile","kind":"object","type":"SecurityPersonnelProfile","relationName":"SecurityPersonnelProfileToUser"},{"name":"emergencyContacts","kind":"object","type":"EmergencyContact","relationName":"EmergencyContactToUser"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"},"EmergencyContact":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"relationship","kind":"scalar","type":"String"},{"name":"phoneNumber","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"EmergencyContactToUser"}],"dbName":"emergency_contact"},"SecurityPersonnelProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"address","kind":"scalar","type":"String"},{"name":"rank","kind":"enum","type":"PoliceRank"},{"name":"bloodGroup","kind":"enum","type":"BloodGroup"},{"name":"user","kind":"object","type":"User","relationName":"SecurityPersonnelProfileToUser"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"security_personnel_profile"},"SuperAdminProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SuperAdminProfileToUser"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"super_admin_profile"},"UserProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"UserToUserProfile"},{"name":"bio","kind":"scalar","type":"String"},{"name":"address","kind":"scalar","type":"String"},{"name":"bloodGroup","kind":"enum","type":"BloodGroup"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"user_profile"}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","user","sessions","accounts","userProfile","adminProfile","superAdminProfile","securityPersonnelProfile","emergencyContacts","_count","AdminProfile.findUnique","AdminProfile.findUniqueOrThrow","AdminProfile.findFirst","AdminProfile.findFirstOrThrow","AdminProfile.findMany","data","AdminProfile.createOne","AdminProfile.createMany","AdminProfile.createManyAndReturn","AdminProfile.updateOne","AdminProfile.updateMany","AdminProfile.updateManyAndReturn","create","update","AdminProfile.upsertOne","AdminProfile.deleteOne","AdminProfile.deleteMany","having","_min","_max","AdminProfile.groupBy","AdminProfile.aggregate","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","User.upsertOne","User.deleteOne","User.deleteMany","User.groupBy","User.aggregate","Session.findUnique","Session.findUniqueOrThrow","Session.findFirst","Session.findFirstOrThrow","Session.findMany","Session.createOne","Session.createMany","Session.createManyAndReturn","Session.updateOne","Session.updateMany","Session.updateManyAndReturn","Session.upsertOne","Session.deleteOne","Session.deleteMany","Session.groupBy","Session.aggregate","Account.findUnique","Account.findUniqueOrThrow","Account.findFirst","Account.findFirstOrThrow","Account.findMany","Account.createOne","Account.createMany","Account.createManyAndReturn","Account.updateOne","Account.updateMany","Account.updateManyAndReturn","Account.upsertOne","Account.deleteOne","Account.deleteMany","Account.groupBy","Account.aggregate","Verification.findUnique","Verification.findUniqueOrThrow","Verification.findFirst","Verification.findFirstOrThrow","Verification.findMany","Verification.createOne","Verification.createMany","Verification.createManyAndReturn","Verification.updateOne","Verification.updateMany","Verification.updateManyAndReturn","Verification.upsertOne","Verification.deleteOne","Verification.deleteMany","Verification.groupBy","Verification.aggregate","EmergencyContact.findUnique","EmergencyContact.findUniqueOrThrow","EmergencyContact.findFirst","EmergencyContact.findFirstOrThrow","EmergencyContact.findMany","EmergencyContact.createOne","EmergencyContact.createMany","EmergencyContact.createManyAndReturn","EmergencyContact.updateOne","EmergencyContact.updateMany","EmergencyContact.updateManyAndReturn","EmergencyContact.upsertOne","EmergencyContact.deleteOne","EmergencyContact.deleteMany","EmergencyContact.groupBy","EmergencyContact.aggregate","SecurityPersonnelProfile.findUnique","SecurityPersonnelProfile.findUniqueOrThrow","SecurityPersonnelProfile.findFirst","SecurityPersonnelProfile.findFirstOrThrow","SecurityPersonnelProfile.findMany","SecurityPersonnelProfile.createOne","SecurityPersonnelProfile.createMany","SecurityPersonnelProfile.createManyAndReturn","SecurityPersonnelProfile.updateOne","SecurityPersonnelProfile.updateMany","SecurityPersonnelProfile.updateManyAndReturn","SecurityPersonnelProfile.upsertOne","SecurityPersonnelProfile.deleteOne","SecurityPersonnelProfile.deleteMany","SecurityPersonnelProfile.groupBy","SecurityPersonnelProfile.aggregate","SuperAdminProfile.findUnique","SuperAdminProfile.findUniqueOrThrow","SuperAdminProfile.findFirst","SuperAdminProfile.findFirstOrThrow","SuperAdminProfile.findMany","SuperAdminProfile.createOne","SuperAdminProfile.createMany","SuperAdminProfile.createManyAndReturn","SuperAdminProfile.updateOne","SuperAdminProfile.updateMany","SuperAdminProfile.updateManyAndReturn","SuperAdminProfile.upsertOne","SuperAdminProfile.deleteOne","SuperAdminProfile.deleteMany","SuperAdminProfile.groupBy","SuperAdminProfile.aggregate","UserProfile.findUnique","UserProfile.findUniqueOrThrow","UserProfile.findFirst","UserProfile.findFirstOrThrow","UserProfile.findMany","UserProfile.createOne","UserProfile.createMany","UserProfile.createManyAndReturn","UserProfile.updateOne","UserProfile.updateMany","UserProfile.updateManyAndReturn","UserProfile.upsertOne","UserProfile.deleteOne","UserProfile.deleteMany","UserProfile.groupBy","UserProfile.aggregate","AND","OR","NOT","id","userId","bio","address","BloodGroup","bloodGroup","createdAt","updatedAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","PoliceRank","rank","name","relationship","phoneNumber","identifier","value","expiresAt","accountId","providerId","accessToken","refreshToken","idToken","accessTokenExpiresAt","refreshTokenExpiresAt","scope","password","token","ipAddress","userAgent","email","emailVerified","image","role","accountStatus","deletedAt","every","some","none","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany"]'),
  graph: "yANKkAEJAwAA_wEAIKIBAAChAgAwowEAAA0AEKQBAAChAgAwpQEBAAAAAaYBAQAAAAGoAQEA_AEAIasBQAD-AQAhrAFAAP4BACEBAAAAAQAgDAMAAP8BACCiAQAAowIAMKMBAAADABCkAQAAowIAMKUBAQCLAgAhpgEBAIsCACGrAUAA_gEAIawBQAD-AQAhvwFAAP4BACHJAQEAiwIAIcoBAQD8AQAhywEBAPwBACEDAwAArgIAIMoBAACkAgAgywEAAKQCACAMAwAA_wEAIKIBAACjAgAwowEAAAMAEKQBAACjAgAwpQEBAAAAAaYBAQCLAgAhqwFAAP4BACGsAUAA_gEAIb8BQAD-AQAhyQEBAAAAAcoBAQD8AQAhywEBAPwBACEDAAAAAwAgAQAABAAwAgAABQAgEQMAAP8BACCiAQAAogIAMKMBAAAHABCkAQAAogIAMKUBAQCLAgAhpgEBAIsCACGrAUAA_gEAIawBQAD-AQAhwAEBAIsCACHBAQEAiwIAIcIBAQD8AQAhwwEBAPwBACHEAQEA_AEAIcUBQACXAgAhxgFAAJcCACHHAQEA_AEAIcgBAQD8AQAhCAMAAK4CACDCAQAApAIAIMMBAACkAgAgxAEAAKQCACDFAQAApAIAIMYBAACkAgAgxwEAAKQCACDIAQAApAIAIBEDAAD_AQAgogEAAKICADCjAQAABwAQpAEAAKICADClAQEAAAABpgEBAIsCACGrAUAA_gEAIawBQAD-AQAhwAEBAIsCACHBAQEAiwIAIcIBAQD8AQAhwwEBAPwBACHEAQEA_AEAIcUBQACXAgAhxgFAAJcCACHHAQEA_AEAIcgBAQD8AQAhAwAAAAcAIAEAAAgAMAIAAAkAIAsDAAD_AQAgogEAAPsBADCjAQAACwAQpAEAAPsBADClAQEAiwIAIaYBAQCLAgAhpwEBAPwBACGoAQEA_AEAIaoBAAD9AaoBI6sBQAD-AQAhrAFAAP4BACEBAAAACwAgCQMAAP8BACCiAQAAoQIAMKMBAAANABCkAQAAoQIAMKUBAQCLAgAhpgEBAIsCACGoAQEA_AEAIasBQAD-AQAhrAFAAP4BACEBAAAADQAgCAMAAP8BACCiAQAAgQIAMKMBAAAPABCkAQAAgQIAMKUBAQCLAgAhpgEBAIsCACGrAUAA_gEAIawBQAD-AQAhAQAAAA8AIAsDAAD_AQAgogEAAIYCADCjAQAAEQAQpAEAAIYCADClAQEAiwIAIaYBAQCLAgAhqAEBAPwBACGqAQAA_QGqASOrAUAA_gEAIawBQAD-AQAhuQEAAIcCuQEjAQAAABEAIAsDAAD_AQAgogEAAKACADCjAQAAEwAQpAEAAKACADClAQEAiwIAIaYBAQCLAgAhqwFAAP4BACGsAUAA_gEAIboBAQCLAgAhuwEBAIsCACG8AQEAiwIAIQEDAACuAgAgCwMAAP8BACCiAQAAoAIAMKMBAAATABCkAQAAoAIAMKUBAQAAAAGmAQEAiwIAIasBQAD-AQAhrAFAAP4BACG6AQEAiwIAIbsBAQCLAgAhvAEBAIsCACEDAAAAEwAgAQAAFAAwAgAAFQAgAQAAAAMAIAEAAAAHACABAAAAEwAgAQAAAAEAIAIDAACuAgAgqAEAAKQCACADAAAADQAgAQAAGwAwAgAAAQAgAwAAAA0AIAEAABsAMAIAAAEAIAMAAAANACABAAAbADACAAABACAGAwAAogMAIKUBAQAAAAGmAQEAAAABqAEBAAAAAasBQAAAAAGsAUAAAAABAREAAB8AIAWlAQEAAAABpgEBAAAAAagBAQAAAAGrAUAAAAABrAFAAAAAAQERAAAhADABEQAAIQAwBgMAAKEDACClAQEAqAIAIaYBAQCoAgAhqAEBAKkCACGrAUAAqwIAIawBQACrAgAhAgAAAAEAIBEAACQAIAWlAQEAqAIAIaYBAQCoAgAhqAEBAKkCACGrAUAAqwIAIawBQACrAgAhAgAAAA0AIBEAACYAIAIAAAANACARAAAmACADAAAAAQAgGAAAHwAgGQAAJAAgAQAAAAEAIAEAAAANACAECwAAngMAIB4AAKADACAfAACfAwAgqAEAAKQCACAIogEAAJ8CADCjAQAALQAQpAEAAJ8CADClAQEA7QEAIaYBAQDtAQAhqAEBAO4BACGrAUAA8AEAIawBQADwAQAhAwAAAA0AIAEAACwAMB0AAC0AIAMAAAANACABAAAbADACAAABACAUBAAAmAIAIAUAAJkCACAGAACaAgAgBwAAmwIAIAgAAJwCACAJAACdAgAgCgAAngIAIKIBAACVAgAwowEAADMAEKQBAACVAgAwpQEBAAAAAasBQAD-AQAhrAFAAP4BACG6AQEAiwIAIcwBAQAAAAHNASAAlgIAIc4BAQD8AQAhzwEBAIsCACHQAQEAiwIAIdEBQACXAgAhAQAAADAAIAEAAAAwACAUBAAAmAIAIAUAAJkCACAGAACaAgAgBwAAmwIAIAgAAJwCACAJAACdAgAgCgAAngIAIKIBAACVAgAwowEAADMAEKQBAACVAgAwpQEBAIsCACGrAUAA_gEAIawBQAD-AQAhugEBAIsCACHMAQEAiwIAIc0BIACWAgAhzgEBAPwBACHPAQEAiwIAIdABAQCLAgAh0QFAAJcCACEJBAAAlwMAIAUAAJgDACAGAACZAwAgBwAAmgMAIAgAAJsDACAJAACcAwAgCgAAnQMAIM4BAACkAgAg0QEAAKQCACADAAAAMwAgAQAANAAwAgAAMAAgAwAAADMAIAEAADQAMAIAADAAIAMAAAAzACABAAA0ADACAAAwACARBAAAkAMAIAUAAJEDACAGAACSAwAgBwAAkwMAIAgAAJQDACAJAACVAwAgCgAAlgMAIKUBAQAAAAGrAUAAAAABrAFAAAAAAboBAQAAAAHMAQEAAAABzQEgAAAAAc4BAQAAAAHPAQEAAAAB0AEBAAAAAdEBQAAAAAEBEQAAOAAgCqUBAQAAAAGrAUAAAAABrAFAAAAAAboBAQAAAAHMAQEAAAABzQEgAAAAAc4BAQAAAAHPAQEAAAAB0AEBAAAAAdEBQAAAAAEBEQAAOgAwAREAADoAMBEEAADRAgAgBQAA0gIAIAYAANMCACAHAADUAgAgCAAA1QIAIAkAANYCACAKAADXAgAgpQEBAKgCACGrAUAAqwIAIawBQACrAgAhugEBAKgCACHMAQEAqAIAIc0BIADQAgAhzgEBAKkCACHPAQEAqAIAIdABAQCoAgAh0QFAAMUCACECAAAAMAAgEQAAPQAgCqUBAQCoAgAhqwFAAKsCACGsAUAAqwIAIboBAQCoAgAhzAEBAKgCACHNASAA0AIAIc4BAQCpAgAhzwEBAKgCACHQAQEAqAIAIdEBQADFAgAhAgAAADMAIBEAAD8AIAIAAAAzACARAAA_ACADAAAAMAAgGAAAOAAgGQAAPQAgAQAAADAAIAEAAAAzACAFCwAAzQIAIB4AAM8CACAfAADOAgAgzgEAAKQCACDRAQAApAIAIA2iAQAAkQIAMKMBAABGABCkAQAAkQIAMKUBAQDtAQAhqwFAAPABACGsAUAA8AEAIboBAQDtAQAhzAEBAO0BACHNASAAkgIAIc4BAQDuAQAhzwEBAO0BACHQAQEA7QEAIdEBQACNAgAhAwAAADMAIAEAAEUAMB0AAEYAIAMAAAAzACABAAA0ADACAAAwACABAAAABQAgAQAAAAUAIAMAAAADACABAAAEADACAAAFACADAAAAAwAgAQAABAAwAgAABQAgAwAAAAMAIAEAAAQAMAIAAAUAIAkDAADMAgAgpQEBAAAAAaYBAQAAAAGrAUAAAAABrAFAAAAAAb8BQAAAAAHJAQEAAAABygEBAAAAAcsBAQAAAAEBEQAATgAgCKUBAQAAAAGmAQEAAAABqwFAAAAAAawBQAAAAAG_AUAAAAAByQEBAAAAAcoBAQAAAAHLAQEAAAABAREAAFAAMAERAABQADAJAwAAywIAIKUBAQCoAgAhpgEBAKgCACGrAUAAqwIAIawBQACrAgAhvwFAAKsCACHJAQEAqAIAIcoBAQCpAgAhywEBAKkCACECAAAABQAgEQAAUwAgCKUBAQCoAgAhpgEBAKgCACGrAUAAqwIAIawBQACrAgAhvwFAAKsCACHJAQEAqAIAIcoBAQCpAgAhywEBAKkCACECAAAAAwAgEQAAVQAgAgAAAAMAIBEAAFUAIAMAAAAFACAYAABOACAZAABTACABAAAABQAgAQAAAAMAIAULAADIAgAgHgAAygIAIB8AAMkCACDKAQAApAIAIMsBAACkAgAgC6IBAACQAgAwowEAAFwAEKQBAACQAgAwpQEBAO0BACGmAQEA7QEAIasBQADwAQAhrAFAAPABACG_AUAA8AEAIckBAQDtAQAhygEBAO4BACHLAQEA7gEAIQMAAAADACABAABbADAdAABcACADAAAAAwAgAQAABAAwAgAABQAgAQAAAAkAIAEAAAAJACADAAAABwAgAQAACAAwAgAACQAgAwAAAAcAIAEAAAgAMAIAAAkAIAMAAAAHACABAAAIADACAAAJACAOAwAAxwIAIKUBAQAAAAGmAQEAAAABqwFAAAAAAawBQAAAAAHAAQEAAAABwQEBAAAAAcIBAQAAAAHDAQEAAAABxAEBAAAAAcUBQAAAAAHGAUAAAAABxwEBAAAAAcgBAQAAAAEBEQAAZAAgDaUBAQAAAAGmAQEAAAABqwFAAAAAAawBQAAAAAHAAQEAAAABwQEBAAAAAcIBAQAAAAHDAQEAAAABxAEBAAAAAcUBQAAAAAHGAUAAAAABxwEBAAAAAcgBAQAAAAEBEQAAZgAwAREAAGYAMA4DAADGAgAgpQEBAKgCACGmAQEAqAIAIasBQACrAgAhrAFAAKsCACHAAQEAqAIAIcEBAQCoAgAhwgEBAKkCACHDAQEAqQIAIcQBAQCpAgAhxQFAAMUCACHGAUAAxQIAIccBAQCpAgAhyAEBAKkCACECAAAACQAgEQAAaQAgDaUBAQCoAgAhpgEBAKgCACGrAUAAqwIAIawBQACrAgAhwAEBAKgCACHBAQEAqAIAIcIBAQCpAgAhwwEBAKkCACHEAQEAqQIAIcUBQADFAgAhxgFAAMUCACHHAQEAqQIAIcgBAQCpAgAhAgAAAAcAIBEAAGsAIAIAAAAHACARAABrACADAAAACQAgGAAAZAAgGQAAaQAgAQAAAAkAIAEAAAAHACAKCwAAwgIAIB4AAMQCACAfAADDAgAgwgEAAKQCACDDAQAApAIAIMQBAACkAgAgxQEAAKQCACDGAQAApAIAIMcBAACkAgAgyAEAAKQCACAQogEAAIwCADCjAQAAcgAQpAEAAIwCADClAQEA7QEAIaYBAQDtAQAhqwFAAPABACGsAUAA8AEAIcABAQDtAQAhwQEBAO0BACHCAQEA7gEAIcMBAQDuAQAhxAEBAO4BACHFAUAAjQIAIcYBQACNAgAhxwEBAO4BACHIAQEA7gEAIQMAAAAHACABAABxADAdAAByACADAAAABwAgAQAACAAwAgAACQAgCaIBAACKAgAwowEAAHgAEKQBAACKAgAwpQEBAAAAAasBQAD-AQAhrAFAAP4BACG9AQEAiwIAIb4BAQCLAgAhvwFAAP4BACEBAAAAdQAgAQAAAHUAIAmiAQAAigIAMKMBAAB4ABCkAQAAigIAMKUBAQCLAgAhqwFAAP4BACGsAUAA_gEAIb0BAQCLAgAhvgEBAIsCACG_AUAA_gEAIQADAAAAeAAgAQAAeQAwAgAAdQAgAwAAAHgAIAEAAHkAMAIAAHUAIAMAAAB4ACABAAB5ADACAAB1ACAGpQEBAAAAAasBQAAAAAGsAUAAAAABvQEBAAAAAb4BAQAAAAG_AUAAAAABAREAAH0AIAalAQEAAAABqwFAAAAAAawBQAAAAAG9AQEAAAABvgEBAAAAAb8BQAAAAAEBEQAAfwAwAREAAH8AMAalAQEAqAIAIasBQACrAgAhrAFAAKsCACG9AQEAqAIAIb4BAQCoAgAhvwFAAKsCACECAAAAdQAgEQAAggEAIAalAQEAqAIAIasBQACrAgAhrAFAAKsCACG9AQEAqAIAIb4BAQCoAgAhvwFAAKsCACECAAAAeAAgEQAAhAEAIAIAAAB4ACARAACEAQAgAwAAAHUAIBgAAH0AIBkAAIIBACABAAAAdQAgAQAAAHgAIAMLAAC_AgAgHgAAwQIAIB8AAMACACAJogEAAIkCADCjAQAAiwEAEKQBAACJAgAwpQEBAO0BACGrAUAA8AEAIawBQADwAQAhvQEBAO0BACG-AQEA7QEAIb8BQADwAQAhAwAAAHgAIAEAAIoBADAdAACLAQAgAwAAAHgAIAEAAHkAMAIAAHUAIAEAAAAVACABAAAAFQAgAwAAABMAIAEAABQAMAIAABUAIAMAAAATACABAAAUADACAAAVACADAAAAEwAgAQAAFAAwAgAAFQAgCAMAAL4CACClAQEAAAABpgEBAAAAAasBQAAAAAGsAUAAAAABugEBAAAAAbsBAQAAAAG8AQEAAAABAREAAJMBACAHpQEBAAAAAaYBAQAAAAGrAUAAAAABrAFAAAAAAboBAQAAAAG7AQEAAAABvAEBAAAAAQERAACVAQAwAREAAJUBADAIAwAAvQIAIKUBAQCoAgAhpgEBAKgCACGrAUAAqwIAIawBQACrAgAhugEBAKgCACG7AQEAqAIAIbwBAQCoAgAhAgAAABUAIBEAAJgBACAHpQEBAKgCACGmAQEAqAIAIasBQACrAgAhrAFAAKsCACG6AQEAqAIAIbsBAQCoAgAhvAEBAKgCACECAAAAEwAgEQAAmgEAIAIAAAATACARAACaAQAgAwAAABUAIBgAAJMBACAZAACYAQAgAQAAABUAIAEAAAATACADCwAAugIAIB4AALwCACAfAAC7AgAgCqIBAACIAgAwowEAAKEBABCkAQAAiAIAMKUBAQDtAQAhpgEBAO0BACGrAUAA8AEAIawBQADwAQAhugEBAO0BACG7AQEA7QEAIbwBAQDtAQAhAwAAABMAIAEAAKABADAdAAChAQAgAwAAABMAIAEAABQAMAIAABUAIAsDAAD_AQAgogEAAIYCADCjAQAAEQAQpAEAAIYCADClAQEAAAABpgEBAAAAAagBAQD8AQAhqgEAAP0BqgEjqwFAAP4BACGsAUAA_gEAIbkBAACHArkBIwEAAACkAQAgAQAAAKQBACAEAwAArgIAIKgBAACkAgAgqgEAAKQCACC5AQAApAIAIAMAAAARACABAACnAQAwAgAApAEAIAMAAAARACABAACnAQAwAgAApAEAIAMAAAARACABAACnAQAwAgAApAEAIAgDAAC5AgAgpQEBAAAAAaYBAQAAAAGoAQEAAAABqgEAAACqAQOrAUAAAAABrAFAAAAAAbkBAAAAuQEDAREAAKsBACAHpQEBAAAAAaYBAQAAAAGoAQEAAAABqgEAAACqAQOrAUAAAAABrAFAAAAAAbkBAAAAuQEDAREAAK0BADABEQAArQEAMAgDAAC4AgAgpQEBAKgCACGmAQEAqAIAIagBAQCpAgAhqgEAAKoCqgEjqwFAAKsCACGsAUAAqwIAIbkBAAC3ArkBIwIAAACkAQAgEQAAsAEAIAelAQEAqAIAIaYBAQCoAgAhqAEBAKkCACGqAQAAqgKqASOrAUAAqwIAIawBQACrAgAhuQEAALcCuQEjAgAAABEAIBEAALIBACACAAAAEQAgEQAAsgEAIAMAAACkAQAgGAAAqwEAIBkAALABACABAAAApAEAIAEAAAARACAGCwAAtAIAIB4AALYCACAfAAC1AgAgqAEAAKQCACCqAQAApAIAILkBAACkAgAgCqIBAACCAgAwowEAALkBABCkAQAAggIAMKUBAQDtAQAhpgEBAO0BACGoAQEA7gEAIaoBAADvAaoBI6sBQADwAQAhrAFAAPABACG5AQAAgwK5ASMDAAAAEQAgAQAAuAEAMB0AALkBACADAAAAEQAgAQAApwEAMAIAAKQBACAIAwAA_wEAIKIBAACBAgAwowEAAA8AEKQBAACBAgAwpQEBAAAAAaYBAQAAAAGrAUAA_gEAIawBQAD-AQAhAQAAALwBACABAAAAvAEAIAEDAACuAgAgAwAAAA8AIAEAAL8BADACAAC8AQAgAwAAAA8AIAEAAL8BADACAAC8AQAgAwAAAA8AIAEAAL8BADACAAC8AQAgBQMAALMCACClAQEAAAABpgEBAAAAAasBQAAAAAGsAUAAAAABAREAAMMBACAEpQEBAAAAAaYBAQAAAAGrAUAAAAABrAFAAAAAAQERAADFAQAwAREAAMUBADAFAwAAsgIAIKUBAQCoAgAhpgEBAKgCACGrAUAAqwIAIawBQACrAgAhAgAAALwBACARAADIAQAgBKUBAQCoAgAhpgEBAKgCACGrAUAAqwIAIawBQACrAgAhAgAAAA8AIBEAAMoBACACAAAADwAgEQAAygEAIAMAAAC8AQAgGAAAwwEAIBkAAMgBACABAAAAvAEAIAEAAAAPACADCwAArwIAIB4AALECACAfAACwAgAgB6IBAACAAgAwowEAANEBABCkAQAAgAIAMKUBAQDtAQAhpgEBAO0BACGrAUAA8AEAIawBQADwAQAhAwAAAA8AIAEAANABADAdAADRAQAgAwAAAA8AIAEAAL8BADACAAC8AQAgCwMAAP8BACCiAQAA-wEAMKMBAAALABCkAQAA-wEAMKUBAQAAAAGmAQEAAAABpwEBAPwBACGoAQEA_AEAIaoBAAD9AaoBI6sBQAD-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-gEAIbUBAQAAAAG2AQEAAAABtwEBAAAAAQsDAAD_AQAgogEAAPsBADCjAQAACwAQpAEAAPsBADClAQEAiwIAIaYBAQCLAgAhpwEBAPwBACGoAQEA_AEAIaoBAAD9AaoBI6sBQAD-AQAhrAFAAP4BACELrQEBAAAAAa4BAQAAAAWvAQEAAAAFsAEBAAAAAbEBAQAAAAGyAQEAAAABswEBAAAAAbQBAQD4AQAhtQEBAAAAAbYBAQAAAAG3AQEAAAABBK0BAAAAqgEDrgEAAACqAQmvAQAAAKoBCbQBAAD2AaoBIwitAUAAAAABrgFAAAAABK8BQAAAAASwAUAAAAABsQFAAAAAAbIBQAAAAAGzAUAAAAABtAFAAPMBACEWBAAAmAIAIAUAAJkCACAGAACaAgAgBwAAmwIAIAgAAJwCACAJAACdAgAgCgAAngIAIKIBAACVAgAwowEAADMAEKQBAACVAgAwpQEBAIsCACGrAUAA_gEAIawBQAD-AQAhugEBAIsCACHMAQEAiwIAIc0BIACWAgAhzgEBAPwBACHPAQEAiwIAIdABAQCLAgAh0QFAAJcCACHVAQAAMwAg1gEAADMAIAeiAQAAgAIAMKMBAADRAQAQpAEAAIACADClAQEA7QEAIaYBAQDtAQAhqwFAAPABACGsAUAA8AEAIQgDAAD_AQAgogEAAIECADCjAQAADwAQpAEAAIECADClAQEAiwIAIaYBAQCLAgAhqwFAAP4BACGsAUAA_gEAIQqiAQAAggIAMKMBAAC5AQAQpAEAAIICADClAQEA7QEAIaYBAQDtAQAhqAEBAO4BACGqAQAA7wGqASOrAUAA8AEAIawBQADwAQAhuQEAAIMCuQEjBwsAAPUBACAeAACFAgAgHwAAhQIAIK0BAAAAuQEDrgEAAAC5AQmvAQAAALkBCbQBAACEArkBIwcLAAD1AQAgHgAAhQIAIB8AAIUCACCtAQAAALkBA64BAAAAuQEJrwEAAAC5AQm0AQAAhAK5ASMErQEAAAC5AQOuAQAAALkBCa8BAAAAuQEJtAEAAIUCuQEjCwMAAP8BACCiAQAAhgIAMKMBAAARABCkAQAAhgIAMKUBAQCLAgAhpgEBAIsCACGoAQEA_AEAIaoBAAD9AaoBI6sBQAD-AQAhrAFAAP4BACG5AQAAhwK5ASMErQEAAAC5AQOuAQAAALkBCa8BAAAAuQEJtAEAAIUCuQEjCqIBAACIAgAwowEAAKEBABCkAQAAiAIAMKUBAQDtAQAhpgEBAO0BACGrAUAA8AEAIawBQADwAQAhugEBAO0BACG7AQEA7QEAIbwBAQDtAQAhCaIBAACJAgAwowEAAIsBABCkAQAAiQIAMKUBAQDtAQAhqwFAAPABACGsAUAA8AEAIb0BAQDtAQAhvgEBAO0BACG_AUAA8AEAIQmiAQAAigIAMKMBAAB4ABCkAQAAigIAMKUBAQCLAgAhqwFAAP4BACGsAUAA_gEAIb0BAQCLAgAhvgEBAIsCACG_AUAA_gEAIQutAQEAAAABrgEBAAAABK8BAQAAAASwAQEAAAABsQEBAAAAAbIBAQAAAAGzAQEAAAABtAEBAPoBACG1AQEAAAABtgEBAAAAAbcBAQAAAAEQogEAAIwCADCjAQAAcgAQpAEAAIwCADClAQEA7QEAIaYBAQDtAQAhqwFAAPABACGsAUAA8AEAIcABAQDtAQAhwQEBAO0BACHCAQEA7gEAIcMBAQDuAQAhxAEBAO4BACHFAUAAjQIAIcYBQACNAgAhxwEBAO4BACHIAQEA7gEAIQsLAAD1AQAgHgAAjwIAIB8AAI8CACCtAUAAAAABrgFAAAAABa8BQAAAAAWwAUAAAAABsQFAAAAAAbIBQAAAAAGzAUAAAAABtAFAAI4CACELCwAA9QEAIB4AAI8CACAfAACPAgAgrQFAAAAAAa4BQAAAAAWvAUAAAAAFsAFAAAAAAbEBQAAAAAGyAUAAAAABswFAAAAAAbQBQACOAgAhCK0BQAAAAAGuAUAAAAAFrwFAAAAABbABQAAAAAGxAUAAAAABsgFAAAAAAbMBQAAAAAG0AUAAjwIAIQuiAQAAkAIAMKMBAABcABCkAQAAkAIAMKUBAQDtAQAhpgEBAO0BACGrAUAA8AEAIawBQADwAQAhvwFAAPABACHJAQEA7QEAIcoBAQDuAQAhywEBAO4BACENogEAAJECADCjAQAARgAQpAEAAJECADClAQEA7QEAIasBQADwAQAhrAFAAPABACG6AQEA7QEAIcwBAQDtAQAhzQEgAJICACHOAQEA7gEAIc8BAQDtAQAh0AEBAO0BACHRAUAAjQIAIQULAADyAQAgHgAAlAIAIB8AAJQCACCtASAAAAABtAEgAJMCACEFCwAA8gEAIB4AAJQCACAfAACUAgAgrQEgAAAAAbQBIACTAgAhAq0BIAAAAAG0ASAAlAIAIRQEAACYAgAgBQAAmQIAIAYAAJoCACAHAACbAgAgCAAAnAIAIAkAAJ0CACAKAACeAgAgogEAAJUCADCjAQAAMwAQpAEAAJUCADClAQEAiwIAIasBQAD-AQAhrAFAAP4BACG6AQEAiwIAIcwBAQCLAgAhzQEgAJYCACHOAQEA_AEAIc8BAQCLAgAh0AEBAIsCACHRAUAAlwIAIQKtASAAAAABtAEgAJQCACEIrQFAAAAAAa4BQAAAAAWvAUAAAAAFsAFAAAAAAbEBQAAAAAGyAUAAAAABswFAAAAAAbQBQACPAgAhA9IBAAADACDTAQAAAwAg1AEAAAMAIAPSAQAABwAg0wEAAAcAINQBAAAHACANAwAA_wEAIKIBAAD7AQAwowEAAAsAEKQBAAD7AQAwpQEBAIsCACGmAQEAiwIAIacBAQD8AQAhqAEBAPwBACGqAQAA_QGqASOrAUAA_gEAIawBQAD-AQAh1QEAAAsAINYBAAALACALAwAA_wEAIKIBAAChAgAwowEAAA0AEKQBAAChAgAwpQEBAIsCACGmAQEAiwIAIagBAQD8AQAhqwFAAP4BACGsAUAA_gEAIdUBAAANACDWAQAADQAgCgMAAP8BACCiAQAAgQIAMKMBAAAPABCkAQAAgQIAMKUBAQCLAgAhpgEBAIsCACGrAUAA_gEAIawBQAD-AQAh1QEAAA8AINYBAAAPACANAwAA_wEAIKIBAACGAgAwowEAABEAEKQBAACGAgAwpQEBAIsCACGmAQEAiwIAIagBAQD8AQAhqgEAAP0BqgEjqwFAAP4BACGsAUAA_gEAIbkBAACHArkBI9UBAAARACDWAQAAEQAgA9IBAAATACDTAQAAEwAg1AEAABMAIAiiAQAAnwIAMKMBAAAtABCkAQAAnwIAMKUBAQDtAQAhpgEBAO0BACGoAQEA7gEAIasBQADwAQAhrAFAAPABACELAwAA_wEAIKIBAACgAgAwowEAABMAEKQBAACgAgAwpQEBAIsCACGmAQEAiwIAIasBQAD-AQAhrAFAAP4BACG6AQEAiwIAIbsBAQCLAgAhvAEBAIsCACEJAwAA_wEAIKIBAAChAgAwowEAAA0AEKQBAAChAgAwpQEBAIsCACGmAQEAiwIAIagBAQD8AQAhqwFAAP4BACGsAUAA_gEAIREDAAD_AQAgogEAAKICADCjAQAABwAQpAEAAKICADClAQEAiwIAIaYBAQCLAgAhqwFAAP4BACGsAUAA_gEAIcABAQCLAgAhwQEBAIsCACHCAQEA_AEAIcMBAQD8AQAhxAEBAPwBACHFAUAAlwIAIcYBQACXAgAhxwEBAPwBACHIAQEA_AEAIQwDAAD_AQAgogEAAKMCADCjAQAAAwAQpAEAAKMCADClAQEAiwIAIaYBAQCLAgAhqwFAAP4BACGsAUAA_gEAIb8BQAD-AQAhyQEBAIsCACHKAQEA_AEAIcsBAQD8AQAhAAAAAAHaAQEAAAABAdoBAQAAAAEB2gEAAACqAQMB2gFAAAAAAQUYAADEAwAgGQAAxwMAINcBAADFAwAg2AEAAMYDACDdAQAAMAAgAxgAAMQDACDXAQAAxQMAIN0BAAAwACAJBAAAlwMAIAUAAJgDACAGAACZAwAgBwAAmgMAIAgAAJsDACAJAACcAwAgCgAAnQMAIM4BAACkAgAg0QEAAKQCACAAAAAFGAAAvwMAIBkAAMIDACDXAQAAwAMAINgBAADBAwAg3QEAADAAIAMYAAC_AwAg1wEAAMADACDdAQAAMAAgAAAAAdoBAAAAuQEDBRgAALoDACAZAAC9AwAg1wEAALsDACDYAQAAvAMAIN0BAAAwACADGAAAugMAINcBAAC7AwAg3QEAADAAIAAAAAUYAAC1AwAgGQAAuAMAINcBAAC2AwAg2AEAALcDACDdAQAAMAAgAxgAALUDACDXAQAAtgMAIN0BAAAwACAAAAAAAAAB2gFAAAAAAQUYAACwAwAgGQAAswMAINcBAACxAwAg2AEAALIDACDdAQAAMAAgAxgAALADACDXAQAAsQMAIN0BAAAwACAAAAAFGAAAqwMAIBkAAK4DACDXAQAArAMAINgBAACtAwAg3QEAADAAIAMYAACrAwAg1wEAAKwDACDdAQAAMAAgAAAAAdoBIAAAAAELGAAAhAMAMBkAAIkDADDXAQAAhQMAMNgBAACGAwAw2QEAAIcDACDaAQAAiAMAMNsBAACIAwAw3AEAAIgDADDdAQAAiAMAMN4BAACKAwAw3wEAAIsDADALGAAA-AIAMBkAAP0CADDXAQAA-QIAMNgBAAD6AgAw2QEAAPsCACDaAQAA_AIAMNsBAAD8AgAw3AEAAPwCADDdAQAA_AIAMN4BAAD-AgAw3wEAAP8CADAHGAAA8wIAIBkAAPYCACDXAQAA9AIAINgBAAD1AgAg2wEAAAsAINwBAAALACDdAQAA1AEAIAcYAADuAgAgGQAA8QIAINcBAADvAgAg2AEAAPACACDbAQAADQAg3AEAAA0AIN0BAAABACAHGAAA6QIAIBkAAOwCACDXAQAA6gIAINgBAADrAgAg2wEAAA8AINwBAAAPACDdAQAAvAEAIAcYAADkAgAgGQAA5wIAINcBAADlAgAg2AEAAOYCACDbAQAAEQAg3AEAABEAIN0BAACkAQAgCxgAANgCADAZAADdAgAw1wEAANkCADDYAQAA2gIAMNkBAADbAgAg2gEAANwCADDbAQAA3AIAMNwBAADcAgAw3QEAANwCADDeAQAA3gIAMN8BAADfAgAwBqUBAQAAAAGrAUAAAAABrAFAAAAAAboBAQAAAAG7AQEAAAABvAEBAAAAAQIAAAAVACAYAADjAgAgAwAAABUAIBgAAOMCACAZAADiAgAgAREAAKoDADALAwAA_wEAIKIBAACgAgAwowEAABMAEKQBAACgAgAwpQEBAAAAAaYBAQCLAgAhqwFAAP4BACGsAUAA_gEAIboBAQCLAgAhuwEBAIsCACG8AQEAiwIAIQIAAAAVACARAADiAgAgAgAAAOACACARAADhAgAgCqIBAADfAgAwowEAAOACABCkAQAA3wIAMKUBAQCLAgAhpgEBAIsCACGrAUAA_gEAIawBQAD-AQAhugEBAIsCACG7AQEAiwIAIbwBAQCLAgAhCqIBAADfAgAwowEAAOACABCkAQAA3wIAMKUBAQCLAgAhpgEBAIsCACGrAUAA_gEAIawBQAD-AQAhugEBAIsCACG7AQEAiwIAIbwBAQCLAgAhBqUBAQCoAgAhqwFAAKsCACGsAUAAqwIAIboBAQCoAgAhuwEBAKgCACG8AQEAqAIAIQalAQEAqAIAIasBQACrAgAhrAFAAKsCACG6AQEAqAIAIbsBAQCoAgAhvAEBAKgCACEGpQEBAAAAAasBQAAAAAGsAUAAAAABugEBAAAAAbsBAQAAAAG8AQEAAAABBqUBAQAAAAGoAQEAAAABqgEAAACqAQOrAUAAAAABrAFAAAAAAbkBAAAAuQEDAgAAAKQBACAYAADkAgAgAwAAABEAIBgAAOQCACAZAADoAgAgCAAAABEAIBEAAOgCACClAQEAqAIAIagBAQCpAgAhqgEAAKoCqgEjqwFAAKsCACGsAUAAqwIAIbkBAAC3ArkBIwalAQEAqAIAIagBAQCpAgAhqgEAAKoCqgEjqwFAAKsCACGsAUAAqwIAIbkBAAC3ArkBIwOlAQEAAAABqwFAAAAAAawBQAAAAAECAAAAvAEAIBgAAOkCACADAAAADwAgGAAA6QIAIBkAAO0CACAFAAAADwAgEQAA7QIAIKUBAQCoAgAhqwFAAKsCACGsAUAAqwIAIQOlAQEAqAIAIasBQACrAgAhrAFAAKsCACEEpQEBAAAAAagBAQAAAAGrAUAAAAABrAFAAAAAAQIAAAABACAYAADuAgAgAwAAAA0AIBgAAO4CACAZAADyAgAgBgAAAA0AIBEAAPICACClAQEAqAIAIagBAQCpAgAhqwFAAKsCACGsAUAAqwIAIQSlAQEAqAIAIagBAQCpAgAhqwFAAKsCACGsAUAAqwIAIQalAQEAAAABpwEBAAAAAagBAQAAAAGqAQAAAKoBA6sBQAAAAAGsAUAAAAABAgAAANQBACAYAADzAgAgAwAAAAsAIBgAAPMCACAZAAD3AgAgCAAAAAsAIBEAAPcCACClAQEAqAIAIacBAQCpAgAhqAEBAKkCACGqAQAAqgKqASOrAUAAqwIAIawBQACrAgAhBqUBAQCoAgAhpwEBAKkCACGoAQEAqQIAIaoBAACqAqoBI6sBQACrAgAhrAFAAKsCACEMpQEBAAAAAasBQAAAAAGsAUAAAAABwAEBAAAAAcEBAQAAAAHCAQEAAAABwwEBAAAAAcQBAQAAAAHFAUAAAAABxgFAAAAAAccBAQAAAAHIAQEAAAABAgAAAAkAIBgAAIMDACADAAAACQAgGAAAgwMAIBkAAIIDACABEQAAqQMAMBEDAAD_AQAgogEAAKICADCjAQAABwAQpAEAAKICADClAQEAAAABpgEBAIsCACGrAUAA_gEAIawBQAD-AQAhwAEBAIsCACHBAQEAiwIAIcIBAQD8AQAhwwEBAPwBACHEAQEA_AEAIcUBQACXAgAhxgFAAJcCACHHAQEA_AEAIcgBAQD8AQAhAgAAAAkAIBEAAIIDACACAAAAgAMAIBEAAIEDACAQogEAAP8CADCjAQAAgAMAEKQBAAD_AgAwpQEBAIsCACGmAQEAiwIAIasBQAD-AQAhrAFAAP4BACHAAQEAiwIAIcEBAQCLAgAhwgEBAPwBACHDAQEA_AEAIcQBAQD8AQAhxQFAAJcCACHGAUAAlwIAIccBAQD8AQAhyAEBAPwBACEQogEAAP8CADCjAQAAgAMAEKQBAAD_AgAwpQEBAIsCACGmAQEAiwIAIasBQAD-AQAhrAFAAP4BACHAAQEAiwIAIcEBAQCLAgAhwgEBAPwBACHDAQEA_AEAIcQBAQD8AQAhxQFAAJcCACHGAUAAlwIAIccBAQD8AQAhyAEBAPwBACEMpQEBAKgCACGrAUAAqwIAIawBQACrAgAhwAEBAKgCACHBAQEAqAIAIcIBAQCpAgAhwwEBAKkCACHEAQEAqQIAIcUBQADFAgAhxgFAAMUCACHHAQEAqQIAIcgBAQCpAgAhDKUBAQCoAgAhqwFAAKsCACGsAUAAqwIAIcABAQCoAgAhwQEBAKgCACHCAQEAqQIAIcMBAQCpAgAhxAEBAKkCACHFAUAAxQIAIcYBQADFAgAhxwEBAKkCACHIAQEAqQIAIQylAQEAAAABqwFAAAAAAawBQAAAAAHAAQEAAAABwQEBAAAAAcIBAQAAAAHDAQEAAAABxAEBAAAAAcUBQAAAAAHGAUAAAAABxwEBAAAAAcgBAQAAAAEHpQEBAAAAAasBQAAAAAGsAUAAAAABvwFAAAAAAckBAQAAAAHKAQEAAAABywEBAAAAAQIAAAAFACAYAACPAwAgAwAAAAUAIBgAAI8DACAZAACOAwAgAREAAKgDADAMAwAA_wEAIKIBAACjAgAwowEAAAMAEKQBAACjAgAwpQEBAAAAAaYBAQCLAgAhqwFAAP4BACGsAUAA_gEAIb8BQAD-AQAhyQEBAAAAAcoBAQD8AQAhywEBAPwBACECAAAABQAgEQAAjgMAIAIAAACMAwAgEQAAjQMAIAuiAQAAiwMAMKMBAACMAwAQpAEAAIsDADClAQEAiwIAIaYBAQCLAgAhqwFAAP4BACGsAUAA_gEAIb8BQAD-AQAhyQEBAIsCACHKAQEA_AEAIcsBAQD8AQAhC6IBAACLAwAwowEAAIwDABCkAQAAiwMAMKUBAQCLAgAhpgEBAIsCACGrAUAA_gEAIawBQAD-AQAhvwFAAP4BACHJAQEAiwIAIcoBAQD8AQAhywEBAPwBACEHpQEBAKgCACGrAUAAqwIAIawBQACrAgAhvwFAAKsCACHJAQEAqAIAIcoBAQCpAgAhywEBAKkCACEHpQEBAKgCACGrAUAAqwIAIawBQACrAgAhvwFAAKsCACHJAQEAqAIAIcoBAQCpAgAhywEBAKkCACEHpQEBAAAAAasBQAAAAAGsAUAAAAABvwFAAAAAAckBAQAAAAHKAQEAAAABywEBAAAAAQQYAACEAwAw1wEAAIUDADDZAQAAhwMAIN0BAACIAwAwBBgAAPgCADDXAQAA-QIAMNkBAAD7AgAg3QEAAPwCADADGAAA8wIAINcBAAD0AgAg3QEAANQBACADGAAA7gIAINcBAADvAgAg3QEAAAEAIAMYAADpAgAg1wEAAOoCACDdAQAAvAEAIAMYAADkAgAg1wEAAOUCACDdAQAApAEAIAQYAADYAgAw1wEAANkCADDZAQAA2wIAIN0BAADcAgAwAAAEAwAArgIAIKcBAACkAgAgqAEAAKQCACCqAQAApAIAIAIDAACuAgAgqAEAAKQCACABAwAArgIAIAQDAACuAgAgqAEAAKQCACCqAQAApAIAILkBAACkAgAgAAAAAAUYAACjAwAgGQAApgMAINcBAACkAwAg2AEAAKUDACDdAQAAMAAgAxgAAKMDACDXAQAApAMAIN0BAAAwACAQBAAAkAMAIAUAAJEDACAGAACSAwAgCAAAlAMAIAkAAJUDACAKAACWAwAgpQEBAAAAAasBQAAAAAGsAUAAAAABugEBAAAAAcwBAQAAAAHNASAAAAABzgEBAAAAAc8BAQAAAAHQAQEAAAAB0QFAAAAAAQIAAAAwACAYAACjAwAgAwAAADMAIBgAAKMDACAZAACnAwAgEgAAADMAIAQAANECACAFAADSAgAgBgAA0wIAIAgAANUCACAJAADWAgAgCgAA1wIAIBEAAKcDACClAQEAqAIAIasBQACrAgAhrAFAAKsCACG6AQEAqAIAIcwBAQCoAgAhzQEgANACACHOAQEAqQIAIc8BAQCoAgAh0AEBAKgCACHRAUAAxQIAIRAEAADRAgAgBQAA0gIAIAYAANMCACAIAADVAgAgCQAA1gIAIAoAANcCACClAQEAqAIAIasBQACrAgAhrAFAAKsCACG6AQEAqAIAIcwBAQCoAgAhzQEgANACACHOAQEAqQIAIc8BAQCoAgAh0AEBAKgCACHRAUAAxQIAIQelAQEAAAABqwFAAAAAAawBQAAAAAG_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AKgCACHMAQEAqAIAIc0BIADQAgAhzgEBAKkCACHPAQEAqAIAIdABAQCoAgAh0QFAAMUCACEQBAAA0QIAIAUAANICACAHAADUAgAgCAAA1QIAIAkAANYCACAKAADXAgAgpQEBAKgCACGrAUAAqwIAIawBQACrAgAhugEBAKgCACHMAQEAqAIAIc0BIADQAgAhzgEBAKkCACHPAQEAqAIAIdABAQCoAgAh0QFAAMUCACEBAwACCAQGAwUKBAYMBQcOAQgQBgkSBwoWCAsACQEDAAIBAwACAQMAAgEDAAIBAwACAQMAAgMEFwAFGAAKGQAAAQMAAgEDAAIDCwAOHgAPHwAQAAAAAwsADh4ADx8AEAAAAwsAFR4AFh8AFwAAAAMLABUeABYfABcBAwACAQMAAgMLABweAB0fAB4AAAADCwAcHgAdHwAeAQMAAgEDAAIDCwAjHgAkHwAlAAAAAwsAIx4AJB8AJQAAAAMLACseACwfAC0AAAADCwArHgAsHwAtAQMAAgEDAAIDCwAyHgAzHwA0AAAAAwsAMh4AMx8ANAEDAAIBAwACAwsAOR4AOh8AOwAAAAMLADkeADofADsBAwACAQMAAgMLAEAeAEEfAEIAAAADCwBAHgBBHwBCAQMAAgEDAAIDCwBHHgBIHwBJAAAAAwsARx4ASB8ASQwCAQ0aAQ4cAQ8dARAeARIgARMiChQjCxUlARYnChcoDBopARsqARwrCiAuDSEvESIxAiMyAiQ1AiU2AiY3Aic5Aig7Cik8Eio-AitACixBEy1CAi5DAi9ECjBHFDFIGDJJAzNKAzRLAzVMAzZNAzdPAzhRCjlSGTpUAztWCjxXGj1YAz5ZAz9aCkBdG0FeH0JfBENgBERhBEViBEZjBEdlBEhnCkloIEpqBEtsCkxtIU1uBE5vBE9wClBzIlF0JlJ2J1N3J1R6J1V7J1Z8J1d-J1iAAQpZgQEoWoMBJ1uFAQpchgEpXYcBJ16IASdfiQEKYIwBKmGNAS5ijgEIY48BCGSQAQhlkQEIZpIBCGeUAQholgEKaZcBL2qZAQhrmwEKbJwBMG2dAQhungEIb58BCnCiATFxowE1cqUBB3OmAQd0qAEHdakBB3aqAQd3rAEHeK4BCnmvATZ6sQEHe7MBCny0ATd9tQEHfrYBB3-3AQqAAboBOIEBuwE8ggG9AQaDAb4BBoQBwAEGhQHBAQaGAcIBBocBxAEGiAHGAQqJAccBPYoByQEGiwHLAQqMAcwBPo0BzQEGjgHOAQaPAc8BCpAB0gE_kQHTAUOSAdUBBZMB1gEFlAHYAQWVAdkBBZYB2gEFlwHcAQWYAd4BCpkB3wFEmgHhAQWbAeMBCpwB5AFFnQHlAQWeAeYBBZ8B5wEKoAHqAUahAesBSg"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer } = await import("buffer");
  const wasmArray = Buffer.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// src/generated/prisma/internal/prismaNamespace.ts
import * as runtime2 from "@prisma/client/runtime/client";
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var defineExtension = runtime2.Extensions.defineExtension;

// src/generated/prisma/enums.ts
var AccountStatus = {
  ACTIVE: "ACTIVE",
  DEACTIVATED: "DEACTIVATED",
  BANNED: "BANNED",
  DELETIONPENDING: "DELETIONPENDING",
  DELETED: "DELETED"
};

// src/generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient2 = getPrismaClientClass();

// src/app/module/userProfile/userProfile.service.ts
var createUserProfile = async (payload) => {
  const userProfile = await prisma.user.create({
    data: {
      id: payload.userId,
      name: payload.name,
      email: payload.email,
      bio: payload.bio,
      address: payload.address,
      bloodGroup: payload.bloodGroup,
      gender: payload.gender
    }
  });
  return userProfile;
};
var getUserProfileByUserId = async (userId) => {
  const userProfile = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });
  return userProfile;
};
var updateUserProfile = async (userId, data) => {
  const userProfile = await prisma.user.update({
    where: {
      id: userId
    },
    data
  });
  return userProfile;
};
var deleteUserProfile = async (userId) => {
  await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      accountStatus: AccountStatus.DELETIONPENDING,
      deletedAt: /* @__PURE__ */ new Date()
    }
  });
};
var UserProfileService = {
  createUserProfile,
  getUserProfileByUserId,
  updateUserProfile,
  deleteUserProfile
};

// src/app/module/userProfile/userProfile.controller.ts
var createUserProfile2 = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await UserProfileService.createUserProfile(payload);
  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "User profile created successfully",
    data: result
  });
});
var getUserProfileByUserId2 = catchAsync(
  async (req, res) => {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    console.log("req.params.userId", req.params.userId);
    const result = await UserProfileService.getUserProfileByUserId(userId);
    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "User profile retrieved successfully",
      data: result
    });
  }
);
var updateUserProfile2 = catchAsync(async (req, res) => {
  const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const payload = req.body;
  const result = await UserProfileService.updateUserProfile(userId, payload);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "User profile updated successfully",
    data: result
  });
});
var deleteUserProfile2 = catchAsync(async (req, res) => {
  const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  await UserProfileService.deleteUserProfile(userId);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "User profile deleted successfully"
  });
});
var UserProfileController = {
  createUserProfile: createUserProfile2,
  getUserProfileByUserId: getUserProfileByUserId2,
  updateUserProfile: updateUserProfile2,
  deleteUserProfile: deleteUserProfile2
};

// src/app/module/userProfile/userProfile.validation.ts
import { z as z2 } from "zod";
import { BloodGroup } from "@prisma/client";
var bloodGroupSchema = z2.nativeEnum(BloodGroup, {
  message: "Invalid blood group"
});
var createUserProfileSchema = z2.object({
  body: z2.object({
    userId: z2.string({ message: "User ID is required" }),
    name: z2.string().trim().optional(),
    image: z2.string().trim().nullable().optional().or(z2.literal("")),
    bio: z2.string().trim().max(500, "Bio must not exceed 500 characters").optional(),
    address: z2.string().trim().max(255, "Address must not exceed 255 characters").optional(),
    contactNo: z2.string().trim().regex(
      /^(?:\+8801|01)[3-9]\d{8}$/,
      "Invalid contact number, must be a valid Bangladeshi number starting with +8801 or 01 followed by 3-9 and 8 digits"
    ).optional(),
    location: z2.string().trim().max(255, "Location must not exceed 255 characters").optional(),
    bloodGroup: bloodGroupSchema.optional(),
    gender: z2.string().trim().transform((val) => val.charAt(0).toUpperCase() + val.slice(1).toLowerCase()).refine(
      (val) => ["Male", "Female", "Others"].includes(val),
      { message: "Gender must be Male, Female, or Others" }
    ).optional()
  })
});
var updateUserProfileSchema = z2.object({
  body: z2.object({
    name: z2.string().trim().optional(),
    image: z2.string().trim().nullable().optional().or(z2.literal("")),
    bio: z2.string().trim().max(500, "Bio must not exceed 500 characters").optional(),
    address: z2.string().trim().max(255, "Address must not exceed 255 characters").optional(),
    bloodGroup: bloodGroupSchema.optional(),
    contactNo: z2.string().trim().regex(
      /^(?:\+8801|01)[3-9]\d{8}$/,
      "Invalid contact number, must be a valid Bangladeshi number starting with +8801 or 01 followed by 3-9 and 8 digits"
    ).optional(),
    location: z2.string().trim().max(255, "Location must not exceed 255 characters").optional(),
    gender: z2.string().trim().transform((val) => val.charAt(0).toUpperCase() + val.slice(1).toLowerCase()).refine(
      (val) => ["Male", "Female", "Others"].includes(val),
      { message: "Gender must be Male, Female, or Others" }
    ).optional()
  }).refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided for update"
  )
});
var UserProfileValidation = {
  createUserProfileSchema,
  updateUserProfileSchema
};

// src/app/module/userProfile/userProfile.route.ts
var router2 = Router2();
router2.post(
  "/",
  validateRequest(UserProfileValidation.createUserProfileSchema),
  UserProfileController.createUserProfile
);
router2.get("/:userId", UserProfileController.getUserProfileByUserId);
router2.put(
  "/:userId",
  validateRequest(UserProfileValidation.updateUserProfileSchema),
  UserProfileController.updateUserProfile
);
router2.delete("/:userId", UserProfileController.deleteUserProfile);
var UserProfileRoute = router2;

// src/app/module/securityPersonnelProfile/securityPersonnelProfile.route.ts
import { Router as Router3 } from "express";

// src/app/module/securityPersonnelProfile/securityPersonnelProfile.service.ts
var createSecurityPersonnelProfile = async (payload) => {
  const profile = await prisma.securityPersonnelProfile.create({
    data: {
      id: payload.userId,
      userId: payload.userId,
      address: payload.address,
      rank: payload.rank,
      bloodGroup: payload.bloodGroup
    }
  });
  return profile;
};
var getSecurityPersonnelProfileByUserId = async (userId) => {
  const profile = await prisma.securityPersonnelProfile.findUnique({
    where: {
      userId
    }
  });
  return profile;
};
var updateSecurityPersonnelProfile = async (userId, data) => {
  const profile = await prisma.securityPersonnelProfile.update({
    where: {
      userId
    },
    data
  });
  return profile;
};
var deleteSecurityPersonnelProfile = async (userId) => {
  await prisma.securityPersonnelProfile.delete({
    where: {
      userId
    }
  });
};
var SecurityPersonnelProfileService = {
  createSecurityPersonnelProfile,
  getSecurityPersonnelProfileByUserId,
  updateSecurityPersonnelProfile,
  deleteSecurityPersonnelProfile
};

// src/app/module/securityPersonnelProfile/securityPersonnelProfile.controller.ts
var createSecurityPersonnelProfile2 = catchAsync(
  async (req, res) => {
    const payload = req.body;
    const result = await SecurityPersonnelProfileService.createSecurityPersonnelProfile(
      payload
    );
    sendResponse(res, {
      httpStatusCode: 201,
      success: true,
      message: "Security personnel profile created successfully",
      data: result
    });
  }
);
var getSecurityPersonnelProfileByUserId2 = catchAsync(
  async (req, res) => {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    const result = await SecurityPersonnelProfileService.getSecurityPersonnelProfileByUserId(
      userId
    );
    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Security personnel profile retrieved successfully",
      data: result
    });
  }
);
var updateSecurityPersonnelProfile2 = catchAsync(
  async (req, res) => {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    const payload = req.body;
    const result = await SecurityPersonnelProfileService.updateSecurityPersonnelProfile(
      userId,
      payload
    );
    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Security personnel profile updated successfully",
      data: result
    });
  }
);
var deleteSecurityPersonnelProfile2 = catchAsync(
  async (req, res) => {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    await SecurityPersonnelProfileService.deleteSecurityPersonnelProfile(userId);
    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Security personnel profile deleted successfully"
    });
  }
);
var SecurityPersonnelProfileController = {
  createSecurityPersonnelProfile: createSecurityPersonnelProfile2,
  getSecurityPersonnelProfileByUserId: getSecurityPersonnelProfileByUserId2,
  updateSecurityPersonnelProfile: updateSecurityPersonnelProfile2,
  deleteSecurityPersonnelProfile: deleteSecurityPersonnelProfile2
};

// src/app/module/securityPersonnelProfile/securityPersonnelProfile.validation.ts
import { z as z3 } from "zod";
import { BloodGroup as BloodGroup2, PoliceRank } from "@prisma/client";
var bloodGroupSchema2 = z3.nativeEnum(BloodGroup2, {
  message: "Invalid blood group"
});
var rankSchema = z3.nativeEnum(PoliceRank, {
  message: "Invalid police rank"
});
var createSecurityPersonnelProfileSchema = z3.object({
  body: z3.object({
    userId: z3.string({ message: "User ID is required" }),
    address: z3.string().trim().max(255, "Address must not exceed 255 characters").optional(),
    rank: rankSchema.optional(),
    bloodGroup: bloodGroupSchema2.optional()
  })
});
var updateSecurityPersonnelProfileSchema = z3.object({
  body: z3.object({
    address: z3.string().trim().max(255, "Address must not exceed 255 characters").optional(),
    rank: rankSchema.optional(),
    bloodGroup: bloodGroupSchema2.optional()
  }).refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided for update"
  )
});
var SecurityPersonnelProfileValidation = {
  createSecurityPersonnelProfileSchema,
  updateSecurityPersonnelProfileSchema
};

// src/app/module/securityPersonnelProfile/securityPersonnelProfile.route.ts
var router3 = Router3();
router3.post(
  "/",
  validateRequest(
    SecurityPersonnelProfileValidation.createSecurityPersonnelProfileSchema
  ),
  SecurityPersonnelProfileController.createSecurityPersonnelProfile
);
router3.get(
  "/user/:userId",
  SecurityPersonnelProfileController.getSecurityPersonnelProfileByUserId
);
router3.put(
  "/user/:userId",
  validateRequest(
    SecurityPersonnelProfileValidation.updateSecurityPersonnelProfileSchema
  ),
  SecurityPersonnelProfileController.updateSecurityPersonnelProfile
);
router3.delete(
  "/user/:userId",
  SecurityPersonnelProfileController.deleteSecurityPersonnelProfile
);
var SecurityPersonnelProfileRoute = router3;

// src/app/module/adminProfile/adminProfile.route.ts
import { Router as Router4 } from "express";

// src/app/module/adminProfile/adminProfile.service.ts
var createAdminProfile = async (payload) => {
  const profile = await prisma.adminProfile.create({
    data: {
      id: payload.userId,
      userId: payload.userId,
      address: payload.address
    }
  });
  return profile;
};
var getAdminProfileByUserId = async (userId) => {
  const profile = await prisma.adminProfile.findUnique({
    where: {
      userId
    }
  });
  return profile;
};
var updateAdminProfile = async (userId, data) => {
  const profile = await prisma.adminProfile.update({
    where: {
      userId
    },
    data
  });
  return profile;
};
var deleteAdminProfile = async (userId) => {
  await prisma.adminProfile.delete({
    where: {
      userId
    }
  });
};
var AdminProfileService = {
  createAdminProfile,
  getAdminProfileByUserId,
  updateAdminProfile,
  deleteAdminProfile
};

// src/app/module/adminProfile/adminProfile.controller.ts
var createAdminProfile2 = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await AdminProfileService.createAdminProfile(payload);
  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "Admin profile created successfully",
    data: result
  });
});
var getAdminProfileByUserId2 = catchAsync(
  async (req, res) => {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    const result = await AdminProfileService.getAdminProfileByUserId(userId);
    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Admin profile retrieved successfully",
      data: result
    });
  }
);
var updateAdminProfile2 = catchAsync(async (req, res) => {
  const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const payload = req.body;
  const result = await AdminProfileService.updateAdminProfile(userId, payload);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Admin profile updated successfully",
    data: result
  });
});
var deleteAdminProfile2 = catchAsync(async (req, res) => {
  const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  await AdminProfileService.deleteAdminProfile(userId);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Admin profile deleted successfully"
  });
});
var AdminProfileController = {
  createAdminProfile: createAdminProfile2,
  getAdminProfileByUserId: getAdminProfileByUserId2,
  updateAdminProfile: updateAdminProfile2,
  deleteAdminProfile: deleteAdminProfile2
};

// src/app/module/adminProfile/adminProfile.validation.ts
import { z as z4 } from "zod";
var createAdminProfileSchema = z4.object({
  body: z4.object({
    userId: z4.string({ message: "User ID is required" }),
    address: z4.string().trim().max(255, "Address must not exceed 255 characters").optional()
  })
});
var updateAdminProfileSchema = z4.object({
  body: z4.object({
    address: z4.string().trim().max(255, "Address must not exceed 255 characters").optional()
  }).refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided for update"
  )
});
var AdminProfileValidation = {
  createAdminProfileSchema,
  updateAdminProfileSchema
};

// src/app/module/adminProfile/adminProfile.route.ts
var router4 = Router4();
router4.post(
  "/",
  validateRequest(AdminProfileValidation.createAdminProfileSchema),
  AdminProfileController.createAdminProfile
);
router4.get("/user/:userId", AdminProfileController.getAdminProfileByUserId);
router4.put(
  "/user/:userId",
  validateRequest(AdminProfileValidation.updateAdminProfileSchema),
  AdminProfileController.updateAdminProfile
);
router4.delete("/user/:userId", AdminProfileController.deleteAdminProfile);
var AdminProfileRoute = router4;

// src/app/module/superAdminProfile/superAdminProfile.route.ts
import { Router as Router5 } from "express";

// src/app/module/superAdminProfile/superAdminProfile.service.ts
var createSuperAdminProfile = async (payload) => {
  const profile = await prisma.superAdminProfile.create({
    data: {
      id: payload.userId,
      userId: payload.userId
    }
  });
  return profile;
};
var getSuperAdminProfileByUserId = async (userId) => {
  const profile = await prisma.superAdminProfile.findUnique({
    where: {
      userId
    }
  });
  return profile;
};
var updateSuperAdminProfile = async (userId, data) => {
  const profile = await prisma.superAdminProfile.update({
    where: {
      userId
    },
    data
  });
  return profile;
};
var deleteSuperAdminProfile = async (userId) => {
  await prisma.superAdminProfile.delete({
    where: {
      userId
    }
  });
};
var SuperAdminProfileService = {
  createSuperAdminProfile,
  getSuperAdminProfileByUserId,
  updateSuperAdminProfile,
  deleteSuperAdminProfile
};

// src/app/module/superAdminProfile/superAdminProfile.controller.ts
var createSuperAdminProfile2 = catchAsync(
  async (req, res) => {
    const payload = req.body;
    const result = await SuperAdminProfileService.createSuperAdminProfile(payload);
    sendResponse(res, {
      httpStatusCode: 201,
      success: true,
      message: "Super admin profile created successfully",
      data: result
    });
  }
);
var getSuperAdminProfileByUserId2 = catchAsync(
  async (req, res) => {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    const result = await SuperAdminProfileService.getSuperAdminProfileByUserId(userId);
    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Super admin profile retrieved successfully",
      data: result
    });
  }
);
var updateSuperAdminProfile2 = catchAsync(
  async (req, res) => {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    const payload = req.body;
    const result = await SuperAdminProfileService.updateSuperAdminProfile(
      userId,
      payload
    );
    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Super admin profile updated successfully",
      data: result
    });
  }
);
var deleteSuperAdminProfile2 = catchAsync(
  async (req, res) => {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    await SuperAdminProfileService.deleteSuperAdminProfile(userId);
    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Super admin profile deleted successfully"
    });
  }
);
var SuperAdminProfileController = {
  createSuperAdminProfile: createSuperAdminProfile2,
  getSuperAdminProfileByUserId: getSuperAdminProfileByUserId2,
  updateSuperAdminProfile: updateSuperAdminProfile2,
  deleteSuperAdminProfile: deleteSuperAdminProfile2
};

// src/app/module/superAdminProfile/superAdminProfile.validation.ts
import { z as z5 } from "zod";
var createSuperAdminProfileSchema = z5.object({
  body: z5.object({
    userId: z5.string({ message: "User ID is required" })
  })
});
var updateSuperAdminProfileSchema = z5.object({
  body: z5.object({}).refine(
    (data) => Object.keys(data).length > 0,
    "No updatable fields available"
  )
});
var SuperAdminProfileValidation = {
  createSuperAdminProfileSchema,
  updateSuperAdminProfileSchema
};

// src/app/module/superAdminProfile/superAdminProfile.route.ts
var router5 = Router5();
router5.post(
  "/",
  validateRequest(SuperAdminProfileValidation.createSuperAdminProfileSchema),
  SuperAdminProfileController.createSuperAdminProfile
);
router5.get(
  "/user/:userId",
  SuperAdminProfileController.getSuperAdminProfileByUserId
);
router5.put(
  "/user/:userId",
  validateRequest(SuperAdminProfileValidation.updateSuperAdminProfileSchema),
  SuperAdminProfileController.updateSuperAdminProfile
);
router5.delete(
  "/user/:userId",
  SuperAdminProfileController.deleteSuperAdminProfile
);
var SuperAdminProfileRoute = router5;

// src/app/module/incidentReporting/incidentReporting.route.ts
import { Router as Router6 } from "express";

// src/app/module/incidentReporting/incidentReporting.service.ts
var createIncident = async (payload) => {
  const incident = await prisma.incident.create({
    data: {
      userId: payload.userId,
      title: payload.title || "SOS Emergency",
      description: payload.description,
      latitude: payload.latitude,
      longitude: payload.longitude,
      severityLevel: payload.severityLevel,
      timing: payload.timing,
      victim: payload.victim,
      attackers: payload.attackers,
      deathToll: payload.deathToll ?? 0,
      injuryCount: payload.injuryCount ?? 0,
      peopleHelped: payload.peopleHelped ?? 0,
      stories: payload.stories ?? [],
      reportedAt: /* @__PURE__ */ new Date()
    }
  });
  return incident;
};
var getAllIncidents = async (limit, offset) => {
  const incidents = await prisma.incident.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
  return incidents;
};
var getIncidentById = async (id) => {
  const incident = await prisma.incident.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
  return incident;
};
var getIncidentsByUserId = async (userId) => {
  const incidents = await prisma.incident.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });
  return incidents;
};
var updateIncident = async (id, data) => {
  const incident = await prisma.incident.update({
    where: { id },
    data
  });
  return incident;
};
var deleteIncident = async (id) => {
  await prisma.incident.delete({
    where: { id }
  });
};
var IncidentReportingService = {
  createIncident,
  getAllIncidents,
  getIncidentById,
  getIncidentsByUserId,
  updateIncident,
  deleteIncident
};

// src/app/utills/pushNotification.ts
async function sendPushNotification(expoPushToken, title, body, data) {
  if (!expoPushToken || !expoPushToken.startsWith("ExponentPushToken")) {
    console.warn("[Push Notification] Invalid or missing token:", expoPushToken);
    return null;
  }
  try {
    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        to: expoPushToken,
        title,
        body,
        data
      })
    });
    const result = await res.json();
    console.log("[Push Notification] Send response:", JSON.stringify(result));
    return result;
  } catch (error) {
    console.error("[Push Notification] Error sending push notification:", error);
    throw error;
  }
}

// src/app/module/incidentReporting/incidentReporting.controller.ts
function getDistanceInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
var createIncident2 = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await IncidentReportingService.createIncident(payload);
  if (result.severityLevel === "critical" || result.severityLevel === "high") {
    try {
      const otherUsers = await prisma.user.findMany({
        where: {
          id: { not: result.userId },
          pushToken: { not: null },
          location: { not: null }
        },
        select: { id: true, name: true, pushToken: true, location: true }
      });
      for (const otherUser of otherUsers) {
        if (!otherUser.location || !otherUser.pushToken) continue;
        try {
          let latitude;
          let longitude;
          try {
            const userLoc = JSON.parse(otherUser.location);
            if (userLoc && typeof userLoc.latitude === "number" && typeof userLoc.longitude === "number") {
              latitude = userLoc.latitude;
              longitude = userLoc.longitude;
            } else if (userLoc && typeof userLoc.latitude === "string" && typeof userLoc.longitude === "string") {
              latitude = parseFloat(userLoc.latitude);
              longitude = parseFloat(userLoc.longitude);
            }
          } catch {
            const parts = otherUser.location.split(",");
            if (parts.length === 2) {
              const lat = parseFloat(parts[0]);
              const lng = parseFloat(parts[1]);
              if (!isNaN(lat) && !isNaN(lng)) {
                latitude = lat;
                longitude = lng;
              }
            }
          }
          if (latitude === void 0 || longitude === void 0 || isNaN(latitude) || isNaN(longitude)) {
            continue;
          }
          const distance = getDistanceInKm(
            result.latitude,
            result.longitude,
            latitude,
            longitude
          );
          if (distance <= 1) {
            await sendPushNotification(
              otherUser.pushToken,
              "\u{1F6A8} Someone is in danger near you!",
              `Emergency SOS triggered nearby. Tap to help.`,
              {
                type: "sos_alert",
                incidentId: result.id,
                latitude: result.latitude,
                longitude: result.longitude
              }
            );
            console.log(`[Incident Alert] Sent nearby alert to ${otherUser.name} for SOS ${result.id}`);
          }
        } catch (err) {
          console.error(`[Incident Alert] Failed to parse/send alert to user ${otherUser.id}:`, err);
        }
      }
    } catch (err) {
      console.error("[Incident Alert] General error fetching users for SOS alert:", err);
    }
  }
  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "Incident reported successfully",
    data: result
  });
});
var getAllIncidents2 = catchAsync(async (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : void 0;
  const offset = req.query.offset ? Number(req.query.offset) : void 0;
  const result = await IncidentReportingService.getAllIncidents(limit, offset);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Incidents retrieved successfully",
    data: result
  });
});
var getIncidentById2 = catchAsync(async (req, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const result = await IncidentReportingService.getIncidentById(id);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Incident retrieved successfully",
    data: result
  });
});
var getIncidentsByUserId2 = catchAsync(
  async (req, res) => {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    const result = await IncidentReportingService.getIncidentsByUserId(userId);
    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Incidents retrieved successfully",
      data: result
    });
  }
);
var updateIncident2 = catchAsync(async (req, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const payload = req.body;
  const result = await IncidentReportingService.updateIncident(id, payload);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Incident updated successfully",
    data: result
  });
});
var deleteIncident2 = catchAsync(async (req, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await IncidentReportingService.deleteIncident(id);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Incident deleted successfully"
  });
});
var IncidentReportingController = {
  createIncident: createIncident2,
  getAllIncidents: getAllIncidents2,
  getIncidentById: getIncidentById2,
  getIncidentsByUserId: getIncidentsByUserId2,
  updateIncident: updateIncident2,
  deleteIncident: deleteIncident2
};

// src/app/module/incidentReporting/incidentReporting.validation.ts
import { z as z6 } from "zod";
var createIncidentSchema = z6.object({
  body: z6.object({
    userId: z6.string({ message: "User ID is required" }),
    title: z6.string().trim().max(200, "Title must not exceed 200 characters").optional(),
    description: z6.string().trim().max(2e3, "Description must not exceed 2000 characters").optional(),
    latitude: z6.number({ message: "Latitude is required" }).min(-90, "Latitude must be between -90 and 90").max(90, "Latitude must be between -90 and 90"),
    longitude: z6.number({ message: "Longitude is required" }).min(-180, "Longitude must be between -180 and 180").max(180, "Longitude must be between -180 and 180"),
    severityLevel: z6.string().trim().optional(),
    timing: z6.string({ message: "Timing is required" }).trim().min(1, "Timing must not be empty"),
    victim: z6.string().trim().optional(),
    attackers: z6.string().trim().optional(),
    deathToll: z6.number().int().min(0).optional(),
    injuryCount: z6.number().int().min(0).optional(),
    peopleHelped: z6.number().int().min(0).optional(),
    stories: z6.array(z6.string()).optional()
  })
});
var updateIncidentSchema = z6.object({
  body: z6.object({
    title: z6.string().trim().min(1, "Title must not be empty").max(200, "Title must not exceed 200 characters").optional(),
    description: z6.string().trim().max(2e3, "Description must not exceed 2000 characters").optional(),
    latitude: z6.number().min(-90, "Latitude must be between -90 and 90").max(90, "Latitude must be between -90 and 90").optional(),
    longitude: z6.number().min(-180, "Longitude must be between -180 and 180").max(180, "Longitude must be between -180 and 180").optional(),
    severityLevel: z6.string().trim().optional(),
    timing: z6.string().trim().optional(),
    status: z6.string().trim().optional(),
    victim: z6.string().trim().optional(),
    attackers: z6.string().trim().optional(),
    deathToll: z6.number().int().min(0).optional(),
    injuryCount: z6.number().int().min(0).optional(),
    peopleHelped: z6.number().int().min(0).optional(),
    stories: z6.array(z6.string()).optional()
  }).refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided for update"
  )
});
var IncidentReportingValidation = {
  createIncidentSchema,
  updateIncidentSchema
};

// src/app/module/incidentReporting/incidentReporting.route.ts
var router6 = Router6();
router6.post(
  "/",
  validateRequest(IncidentReportingValidation.createIncidentSchema),
  IncidentReportingController.createIncident
);
router6.get("/", IncidentReportingController.getAllIncidents);
router6.get("/user/:userId", IncidentReportingController.getIncidentsByUserId);
router6.get("/:id", IncidentReportingController.getIncidentById);
router6.put(
  "/:id",
  validateRequest(IncidentReportingValidation.updateIncidentSchema),
  IncidentReportingController.updateIncident
);
router6.delete("/:id", IncidentReportingController.deleteIncident);
var IncidentReportingRoute = router6;

// src/app/module/location/location.route.ts
import { Router as Router7 } from "express";

// src/app/module/location/location.controller.ts
var notificationCooldowns = /* @__PURE__ */ new Map();
function getDistanceInKm2(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad2(lat2 - lat1);
  const dLon = deg2rad2(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad2(lat1)) * Math.cos(deg2rad2(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function deg2rad2(deg) {
  return deg * (Math.PI / 180);
}
var LocationController = {
  // Update user's live location and check danger zones
  updateLocation: async (req, res) => {
    try {
      const { userId, latitude, longitude } = req.body;
      if (!userId || latitude === void 0 || longitude === void 0) {
        res.status(400).json({
          success: false,
          message: "userId, latitude, and longitude are required."
        });
        return;
      }
      const locationData = JSON.stringify({
        latitude,
        longitude,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      const user = await prisma.user.update({
        where: { id: userId },
        data: { location: locationData },
        select: { id: true, name: true, pushToken: true }
      });
      const activeIncidents = await prisma.incident.findMany({
        where: {
          status: { not: "resolved" },
          severityLevel: { in: ["high", "critical"] }
        }
      });
      const triggeredAlerts = [];
      for (const incident of activeIncidents) {
        if (incident.userId === userId) continue;
        const distance = getDistanceInKm2(latitude, longitude, incident.latitude, incident.longitude);
        if (distance <= 0.5) {
          const cooldownKey = `${userId}_${incident.id}`;
          const lastNotified = notificationCooldowns.get(cooldownKey) || 0;
          const isCooldownActive = Date.now() - lastNotified < 5 * 60 * 1e3;
          if (!isCooldownActive) {
            notificationCooldowns.set(cooldownKey, Date.now());
            if (user.pushToken) {
              try {
                await sendPushNotification(
                  user.pushToken,
                  "\u26A0\uFE0F Danger Zone Alert",
                  `You are near a ${incident.severityLevel || "critical"} danger zone: "${incident.title}". Stay alert!`,
                  {
                    type: "danger_zone",
                    incidentId: incident.id,
                    latitude: incident.latitude,
                    longitude: incident.longitude
                  }
                );
                console.log(`[LocationController] Sent danger alert to ${user.name} for incident ${incident.id}`);
              } catch (pushErr) {
                console.error("[LocationController] Failed to send push:", pushErr);
              }
            }
            triggeredAlerts.push(incident);
          }
        }
      }
      res.status(200).json({
        success: true,
        message: "Location updated successfully.",
        data: {
          alertsSent: triggeredAlerts.map((inc) => inc.id)
        }
      });
    } catch (error) {
      console.error("[LocationController] Error updating location:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to update location."
      });
    }
  },
  // Register push token for a user
  updatePushToken: async (req, res) => {
    try {
      const { userId, pushToken } = req.body;
      if (!userId || !pushToken) {
        res.status(400).json({
          success: false,
          message: "userId and pushToken are required."
        });
        return;
      }
      await prisma.user.update({
        where: { id: userId },
        data: { pushToken }
      });
      console.log(`[LocationController] Registered push token for user ${userId}`);
      res.status(200).json({
        success: true,
        message: "Push token registered successfully."
      });
    } catch (error) {
      console.error("[LocationController] Error updating push token:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to register push token."
      });
    }
  }
};

// src/app/module/location/location.route.ts
var router7 = Router7();
router7.post("/location", LocationController.updateLocation);
router7.post("/push-token", LocationController.updatePushToken);
var LocationRoute = router7;

// src/app/module/responder/responder.route.ts
import { Router as Router8 } from "express";

// src/app/websocket.ts
import { WebSocketServer, WebSocket } from "ws";
var rooms = /* @__PURE__ */ new Map();
function broadcastRoomUpdate(incidentId) {
  const room = rooms.get(incidentId);
  if (!room) return;
  const activeUsers = Array.from(room).map((c) => ({
    userId: c.userId,
    name: c.name,
    role: c.role,
    lat: c.lat,
    lng: c.lng
  }));
  const message = JSON.stringify({
    type: "sos_state",
    data: {
      incidentId,
      users: activeUsers,
      totalResponders: activeUsers.filter((u) => u.role === "responder").length
    }
  });
  for (const client of room) {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  }
}

// src/app/module/responder/responder.controller.ts
var ResponderController = {
  respondToIncident: async (req, res) => {
    try {
      const { id: incidentId } = req.params;
      const { responderId } = req.body;
      if (!incidentId || !responderId) {
        res.status(400).json({
          success: false,
          message: "incidentId and responderId are required."
        });
        return;
      }
      const existing = await prisma.incidentResponder.findFirst({
        where: { incidentId, responderId }
      });
      let responderRecord;
      if (existing) {
        responderRecord = await prisma.incidentResponder.update({
          where: { id: existing.id },
          data: { status: "coming", respondedAt: /* @__PURE__ */ new Date() },
          include: {
            responder: {
              select: { id: true, name: true }
            }
          }
        });
      } else {
        responderRecord = await prisma.incidentResponder.create({
          data: {
            incidentId,
            responderId,
            status: "coming",
            respondedAt: /* @__PURE__ */ new Date()
          },
          include: {
            responder: {
              select: { id: true, name: true }
            }
          }
        });
      }
      const incident = await prisma.incident.findUnique({
        where: { id: incidentId },
        include: {
          user: {
            select: { id: true, name: true, pushToken: true }
          }
        }
      });
      if (incident && incident.user && incident.user.pushToken) {
        try {
          await sendPushNotification(
            incident.user.pushToken,
            "Help is on the way!",
            `${responderRecord.responder.name} is coming to help you.`,
            {
              type: "help_coming",
              incidentId,
              responderId: responderRecord.responder.id,
              responderName: responderRecord.responder.name
            }
          );
          console.log(`[ResponderController] Push notification sent to victim ${incident.user.name}`);
        } catch (pushErr) {
          console.error("[ResponderController] Push notification failed:", pushErr);
        }
      }
      broadcastRoomUpdate(incidentId);
      res.status(200).json({
        success: true,
        message: "Responded to emergency successfully.",
        data: responderRecord
      });
    } catch (error) {
      console.error("[ResponderController] Error responding to incident:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to respond to incident."
      });
    }
  }
};

// src/app/module/responder/responder.route.ts
var router8 = Router8();
router8.post("/:id/respond", ResponderController.respondToIncident);
var ResponderRoute = router8;

// src/app/routes/index.ts
var router9 = Router9();
router9.use("/emergency-contact", EmergencyContactRoute);
router9.use("/user", UserProfileRoute);
router9.use("/security-personnel-profile", SecurityPersonnelProfileRoute);
router9.use("/admin-profile", AdminProfileRoute);
router9.use("/super-admin-profile", SuperAdminProfileRoute);
router9.use("/incidents", IncidentReportingRoute);
router9.use("/user", LocationRoute);
router9.use("/incidents", ResponderRoute);
var IndexRouters = router9;

// src/app/module/auth/auth.route.ts
import { Router as Router10 } from "express";

// src/app/module/auth/auth.service.ts
import { AccountStatus as AccountStatus3 } from "@prisma/client";

// src/app/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { AccountStatus as AccountStatus2, Role } from "@prisma/client";
import { bearer } from "better-auth/plugins";
var auth = betterAuth({
  basePath: "/api/v1/auth",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5000",
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  plugins: [
    bearer()
  ],
  emailAndPassword: {
    enabled: true
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"]
    }
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }
  },
  trustedOrigins: [
    "safetify://",
    process.env.BETTER_AUTH_URL || "http://localhost:5000"
  ],
  session: {
    cookieCache: {
      enabled: false
    }
  },
  secret: process.env.BETTER_AUTH_SECRET,
  advanced: {
    cookiePrefix: "better-auth",
    useSecureCookies: process.env.NODE_ENV === "production" || !!process.env.BETTER_AUTH_URL?.includes("ngrok-free.dev"),
    crossSubDomainCookies: {
      enabled: false
    },
    disableCSRFCheck: true,
    generateSessionToken: void 0,
    defaultCookieAttributes: {
      sameSite: process.env.NODE_ENV === "production" || !!process.env.BETTER_AUTH_URL?.includes("ngrok-free.dev") ? "none" : "lax",
      secure: process.env.NODE_ENV === "production" || !!process.env.BETTER_AUTH_URL?.includes("ngrok-free.dev"),
      httpOnly: true,
      path: "/"
    }
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: Role.USER
      },
      contactNo: {
        type: "string",
        required: false,
        defaultValue: null
      },
      bio: {
        type: "string",
        required: false,
        defaultValue: "Safetify User"
      },
      address: {
        type: "string",
        required: false,
        defaultValue: null
      },
      bloodGroup: {
        type: "string",
        required: false,
        defaultValue: null
      },
      accountStatus: {
        type: "string",
        required: true,
        defaultValue: AccountStatus2.ACTIVE
      },
      deletedAt: {
        type: "date",
        required: false,
        defaultValue: null
      },
      location: {
        type: "string",
        required: false,
        defaultValue: null
      },
      gender: {
        type: "string",
        required: false,
        defaultValue: null
      }
    }
  }
});

// src/app/module/auth/auth.service.ts
var registerUser = async (payload) => {
  const { name, email, password } = payload;
  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password
      // role: Role.USER,
      // accountStatus: AccountStatus.ACTIVE
    }
  });
  if (!data.user) {
    throw new Error("Failed to register user");
  }
  console.log("Registration data:", data);
  return data;
};
var loginUser = async (payload) => {
  const { email, password } = payload;
  const data = await auth.api.signInEmail({
    body: {
      email,
      password
    }
  });
  if (!data.user) {
    throw new Error("Failed to login user");
  }
  if (data.user.accountStatus === AccountStatus3.DELETED) {
    throw new Error("User account has been deleted");
  }
  if (data.user.accountStatus === AccountStatus3.BANNED) {
    throw new Error("User account has been banned");
  }
  if (data.user.accountStatus === AccountStatus3.DEACTIVATED) {
    throw new Error("User account has been deactivated");
  }
  if (data.user.accountStatus === AccountStatus3.DELETIONPENDING) {
    throw new Error("User account deletion is pending");
  }
  console.log("Login data:", data);
  return data;
};
var AuthService = {
  registerUser,
  loginUser
};

// src/app/module/auth/auth.controller.ts
var registerUser2 = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await AuthService.registerUser(payload);
  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "User registered successfully",
    data: result
  });
});
var loginUser2 = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await AuthService.loginUser(payload);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "User logged in successfully",
    data: result
  });
});
var AuthController = {
  registerUser: registerUser2,
  loginUser: loginUser2
};

// src/app/module/auth/auth.validation.ts
import { z as z7 } from "zod";
var passwordSchema = z7.string("Password is required").min(8, "Password must be at least 8 characters long").max(64, "Password must not exceed 64 characters").regex(/[A-Z]/, "Password must contain at least one uppercase letter").regex(/[a-z]/, "Password must contain at least one lowercase letter").regex(/[0-9]/, "Password must contain at least one number").regex(
  /[^A-Za-z0-9]/,
  "Password must contain at least one special character"
);
var emailSchema = z7.email("Please provide a valid email address").toLowerCase().trim();
var registerSchema = z7.object({
  body: z7.object({
    name: z7.string("Name is required").trim().min(2, "Name must be at least 2 characters long").max(60, "Name must not exceed 60 characters").regex(
      /^[a-zA-Z\s'-]+$/,
      "Name must only contain letters, spaces, hyphens or apostrophes"
    ),
    email: emailSchema,
    password: passwordSchema
  })
});
var loginSchema = z7.object({
  body: z7.object({
    email: emailSchema,
    password: z7.string("Password is required").min(1, "Password is required")
  })
});
var changePasswordSchema = z7.object({
  body: z7.object({
    currentPassword: z7.string("Current password is required").min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmNewPassword: z7.string("Please confirm your new password").min(1, "Please confirm your new password")
  })
}).refine((data) => data.body.newPassword === data.body.confirmNewPassword, {
  message: "Passwords do not match",
  path: ["body", "confirmNewPassword"]
}).refine((data) => data.body.currentPassword !== data.body.newPassword, {
  message: "New password must be different from the current password",
  path: ["body", "newPassword"]
});
var forgotPasswordSchema = z7.object({
  body: z7.object({
    email: emailSchema
  })
});
var resetPasswordSchema = z7.object({
  body: z7.object({
    token: z7.string("Reset token is required").min(1, "Reset token is required"),
    newPassword: passwordSchema,
    confirmNewPassword: z7.string("Please confirm your new password").min(1, "Please confirm your new password")
  })
}).refine((data) => data.body.newPassword === data.body.confirmNewPassword, {
  message: "Passwords do not match",
  path: ["body", "confirmNewPassword"]
});
var verifyEmailSchema = z7.object({
  body: z7.object({
    token: z7.string("Verification token is required").min(1, "Verification token is required")
  })
});
var refreshTokenSchema = z7.object({
  cookies: z7.object({
    refreshToken: z7.string("Refresh token is required").min(1, "Refresh token is required")
  })
});
var AuthValidation = {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  refreshTokenSchema
};

// src/app/module/auth/auth.route.ts
var router10 = Router10();
router10.post("/register", validateRequest(AuthValidation.registerSchema), AuthController.registerUser);
router10.post("/login", validateRequest(AuthValidation.loginSchema), AuthController.loginUser);
router10.get("/social-login", catchAsync(async (req, res) => {
  const provider = req.query.provider;
  const callbackURL = req.query.callbackURL;
  if (!provider || !callbackURL) {
    res.status(400).json({ success: false, message: "provider and callbackURL are required" });
    return;
  }
  const authRes = await auth.api.signInSocial({
    body: {
      provider,
      callbackURL
    },
    asResponse: true,
    headers: req.headers
  });
  const setCookies = authRes.headers.getSetCookie ? authRes.headers.getSetCookie() : authRes.headers.get("set-cookie") ? [authRes.headers.get("set-cookie")] : [];
  console.log("[social-login] Set-Cookie headers:", setCookies);
  if (setCookies.length > 0) {
    res.setHeader("Set-Cookie", setCookies);
  }
  const data = await authRes.json();
  const url = data?.url;
  if (!url) {
    res.status(400).json({ success: false, message: "Failed to initiate social login" });
    return;
  }
  res.redirect(url);
}));
router10.get("/session", catchAsync(async (req, res) => {
  console.log("[auth.route /session] Incoming authorization:", req.headers.authorization);
  const session = await auth.api.getSession({
    headers: req.headers
  });
  console.log("[auth.route /session] Retrieved session data:", session);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Session retrieved successfully",
    data: session
  });
}));
var AuthRoutes = router10;

// src/app.ts
import { toNodeHandler } from "better-auth/node";
var app = express();
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (origin.includes("localhost") || origin.includes("ngrok-free.dev") || origin.startsWith("safetify://"))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});
app.use((req, res, next) => {
  const originalWriteHead = res.writeHead;
  res.writeHead = function(statusCode, ...args) {
    const currentStatus = statusCode || res.statusCode;
    if (currentStatus === 302 || currentStatus === 307) {
      let location = res.getHeader("location") || "";
      if (typeof location === "string" && location.startsWith("safetify://")) {
        const setCookie = res.getHeader("set-cookie");
        if (setCookie) {
          const cookies = Array.isArray(setCookie) ? setCookie : [String(setCookie)];
          let token = "";
          for (const cookie of cookies) {
            const match = cookie.match(/better-auth\.session_token=([^;]+)/);
            if (match) {
              token = match[1];
              break;
            }
          }
          console.log("[redirect-interceptor] Redirect location:", location, "Cookies:", cookies, "Extracted token:", token);
          if (token) {
            const separator = location.includes("?") ? "&" : "?";
            location = `${location}${separator}token=${encodeURIComponent(token)}`;
            res.setHeader("location", location);
          }
        }
      }
    }
    return originalWriteHead.apply(this, arguments);
  };
  next();
});
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1/auth", express.json(), AuthRoutes);
app.all("/api/v1/auth/*splat", toNodeHandler(auth));
app.use(express.json());
app.use("/api/v1/", IndexRouters);
app.get("/", (req, res) => {
  res.send("Safetify!");
});
app.use(
  (err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(
      err?.statusCode || 500
    ).json({
      success: false,
      message: err?.message || "Internal server error"
    });
  }
);
var app_default = app;
export {
  app_default as default
};

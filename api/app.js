// src/app.ts
import express from "express";

// src/app/routes/index.ts
import { Router as Router7 } from "express";

// src/app/module/auth/auth.route.ts
import { Router } from "express";

// src/app/module/auth/auth.service.ts
import { AccountStatus as AccountStatus2 } from "@prisma/client";

// src/app/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// src/app/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/app/lib/auth.ts
import { AccountStatus, Role } from "@prisma/client";
var auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  emailAndPassword: {
    enabled: true
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: Role.USER
      },
      accountStatus: {
        type: "string",
        required: true,
        defaultValue: AccountStatus.ACTIVE
      },
      deletedAt: {
        type: "date",
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
  if (data.user.accountStatus === AccountStatus2.DELETED) {
    throw new Error("User account has been deleted");
  }
  if (data.user.accountStatus === AccountStatus2.BANNED) {
    throw new Error("User account has been banned");
  }
  if (data.user.accountStatus === AccountStatus2.DEACTIVATED) {
    throw new Error("User account has been deactivated");
  }
  if (data.user.accountStatus === AccountStatus2.DELETIONPENDING) {
    throw new Error("User account deletion is pending");
  }
  console.log("Login data:", data);
  return data;
};
var AuthService = {
  registerUser,
  loginUser
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
import { z } from "zod";
var passwordSchema = z.string("Password is required").min(8, "Password must be at least 8 characters long").max(64, "Password must not exceed 64 characters").regex(/[A-Z]/, "Password must contain at least one uppercase letter").regex(/[a-z]/, "Password must contain at least one lowercase letter").regex(/[0-9]/, "Password must contain at least one number").regex(
  /[^A-Za-z0-9]/,
  "Password must contain at least one special character"
);
var emailSchema = z.email("Please provide a valid email address").toLowerCase().trim();
var registerSchema = z.object({
  body: z.object({
    name: z.string("Name is required").trim().min(2, "Name must be at least 2 characters long").max(60, "Name must not exceed 60 characters").regex(
      /^[a-zA-Z\s'-]+$/,
      "Name must only contain letters, spaces, hyphens or apostrophes"
    ),
    email: emailSchema,
    password: passwordSchema
  })
});
var loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string("Password is required").min(1, "Password is required")
  })
});
var changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string("Current password is required").min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmNewPassword: z.string("Please confirm your new password").min(1, "Please confirm your new password")
  })
}).refine((data) => data.body.newPassword === data.body.confirmNewPassword, {
  message: "Passwords do not match",
  path: ["body", "confirmNewPassword"]
}).refine((data) => data.body.currentPassword !== data.body.newPassword, {
  message: "New password must be different from the current password",
  path: ["body", "newPassword"]
});
var forgotPasswordSchema = z.object({
  body: z.object({
    email: emailSchema
  })
});
var resetPasswordSchema = z.object({
  body: z.object({
    token: z.string("Reset token is required").min(1, "Reset token is required"),
    newPassword: passwordSchema,
    confirmNewPassword: z.string("Please confirm your new password").min(1, "Please confirm your new password")
  })
}).refine((data) => data.body.newPassword === data.body.confirmNewPassword, {
  message: "Passwords do not match",
  path: ["body", "confirmNewPassword"]
});
var verifyEmailSchema = z.object({
  body: z.object({
    token: z.string("Verification token is required").min(1, "Verification token is required")
  })
});
var refreshTokenSchema = z.object({
  cookies: z.object({
    refreshToken: z.string("Refresh token is required").min(1, "Refresh token is required")
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

// src/app/module/auth/auth.route.ts
var router = Router();
router.post("/register", validateRequest(AuthValidation.registerSchema), AuthController.registerUser);
router.post("/login", validateRequest(AuthValidation.loginSchema), AuthController.loginUser);
var AuthRoutes = router;

// src/app/module/emergencyContact/emergencyContact.route.ts
import { Router as Router2 } from "express";

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

// src/app/module/emergencyContact/emergencyContact.validation.ts
import { z as z2 } from "zod";
var nameSchema = z2.string({ message: "Name is required" }).trim().min(2, "Name must be at least 2 characters long").max(100, "Name must not exceed 100 characters").regex(
  /^[a-zA-Z\s'-]+$/,
  "Name must only contain letters, spaces, hyphens, or apostrophes"
);
var relationshipSchema = z2.string({ message: "Relationship is required" }).trim().min(2, "Relationship must be at least 2 characters long").max(50, "Relationship must not exceed 50 characters").regex(
  /^[a-zA-Z\s'-]+$/,
  "Relationship must only contain letters, spaces, hyphens, or apostrophes"
);
var phoneNumberSchema = z2.string({ message: "Phone number is required" }).trim().regex(
  /^(\+8801|8801|01)[3-9]\d{8}$/,
  "Phone number must be a valid Bangladeshi number (e.g. +8801XXXXXXXXX, 8801XXXXXXXXX, or 01XXXXXXXXX)"
);
var createEmergencyContactSchema = z2.object({
  body: z2.object({
    userId: z2.string({ message: "User ID is required" }),
    name: nameSchema,
    relationship: relationshipSchema,
    phoneNumber: phoneNumberSchema
  })
});
var updateEmergencyContactSchema = z2.object({
  body: z2.object({
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
var router2 = Router2();
router2.post("/", validateRequest(EmergencyContactValidation.createEmergencyContactSchema), EmergencyContactController.createEmergencyContact);
router2.get("/user/:userId", EmergencyContactController.getEmergencyContactByUserId);
router2.put("/:id", validateRequest(EmergencyContactValidation.updateEmergencyContactSchema), EmergencyContactController.updateEmergencyContact);
router2.delete("/:id", EmergencyContactController.deleteEmergencyContact);
var EmergencyContactRoute = router2;

// src/app/module/userProfile/userProfile.route.ts
import { Router as Router3 } from "express";

// src/app/module/userProfile/userProfile.service.ts
var createUserProfile = async (payload) => {
  const userProfile = await prisma.userProfile.create({
    data: {
      id: payload.userId,
      userId: payload.userId,
      bio: payload.bio,
      address: payload.address,
      bloodGroup: payload.bloodGroup
    }
  });
  return userProfile;
};
var getUserProfileByUserId = async (userId) => {
  const userProfile = await prisma.userProfile.findUnique({
    where: {
      userId
    }
  });
  return userProfile;
};
var updateUserProfile = async (userId, data) => {
  const userProfile = await prisma.userProfile.update({
    where: {
      userId
    },
    data
  });
  return userProfile;
};
var deleteUserProfile = async (userId) => {
  await prisma.userProfile.delete({
    where: {
      userId
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
import { z as z3 } from "zod";
import { BloodGroup } from "@prisma/client";
var bloodGroupSchema = z3.nativeEnum(BloodGroup, {
  message: "Invalid blood group"
});
var createUserProfileSchema = z3.object({
  body: z3.object({
    userId: z3.string({ message: "User ID is required" }),
    bio: z3.string().trim().max(500, "Bio must not exceed 500 characters").optional(),
    address: z3.string().trim().max(255, "Address must not exceed 255 characters").optional(),
    bloodGroup: bloodGroupSchema.optional()
  })
});
var updateUserProfileSchema = z3.object({
  body: z3.object({
    bio: z3.string().trim().max(500, "Bio must not exceed 500 characters").optional(),
    address: z3.string().trim().max(255, "Address must not exceed 255 characters").optional(),
    bloodGroup: bloodGroupSchema.optional()
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
var router3 = Router3();
router3.post(
  "/",
  validateRequest(UserProfileValidation.createUserProfileSchema),
  UserProfileController.createUserProfile
);
router3.get("/user/:userId", UserProfileController.getUserProfileByUserId);
router3.put(
  "/user/:userId",
  validateRequest(UserProfileValidation.updateUserProfileSchema),
  UserProfileController.updateUserProfile
);
router3.delete("/user/:userId", UserProfileController.deleteUserProfile);
var UserProfileRoute = router3;

// src/app/module/securityPersonnelProfile/securityPersonnelProfile.route.ts
import { Router as Router4 } from "express";

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
import { z as z4 } from "zod";
import { BloodGroup as BloodGroup2, PoliceRank } from "@prisma/client";
var bloodGroupSchema2 = z4.nativeEnum(BloodGroup2, {
  message: "Invalid blood group"
});
var rankSchema = z4.nativeEnum(PoliceRank, {
  message: "Invalid police rank"
});
var createSecurityPersonnelProfileSchema = z4.object({
  body: z4.object({
    userId: z4.string({ message: "User ID is required" }),
    address: z4.string().trim().max(255, "Address must not exceed 255 characters").optional(),
    rank: rankSchema.optional(),
    bloodGroup: bloodGroupSchema2.optional()
  })
});
var updateSecurityPersonnelProfileSchema = z4.object({
  body: z4.object({
    address: z4.string().trim().max(255, "Address must not exceed 255 characters").optional(),
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
var router4 = Router4();
router4.post(
  "/",
  validateRequest(
    SecurityPersonnelProfileValidation.createSecurityPersonnelProfileSchema
  ),
  SecurityPersonnelProfileController.createSecurityPersonnelProfile
);
router4.get(
  "/user/:userId",
  SecurityPersonnelProfileController.getSecurityPersonnelProfileByUserId
);
router4.put(
  "/user/:userId",
  validateRequest(
    SecurityPersonnelProfileValidation.updateSecurityPersonnelProfileSchema
  ),
  SecurityPersonnelProfileController.updateSecurityPersonnelProfile
);
router4.delete(
  "/user/:userId",
  SecurityPersonnelProfileController.deleteSecurityPersonnelProfile
);
var SecurityPersonnelProfileRoute = router4;

// src/app/module/adminProfile/adminProfile.route.ts
import { Router as Router5 } from "express";

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
import { z as z5 } from "zod";
var createAdminProfileSchema = z5.object({
  body: z5.object({
    userId: z5.string({ message: "User ID is required" }),
    address: z5.string().trim().max(255, "Address must not exceed 255 characters").optional()
  })
});
var updateAdminProfileSchema = z5.object({
  body: z5.object({
    address: z5.string().trim().max(255, "Address must not exceed 255 characters").optional()
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
var router5 = Router5();
router5.post(
  "/",
  validateRequest(AdminProfileValidation.createAdminProfileSchema),
  AdminProfileController.createAdminProfile
);
router5.get("/user/:userId", AdminProfileController.getAdminProfileByUserId);
router5.put(
  "/user/:userId",
  validateRequest(AdminProfileValidation.updateAdminProfileSchema),
  AdminProfileController.updateAdminProfile
);
router5.delete("/user/:userId", AdminProfileController.deleteAdminProfile);
var AdminProfileRoute = router5;

// src/app/module/superAdminProfile/superAdminProfile.route.ts
import { Router as Router6 } from "express";

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
import { z as z6 } from "zod";
var createSuperAdminProfileSchema = z6.object({
  body: z6.object({
    userId: z6.string({ message: "User ID is required" })
  })
});
var updateSuperAdminProfileSchema = z6.object({
  body: z6.object({}).refine(
    (data) => Object.keys(data).length > 0,
    "No updatable fields available"
  )
});
var SuperAdminProfileValidation = {
  createSuperAdminProfileSchema,
  updateSuperAdminProfileSchema
};

// src/app/module/superAdminProfile/superAdminProfile.route.ts
var router6 = Router6();
router6.post(
  "/",
  validateRequest(SuperAdminProfileValidation.createSuperAdminProfileSchema),
  SuperAdminProfileController.createSuperAdminProfile
);
router6.get(
  "/user/:userId",
  SuperAdminProfileController.getSuperAdminProfileByUserId
);
router6.put(
  "/user/:userId",
  validateRequest(SuperAdminProfileValidation.updateSuperAdminProfileSchema),
  SuperAdminProfileController.updateSuperAdminProfile
);
router6.delete(
  "/user/:userId",
  SuperAdminProfileController.deleteSuperAdminProfile
);
var SuperAdminProfileRoute = router6;

// src/app/routes/index.ts
var router7 = Router7();
router7.use("/auth", AuthRoutes);
router7.use("/emergency-contact", EmergencyContactRoute);
router7.use("/user-profile", UserProfileRoute);
router7.use("/security-personnel-profile", SecurityPersonnelProfileRoute);
router7.use("/admin-profile", AdminProfileRoute);
router7.use("/super-admin-profile", SuperAdminProfileRoute);
var IndexRouters = router7;

// src/app.ts
var app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/api/v1/", IndexRouters);
app.get("/", (req, res) => {
  res.send("Hello, TypeScript + Express!");
});
var app_default = app;
export {
  app_default as default
};

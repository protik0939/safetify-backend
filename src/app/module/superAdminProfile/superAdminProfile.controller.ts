import { Request, Response } from "express";
import { SuperAdminProfileService } from "./superAdminProfile.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

const createSuperAdminProfile = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const result =
      await SuperAdminProfileService.createSuperAdminProfile(payload);

    sendResponse(res, {
      httpStatusCode: 201,
      success: true,
      message: "Super admin profile created successfully",
      data: result,
    });
  },
);

const getSuperAdminProfileByUserId = catchAsync(
  async (req: Request, res: Response) => {
    const userId = Array.isArray(req.params.userId)
      ? req.params.userId[0]
      : req.params.userId;
    const result =
      await SuperAdminProfileService.getSuperAdminProfileByUserId(userId);

    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Super admin profile retrieved successfully",
      data: result,
    });
  },
);

const updateSuperAdminProfile = catchAsync(
  async (req: Request, res: Response) => {
    const userId = Array.isArray(req.params.userId)
      ? req.params.userId[0]
      : req.params.userId;
    const payload = req.body;
    const result = await SuperAdminProfileService.updateSuperAdminProfile(
      userId,
      payload,
    );

    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Super admin profile updated successfully",
      data: result,
    });
  },
);

const deleteSuperAdminProfile = catchAsync(
  async (req: Request, res: Response) => {
    const userId = Array.isArray(req.params.userId)
      ? req.params.userId[0]
      : req.params.userId;
    await SuperAdminProfileService.deleteSuperAdminProfile(userId);

    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Super admin profile deleted successfully",
    });
  },
);

export const SuperAdminProfileController = {
  createSuperAdminProfile,
  getSuperAdminProfileByUserId,
  updateSuperAdminProfile,
  deleteSuperAdminProfile,
};

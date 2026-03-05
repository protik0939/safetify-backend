import { Request, Response } from "express";
import { SecurityPersonnelProfileService } from "./securityPersonnelProfile.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

const createSecurityPersonnelProfile = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const result =
      await SecurityPersonnelProfileService.createSecurityPersonnelProfile(
        payload,
      );

    sendResponse(res, {
      httpStatusCode: 201,
      success: true,
      message: "Security personnel profile created successfully",
      data: result,
    });
  },
);

const getSecurityPersonnelProfileByUserId = catchAsync(
  async (req: Request, res: Response) => {
    const userId = Array.isArray(req.params.userId)
      ? req.params.userId[0]
      : req.params.userId;
    const result =
      await SecurityPersonnelProfileService.getSecurityPersonnelProfileByUserId(
        userId,
      );

    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Security personnel profile retrieved successfully",
      data: result,
    });
  },
);

const updateSecurityPersonnelProfile = catchAsync(
  async (req: Request, res: Response) => {
    const userId = Array.isArray(req.params.userId)
      ? req.params.userId[0]
      : req.params.userId;
    const payload = req.body;
    const result =
      await SecurityPersonnelProfileService.updateSecurityPersonnelProfile(
        userId,
        payload,
      );

    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Security personnel profile updated successfully",
      data: result,
    });
  },
);

const deleteSecurityPersonnelProfile = catchAsync(
  async (req: Request, res: Response) => {
    const userId = Array.isArray(req.params.userId)
      ? req.params.userId[0]
      : req.params.userId;
    await SecurityPersonnelProfileService.deleteSecurityPersonnelProfile(userId);

    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Security personnel profile deleted successfully",
    });
  },
);

export const SecurityPersonnelProfileController = {
  createSecurityPersonnelProfile,
  getSecurityPersonnelProfileByUserId,
  updateSecurityPersonnelProfile,
  deleteSecurityPersonnelProfile,
};

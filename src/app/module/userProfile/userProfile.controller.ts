import { Request, Response } from "express";
import { UserProfileService } from "./userProfile.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

const createUserProfile = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await UserProfileService.createUserProfile(payload);

  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "User profile created successfully",
    data: result,
  });
});

const getUserProfileByUserId = catchAsync(
  async (req: Request, res: Response) => {
    const userId = Array.isArray(req.params.userId)
      ? req.params.userId[0]
      : req.params.userId;
    const result = await UserProfileService.getUserProfileByUserId(userId);

    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "User profile retrieved successfully",
      data: result,
    });
  },
);

const updateUserProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = Array.isArray(req.params.userId)
    ? req.params.userId[0]
    : req.params.userId;
  const payload = req.body;
  const result = await UserProfileService.updateUserProfile(userId, payload);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "User profile updated successfully",
    data: result,
  });
});

const deleteUserProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = Array.isArray(req.params.userId)
    ? req.params.userId[0]
    : req.params.userId;
  await UserProfileService.deleteUserProfile(userId);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "User profile deleted successfully",
  });
});

export const UserProfileController = {
  createUserProfile,
  getUserProfileByUserId,
  updateUserProfile,
  deleteUserProfile,
};

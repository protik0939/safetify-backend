import { Request, Response } from "express";
import { AdminProfileService } from "./adminProfile.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

const createAdminProfile = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await AdminProfileService.createAdminProfile(payload);

  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "Admin profile created successfully",
    data: result,
  });
});

const getAdminProfileByUserId = catchAsync(
  async (req: Request, res: Response) => {
    const userId = Array.isArray(req.params.userId)
      ? req.params.userId[0]
      : req.params.userId;
    const result = await AdminProfileService.getAdminProfileByUserId(userId);

    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Admin profile retrieved successfully",
      data: result,
    });
  },
);

const updateAdminProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = Array.isArray(req.params.userId)
    ? req.params.userId[0]
    : req.params.userId;
  const payload = req.body;
  const result = await AdminProfileService.updateAdminProfile(userId, payload);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Admin profile updated successfully",
    data: result,
  });
});

const deleteAdminProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = Array.isArray(req.params.userId)
    ? req.params.userId[0]
    : req.params.userId;
  await AdminProfileService.deleteAdminProfile(userId);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Admin profile deleted successfully",
  });
});

export const AdminProfileController = {
  createAdminProfile,
  getAdminProfileByUserId,
  updateAdminProfile,
  deleteAdminProfile,
};

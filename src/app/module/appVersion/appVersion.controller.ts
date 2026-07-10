import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { AppVersionService } from "./appVersion.service";

const getLatestVersion = catchAsync(async (req: Request, res: Response) => {
  const result = await AppVersionService.getLatestVersion();
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Latest app version fetched successfully",
    data: result,
  });
});

export const AppVersionController = {
  getLatestVersion,
};

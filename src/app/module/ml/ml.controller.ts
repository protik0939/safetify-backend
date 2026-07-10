import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { MLService } from "./ml.service";

const predictPoint = catchAsync(async (req: Request, res: Response) => {
  const result = await MLService.predictPoint(req.body);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Point risk prediction generated successfully",
    data: result,
  });
});

const predictRoute = catchAsync(async (req: Request, res: Response) => {
  const result = await MLService.predictRoute(req.body);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Route risk prediction generated successfully",
    data: result,
  });
});

const predictHotspots = catchAsync(async (req: Request, res: Response) => {
  const result = await MLService.predictHotspots(req.body);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Hotspots risk predictions generated successfully",
    data: result,
  });
});

export const MLController = {
  predictPoint,
  predictRoute,
  predictHotspots,
};

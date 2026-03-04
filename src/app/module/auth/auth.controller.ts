import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";
import { catchAsync } from "../../shared/catchAsync";

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await AuthService.registerUser(payload);

  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await AuthService.loginUser(payload);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "User logged in successfully",
    data: result,
  });
});

export const AuthController = {
  registerUser,
  loginUser,
};

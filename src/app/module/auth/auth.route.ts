import { Router, Request, Response } from "express";
import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";
import { validateRequest } from "../../middleware/validateRequest";
import { auth } from "../../lib/auth";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

const router = Router();

router.post("/register", validateRequest(AuthValidation.registerSchema), AuthController.registerUser);
router.post("/login", validateRequest(AuthValidation.loginSchema), AuthController.loginUser);

router.get("/session", catchAsync(async (req: Request, res: Response) => {
  const session = await auth.api.getSession({
    headers: req.headers as Record<string, string>,
  });
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Session retrieved successfully",
    data: session,
  });
}));

export const AuthRoutes = router;
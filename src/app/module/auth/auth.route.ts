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

router.get("/social-login", catchAsync(async (req: Request, res: Response) => {
  const provider = req.query.provider as string;
  const callbackURL = req.query.callbackURL as string;

  if (!provider || !callbackURL) {
    res.status(400).json({ success: false, message: "provider and callbackURL are required" });
    return;
  }

  const authRes = await auth.api.signInSocial({
    body: {
      provider,
      callbackURL,
    },
    asResponse: true,
    headers: req.headers as Record<string, string>,
  });

  const setCookies = authRes.headers.getSetCookie 
    ? authRes.headers.getSetCookie() 
    : (authRes.headers.get("set-cookie") ? [authRes.headers.get("set-cookie")!] : []);

  console.log("[social-login] Set-Cookie headers:", setCookies);

  if (setCookies.length > 0) {
    res.setHeader("Set-Cookie", setCookies);
  }

  const data = await authRes.json() as { url?: string };
  const url = data?.url;

  if (!url) {
    res.status(400).json({ success: false, message: "Failed to initiate social login" });
    return;
  }

  res.redirect(url);
}));

router.get("/session", catchAsync(async (req: Request, res: Response) => {
  console.log("[auth.route /session] Incoming authorization:", req.headers.authorization);
  const session = await auth.api.getSession({
    headers: req.headers as Record<string, string>,
  });
  console.log("[auth.route /session] Retrieved session data:", session);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Session retrieved successfully",
    data: session,
  });
}));

export const AuthRoutes = router;
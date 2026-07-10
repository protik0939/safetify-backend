import { Router } from "express";
import { AppVersionController } from "./appVersion.controller";

const router = Router();

router.get("/latest", AppVersionController.getLatestVersion);

export const AppVersionRoute = router;

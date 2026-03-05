import { Router } from "express";
import { SuperAdminProfileController } from "./superAdminProfile.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { SuperAdminProfileValidation } from "./superAdminProfile.validation";

const router = Router();

router.post(
  "/",
  validateRequest(SuperAdminProfileValidation.createSuperAdminProfileSchema),
  SuperAdminProfileController.createSuperAdminProfile,
);
router.get(
  "/user/:userId",
  SuperAdminProfileController.getSuperAdminProfileByUserId,
);
router.put(
  "/user/:userId",
  validateRequest(SuperAdminProfileValidation.updateSuperAdminProfileSchema),
  SuperAdminProfileController.updateSuperAdminProfile,
);
router.delete(
  "/user/:userId",
  SuperAdminProfileController.deleteSuperAdminProfile,
);

export const SuperAdminProfileRoute = router;

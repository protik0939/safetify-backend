import { Router } from "express";
import { AdminProfileController } from "./adminProfile.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { AdminProfileValidation } from "./adminProfile.validation";

const router = Router();

router.post(
  "/",
  validateRequest(AdminProfileValidation.createAdminProfileSchema),
  AdminProfileController.createAdminProfile,
);
router.get("/user/:userId", AdminProfileController.getAdminProfileByUserId);
router.put(
  "/user/:userId",
  validateRequest(AdminProfileValidation.updateAdminProfileSchema),
  AdminProfileController.updateAdminProfile,
);
router.delete("/user/:userId", AdminProfileController.deleteAdminProfile);

export const AdminProfileRoute = router;

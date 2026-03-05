import { Router } from "express";
import { SecurityPersonnelProfileController } from "./securityPersonnelProfile.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { SecurityPersonnelProfileValidation } from "./securityPersonnelProfile.validation";

const router = Router();

router.post(
  "/",
  validateRequest(
    SecurityPersonnelProfileValidation.createSecurityPersonnelProfileSchema,
  ),
  SecurityPersonnelProfileController.createSecurityPersonnelProfile,
);
router.get(
  "/user/:userId",
  SecurityPersonnelProfileController.getSecurityPersonnelProfileByUserId,
);
router.put(
  "/user/:userId",
  validateRequest(
    SecurityPersonnelProfileValidation.updateSecurityPersonnelProfileSchema,
  ),
  SecurityPersonnelProfileController.updateSecurityPersonnelProfile,
);
router.delete(
  "/user/:userId",
  SecurityPersonnelProfileController.deleteSecurityPersonnelProfile,
);

export const SecurityPersonnelProfileRoute = router;

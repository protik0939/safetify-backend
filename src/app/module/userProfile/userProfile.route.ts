import { Router } from "express";
import { UserProfileController } from "./userProfile.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { UserProfileValidation } from "./userProfile.validation";

const router = Router();

router.post(
  "/",
  validateRequest(UserProfileValidation.createUserProfileSchema),
  UserProfileController.createUserProfile,
);
router.get("/:userId", UserProfileController.getUserProfileByUserId);
router.put(
  "/:userId",
  validateRequest(UserProfileValidation.updateUserProfileSchema),
  UserProfileController.updateUserProfile,
);
router.delete("/:userId", UserProfileController.deleteUserProfile);

export const UserProfileRoute = router;

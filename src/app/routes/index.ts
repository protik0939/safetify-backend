import { Router } from "express";
import { AuthRoutes } from "../module/auth/auth.route";
import { EmergencyContactRoute } from "../module/emergencyContact/emergencyContact.route";
import { UserProfileRoute } from "../module/userProfile/userProfile.route";
import { SecurityPersonnelProfileRoute } from "../module/securityPersonnelProfile/securityPersonnelProfile.route";
import { AdminProfileRoute } from "../module/adminProfile/adminProfile.route";
import { SuperAdminProfileRoute } from "../module/superAdminProfile/superAdminProfile.route";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/emergency-contact", EmergencyContactRoute);
router.use("/user-profile", UserProfileRoute);
router.use("/security-personnel-profile", SecurityPersonnelProfileRoute);
router.use("/admin-profile", AdminProfileRoute);
router.use("/super-admin-profile", SuperAdminProfileRoute);

export const IndexRouters = router;
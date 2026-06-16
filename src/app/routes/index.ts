import { Router } from "express";
import { AuthRoutes } from "../module/auth/auth.route";
import { EmergencyContactRoute } from "../module/emergencyContact/emergencyContact.route";
import { UserProfileRoute } from "../module/userProfile/userProfile.route";
import { SecurityPersonnelProfileRoute } from "../module/securityPersonnelProfile/securityPersonnelProfile.route";
import { AdminProfileRoute } from "../module/adminProfile/adminProfile.route";
import { SuperAdminProfileRoute } from "../module/superAdminProfile/superAdminProfile.route";
import { IncidentReportingRoute } from "../module/incidentReporting/incidentReporting.route";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/emergency-contact", EmergencyContactRoute);
router.use("/user", UserProfileRoute);
router.use("/security-personnel-profile", SecurityPersonnelProfileRoute);
router.use("/admin-profile", AdminProfileRoute);
router.use("/super-admin-profile", SuperAdminProfileRoute);
router.use("/incidents", IncidentReportingRoute);

export const IndexRouters = router;
import { Router } from "express";
import { EmergencyContactRoute } from "../module/emergencyContact/emergencyContact.route";
import { UserProfileRoute } from "../module/userProfile/userProfile.route";
import { SecurityPersonnelProfileRoute } from "../module/securityPersonnelProfile/securityPersonnelProfile.route";
import { AdminProfileRoute } from "../module/adminProfile/adminProfile.route";
import { SuperAdminProfileRoute } from "../module/superAdminProfile/superAdminProfile.route";
import { IncidentReportingRoute } from "../module/incidentReporting/incidentReporting.route";
import { LocationRoute } from "../module/location/location.route";
import { ResponderRoute } from "../module/responder/responder.route";
import { AppVersionRoute } from "../module/appVersion/appVersion.route";
import { MLRoute } from "../module/ml/ml.route";
import { AdminRoute } from "../module/admin/admin.route";

const router = Router();

// auth is handled in app.ts (custom routes + toNodeHandler catch-all)
router.use("/emergency-contact", EmergencyContactRoute);
router.use("/user", UserProfileRoute);
router.use("/security-personnel-profile", SecurityPersonnelProfileRoute);
router.use("/admin-profile", AdminProfileRoute);
router.use("/super-admin-profile", SuperAdminProfileRoute);
router.use("/incidents", IncidentReportingRoute);
router.use("/user", LocationRoute);
router.use("/incidents", ResponderRoute);
router.use("/app-version", AppVersionRoute);
router.use("/ml", MLRoute);
router.use("/admin", AdminRoute);

export const IndexRouters = router;
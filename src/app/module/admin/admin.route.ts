import { Router } from "express";
import { AdminController } from "./admin.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { AdminValidation } from "./admin.validation";

const router = Router();

router.get("/users", AdminController.listAllUsers);
router.patch(
  "/users/:userId/status",
  validateRequest(AdminValidation.updateUserStatusSchema),
  AdminController.updateUserStatus,
);
router.patch(
  "/users/:userId/role",
  validateRequest(AdminValidation.updateUserRoleSchema),
  AdminController.updateUserRole,
);
router.get("/stats", AdminController.getDashboardStats);
router.post(
  "/broadcast",
  validateRequest(AdminValidation.broadcastSchema),
  AdminController.broadcastPushNotification,
);
router.get("/incidents", AdminController.listAllIncidents);
router.patch(
  "/incidents/:id/status",
  validateRequest(AdminValidation.updateIncidentStatusSchema),
  AdminController.updateIncidentStatus,
);
router.delete("/incidents/:id", AdminController.deleteIncident);

export const AdminRoute = router;

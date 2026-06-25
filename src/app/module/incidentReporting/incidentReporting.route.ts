import { Router } from "express";
import { IncidentReportingController } from "./incidentReporting.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { IncidentReportingValidation } from "./incidentReporting.validation";

const router = Router();

router.post(
  "/",
  validateRequest(IncidentReportingValidation.createIncidentSchema),
  IncidentReportingController.createIncident,
);
router.get("/", IncidentReportingController.getAllIncidents);
router.get("/user/:userId", IncidentReportingController.getIncidentsByUserId);
router.get("/history/:userId", IncidentReportingController.getIncidentHistoryByUserId);
router.get("/:id", IncidentReportingController.getIncidentById);
router.put(
  "/:id",
  validateRequest(IncidentReportingValidation.updateIncidentSchema),
  IncidentReportingController.updateIncident,
);
router.delete("/:id", IncidentReportingController.deleteIncident);

export const IncidentReportingRoute = router;

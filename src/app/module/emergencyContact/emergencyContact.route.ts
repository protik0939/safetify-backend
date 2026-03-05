import { Router } from "express";
import { EmergencyContactController } from "./emergencyContact.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { EmergencyContactValidation } from "./emergencyContact.validation";

const router = Router();

    router.post("/", validateRequest(EmergencyContactValidation.createEmergencyContactSchema), EmergencyContactController.createEmergencyContact);
    router.get("/user/:userId", EmergencyContactController.getEmergencyContactByUserId);
    router.put("/:id", validateRequest(EmergencyContactValidation.updateEmergencyContactSchema), EmergencyContactController.updateEmergencyContact);
    router.delete("/:id", EmergencyContactController.deleteEmergencyContact);

export const EmergencyContactRoute = router;
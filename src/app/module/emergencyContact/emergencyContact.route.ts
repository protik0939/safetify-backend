import { Router } from "express";
import { EmergencyContactController } from "./emergencyContact.controller";

const router = Router();

    router.post("/", EmergencyContactController.createEmergencyContact);
    router.get("/user/:userId", EmergencyContactController.getEmergencyContactByUserId);

export const EmergencyContactRoute = router;
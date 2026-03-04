import { Router } from "express";
import { AuthRoutes } from "../module/auth/auth.route";
import { EmergencyContactRoute } from "../module/emergencyContact/emergencyContact.route";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/emergency-contact", EmergencyContactRoute);

export const IndexRouters = router;
import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { MLValidation } from "./ml.validation";
import { MLController } from "./ml.controller";

const router = Router();

router.post(
  "/predict-point",
  validateRequest(MLValidation.predictPointSchema),
  MLController.predictPoint
);

router.post(
  "/predict-route",
  validateRequest(MLValidation.predictRouteSchema),
  MLController.predictRoute
);

router.post(
  "/predict-hotspots",
  validateRequest(MLValidation.predictHotspotsSchema),
  MLController.predictHotspots
);

export const MLRoute = router;

import { Router } from 'express';
import { LocationController } from './location.controller';

const router = Router();

router.post('/location', LocationController.updateLocation);
router.post('/push-token', LocationController.updatePushToken);

export const LocationRoute = router;

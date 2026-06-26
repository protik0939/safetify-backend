import { Router } from 'express';
import { ResponderController } from './responder.controller';

const router = Router();

router.post('/:id/respond', ResponderController.respondToIncident);
router.post('/:id/abort', ResponderController.abortIncidentResponse);

export const ResponderRoute = router;


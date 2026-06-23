import { Router } from 'express';
import { ResponderController } from './responder.controller';

const router = Router();

router.post('/:id/respond', ResponderController.respondToIncident);

export const ResponderRoute = router;

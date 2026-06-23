import { Router } from 'express';
import { TranscribeController } from './transcribe.controller';

const router = Router();

router.post('/', TranscribeController.transcribe);

export const TranscribeRoute = router;

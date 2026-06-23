import { Request, Response } from 'express';
import { TranscribeService } from './transcribe.service';

export const TranscribeController = {
  transcribe: async (req: Request, res: Response) => {
    try {
      const { audio, format } = req.body;

      if (!audio) {
        res.status(400).json({
          success: false,
          message: 'Audio data (base64 string) is required.',
        });
        return;
      }

      if (!format || !['wav', 'amr'].includes(format)) {
        res.status(400).json({
          success: false,
          message: 'Audio format must be either "wav" or "amr".',
        });
        return;
      }

      const result = await TranscribeService.transcribeAudio(audio, format);

      res.status(200).json({
        success: true,
        message: 'Speech transcribed successfully.',
        data: result,
      });
    } catch (error: any) {
      console.error('[TranscribeController] Error in transcribe:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to transcribe audio.',
      });
    }
  },
};

import speech from '@google-cloud/speech';
import path from 'path';

const clientOptions: any = {};

if (process.env.GOOGLE_CREDENTIALS_JSON) {
  try {
    clientOptions.credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
    console.log('[TranscribeService] Google SpeechClient initialized using credentials JSON.');
  } catch (err) {
    console.error('[TranscribeService] Failed to parse GOOGLE_CREDENTIALS_JSON environment variable:', err);
  }
} else {
  clientOptions.keyFilename = path.resolve(process.cwd(), 'google-services-key.json');
  console.log('[TranscribeService] Google SpeechClient fallback to local keyfile.');
}

const client = new speech.SpeechClient(clientOptions);

export const TranscribeService = {
  transcribeAudio: async (base64Audio: string, format: 'wav' | 'amr') => {
    const isWav = format === 'wav';

    const request = {
      audio: {
        content: base64Audio,
      },
      config: {
        encoding: (isWav ? 'LINEAR16' : 'AMR_WB') as any,
        sampleRateHertz: 16000,
        languageCode: 'en-US',
        alternativeLanguageCodes: ['bn-BD', 'hi-IN', 'es-ES'],
      },
    };

    try {
      const [response] = await client.recognize(request);

      const transcription = response.results
        ?.map((result) => result.alternatives?.[0]?.transcript)
        .join('\n') || '';

      const detectedLanguageCode = response.results?.[0]?.languageCode || 'en-US';

      return {
        text: transcription,
        languageCode: detectedLanguageCode,
      };
    } catch (error) {
      console.error('[TranscribeService] Error in Google Speech recognition:', error);
      throw error;
    }
  },
};

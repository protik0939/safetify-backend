export interface PushSendResult {
  success: boolean;
  token: string;
  response: any;
  error?: string;
}

export async function sendPushNotification(
  expoPushToken: string,
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<PushSendResult> {
  if (!expoPushToken || (!expoPushToken.startsWith('ExponentPushToken') && !expoPushToken.startsWith('ExpoPushToken'))) {
    console.warn('[Push Notification] Invalid or missing token:', expoPushToken);
    return { success: false, token: expoPushToken, response: null, error: 'Invalid or missing token' };
  }

  try {
    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        to: expoPushToken,
        title,
        body,
        sound: 'alert.mp3',
        channelId: 'safetify-alerts-v4',
        data,
        priority: 'high',
      }),
    });

    const result = await res.json();

    // Expo Push API returns HTTP 200 even on logical errors.
    // Parse the actual status from the response body.
    const ticket = result?.data;
    if (ticket?.status === 'error') {
      const errorType = ticket.details?.error || 'UnknownError';
      const errorMsg = ticket.message || 'No message';

      // Common errors:
      //   "DeviceNotRegistered" — token is stale / app was uninstalled
      //   "InvalidCredentials"  — FCM key not uploaded to Expo project
      //   "MessageTooBig"       — payload exceeds limit
      //   "MessageRateExceeded" — throttled by Expo
      console.error(
        `[Push Notification] DELIVERY FAILED — ${errorType}: ${errorMsg}` +
        (errorType === 'InvalidCredentials'
          ? '\n  ⚠️  FCM credentials are NOT configured on your Expo project!' +
            '\n  Run: eas credentials --platform android' +
            '\n  Then upload your Google Service Account key for FCM V1.'
          : '')
      );

      return { success: false, token: expoPushToken, response: result, error: `${errorType}: ${errorMsg}` };
    }

    console.log('[Push Notification] Ticket OK:', ticket?.id ?? JSON.stringify(result));
    return { success: true, token: expoPushToken, response: result };
  } catch (error) {
    console.error('[Push Notification] Network error sending push notification:', error);
    return { success: false, token: expoPushToken, response: null, error: String(error) };
  }
}

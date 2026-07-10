// src/app/utills/pushNotification.ts
async function sendPushNotification(expoPushToken, title, body, data) {
  if (!expoPushToken || !expoPushToken.startsWith("ExponentPushToken") && !expoPushToken.startsWith("ExpoPushToken")) {
    console.warn("[Push Notification] Invalid or missing token:", expoPushToken);
    return { success: false, token: expoPushToken, response: null, error: "Invalid or missing token" };
  }
  try {
    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        to: expoPushToken,
        title,
        body,
        sound: "alert.mp3",
        channelId: "safetify-alerts-v4",
        data,
        priority: "high"
      })
    });
    const result = await res.json();
    const ticket = result?.data;
    if (ticket?.status === "error") {
      const errorType = ticket.details?.error || "UnknownError";
      const errorMsg = ticket.message || "No message";
      console.error(
        `[Push Notification] DELIVERY FAILED \u2014 ${errorType}: ${errorMsg}` + (errorType === "InvalidCredentials" ? "\n  \u26A0\uFE0F  FCM credentials are NOT configured on your Expo project!\n  Run: eas credentials --platform android\n  Then upload your Google Service Account key for FCM V1." : "")
      );
      return { success: false, token: expoPushToken, response: result, error: `${errorType}: ${errorMsg}` };
    }
    console.log("[Push Notification] Ticket OK:", ticket?.id ?? JSON.stringify(result));
    return { success: true, token: expoPushToken, response: result };
  } catch (error) {
    console.error("[Push Notification] Network error sending push notification:", error);
    return { success: false, token: expoPushToken, response: null, error: String(error) };
  }
}

export {
  sendPushNotification
};

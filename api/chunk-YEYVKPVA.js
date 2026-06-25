// src/app/utills/pushNotification.ts
async function sendPushNotification(expoPushToken, title, body, data) {
  if (!expoPushToken || !expoPushToken.startsWith("ExponentPushToken") && !expoPushToken.startsWith("ExpoPushToken")) {
    console.warn("[Push Notification] Invalid or missing token:", expoPushToken);
    return null;
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
        channelId: "safetify-alerts-v3",
        data
      })
    });
    const result = await res.json();
    console.log("[Push Notification] Send response:", JSON.stringify(result));
    return result;
  } catch (error) {
    console.error("[Push Notification] Error sending push notification:", error);
    throw error;
  }
}

export {
  sendPushNotification
};

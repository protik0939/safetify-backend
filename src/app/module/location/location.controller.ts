import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { sendPushNotification } from '../../utills/pushNotification';

// Cooldown map: "userId_incidentId" -> timestamp of last notification
const notificationCooldowns = new Map<string, number>();

// Proximity check helper (Haversine formula)
function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export const LocationController = {
  // Update user's live location and check danger zones
  updateLocation: async (req: Request, res: Response) => {
    try {
      const { userId, latitude, longitude } = req.body;

      if (!userId || latitude === undefined || longitude === undefined) {
        res.status(400).json({
          success: false,
          message: 'userId, latitude, and longitude are required.',
        });
        return;
      }

      // 1. Update user location in DB
      const locationData = JSON.stringify({
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
      });

      const user = await prisma.user.update({
        where: { id: userId },
        data: { location: locationData },
        select: { id: true, name: true, pushToken: true },
      });

      // 2. Fetch all active incidents with high/critical severity (danger zones)
      const activeIncidents = await prisma.incident.findMany({
        where: {
          status: { not: 'resolved' },
          severityLevel: { in: ['high', 'critical'] },
        },
      });

      const triggeredAlerts = [];

      // 3. Proximity check
      for (const incident of activeIncidents) {
        // Skip user's own SOS
        if (incident.userId === userId) continue;

        const distance = getDistanceInKm(latitude, longitude, incident.latitude, incident.longitude);

        if (distance <= 0.5) { // 500 meters
          const cooldownKey = `${userId}_${incident.id}`;
          const lastNotified = notificationCooldowns.get(cooldownKey) || 0;
          const isCooldownActive = Date.now() - lastNotified < 5 * 60 * 1000; // 5 mins cooldown

          if (!isCooldownActive) {
            notificationCooldowns.set(cooldownKey, Date.now());

            if (user.pushToken) {
              try {
                await sendPushNotification(
                  user.pushToken,
                  '⚠️ Danger Zone Alert',
                  `You are near a ${incident.severityLevel || 'critical'} danger zone: "${incident.title}". Stay alert!`,
                  {
                    type: 'danger_zone',
                    incidentId: incident.id,
                    latitude: incident.latitude,
                    longitude: incident.longitude,
                  }
                );
                console.log(`[LocationController] Sent danger alert to ${user.name} for incident ${incident.id}`);
              } catch (pushErr) {
                console.error('[LocationController] Failed to send push:', pushErr);
              }
            }
            triggeredAlerts.push(incident);
          }
        }
      }

      res.status(200).json({
        success: true,
        message: 'Location updated successfully.',
        data: {
          alertsSent: triggeredAlerts.map((inc) => inc.id),
        },
      });
    } catch (error: any) {
      console.error('[LocationController] Error updating location:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update location.',
      });
    }
  },

  // Register push token for a user
  updatePushToken: async (req: Request, res: Response) => {
    try {
      const { userId, pushToken } = req.body;

      if (!userId || !pushToken) {
        res.status(400).json({
          success: false,
          message: 'userId and pushToken are required.',
        });
        return;
      }

      await prisma.user.update({
        where: { id: userId },
        data: { pushToken },
      });

      console.log(`[LocationController] Registered push token for user ${userId}`);

      res.status(200).json({
        success: true,
        message: 'Push token registered successfully.',
      });
    } catch (error: any) {
      console.error('[LocationController] Error updating push token:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to register push token.',
      });
    }
  },
};

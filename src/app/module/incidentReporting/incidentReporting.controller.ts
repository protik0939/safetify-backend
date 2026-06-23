import { Request, Response } from "express";
import { IncidentReportingService } from "./incidentReporting.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { prisma } from "../../lib/prisma";
import { sendPushNotification } from "../../utills/pushNotification";

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

const createIncident = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await IncidentReportingService.createIncident(payload);

  // Trigger nearby alerts for high/critical incidents
  if (result.severityLevel === "critical" || result.severityLevel === "high") {
    try {
      // 1. Fetch other users with locations and push tokens
      const otherUsers = await prisma.user.findMany({
        where: {
          id: { not: result.userId },
          pushToken: { not: null },
          location: { not: null },
        },
        select: { id: true, name: true, pushToken: true, location: true },
      });

      // 2. Proximity check
      for (const otherUser of otherUsers) {
        if (!otherUser.location || !otherUser.pushToken) continue;
        try {
          const userLoc = JSON.parse(otherUser.location);
          if (userLoc.latitude === undefined || userLoc.longitude === undefined) continue;

          const distance = getDistanceInKm(
            result.latitude,
            result.longitude,
            userLoc.latitude,
            userLoc.longitude
          );

          if (distance <= 1.0) { // 1.0 kilometer
            await sendPushNotification(
              otherUser.pushToken,
              "🚨 Someone is in danger near you!",
              `Emergency SOS triggered nearby. Tap to help.`,
              {
                type: "sos_alert",
                incidentId: result.id,
                latitude: result.latitude,
                longitude: result.longitude,
              }
            );
            console.log(`[Incident Alert] Sent nearby alert to ${otherUser.name} for SOS ${result.id}`);
          }
        } catch (err) {
          console.error(`[Incident Alert] Failed to parse/send alert to user ${otherUser.id}:`, err);
        }
      }
    } catch (err) {
      console.error("[Incident Alert] General error fetching users for SOS alert:", err);
    }
  }

  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "Incident reported successfully",
    data: result,
  });
});

const getAllIncidents = catchAsync(async (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const offset = req.query.offset ? Number(req.query.offset) : undefined;
  const result = await IncidentReportingService.getAllIncidents(limit, offset);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Incidents retrieved successfully",
    data: result,
  });
});

const getIncidentById = catchAsync(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const result = await IncidentReportingService.getIncidentById(id);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Incident retrieved successfully",
    data: result,
  });
});

const getIncidentsByUserId = catchAsync(
  async (req: Request, res: Response) => {
    const userId = Array.isArray(req.params.userId)
      ? req.params.userId[0]
      : req.params.userId;
    const result = await IncidentReportingService.getIncidentsByUserId(userId);

    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Incidents retrieved successfully",
      data: result,
    });
  },
);

const updateIncident = catchAsync(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const payload = req.body;
  const result = await IncidentReportingService.updateIncident(id, payload);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Incident updated successfully",
    data: result,
  });
});

const deleteIncident = catchAsync(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await IncidentReportingService.deleteIncident(id);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Incident deleted successfully",
  });
});

export const IncidentReportingController = {
  createIncident,
  getAllIncidents,
  getIncidentById,
  getIncidentsByUserId,
  updateIncident,
  deleteIncident,
};

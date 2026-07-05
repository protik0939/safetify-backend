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

  // Trigger nearby alerts for high/critical incidents (now broadcast to all app users)
  if (result.severityLevel === "critical" || result.severityLevel === "high") {
    try {
      // Fetch victim name
      const victimUser = await prisma.user.findUnique({
        where: { id: result.userId },
        select: { name: true },
      });
      const victimName = victimUser?.name || "Someone";

      // 1. Fetch other users with push tokens
      const otherUsers = await prisma.user.findMany({
        where: {
          id: { not: result.userId },
          pushToken: { not: null },
        },
        select: { id: true, name: true, pushToken: true },
      });

      console.log(`[Incident Alert] Broadcasting SOS ${result.id} to ${otherUsers.length} users with push tokens`);

      // 2. Broadcast alerts and track results
      let successCount = 0;
      let failCount = 0;
      for (const otherUser of otherUsers) {
        if (!otherUser.pushToken) continue;
        try {
          const pushResult = await sendPushNotification(
            otherUser.pushToken,
            "🚨 Someone is in danger!",
            `${victimName} triggered an emergency SOS. Tap to help.`,
            {
              type: "sos_alert",
              incidentId: result.id,
              latitude: result.latitude,
              longitude: result.longitude,
            }
          );
          if (pushResult.success) {
            successCount++;
          } else {
            failCount++;
            console.warn(`[Incident Alert] Push failed for ${otherUser.name}: ${pushResult.error}`);
          }
        } catch (err) {
          failCount++;
          console.error(`[Incident Alert] Exception sending alert to user ${otherUser.id}:`, err);
        }
      }

      console.log(`[Incident Alert] SOS ${result.id} broadcast complete: ${successCount} sent, ${failCount} failed, ${otherUsers.length} total targets`);
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

const getIncidentHistoryByUserId = catchAsync(
  async (req: Request, res: Response) => {
    const userId = Array.isArray(req.params.userId)
      ? req.params.userId[0]
      : req.params.userId;
    const result = await IncidentReportingService.getIncidentHistoryByUserId(userId);

    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Incident history retrieved successfully",
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

const validateIncident = catchAsync(async (req: Request, res: Response) => {
  const incidentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { responderId, isTrue, comment, images } = req.body;

  if (!responderId) {
    res.status(400).json({
      success: false,
      message: "responderId is required.",
    });
    return;
  }



  // 2. Create or update validation
  const validation = await prisma.helperValidation.upsert({
    where: {
      incidentId_responderId: {
        incidentId,
        responderId,
      },
    },
    create: {
      incidentId,
      responderId,
      isTrue: !!isTrue,
      comment,
    },
    update: {
      isTrue: !!isTrue,
      comment,
    },
  });

  // 3. Handle proof images if provided
  if (images && Array.isArray(images)) {
    // Delete existing images associated with this helper validation
    await prisma.incidentImage.deleteMany({
      where: {
        helperValidationId: validation.id,
      },
    });

    if (images.length > 0) {
      await prisma.incidentImage.createMany({
        data: images.map((url: string) => ({
          incidentId,
          url,
          helperValidationId: validation.id,
        })),
      });
    }
  }

  // 4. Send push notification to incident reporter (victim)
  try {
    const incident = await prisma.incidentReporting.findUnique({
      where: { id: incidentId },
      select: {
        id: true,
        title: true,
        userId: true,
        user: {
          select: {
            id: true,
            name: true,
            pushToken: true,
          }
        }
      }
    });

    const validator = await prisma.user.findUnique({
      where: { id: responderId },
      select: { name: true }
    });

    if (incident && incident.user && incident.user.pushToken && incident.user.id !== responderId) {
      const titleStr = `Incident Verified: ${incident.title || "SOS Alert"}`;
      const bodyStr = `${validator?.name || "A helper"} has verified the status of your incident.`;
      
      await sendPushNotification(
        incident.user.pushToken,
        titleStr,
        bodyStr,
        {
          type: "incident_verification",
          incidentId: incident.id,
        }
      );
      console.log(`[IncidentReportingController] Verification push notification sent to victim ${incident.user.name}`);
    }
  } catch (pushErr) {
    console.error('[IncidentReportingController] Failed to send verification push notification:', pushErr);
  }

  // Retrieve the updated incident details
  const updatedIncident = await IncidentReportingService.getIncidentById(incidentId);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Incident validation submitted successfully.",
    data: updatedIncident,
  });
});

export const IncidentReportingController = {
  createIncident,
  getAllIncidents,
  getIncidentById,
  getIncidentsByUserId,
  getIncidentHistoryByUserId,
  updateIncident,
  deleteIncident,
  validateIncident,
};

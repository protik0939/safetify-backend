import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { sendPushNotification } from '../../utills/pushNotification';
import { broadcastRoomUpdate } from '../../websocket';

export const ResponderController = {
  respondToIncident: async (req: Request, res: Response) => {
    try {
      const { id: incidentId } = req.params as { id: string };
      const { responderId } = req.body as { responderId: string };

      if (!incidentId || !responderId) {
        res.status(400).json({
          success: false,
          message: 'incidentId and responderId are required.',
        });
        return;
      }

      // 1. Create incident responder entry in database
      // If they already responded, update or return existing
      const existing = await prisma.incidentResponder.findFirst({
        where: { incidentId, responderId },
      });

      let responderRecord: any;
      if (existing) {
        responderRecord = await prisma.incidentResponder.update({
          where: { id: existing.id },
          data: { status: 'coming', respondedAt: new Date() },
          include: {
            responder: {
              select: { id: true, name: true },
            },
          },
        });
      } else {
        responderRecord = await prisma.incidentResponder.create({
          data: {
            incidentId,
            responderId,
            status: 'coming',
            respondedAt: new Date(),
          },
          include: {
            responder: {
              select: { id: true, name: true },
            },
          },
        });
      }

      // 2. Find the incident to get the victim (reporter) and send push notification
      const incident = await prisma.incident.findUnique({
        where: { id: incidentId },
        include: {
          user: {
            select: { id: true, name: true, pushToken: true },
          },
        },
      }) as any;

      if (incident && incident.user && incident.user.pushToken) {
        try {
          const pushResult = await sendPushNotification(
            incident.user.pushToken,
            'Help is on the way!',
            `${responderRecord.responder.name} is coming to help you.`,
            {
              type: 'help_coming',
              incidentId,
              responderId: responderRecord.responder.id,
              responderName: responderRecord.responder.name,
            }
          );
          if (pushResult.success) {
            console.log(`[ResponderController] Push notification sent to victim ${incident.user.name}`);
          } else {
            console.warn(`[ResponderController] Push notification failed for victim ${incident.user.name}: ${pushResult.error}`);
          }
        } catch (pushErr) {
          console.error('[ResponderController] Push notification exception:', pushErr);
        }
      }

      // 3. Trigger WebSocket broadcast update for this incident room
      broadcastRoomUpdate(incidentId);

      res.status(200).json({
        success: true,
        message: 'Responded to emergency successfully.',
        data: responderRecord,
      });
    } catch (error: any) {
      console.error('[ResponderController] Error responding to incident:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to respond to incident.',
      });
    }
  },

  abortIncidentResponse: async (req: Request, res: Response) => {
    try {
      const { id: incidentId } = req.params as { id: string };
      const { responderId } = req.body as { responderId: string };

      if (!incidentId || !responderId) {
        res.status(400).json({
          success: false,
          message: 'incidentId and responderId are required.',
        });
        return;
      }

      // Delete responder record from database
      await prisma.incidentResponder.deleteMany({
        where: { incidentId, responderId },
      });

      // Broadcast room update so the responder is removed from the active users list in WebSocket
      broadcastRoomUpdate(incidentId);

      res.status(200).json({
        success: true,
        message: 'Aborted incident response successfully.',
      });
    } catch (error: any) {
      console.error('[ResponderController] Error aborting incident response:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to abort incident response.',
      });
    }
  },
};

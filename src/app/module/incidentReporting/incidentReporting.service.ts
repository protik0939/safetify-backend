import { incident } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ICreateIncident, IUpdateIncident } from "./incidentReporting.interface";

const incidentInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  images: true,
  helperValidations: {
    include: {
      responder: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      images: true,
    },
  },
  incidentResponders: {
    include: {
      responder: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  },
};

function formatIncidentResponse(incident: any) {
  if (!incident) return null;
  const validations = incident.helperValidations || [];
  let truthfulnessPercentage = null;
  if (validations.length > 0) {
    const trueVotes = validations.filter((v: any) => v.isTrue).length;
    truthfulnessPercentage = Math.round((trueVotes / validations.length) * 100);
  }
  return {
    ...incident,
    truthfulnessPercentage,
  };
}

const createIncident = async (payload: ICreateIncident): Promise<any> => {
  // If user triggers an SOS, automatically delete their responder records from other active incidents
  if (payload.userId) {
    try {
      await prisma.incidentResponder.deleteMany({
        where: {
          responderId: payload.userId,
          status: 'coming',
        },
      });
    } catch (err) {
      console.error('[IncidentReportingService] Failed to auto-remove user from active responder records:', err);
    }
  }

  const createdIncident = await prisma.incident.create({
    data: {
      userId: payload.userId,
      title: payload.title || "SOS Emergency",
      description: payload.description,
      latitude: payload.latitude,
      longitude: payload.longitude,
      severityLevel: payload.severityLevel,
      timing: payload.timing,
      victim: payload.victim,
      attackers: payload.attackers,
      deathToll: payload.deathToll ?? 0,
      injuryCount: payload.injuryCount ?? 0,
      peopleHelped: payload.peopleHelped ?? 0,
      stories: payload.stories ?? [],
      reportedAt: new Date(),
    },
  });

  if (payload.images && Array.isArray(payload.images) && payload.images.length > 0) {
    await prisma.incidentImage.createMany({
      data: payload.images.map((url: string) => ({
        incidentId: createdIncident.id,
        url,
      })),
    });
  }

  return getIncidentById(createdIncident.id);
};

const getAllIncidents = async (limit?: number, offset?: number): Promise<any[]> => {
  const incidents = await prisma.incident.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
    include: incidentInclude,
  });
  return incidents.map(formatIncidentResponse);
};

const getIncidentById = async (id: string): Promise<any | null> => {
  const result = await prisma.incident.findUnique({
    where: { id },
    include: incidentInclude,
  });
  return formatIncidentResponse(result);
};

const getIncidentsByUserId = async (userId: string): Promise<any[]> => {
  const incidents = await prisma.incident.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: incidentInclude,
  });
  return incidents.map(formatIncidentResponse);
};

const getIncidentHistoryByUserId = async (userId: string): Promise<any[]> => {
  const incidents = await prisma.incident.findMany({
    where: {
      OR: [
        { userId },
        {
          incidentResponders: {
            some: {
              responderId: userId,
            },
          },
        },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: incidentInclude,
  });
  return incidents.map(formatIncidentResponse);
};

const updateIncident = async (
  id: string,
  data: IUpdateIncident,
): Promise<any> => {
  const { images, ...incidentData } = data;

  await prisma.incident.update({
    where: { id },
    data: incidentData,
  });

  if (images && Array.isArray(images)) {
    // Delete existing incident images (where helperValidationId is null)
    await prisma.incidentImage.deleteMany({
      where: {
        incidentId: id,
        helperValidationId: null,
      },
    });

    if (images.length > 0) {
      await prisma.incidentImage.createMany({
        data: images.map((url: string) => ({
          incidentId: id,
          url,
        })),
      });
    }
  }

  return getIncidentById(id);
};

const deleteIncident = async (id: string): Promise<void> => {
  await prisma.incident.delete({
    where: { id },
  });
};

export const IncidentReportingService = {
  createIncident,
  getAllIncidents,
  getIncidentById,
  getIncidentsByUserId,
  getIncidentHistoryByUserId,
  updateIncident,
  deleteIncident,
};

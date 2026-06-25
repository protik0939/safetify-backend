import { incident } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ICreateIncident, IUpdateIncident } from "./incidentReporting.interface";

const createIncident = async (payload: ICreateIncident): Promise<incident> => {
  const incident = await prisma.incident.create({
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
  return incident;
};

const getAllIncidents = async (limit?: number, offset?: number): Promise<incident[]> => {
  const incidents = await prisma.incident.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
  return incidents;
};

const getIncidentById = async (id: string): Promise<incident | null> => {
  const incident = await prisma.incident.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
  return incident;
};

const getIncidentsByUserId = async (userId: string): Promise<incident[]> => {
  const incidents = await prisma.incident.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return incidents;
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
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
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
    },
  });
  return incidents;
};

const updateIncident = async (
  id: string,
  data: IUpdateIncident,
): Promise<incident> => {
  const incident = await prisma.incident.update({
    where: { id },
    data,
  });
  return incident;
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

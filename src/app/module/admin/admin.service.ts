import { prisma } from "../../lib/prisma";
import { sendPushNotification } from "../../utills/pushNotification";
import { IUpdateUserStatus, IUpdateUserRole, IBroadcastPayload } from "./admin.interface";

const listAllUsers = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}) => {
  const { page = 1, limit = 50, search, role, status } = params;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { contactNo: { contains: search } },
    ];
  }

  if (role) {
    where.role = role;
  }

  if (status) {
    where.accountStatus = status;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        accountStatus: true,
        contactNo: true,
        bio: true,
        address: true,
        bloodGroup: true,
        gender: true,
        riskScore: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const updateUserStatus = async (userId: string, data: IUpdateUserStatus) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { accountStatus: data.accountStatus },
  });

  return { message: `User status updated to ${data.accountStatus}` };
};

const updateUserRole = async (userId: string, data: IUpdateUserRole) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: data.role },
  });

  return { message: `User role updated to ${data.role}` };
};

const getDashboardStats = async () => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    totalUsers,
    totalIncidents,
    activeIncidents,
    incidentsToday,
    incidentsBySeverity,
    incidentsByDay,
    recentIncidents,
    totalResponders,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.incident.count(),
    prisma.incident.count({
      where: {
        status: { notIn: ["resolved", "cancelled"] },
      },
    }),
    prisma.incident.count({
      where: { createdAt: { gte: todayStart } },
    }),
    prisma.incident.groupBy({
      by: ["severityLevel"],
      _count: { id: true },
    }),
    prisma.$queryRaw`
      SELECT DATE("createdAt") as date, COUNT(*)::int as count
      FROM incident
      WHERE "createdAt" >= NOW() - INTERVAL '30 days'
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `,
    prisma.incident.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        severityLevel: true,
        status: true,
        createdAt: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    }),
    prisma.incidentResponder.count(),
  ]);

  const rawDays = incidentsByDay as Array<{ date: Date; count: number }>;

  return {
    totalUsers,
    totalIncidents,
    activeIncidents,
    incidentsToday,
    totalResponders,
    incidentsBySeverity: incidentsBySeverity.map((item) => ({
      severity: item.severityLevel || "unknown",
      count: item._count.id,
    })),
    incidentsByDay: rawDays.map((item) => ({
      date: new Date(item.date).toISOString().split("T")[0],
      count: Number(item.count),
    })),
    recentIncidents: recentIncidents.map((inc) => ({
      id: inc.id,
      title: inc.title,
      severityLevel: inc.severityLevel,
      status: inc.status,
      createdAt: inc.createdAt,
      user: inc.user,
    })),
  };
};

const broadcastPushNotification = async (payload: IBroadcastPayload) => {
  const users = await prisma.user.findMany({
    where: {
      pushToken: { not: null },
      accountStatus: "ACTIVE",
    },
    select: { pushToken: true },
  });

  if (users.length === 0) {
    return { message: "No users with push tokens found", sent: 0 };
  }

  let sent = 0;
  let failed = 0;

  for (const user of users) {
    if (user.pushToken) {
      const result = await sendPushNotification(
        user.pushToken,
        payload.title,
        payload.body,
        { type: "admin_broadcast" }
      );
      if (result.success) {
        sent++;
      } else {
        failed++;
      }
    }
  }

  return {
    message: `Broadcast sent to ${sent} users${failed > 0 ? `, ${failed} failed` : ""}`,
    sent,
    failed,
  };
};

const listAllIncidents = async (params: {
  page?: number;
  limit?: number;
  status?: string;
  severity?: string;
}) => {
  const { page = 1, limit = 50, status, severity } = params;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (severity) where.severityLevel = severity;

  const [incidents, total] = await Promise.all([
    prisma.incident.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.incident.count({ where }),
  ]);

  return {
    incidents,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const updateIncidentStatus = async (id: string, status: string) => {
  const incident = await prisma.incident.findUnique({ where: { id } });
  if (!incident) throw new Error("Incident not found");

  await prisma.incident.update({ where: { id }, data: { status } });
  return { message: `Incident status updated to ${status}` };
};

const deleteIncident = async (id: string) => {
  const incident = await prisma.incident.findUnique({ where: { id } });
  if (!incident) throw new Error("Incident not found");

  await prisma.incident.delete({ where: { id } });
  return { message: "Incident deleted successfully" };
};

export const AdminService = {
  listAllUsers,
  updateUserStatus,
  updateUserRole,
  getDashboardStats,
  broadcastPushNotification,
  listAllIncidents,
  updateIncidentStatus,
  deleteIncident,
};

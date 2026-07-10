import { Request, Response } from "express";
import { AdminService } from "./admin.service";
import { sendResponse } from "../../shared/sendResponse";
import { catchAsync } from "../../shared/catchAsync";

const listAllUsers = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, search, role, status } = req.query;

  const result = await AdminService.listAllUsers({
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
    search: search as string | undefined,
    role: role as string | undefined,
    status: status as string | undefined,
  });

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Users retrieved successfully",
    data: result.users,
    meta: result.meta,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const userId = Array.isArray(req.params.userId)
    ? req.params.userId[0]
    : req.params.userId;
  const result = await AdminService.updateUserStatus(userId, req.body);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: result.message,
  });
});

const updateUserRole = catchAsync(async (req: Request, res: Response) => {
  const userId = Array.isArray(req.params.userId)
    ? req.params.userId[0]
    : req.params.userId;
  const result = await AdminService.updateUserRole(userId, req.body);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: result.message,
  });
});

const getDashboardStats = catchAsync(async (_req: Request, res: Response) => {
  const result = await AdminService.getDashboardStats();
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Dashboard stats retrieved successfully",
    data: result,
  });
});

const broadcastPushNotification = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AdminService.broadcastPushNotification(req.body);
    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: result.message,
      data: { sent: result.sent, failed: result.failed },
    });
  }
);

const listAllIncidents = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, status, severity } = req.query;

  const result = await AdminService.listAllIncidents({
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
    status: status as string | undefined,
    severity: severity as string | undefined,
  });

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Incidents retrieved successfully",
    data: result.incidents,
    meta: result.meta,
  });
});

const updateIncidentStatus = catchAsync(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const result = await AdminService.updateIncidentStatus(id, req.body.status);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: result.message,
  });
});

const deleteIncident = catchAsync(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const result = await AdminService.deleteIncident(id);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: result.message,
  });
});

export const AdminController = {
  listAllUsers,
  updateUserStatus,
  updateUserRole,
  getDashboardStats,
  broadcastPushNotification,
  listAllIncidents,
  updateIncidentStatus,
  deleteIncident,
};

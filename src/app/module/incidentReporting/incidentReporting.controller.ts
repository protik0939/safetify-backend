import { Request, Response } from "express";
import { IncidentReportingService } from "./incidentReporting.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

const createIncident = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await IncidentReportingService.createIncident(payload);

  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "Incident reported successfully",
    data: result,
  });
});

const getAllIncidents = catchAsync(async (req: Request, res: Response) => {
  const result = await IncidentReportingService.getAllIncidents();

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

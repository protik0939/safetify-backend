import { Request, Response } from "express";
import { EmergencyContactService } from "./emergencyContact.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

const createEmergencyContact = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const result =
      await EmergencyContactService.createEmergencyContact(payload);

    sendResponse(res, {
      httpStatusCode: 201,
      success: true,
      message: "Emergency contact created successfully",
      data: result,
    });
  },
);

const getEmergencyContactByUserId = catchAsync(
  async (req: Request, res: Response) => {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    const result =
      await EmergencyContactService.getEmergencyContactByUserId(userId);
    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Emergency contacts retrieved successfully",
      data: result,
    });
  },
);

const updateEmergencyContact = catchAsync(
  async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const payload = req.body;
    const result =
      await EmergencyContactService.updateEmergecyContact(id, payload);
    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Emergency contact updated successfully",
      data: result,
    });
  },
);

const deleteEmergencyContact = catchAsync(
  async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await EmergencyContactService.deleteEmergencyContact(id);
    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Emergency contact deleted successfully",
    });
  }
);

export const EmergencyContactController = {
  createEmergencyContact,
  getEmergencyContactByUserId,
  updateEmergencyContact,
  deleteEmergencyContact,
};

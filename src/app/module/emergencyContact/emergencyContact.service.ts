import { EmergencyContact } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createEmergencyContact = async (
  Payload: EmergencyContact,
): Promise<EmergencyContact> => {
  const emergencyContact = await prisma.emergencyContact.create({
    data: Payload,
  });
  return emergencyContact;
};

const getEmergencyContactByUserId = async (
  userId: string,
): Promise<EmergencyContact[]> => {
  const emergencyContacts = await prisma.emergencyContact.findMany({
    where: {
      user: {
        id: userId,
      },
    },
  });
  return emergencyContacts;
};

const updateEmergecyContact = async (id: string, data: EmergencyContact) => {
  const emergencyContact = await prisma.emergencyContact.update({
    // TODO: Need to authenticate the user and check if the emergency contact belongs to the user before updating

    where: {
      id: id,
    },
    data: data,
  });
  return emergencyContact;
};

const deleteEmergencyContact = async (id: string) => {
  await prisma.emergencyContact.delete({
    where: {
      id: id,
    },
  });
};

export const EmergencyContactService = {
  createEmergencyContact,
  getEmergencyContactByUserId,
  updateEmergecyContact,
  deleteEmergencyContact,
};

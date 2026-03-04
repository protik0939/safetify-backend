import { EmergencyContact } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createEmergencyContact = async(Payload: EmergencyContact) : Promise<EmergencyContact> => {
    const emergencyContact = await prisma.emergencyContact.create({
        data: Payload
    });
    return emergencyContact;
}

const getEmergencyContactByUserId = async(userId: string) : Promise<EmergencyContact[]> => {
    const emergencyContacts = await prisma.emergencyContact.findMany({
        where: {
            user: {
                id: userId
            }
        }
    });
    return emergencyContacts;
} 

export const EmergencyContactService = {
    createEmergencyContact,
    getEmergencyContactByUserId
}
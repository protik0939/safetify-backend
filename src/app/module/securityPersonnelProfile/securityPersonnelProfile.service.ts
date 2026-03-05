import { SecurityPersonnelProfile } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import {
  ICreateSecurityPersonnelProfile,
  IUpdateSecurityPersonnelProfile,
} from "./securityPersonnelProfile.interface";

const createSecurityPersonnelProfile = async (
  payload: ICreateSecurityPersonnelProfile,
): Promise<SecurityPersonnelProfile> => {
  const profile = await prisma.securityPersonnelProfile.create({
    data: {
      id: payload.userId,
      userId: payload.userId,
      address: payload.address,
      rank: payload.rank,
      bloodGroup: payload.bloodGroup,
    },
  });
  return profile;
};

const getSecurityPersonnelProfileByUserId = async (
  userId: string,
): Promise<SecurityPersonnelProfile | null> => {
  const profile = await prisma.securityPersonnelProfile.findUnique({
    where: {
      userId: userId,
    },
  });
  return profile;
};

const updateSecurityPersonnelProfile = async (
  userId: string,
  data: IUpdateSecurityPersonnelProfile,
): Promise<SecurityPersonnelProfile> => {
  const profile = await prisma.securityPersonnelProfile.update({
    where: {
      userId: userId,
    },
    data: data,
  });
  return profile;
};

const deleteSecurityPersonnelProfile = async (userId: string): Promise<void> => {
  await prisma.securityPersonnelProfile.delete({
    where: {
      userId: userId,
    },
  });
};

export const SecurityPersonnelProfileService = {
  createSecurityPersonnelProfile,
  getSecurityPersonnelProfileByUserId,
  updateSecurityPersonnelProfile,
  deleteSecurityPersonnelProfile,
};

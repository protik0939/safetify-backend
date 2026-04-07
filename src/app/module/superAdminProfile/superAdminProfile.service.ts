import { SuperAdminProfile } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import {
  ICreateSuperAdminProfile,
  IUpdateSuperAdminProfile,
} from "./superAdminProfile.interface";

const createSuperAdminProfile = async (
  payload: ICreateSuperAdminProfile,
): Promise<SuperAdminProfile> => {
  const profile = await prisma.superAdminProfile.create({
    data: {
      id: payload.userId,
      userId: payload.userId,
    },
  });
  return profile;
};

const getSuperAdminProfileByUserId = async (
  userId: string,
): Promise<SuperAdminProfile | null> => {
  const profile = await prisma.superAdminProfile.findUnique({
    where: {
      userId: userId,
    },
  });
  return profile;
};

const updateSuperAdminProfile = async (
  userId: string,
  data: IUpdateSuperAdminProfile,
): Promise<SuperAdminProfile> => {
  const profile = await prisma.superAdminProfile.update({
    where: {
      userId: userId,
    },
    data: data,
  });
  return profile;
};

const deleteSuperAdminProfile = async (userId: string): Promise<void> => {
  await prisma.superAdminProfile.delete({
    where: {
      userId: userId,
    },
  });
};

export const SuperAdminProfileService = {
  createSuperAdminProfile,
  getSuperAdminProfileByUserId,
  updateSuperAdminProfile,
  deleteSuperAdminProfile,
};

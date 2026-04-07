import { AdminProfile } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import {
  ICreateAdminProfile,
  IUpdateAdminProfile,
} from "./adminProfile.interface";

const createAdminProfile = async (
  payload: ICreateAdminProfile,
): Promise<AdminProfile> => {
  const profile = await prisma.adminProfile.create({
    data: {
      id: payload.userId,
      userId: payload.userId,
      address: payload.address,
    },
  });
  return profile;
};

const getAdminProfileByUserId = async (
  userId: string,
): Promise<AdminProfile | null> => {
  const profile = await prisma.adminProfile.findUnique({
    where: {
      userId: userId,
    },
  });
  return profile;
};

const updateAdminProfile = async (
  userId: string,
  data: IUpdateAdminProfile,
): Promise<AdminProfile> => {
  const profile = await prisma.adminProfile.update({
    where: {
      userId: userId,
    },
    data: data,
  });
  return profile;
};

const deleteAdminProfile = async (userId: string): Promise<void> => {
  await prisma.adminProfile.delete({
    where: {
      userId: userId,
    },
  });
};

export const AdminProfileService = {
  createAdminProfile,
  getAdminProfileByUserId,
  updateAdminProfile,
  deleteAdminProfile,
};

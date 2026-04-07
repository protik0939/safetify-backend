import { UserProfile } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ICreateUserProfile, IUpdateUserProfile } from "./userProfile.interface";

const createUserProfile = async (
  payload: ICreateUserProfile,
): Promise<UserProfile> => {
  const userProfile = await prisma.userProfile.create({
    data: {
      id: payload.userId,
      userId: payload.userId,
      bio: payload.bio,
      address: payload.address,
      bloodGroup: payload.bloodGroup,
    },
  });
  return userProfile;
};

const getUserProfileByUserId = async (
  userId: string,
): Promise<UserProfile | null> => {
  const userProfile = await prisma.userProfile.findUnique({
    where: {
      userId: userId,
    },
  });
  return userProfile;
};

const updateUserProfile = async (
  userId: string,
  data: IUpdateUserProfile,
): Promise<UserProfile> => {
  const userProfile = await prisma.userProfile.update({
    where: {
      userId: userId,
    },
    data: data,
  });
  return userProfile;
};

const deleteUserProfile = async (userId: string): Promise<void> => {
  await prisma.userProfile.delete({
    where: {
      userId: userId,
    },
  });
};

export const UserProfileService = {
  createUserProfile,
  getUserProfileByUserId,
  updateUserProfile,
  deleteUserProfile,
};

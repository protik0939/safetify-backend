import { AccountStatus, User } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { ICreateUserProfile, IUpdateUserProfile } from "./userProfile.interface";

const createUserProfile = async (
  payload: ICreateUserProfile,
): Promise<User> => {
  const userProfile = await prisma.user.create({
    data: {
      id: payload.userId,
      name: payload.name,
      email: payload.email,
      bio: payload.bio,
      address: payload.address,
      bloodGroup: payload.bloodGroup,
      gender: payload.gender,
      privacy: payload.privacy,
      riskScore: payload.riskScore,
    },
  });
  return userProfile;
};

const getUserProfileByUserId = async (
  userId: string,
): Promise<User | null> => {
  const userProfile = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  return userProfile;
};

const updateUserProfile = async (
  userId: string,
  data: IUpdateUserProfile,
): Promise<User> => {
  const userProfile = await prisma.user.update({
    where: {
      id: userId,
    },
    data: data,
  });
  return userProfile;
};

const deleteUserProfile = async (userId: string): Promise<void> => {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      accountStatus: AccountStatus.DELETIONPENDING,
      deletedAt: new Date(),
    },
  });
};

export const UserProfileService = {
  createUserProfile,
  getUserProfileByUserId,
  updateUserProfile,
  deleteUserProfile,
};

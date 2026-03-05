import { BloodGroup } from "../../../generated/prisma/client";

export interface ICreateUserProfile {
  userId: string;
  bio?: string;
  address?: string;
  bloodGroup?: BloodGroup;
}

export interface IUpdateUserProfile {
  bio?: string;
  address?: string;
  bloodGroup?: BloodGroup;
}

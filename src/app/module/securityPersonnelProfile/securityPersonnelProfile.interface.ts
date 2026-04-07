import { BloodGroup, PoliceRank } from "@prisma/client";

export interface ICreateSecurityPersonnelProfile {
  userId: string;
  address?: string;
  rank?: PoliceRank;
  bloodGroup?: BloodGroup;
}

export interface IUpdateSecurityPersonnelProfile {
  address?: string;
  rank?: PoliceRank;
  bloodGroup?: BloodGroup;
}

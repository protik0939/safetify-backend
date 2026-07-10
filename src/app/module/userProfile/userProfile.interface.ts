export interface ICreateUserProfile {
  name: string;
  email: string;
  userId: string;
  bio?: string;
  address?: string;
  bloodGroup?: string;
  gender?: string;
  image?: string;
  location?: string;
  contactNo?: string;
  privacy?: string;
  riskScore?: number;
}

export interface IUpdateUserProfile {
  name?: string;
  image?: string;
  bio?: string;
  address?: string;
  bloodGroup?: string;
  gender?: string;
  location?: string;
  contactNo?: string;
  privacy?: string;
  riskScore?: number;
}

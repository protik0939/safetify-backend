export interface ICreateUserProfile {
  name: string;
  email: string;
  userId: string;
  bio?: string;
  address?: string;
  bloodGroup?: string;
}

export interface IUpdateUserProfile {
  bio?: string;
  address?: string;
  bloodGroup?: string;
}

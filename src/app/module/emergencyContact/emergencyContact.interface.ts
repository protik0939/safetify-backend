export interface ICreateEmergencyContact {
  userId: string;
  name: string;
  relationship: string;
  phoneNumber: string;
}

export interface IUpdateEmergencyContact {
  name?: string;
  relationship?: string;
  phoneNumber?: string;
}

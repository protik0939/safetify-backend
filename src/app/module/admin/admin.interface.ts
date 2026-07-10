export interface IUpdateUserStatus {
  accountStatus: "ACTIVE" | "BANNED" | "DEACTIVATED" | "DELETIONPENDING";
}

export interface IUpdateUserRole {
  role: "USER" | "ADMIN" | "SUPERADMIN" | "SECURITYPERSON";
}

export interface IBroadcastPayload {
  title: string;
  body: string;
}

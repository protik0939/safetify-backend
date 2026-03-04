import { AccountStatus } from "../../../generated/prisma/enums";
import { auth } from "../../lib/auth";
import { ILoginUser, IRegisterUser } from "./auth.interface";

const registerUser = async (payload: IRegisterUser) => {
  const { name, email, password } = payload;

  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
      // role: Role.USER,
      // accountStatus: AccountStatus.ACTIVE
    },
  });

  if (!data.user) {
    throw new Error("Failed to register user");
  }

  // const user = await prisma.$transaction(async (tx) => {
  //     await tx.user.
  // });

  return data;
};

const loginUser = async (payload: ILoginUser) => {
  const { email, password } = payload;

  const data = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });

  if (!data.user) {
    throw new Error("Failed to login user");
  }

  if (data.user.accountStatus === AccountStatus.DELETED) {
    throw new Error("User account has been deleted");
  }

  if (data.user.accountStatus === AccountStatus.BANNED) {
    throw new Error("User account has been banned");
  }

  if (data.user.accountStatus === AccountStatus.DEACTIVATED) {
    throw new Error("User account has been deactivated");
  }

  if (data.user.accountStatus === AccountStatus.DELETIONPENDING) {
    throw new Error("User account deletion is pending");
  }

  return data;
};

export const AuthService = {
  registerUser,
  loginUser,
};

import { AccountStatus } from "@prisma/client";
import { auth } from "../../lib/auth";
import { ILoginUser, IRegisterUser } from "./auth.interface";
import { prisma } from "../../lib/prisma";

const registerUser = async (payload: IRegisterUser) => {
  const { name, email, password } = payload;

  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
    },
  });

  if (!data.user) {
    throw new Error("Failed to register user");
  }

  console.log("Registration data:", data);
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

  // Close any active SOS/incident for this user
  try {
    const activeIncidents = await prisma.incident.findMany({
      where: {
        userId: data.user.id,
        status: {
          notIn: ["resolved", "cancelled"],
        },
      },
    });

    for (const incident of activeIncidents) {
      await prisma.incident.update({
        where: { id: incident.id },
        data: { status: "resolved" },
      });
      // Call websocket helper to notify responders and close connections
      try {
        const { closeActiveSOSRoom } = await import("../../websocket");
        closeActiveSOSRoom(incident.id);
      } catch (wsErr) {
        console.error(`[WS] Failed to close active SOS room on login:`, wsErr);
      }
    }
  } catch (err) {
    console.error("[Login] Error closing user's active SOS:", err);
  }

  // Delete all other sessions for this user to force logout on other devices
  try {
    if (data.token) {
      await prisma.session.deleteMany({
        where: {
          userId: data.user.id,
          token: { not: data.token },
        },
      });
      console.log(`[Login] Cleared other sessions for user ${data.user.id}`);
    }
  } catch (err) {
    console.error("[Login] Failed to clear other sessions:", err);
  }

  console.log("Login data:", data);
  return data;
};

const sendOTP = async (email: string) => {
  const otp = Math.floor(10000000 + Math.random() * 90000000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.verification.deleteMany({
    where: { identifier: email },
  });

  await prisma.verification.create({
    data: {
      id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      identifier: email,
      value: otp,
      expiresAt,
    },
  });

  console.log(`[OTP] Email verification OTP code for ${email} is: ${otp}`);

  // Send verification email using Nodemailer
  try {
    const { sendVerificationEmail } = await import("../../utills/email");
    await sendVerificationEmail(email, otp);
  } catch (err) {
    console.error(`[OTP] Failed to send verification email to ${email}:`, err);
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (user && user.pushToken) {
    try {
      const { sendPushNotification } = await import("../../utills/pushNotification");
      await sendPushNotification(
        user.pushToken,
        "🔐 Safetify Verification Code",
        `Your 8-digit verification code is: ${otp}. It expires in 15 minutes.`,
        { type: "email_verification_otp", otp }
      );
      console.log(`[OTP] Sent push notification with OTP to user ${user.id}`);
    } catch (err) {
      console.error(`[OTP] Failed to send push notification with OTP to ${email}:`, err);
    }
  }

  return { message: "OTP sent successfully" };
};

const verifyOTP = async (email: string, otp: string) => {
  const record = await prisma.verification.findFirst({
    where: {
      identifier: email,
      value: otp,
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) {
    throw new Error("Invalid or expired verification code");
  }

  await prisma.user.update({
    where: { email },
    data: { emailVerified: true },
  });

  await prisma.verification.delete({
    where: { id: record.id },
  });

  return { message: "Email verified successfully" };
};

export const AuthService = {
  registerUser,
  loginUser,
  sendOTP,
  verifyOTP,
};

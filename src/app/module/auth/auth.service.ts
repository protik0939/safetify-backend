import { AccountStatus } from "@prisma/client";
import { auth } from "../../lib/auth";
import { ILoginUser, IRegisterUser } from "./auth.interface";
import { prisma } from "../../lib/prisma";
import { generateOTPToken, verifyOTPToken } from "../../lib/otpToken";

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
  const cleanEmail = email.trim().toLowerCase();
  const otp = Math.floor(10000000 + Math.random() * 90000000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  // Generate stateless signed token
  const otpToken = generateOTPToken(cleanEmail, otp, expiresAt);

  console.log(`[OTP] Email verification OTP code for ${cleanEmail} is: ${otp}`);

  // Send verification email asynchronously so it doesn't block the request or cause timeouts
  import("../../utills/email").then(({ sendVerificationEmail }) => {
    sendVerificationEmail(cleanEmail, otp).catch((err) => {
      console.error(`[OTP] Async verification email failed for ${cleanEmail}:`, err);
    });
  }).catch((err) => {
    console.error(`[OTP] Failed to import email utility:`, err);
  });

  const user = await prisma.user.findUnique({
    where: { email: cleanEmail },
  });

  if (user && user.pushToken) {
    try {
      const { sendPushNotification } = await import("../../utills/pushNotification");
      await sendPushNotification(
        user.pushToken,
        "🔐 Verification Code Sent",
        `A verification code has been sent to ${cleanEmail}. Please check your inbox.`,
        { type: "email_verification_otp_sent" }
      );
      console.log(`[OTP] Sent secure push notification alert to user ${user.id}`);
    } catch (err) {
      console.error(`[OTP] Failed to send secure push notification alert to ${cleanEmail}:`, err);
    }
  }

  return { message: "OTP sent successfully", token: otpToken };
};

const verifyOTP = async (email: string, otp: string, token: string) => {
  const cleanEmail = email.trim().toLowerCase();
  const cleanOtp = otp.trim();

  console.log(`[verifyOTP] Stateless verification request: email="${cleanEmail}", otp="${cleanOtp}", tokenLength=${token?.length || 0}`);

  if (!token) {
    throw new Error("Verification token is missing");
  }

  const isValid = verifyOTPToken(cleanEmail, cleanOtp, token);
  if (!isValid) {
    throw new Error("Invalid or expired verification code");
  }

  await prisma.user.update({
    where: { email: cleanEmail },
    data: { emailVerified: true },
  });

  console.log(`[verifyOTP] Verification successful for email="${cleanEmail}"`);
  return { message: "Email verified successfully" };
};

export const AuthService = {
  registerUser,
  loginUser,
  sendOTP,
  verifyOTP,
};

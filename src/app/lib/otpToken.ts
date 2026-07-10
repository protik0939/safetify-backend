import crypto from 'crypto';

const SECRET_KEY = process.env.JWT_SECRET || process.env.AUTH_SECRET || 'safetify_super_secret_otp_key_123456';

/**
 * Generates a signed, base64-encoded verification token containing the email, expiration time,
 * and a cryptographic HMAC-SHA256 signature of the email, OTP, and expiration.
 */
export function generateOTPToken(email: string, otp: string, expiresAt: Date): string {
  const cleanEmail = email.trim().toLowerCase();
  const hash = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(`${cleanEmail}:${otp.trim()}:${expiresAt.getTime()}`)
    .digest('hex');
  const payload = JSON.stringify({ email: cleanEmail, expiresAt: expiresAt.getTime(), hash });
  return Buffer.from(payload).toString('base64');
}

/**
 * Decodes and cryptographically verifies a verification token against the provided email and OTP.
 * Ensures the token was not tampered with, matches the user, and has not expired.
 */
export function verifyOTPToken(email: string, otp: string, token: string): boolean {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    const payloadStr = Buffer.from(token, 'base64').toString('utf-8');
    const { email: tokenEmail, expiresAt, hash } = JSON.parse(payloadStr);

    // Verify email match
    if (cleanEmail !== tokenEmail.trim().toLowerCase()) {
      console.log(`[verifyOTPToken] Email mismatch: expected="${cleanEmail}", token="${tokenEmail}"`);
      return false;
    }

    // Verify expiration
    if (Date.now() > expiresAt) {
      console.log(`[verifyOTPToken] Token expired: now=${Date.now()}, expiresAt=${expiresAt}`);
      return false;
    }

    // Recalculate HMAC signature and perform a timing-safe comparison
    const expectedHash = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(`${tokenEmail}:${cleanOtp}:${expiresAt}`)
      .digest('hex');

    const isMatched = crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expectedHash));
    if (!isMatched) {
      console.log(`[verifyOTPToken] HMAC hash mismatch`);
    }
    return isMatched;
  } catch (err) {
    console.error(`[verifyOTPToken] Failed to parse or verify token:`, err);
    return false;
  }
}

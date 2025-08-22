import bcrypt from "bcryptjs";
import crypto from "crypto";

const OTP_LENGTH = parseInt(process.env.OTP_LENGTH || "6", 10);
const OTP_EXP_MINUTES = parseInt(process.env.OTP_EXP_MINUTES || "10", 10);

export function generateOtp(): string {
  const min = 10 ** (OTP_LENGTH - 1);
  const max = 10 ** OTP_LENGTH - 1;
  return crypto.randomInt(min, max + 1).toString();
}

export async function hashOtp(code: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(code, salt);
}

export async function verifyOtp(code: string, hash: string) {
  return bcrypt.compare(code, hash);
}

export function expiryDate(): Date {
  const d = new Date();
  d.setMinutes(d.getMinutes() + OTP_EXP_MINUTES);
  return d;
}

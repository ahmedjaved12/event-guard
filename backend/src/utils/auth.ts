import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET missing");

export async function hashPassword(plain: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export function signAccessToken(
  payload: string | Buffer | object,
  expiresIn: SignOptions["expiresIn"] = "30m"
) {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, JWT_SECRET as string, options);
}

// lib/authService.ts
import api from "./api";
import { jwtDecode } from "jwt-decode";

export interface AppJwtPayload {
  sub: number;
  role: "ADMIN" | "ORGANIZER" | "PARTICIPANT";
  avatarUrl?: string;
  name: string;
  exp?: number;
  iat?: number;
}

export async function signupUser(data: {
  name: string;
  email: string;
  password: string;
  role: "PARTICIPANT" | "ORGANIZER";
}) {
  try {
    const res = await api.post("/auth/register", data);
    return res.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    const message = err.response?.data?.error || "Signup failed";
    throw new Error(message);
  }
}

export async function loginUser(data: { email: string; password: string }) {
  try {
    const res = await api.post("/auth/login", data);
    // ✅ Save token
    localStorage.setItem("authToken", res.data.token);
    return res.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    const message = err.response?.data?.error || "Login failed";
    throw new Error(message);
  }
}

// ✅ Decode user directly from token
export function getCurrentUser(): AppJwtPayload | null {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) return null;

    const decoded = jwtDecode<AppJwtPayload>(token);

    // check expiry if exp exists
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("authToken");
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

export async function requestOtp(data: {
  email: string;
  purpose: "LOGIN" | "SIGNUP";
}) {
  return api.post("auth/otp/request", data);
}

export async function getOtpStatus(params: {
  email: string | null;
  purpose: "LOGIN" | "SIGNUP";
}) {
  return api.get("auth/otp/status", { params });
}

export async function verifyOtp(data: {
  email: string;
  purpose: "LOGIN" | "SIGNUP";
  code: string;
}) {
  return api.post("auth/otp/verify", data);
}

export async function requestPasswordReset(email: string) {
  return api.post("/auth/request-reset", { email });
}

export async function resetPassword(data: {
  token: string;
  newPassword: string;
}) {
  return api.post("/auth/reset-password", data);
}

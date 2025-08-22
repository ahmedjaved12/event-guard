import api from "./api";

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
  return api.post("/auth/login", data);
}

export async function requestOtp(data: {
  email: string;
  purpose: "LOGIN" | "SIGNUP";
}) {
  return api.post("auth/otp/request", data);
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

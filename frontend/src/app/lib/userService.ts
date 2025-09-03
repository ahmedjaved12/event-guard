// src/lib/userService.ts
import api from "./api";
import { User } from "./types";
import { setToken, clearToken } from "./authClient";

const TOKEN_KEY = "authToken";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export const userService = {
  /**
   * Fetch current user details from backend.
   */
  async fetchMe(): Promise<User | null> {
    const token = getToken();
    if (!token) return null;

    try {
      const { data } = await api.get<User>("/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    } catch (err) {
      console.error("❌ Failed to fetch profile:", err);
      return null;
    }
  },

  /**
   * Update the logged-in user's profile.
   * Payload: { name, avatarUrl, emailNotifications, isActive }
   */
  async updateProfile(payload: Partial<User>) {
    const token = getToken();
    if (!token) throw new Error("No access token found");

    const { data } = await api.put<User>("/users/me", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return data;
  },

  /**
   * Upload an avatar file and return the uploaded URL.
   */
  async uploadAvatar(file: File): Promise<string> {
    const token = getToken();
    if (!token) throw new Error("No access token found");

    const formData = new FormData();
    formData.append("image", file);

    const { data } = await api.post<{ url: string }>("/uploads", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return data.url;
  },

  /**
   * Save token after login/signup.
   */
  saveToken(token: string) {
    setToken(token);
  },

  /**
   * Clear token on logout.
   */
  logout() {
    clearToken();
  },
};

"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import api from "./api";

export interface AppJwtPayload {
  sub: number;
  role: "ADMIN" | "ORGANIZER" | "PARTICIPANT";
  avatarUrl?: string;
  name: string;
  exp?: number;
  iat?: number;
}

export interface User {
  id: number;
  name?: string;
  email?: string;
  role: "ADMIN" | "ORGANIZER" | "PARTICIPANT";
  isActive: boolean;
  otpVerified: boolean;
  emailNotifications: boolean;
  createdAt: string;
  updatedAt: string;
  avatarUrl?: string;
}

const TOKEN_KEY = "authToken";

function getCurrentUserFromToken(): AppJwtPayload | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  try {
    const payload = jwtDecode<AppJwtPayload>(token);
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
    return payload;
  } catch (err) {
    console.error("Invalid token:", err);
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
}

async function fetchUserFromDb(): Promise<User | null> {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) return null;

    const res = await api.get<User>("/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (err) {
    console.error("Failed to fetch user from DB:", err);
    return null;
  }
}

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const tokenPayload = getCurrentUserFromToken();
      if (!tokenPayload) {
        setUser(null);
        setLoading(false);
        return;
      }

      const dbUser = await fetchUserFromDb();
      setUser(dbUser);
      setLoading(false);
    };

    init();

    const handler = () => init();
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return { user, loading } as const;
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

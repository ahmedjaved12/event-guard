import api from "./api";
import { EventRegistration } from "./types";

export interface RegistrationsQuery {
  page?: number;
  pageSize?: number;
  q?: string;
}

export const registrationService = {
  listForOrganizer: async () => {
    const token = localStorage.getItem("authToken");
    const { data } = await api.get("/registrations/organizer", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },

  listForParticipant: async () => {
    const token = localStorage.getItem("authToken");
    const { data } = await api.get("/registrations/participant", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },

  async listForAdmin(params: { page?: number; limit?: number } = {}) {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Not authenticated");

    const { data } = await api.get<{
      data: EventRegistration[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>("/admin/registrations", {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data;
  },
};

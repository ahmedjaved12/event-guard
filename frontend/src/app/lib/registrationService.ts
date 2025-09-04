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
};

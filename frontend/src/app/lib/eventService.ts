import api from "./api";
import { Event, EventRegistration } from "./types";

export interface CreateEventDTO {
  title: string;
  description: string;
  imageUrl?: string;
  date: string;
  location: string;
  entryFee?: number;
  tags?: string[];
  maxParticipants?: number;
}

export interface UpdateEventDTO {
  title?: string;
  description?: string;
  imageUrl?: string;
  date?: string;
  location?: string;
  entryFee?: number;
  tags?: string[];
  maxParticipants?: number;
  status?: "UPCOMING" | "COMPLETED" | "CANCELLED";
}

export interface OrganizerEventsQuery {
  q?: string;
  status?: "UPCOMING" | "COMPLETED" | "CANCELLED";
  from?: string; // ISO date
  to?: string; // ISO date
  page?: number;
  pageSize?: number;
}

export const eventService = {
  // ✅ Get all events for current organizer
  async getMyEvents() {
    const res = await api.get<Event[]>("/organizer/events");
    return res.data;
  },

  // ✅ Get single event by ID
  async getEventById(id: number) {
    const res = await api.get<Event>(`/events/${id}`);
    return res.data;
  },

  // ✅ Create new event
  async createEvent(data: CreateEventDTO) {
    const res = await api.post<Event>("/events", data);
    return res.data;
  },

  // ✅ Update event
  async updateEvent(id: number, data: UpdateEventDTO) {
    const res = await api.put<Event>(`/events/${id}`, data);
    return res.data;
  },

  // ✅ Delete event
  async deleteEvent(id: number) {
    const res = await api.delete<{ success: boolean }>(`/events/${id}`);
    return res.data;
  },

  async listForOrganizer(params: OrganizerEventsQuery = {}) {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Not authenticated");

    const { data } = await api.get<{
      events: Event[];
      total: number;
      page: number;
      totalPages: number;
    }>("/events/organizer", {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data;
  },

  // ✅ Get registrations for an event
  async getEventRegistrations(eventId: number) {
    const res = await api.get<EventRegistration[]>(
      `/events/${eventId}/registrations`
    );
    return res.data;
  },

  // ✅ Get all events (for participants) with pagination
  async listAllEvents(params: { page?: number; limit?: number } = {}) {
    const res = await api.get<{
      events: Event[];
      total: number;
      page: number;
      totalPages: number;
    }>("/events", { params });

    return res.data;
  },

  // ✅ Get all registrations for current participant
  async getMyRegistrations() {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Not authenticated");

    const { data } = await api.get<EventRegistration[]>("/registrations/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data;
  },

  // ✅ Join event (participant only)
  async joinEvent(eventId: number) {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Not authenticated");

    const { data } = await api.post(
      `/participants/${eventId}/join`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return data;
  },

  // ✅ Leave event (participant only)
  async leaveEvent(eventId: number) {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Not authenticated");

    const { data } = await api.post(
      `/participants/${eventId}/leave`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return data;
  },
};

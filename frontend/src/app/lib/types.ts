export type Role = "ADMIN" | "ORGANIZER" | "PARTICIPANT";

export interface User {
  id: number;
  name?: string | null;
  email?: string | null;
  role: Role;
  isActive: boolean;
  otpVerified: boolean;
  emailNotifications: boolean;
  createdAt: string;
  updatedAt: string;
  avatarUrl?: string | null;
}

export type EventStatus = "UPCOMING" | "COMPLETED" | "CANCELLED";

export interface Event {
  id: number;
  title: string;
  description: string;
  imageUrl?: string | null;
  status: EventStatus;
  date: string; // ISO
  location: string;
  entryFee: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  maxParticipants: number;
  organizerId: number;
  registrations: EventRegistration[];
}

export interface EventRegistration {
  id: number;
  createdAt: string; // ISO
  eventId: number;
  userId: number;
  event: Event;
  user: {
    id: number;
    name: string | null;
    email: string;
  };
}

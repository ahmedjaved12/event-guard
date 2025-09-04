"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Event } from "../../../lib/types";
import { eventService } from "../../../lib/eventService";
import StatsCards from "../../../components/dashboard/StatsCards";
import EventFilters, { EventFilterState } from "../../../components/dashboard/EventFilters";
import EventCard from "../../../components/dashboard/EventCard";
import heroImg from "@/app/assets/images/hero.png";
import { toast } from "react-hot-toast";
import api from "../../../lib/api";

// ✅ Small helper to decode JWT safely
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function decodeJWT(token: string | null): any | null {
    if (!token) return null;
    try {
        const payload = token.split(".")[1];
        const decoded = JSON.parse(atob(payload));
        return decoded;
    } catch (err) {
        console.error("Failed to decode JWT:", err);
        return null;
    }
}

export default function ParticipantEventsPage() {
    const [loading, setLoading] = useState(true);
    const [allEvents, setAllEvents] = useState<Event[]>([]);
    const [filters, setFilters] = useState<EventFilterState>({ q: "", status: "ALL" });

    // ✅ Get current user id from JWT
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    const decoded = decodeJWT(token);
    const currentUserId = decoded?.sub || decoded?.id || null;

    useEffect(() => {
        let cancel = false;
        (async () => {
            setLoading(true);
            try {
                const res = await eventService.listAllEvents({ page: 1 });
                if (!cancel) {
                    setAllEvents(res.events ?? []);
                }
            } finally {
                if (!cancel) setLoading(false);
            }
        })();
        return () => {
            cancel = true;
        };
    }, []);

    const events = useMemo(() => {
        return allEvents.filter((e) => {
            const time = new Date(e.date).getTime();

            if (filters.q && !e.title.toLowerCase().includes(filters.q.toLowerCase())) return false;
            if (filters.status && filters.status !== "ALL" && e.status !== filters.status) return false;
            if (filters.from && time < new Date(filters.from).getTime()) return false;
            if (filters.to && time > new Date(filters.to).getTime()) return false;
            return true;
        });
    }, [allEvents, filters]);

    const stats = useMemo(() => {
        const total = allEvents.length;
        const now = Date.now();
        const past = allEvents.filter((e) => new Date(e.date).getTime() < now).length;
        const upcoming = allEvents.filter((e) => new Date(e.date).getTime() >= now).length;
        const cancelled = allEvents.filter((e) => e.status === "CANCELLED").length;
        return [
            { label: "Total events", value: total },
            { label: "Upcoming", value: upcoming },
            { label: "Past", value: past },
            { label: "Cancelled", value: cancelled },
        ];
    }, [allEvents]);

    // Helper to check if participant is registered for an event
    const handleRegisterToggle = async (event: Event, isRegistered: boolean) => {
        try {
            if (isRegistered) {
                // Unregister
                await api.delete(`/registrations/${event.id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
                });
                toast.success(`Unregistered from "${event.title}"`);
            } else {
                // Register
                await api.post(`/registrations/${event.id}`, {}, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
                });
                toast.success(`Registered for "${event.title}"`);
            }

            // Update UI optimistically
            setAllEvents((prev) =>
                prev.map((e) => (e.id === event.id ? { ...e, isRegistered: !isRegistered } : e))
            );
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error(err);
            toast.error(err?.response?.data?.error || "Failed to update registration");
        }
    };

    return (
        <div className="grid gap-6">
            {/* Welcome */}
            <section className="grid gap-6 border border-gray-200 rounded-lg bg-gradient-to-b from-white to-[#f9fafb] p-6 md:grid-cols-[1fr_280px] md:items-center md:gap-8">
                <div className="text-center md:text-left">
                    <h2 className="m-0 text-2xl font-semibold">Welcome back 👋</h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Browse all available events and register for the ones that interest you!
                    </p>
                </div>
                <div className="relative h-48 md:h-40">
                    <Image src={heroImg} alt="Dashboard illustration" fill style={{ objectFit: "contain" }} priority />
                </div>
            </section>

            {/* Analytics */}
            <StatsCards stats={stats} />

            {/* Filters */}
            <EventFilters onChange={setFilters} />

            {/* Events */}
            <section className="grid gap-4">
                {loading ? (
                    <div>Loading events...</div>
                ) : events.length === 0 ? (
                    <div className="text-gray-500">No events match your filters.</div>
                ) : (
                    <div className="grid gap-4">
                        {events.map((e) => (
                            <EventCard
                                key={e.id}
                                e={e}
                                currentUserId={currentUserId} // ✅ pass user id
                                isCreator={false}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

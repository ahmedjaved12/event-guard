"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Event } from "../../../lib/types";
import { eventService } from "../../../lib/eventService";
import StatsCards from "../../../components/dashboard/StatsCards";
import EventFilters, { EventFilterState } from "../../../components/dashboard/EventFilters";
import EventCard from "../../../components/dashboard/EventCard";
import heroImg from "@/app/assets/images/hero.png";
import EventForm from "../../../components/dashboard/EventForm";
import api from "../../../lib/api";
import toast from "react-hot-toast";

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

export default function AdminEventsPage() {
    const [loading, setLoading] = useState(true);
    const [allEvents, setAllEvents] = useState<Event[]>([]);
    const [filters, setFilters] = useState<EventFilterState>({ q: "", status: "ALL" });
    const [showForm, setShowForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);

    // ✅ Get current user id from JWT (for ownership checks, logging, etc.)
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    const decoded = decodeJWT(token);
    const currentUserId = decoded?.sub || decoded?.id || null;

    // ✅ Load ALL events for admin
    useEffect(() => {
        let cancel = false;
        (async () => {
            setLoading(true);
            try {
                const res = await eventService.listAllEvents({});
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

            // 🔍 search filter
            if (filters.q && !e.title.toLowerCase().includes(filters.q.toLowerCase())) {
                return false;
            }

            // ✅ status filter
            if (filters.status && filters.status !== "ALL" && e.status !== filters.status) {
                return false;
            }

            // 📅 date range filter
            if (filters.from && time < new Date(filters.from).getTime()) {
                return false;
            }
            if (filters.to && time > new Date(filters.to).getTime()) {
                return false;
            }

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

    return (
        <div className="grid gap-6">
            {/* Welcome */}
            <section className="grid gap-6 border border-gray-200 rounded-lg bg-gradient-to-b from-white to-[#f9fafb] p-6 md:grid-cols-[1fr_280px] md:items-center md:gap-8">
                <div className="text-center md:text-left">
                    <h2 className="m-0 text-2xl font-semibold">Admin Dashboard 👑</h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Manage all events across the platform. You can create, update, and delete any event.
                    </p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        ➕ Create New Event
                    </button>
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
                                isCreator={true} // 👑 Admin can edit/delete any event
                                currentUserId={currentUserId} // ✅ now passing actual user ID
                                onEdit={(event) => {
                                    setEditingEvent(event);
                                    setShowForm(true);
                                }}
                                onDelete={async (event) => {
                                    if (!confirm(`Delete "${event.title}"?`)) return;

                                    try {
                                        const token = localStorage.getItem("authToken");
                                        if (!token) {
                                            alert("You are not logged in.");
                                            return;
                                        }

                                        await api.delete(`/events/${event.id}`, {
                                            headers: {
                                                Authorization: `Bearer ${token}`,
                                            },
                                        });

                                        setAllEvents((prev) => prev.filter((ev) => ev.id !== event.id));
                                        toast.success("Event deleted successfully!");
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    } catch (err: any) {
                                        console.error("❌ Failed to delete event:", err?.response || err);
                                        toast.error(err?.response?.data?.error || "Failed to delete event.");
                                    }
                                }}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Modal for create/edit */}
            {showForm && (
                <EventForm
                    initialData={editingEvent ?? undefined}
                    onClose={() => {
                        setShowForm(false);
                        setEditingEvent(null);
                    }}
                    onSuccess={(event) => {
                        setAllEvents((prev) =>
                            prev.some((e) => e.id === event.id)
                                ? prev.map((e) => (e.id === event.id ? event : e)) // update existing
                                : [event, ...prev] // add new
                        );
                        setShowForm(false);
                        setEditingEvent(null);
                    }}
                />
            )}
        </div>
    );
}

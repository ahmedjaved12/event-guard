"use client";
import Image from "next/image";
import { Event } from "../../lib/types";
import {
    MapPin,
    CalendarDays,
    DollarSign,
    Pencil,
    Users,
    Trash2,
    Users2,
    CheckCircle,
    LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { eventService } from "../../lib/eventService";
import toast from "react-hot-toast";
import { useState, useMemo } from "react";

interface EventCardProps {
    e: Event;
    currentUserId: number; // 👈 pass current logged-in userId here
    isCreator?: boolean;
    onEdit?: (event: Event) => void;
    onDelete?: (event: Event) => void;
}

export default function EventCard({
    e,
    currentUserId,
    isCreator = false,
    onEdit,
    onDelete,
}: EventCardProps) {
    const when = new Date(e.date).toLocaleString();
    const tagStr = e.tags ?? [];
    const imageSrc =
        e.imageUrl && e.imageUrl.trim() !== "" ? e.imageUrl : "/event-placeholder.jpg";

    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // ✅ compute from event.registrations directly
    const isRegistered = useMemo(

        () => e.registrations?.some((r) => r.userId === currentUserId) ?? false,
        [e.registrations, currentUserId]
    );

    // 🎨 Status styles
    const statusStyles: Record<string, string> = {
        UPCOMING: "bg-green-100 text-green-700 border-green-300",
        CANCELLED: "bg-red-100 text-red-700 border-red-300",
        PAST: "bg-gray-100 text-gray-700 border-gray-300",
    };
    const statusClass =
        statusStyles[e.status] || "bg-gray-100 text-gray-700 border-gray-300";

    // 📌 Participant actions
    const handleJoin = async () => {
        try {
            setLoading(true);
            await eventService.joinEvent(e.id);
            toast.success("Successfully joined event!");
            router.refresh(); // 👈 re-fetch page data so registrations update
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error("Join event error:", err);
            toast.error(err?.response?.data?.error || "Failed to join event.");
        } finally {
            setLoading(false);
        }
    };

    const handleLeave = async () => {
        try {
            setLoading(true);
            await eventService.leaveEvent(e.id);
            toast.success("You left the event.");
            router.refresh(); // 👈 reload to sync event registrations
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error("Leave event error:", err);
            toast.error(err?.response?.data?.error || "Failed to leave event.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <article className="grid grid-cols-1 md:grid-cols-[200px_1fr] min-h-[160px] rounded-xl overflow-hidden border transition-shadow hover:shadow-lg bg-white">
            {/* Image */}
            <div className="relative bg-gray-100 h-48 md:h-auto">
                <Image
                    src={imageSrc}
                    alt={e.title || "Event image"}
                    fill
                    className="object-cover"
                    unoptimized
                />
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col gap-3">
                {/* Header */}
                <div className="flex justify-between items-start gap-3 flex-wrap">
                    <h3 className="text-lg font-semibold leading-tight">{e.title}</h3>
                    <span
                        className={`px-3 py-1 text-xs rounded-full border font-medium ${statusClass}`}
                    >
                        {e.status}
                    </span>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2">{e.description}</p>

                {/* Meta */}
                <div className="flex flex-wrap gap-3 text-sm text-gray-700">
                    <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-gray-500" /> {e.location}
                    </span>
                    <span className="flex items-center gap-1">
                        <CalendarDays className="w-4 h-4 text-gray-500" /> {when}
                    </span>
                    <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        {e.entryFee === 0 ? "Free" : e.entryFee.toFixed(2)}
                    </span>
                    <span className="flex items-center gap-1">
                        <Users2 className="w-4 h-4 text-gray-500" />
                        {e.registrations?.length ?? 0}/{e.maxParticipants}
                    </span>
                </div>

                {/* Tags */}
                {tagStr.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                        {tagStr.map((tag, i) => (
                            <span
                                key={i}
                                className="px-2 py-1 text-xs rounded-md bg-blue-50 text-blue-700 border border-blue-200"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-2 flex-wrap">
                    {isCreator ? (
                        <>
                            <button
                                onClick={() => onEdit?.(e)}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50 transition"
                            >
                                <Pencil className="w-4 h-4" /> Edit
                            </button>
                            <button
                                onClick={() =>
                                    router.push(`/dashboard/organizer/registrations`)
                                }
                                className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50 transition"
                            >
                                <Users className="w-4 h-4" /> Registrations
                            </button>
                            <button
                                onClick={() => onDelete?.(e)}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-red-300 text-red-600 hover:bg-red-50 transition"
                            >
                                <Trash2 className="w-4 h-4" /> Delete
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() =>
                                    router.push(`/dashboard/participant/registrations`)
                                }
                                className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50 transition"
                            >
                                <Users className="w-4 h-4" /> My Registrations
                            </button>

                            {!isRegistered ? (
                                <button
                                    onClick={handleJoin}
                                    disabled={loading}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-green-300 text-green-700 hover:bg-green-50 transition disabled:opacity-50"
                                >
                                    <CheckCircle className="w-4 h-4" /> Join
                                </button>
                            ) : (
                                <button
                                    onClick={handleLeave}
                                    disabled={loading}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-red-300 text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                                >
                                    <LogOut className="w-4 h-4" /> Leave
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </article>

    );
}

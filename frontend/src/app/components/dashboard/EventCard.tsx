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
} from "lucide-react";
import { useRouter } from "next/navigation";

interface EventCardProps {
    e: Event;
    isCreator?: boolean;
    onEdit?: (event: Event) => void;
    onDelete?: (event: Event) => void;
}

export default function EventCard({ e, isCreator = false, onEdit, onDelete }: EventCardProps) {
    const when = new Date(e.date).toLocaleString();
    const tagStr = e.tags ?? [];
    const imageSrc =
        e.imageUrl && e.imageUrl.trim() !== "" ? e.imageUrl : "/event-placeholder.jpg";

    const router = useRouter();

    // 🎨 Status styles
    const statusStyles: Record<string, string> = {
        UPCOMING: "bg-green-100 text-green-700 border-green-300",
        CANCELLED: "bg-red-100 text-red-700 border-red-300",
        PAST: "bg-gray-100 text-gray-700 border-gray-300",
    };
    const statusClass = statusStyles[e.status] || "bg-gray-100 text-gray-700 border-gray-300";

    return (
        <article
            className="grid grid-cols-[160px_1fr] min-h-[160px] rounded-xl overflow-hidden border transition-shadow hover:shadow-lg bg-white"
        >
            {/* Image section */}
            <div className="relative bg-gray-100">
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
                <div className="flex justify-between items-start gap-3">
                    <h3 className="text-lg font-semibold leading-tight">{e.title}</h3>
                    <span
                        className={`px-3 py-1 text-xs rounded-full border font-medium ${statusClass}`}
                    >
                        {e.status}
                    </span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 line-clamp-2">{e.description}</p>

                {/* Meta info */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-700">
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
                <div className="flex gap-2 mt-2">
                    <button
                        aria-label="Edit event"
                        onClick={() => onEdit?.(e)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50 transition"
                    >
                        <Pencil className="w-4 h-4" /> Edit
                    </button>
                    <button
                        aria-label="View registrations"
                        onClick={() => router.push(`/dashboard/organizer/registrations`)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50 transition"
                    >
                        <Users className="w-4 h-4" /> Registrations
                    </button>
                    {isCreator && (
                        <button
                            aria-label="Delete event"
                            onClick={() => onDelete?.(e)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-red-300 text-red-600 hover:bg-red-50 transition"
                        >
                            <Trash2 className="w-4 h-4" /> Delete
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}

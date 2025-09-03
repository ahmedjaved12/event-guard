"use client";

import { useState } from "react";
import { Event } from "../../lib/types";
import api from "../../lib/api";
import { toast } from "react-hot-toast";

interface EventFormProps {
    initialData?: Partial<Event>;
    onSuccess: (event: Event) => void;
    onClose: () => void;
}

export default function EventForm({
    initialData = {},
    onSuccess,
    onClose,
}: EventFormProps) {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [form, setForm] = useState({
        title: initialData.title || "",
        description: initialData.description || "",
        imageUrl: initialData.imageUrl || "",
        date: initialData.date ? initialData.date.slice(0, 16) : "",
        location: initialData.location || "",
        entryFee: initialData.entryFee?.toString() || "0",
        maxParticipants: initialData.maxParticipants?.toString() || "100",
        tags: (initialData.tags || []).join(", "),
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Only image files are allowed.");
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append("image", file);

            const token = localStorage.getItem("authToken");
            const headers: Record<string, string> = {};
            if (token) headers["Authorization"] = `Bearer ${token}`;

            const { data } = await api.post<{ url: string }>("/uploads", formData, {
                headers: {
                    ...headers,
                    "Content-Type": "multipart/form-data",
                },
            });

            setForm((prev) => ({ ...prev, imageUrl: data.url }));
            toast.success("Image uploaded!");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error("❌ Image upload failed:", err?.response || err);
            toast.error(err?.response?.data?.error || "Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const validate = () => {
        const errors: Record<string, string> = {};
        if (!form.title.trim()) errors.title = "Title is required.";
        if (!form.date) errors.date = "Date is required.";
        if (!form.location.trim()) errors.location = "Location is required.";
        if (!form.imageUrl) errors.imageUrl = "Image is required.";
        if (isNaN(parseFloat(form.entryFee)) || parseFloat(form.entryFee) < 0) {
            errors.entryFee = "Entry fee must be a valid number.";
        }
        if (!/^\d+$/.test(form.maxParticipants) || parseInt(form.maxParticipants) <= 0) {
            errors.maxParticipants = "Max participants must be a positive integer.";
        }
        return errors;
    };

    const errors = validate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);

        if (Object.keys(errors).length > 0) {
            toast.error("Please fix errors before submitting.");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                toast.error("You are not logged in.");
                return;
            }

            const headers = { Authorization: `Bearer ${token}` };

            if (initialData.id) {
                // Update event
                const { data } = await api.put<Event>(
                    `/events/${initialData.id}`,
                    {
                        ...form,
                        entryFee: parseFloat(form.entryFee),
                        maxParticipants: parseInt(form.maxParticipants),
                        tags: form.tags.split(",").map((t) => t.trim()),
                        status: initialData.status || "UPCOMING",
                    },
                    { headers }
                );
                toast.success("Event updated!");
                onSuccess(data);
            } else {
                // Create event
                const { data } = await api.post<Event>(
                    "/events",
                    {
                        ...form,
                        entryFee: parseFloat(form.entryFee),
                        maxParticipants: parseInt(form.maxParticipants),
                        tags: form.tags.split(",").map((t) => t.trim()),
                        status: "UPCOMING",
                    },
                    { headers }
                );
                toast.success("Event created!");
                onSuccess(data);
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error("❌ Failed to save event:", err?.response || err);
            toast.error(err?.response?.data?.error || "Failed to save event.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
                    <h2 className="text-lg font-semibold">
                        {initialData.id ? "Edit Event" : "Create Event"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                {/* Scrollable Body */}
                <form
                    id="event-form"
                    onSubmit={handleSubmit}
                    className="flex-1 overflow-y-auto p-6 space-y-4"
                >
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="Event Title"
                            className={`w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition ${submitted && errors.title ? "border-red-500" : "border-gray-300"
                                }`}
                        />
                        {submitted && errors.title && (
                            <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Brief description"
                            rows={3}
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition"
                        />
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Date & Time</label>
                        <input
                            type="datetime-local"
                            name="date"
                            value={form.date}
                            onChange={handleChange}
                            className={`w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition ${submitted && errors.date ? "border-red-500" : "border-gray-300"
                                }`}
                        />
                        {submitted && errors.date && (
                            <p className="text-red-500 text-xs mt-1">{errors.date}</p>
                        )}
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Location</label>
                        <input
                            name="location"
                            value={form.location}
                            onChange={handleChange}
                            placeholder="Event Location"
                            className={`w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition ${submitted && errors.location
                                ? "border-red-500"
                                : "border-gray-300"
                                }`}
                        />
                        {submitted && errors.location && (
                            <p className="text-red-500 text-xs mt-1">{errors.location}</p>
                        )}
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Event Image</label>
                        <div
                            className={`flex flex-col items-center justify-center w-full p-6 border-2 rounded-md cursor-pointer transition ${submitted && errors.imageUrl
                                ? "border-red-500 bg-red-50"
                                : "border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                                }`}
                            onClick={() =>
                                document.getElementById("event-image-input")?.click()
                            }
                        >
                            <input
                                id="event-image-input"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <div className="flex flex-col items-center text-gray-500">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-10 w-10 mb-2 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 15a4 4 0 014-4h1m4-4l4 4m0 0l-4 4m4-4H7"
                                    />
                                </svg>
                                <p className="text-sm">
                                    {form.imageUrl ? "Change image" : "Click to upload or drag & drop"}
                                </p>
                                <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                            </div>
                        </div>

                        {uploading && (
                            <p className="text-blue-500 text-xs mt-2">Uploading image...</p>
                        )}

                        {form.imageUrl && (
                            <img
                                src={form.imageUrl}
                                alt="Preview"
                                className="mt-3 h-40 w-full object-cover rounded-md border"
                            />
                        )}

                        {submitted && errors.imageUrl && (
                            <p className="text-red-500 text-xs mt-1">{errors.imageUrl}</p>
                        )}
                    </div>

                    {/* Entry Fee & Max Participants */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Entry Fee ($)
                            </label>
                            <input
                                type="number"
                                name="entryFee"
                                value={form.entryFee}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                className={`w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition ${submitted && errors.entryFee
                                    ? "border-red-500"
                                    : "border-gray-300"
                                    }`}
                            />
                            {submitted && errors.entryFee && (
                                <p className="text-red-500 text-xs mt-1">{errors.entryFee}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Max Participants
                            </label>
                            <input
                                type="number"
                                name="maxParticipants"
                                value={form.maxParticipants}
                                onChange={handleChange}
                                min="1"
                                step="1"
                                className={`w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition ${submitted && errors.maxParticipants
                                    ? "border-red-500"
                                    : "border-gray-300"
                                    }`}
                            />
                            {submitted && errors.maxParticipants && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.maxParticipants}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Tags</label>
                        <input
                            name="tags"
                            value={form.tags}
                            onChange={handleChange}
                            placeholder="music, networking, tech"
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition"
                        />
                    </div>
                </form>

                {/* Sticky Footer with Submit */}
                <div className="p-4 border-t sticky bottom-0 bg-white">
                    <button
                        type="submit"
                        form="event-form"   // 👈 Matches form id
                        disabled={loading || uploading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md w-full hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading
                            ? "Saving..."
                            : initialData.id
                                ? "Update Event"
                                : "Create Event"}
                    </button>
                </div>
            </div>
        </div>
    );
}

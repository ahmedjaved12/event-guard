"use client";

import { useEffect, useRef, useState } from "react";
import { userService } from "../../../lib/userService";
import { useCurrentUser } from "../../../lib/authClient";
import { User } from "../../../lib/types";
import defaultAvatar from "@/app/assets/images/user.png";
import Image from "next/image";
import toast from "react-hot-toast";

export default function OrganizerSettingsPage() {
    const { user, loading } = useCurrentUser();
    const [me, setMe] = useState<User | null>(null);
    const [name, setName] = useState("");
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [prefEmail, setPrefEmail] = useState(true);
    const [saving, setSaving] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!loading && user) {
            (async () => {
                const profile = await userService.fetchMe();
                if (!profile) return;
                setMe(profile);
                setName(profile.name || "");
                setPrefEmail(profile.emailNotifications ?? true);
            })();
        }
    }, [user, loading]);

    async function onSave() {
        setSaving(true);
        try {
            let avatarUrl = me?.avatarUrl;
            if (avatarFile) {
                avatarUrl = await userService.uploadAvatar(avatarFile);
            }

            const updated = await userService.updateProfile({
                name,
                avatarUrl,
                emailNotifications: prefEmail,
            });
            setMe(updated);
            toast.success("Profile updated successfully!");
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div className="p-6">Loading...</div>;
    if (!user) return <div className="p-6">Unauthorized. Please log in.</div>;

    return (
        <div className="max-w-3xl mx-auto space-y-8 p-6">
            {/* Profile card */}
            <div className="bg-white shadow-md rounded-2xl p-6 space-y-6">
                <h2 className="text-xl font-semibold text-gray-800">Profile</h2>

                {/* Avatar */}
                <div className="flex flex-col items-center">
                    <div
                        className="relative cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Image
                            src={
                                avatarFile
                                    ? URL.createObjectURL(avatarFile)
                                    : me?.avatarUrl || defaultAvatar
                            }
                            alt="Avatar"
                            width={96}
                            height={96}
                            className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 shadow-sm hover:opacity-80 transition"
                            style={{ objectFit: "cover" }}
                            unoptimized={!!avatarFile || !!me?.avatarUrl}
                        // unoptimized disables optimization for dynamic URLs (like from URL.createObjectURL or remote URLs)
                        />
                        <span className="absolute bottom-0 right-0 bg-blue-600 text-white text-xs px-2 py-1 rounded-full shadow">
                            Change
                        </span>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                            if (e.target.files?.[0]) {
                                setAvatarFile(e.target.files[0]);
                            }
                        }}
                    />
                </div>

                {/* Name */}
                <label className="block">
                    <span className="text-sm text-gray-600">Name</span>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </label>

                {/* Email (read-only) */}
                <label className="block">
                    <span className="text-sm text-gray-600">Email</span>
                    <input
                        value={me?.email || ""}
                        disabled
                        className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                    />
                </label>
            </div>

            {/* Preferences card */}
            <div className="bg-white shadow-md rounded-2xl p-6 space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">Preferences</h2>
                <label className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        checked={prefEmail}
                        onChange={(e) => setPrefEmail(e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <span>Email notifications</span>
                </label>
            </div>

            {/* Save button */}
            <div>
                <button
                    onClick={onSave}
                    disabled={saving}
                    className={`px-6 py-3 rounded-lg font-medium shadow-md transition 
            ${saving
                            ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                >
                    {saving ? "Saving..." : "Save changes"}
                </button>
            </div>
        </div>
    );
}

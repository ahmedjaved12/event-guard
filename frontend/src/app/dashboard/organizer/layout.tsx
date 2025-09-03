"use client";

import OrganizerHeader from "../../components/dashboard/OrganizerHeader";
import { useCurrentUser, clearToken } from "../../lib/authClient";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { User } from "../../lib/types";

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useCurrentUser();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // 🚨 No token or invalid token
                clearToken();
                toast.error("Please log in.");
                router.push("/auth/login");
                return;
            }

            // 🚨 Not allowed roles
            if (user.role !== "ADMIN" && user.role !== "ORGANIZER") {
                clearToken();
                toast.error("Unauthorized. Please log in again.");
                router.push("/auth/login");
            }
        }
    }, [loading, user, router]);

    if (loading) {
        return <div className="p-4">Loading...</div>;
    }

    // We don’t render "Unauthorized" UI anymore, just redirect in useEffect
    return (
        <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
            <OrganizerHeader user={user as User} />
            <main style={{ width: "100%", maxWidth: 1200, margin: "0 auto", padding: 16 }}>
                {children}
            </main>
        </div>
    );
}

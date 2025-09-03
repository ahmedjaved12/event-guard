"use client";

import ParticipantHeader from "../../components/dashboard/ParticipantHeader";
import { useCurrentUser, clearToken } from "../../lib/authClient";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { User } from "../../lib/types";

export default function ParticipantLayout({ children }: { children: React.ReactNode }) {
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

            // 🚨 Allow only PARTICIPANT role (and optionally ADMIN)
            if (user.role !== "PARTICIPANT" && user.role !== "ADMIN") {
                clearToken();
                toast.error("Unauthorized. Please log in again.");
                router.push("/auth/login");
            }
        }
    }, [loading, user, router]);

    if (loading) {
        return <div className="p-4">Loading...</div>;
    }

    return (
        <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
            <ParticipantHeader user={user as User} />
            <main style={{ width: "100%", maxWidth: 1200, margin: "0 auto", padding: 16 }}>
                {children}
            </main>
        </div>
    );
}

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";


export default function NavTabs() {
    const pathname = usePathname();
    const tabs = [
        { href: "/dashboard/organizer/events", label: "Dashboard" },
        { href: "/dashboard/organizer/registrations", label: "Registrations" },
        { href: "/dashboard/organizer/settings", label: "Settings" },
    ];
    return (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {tabs.map(t => {
                const active = pathname === t.href;
                return (
                    <Link key={t.href} href={t.href} style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: active ? "1px solid #111" : "1px solid #e5e7eb",
                        background: active ? "#111" : "#fff",
                        color: active ? "#fff" : "#111",
                        fontSize: 14,
                    }}>{t.label}</Link>
                );
            })}
        </div>
    );
}
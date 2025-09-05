"use client";
import StatsCards from "../../../components/dashboard/StatsCards";
import RegistrationTable from "../../../components/dashboard/RegistrationTable";
import { useEffect, useMemo, useState } from "react";
import { registrationService } from "../../../lib/registrationService";
import { EventRegistration } from "../../../lib/types";

export default function AdminRegistrationsPage() {
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState<EventRegistration[]>([]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        let cancel = false;
        (async () => {
            setLoading(true);
            try {
                const res = await registrationService.listForAdmin({ page: 1, limit: 100 }); // fetch first 100 for now
                if (!cancel) {
                    setRows(res.data ?? []);
                    setTotal(res.pagination?.total || 0);
                }
            } finally {
                if (!cancel) setLoading(false);
            }
        })();
        return () => {
            cancel = true;
        };
    }, []);

    const stats = useMemo(() => {
        const totalRegs = total || rows.length;

        // Count registrations per event
        const byEvent = new Map<number, number>();
        for (const r of rows) byEvent.set(r.eventId, (byEvent.get(r.eventId) || 0) + 1);

        // Find best event
        let bestEventTitle = "—", bestCount = 0;
        for (const r of rows) {
            const c = byEvent.get(r.eventId)!;
            if (c > bestCount) {
                bestCount = c;
                bestEventTitle = r.event.title;
            }
        }

        // Unique users
        const uniqueUsers = new Set(rows.map((r) => r.userId)).size;

        return [
            { label: "Total registrations", value: totalRegs },
            { label: "Best event", value: bestEventTitle, hint: bestCount ? `${bestCount} regs` : undefined },
            { label: "Unique events", value: byEvent.size },
            { label: "Unique users", value: uniqueUsers },
        ];
    }, [rows, total]);

    return (
        <div style={{ display: "grid", gap: 16 }}>
            <StatsCards stats={stats} />
            {loading ? (
                <div>Loading registrations...</div>
            ) : rows.length === 0 ? (
                <div className="text-gray-500">No registrations found.</div>
            ) : (
                <RegistrationTable rows={rows} />
            )}
        </div>
    );
}

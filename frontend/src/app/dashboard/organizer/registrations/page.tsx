"use client";
import StatsCards from "../../../components/dashboard/StatsCards";
import RegistrationTable from "../../../components/dashboard/RegistrationTable";
import { useEffect, useMemo, useState } from "react";
import { registrationService } from "../../../lib/registrationService";
import { EventRegistration } from "../../../lib/types";


export default function OrganizerRegistrationsPage() {
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState<EventRegistration[]>([]);


    useEffect(() => {
        let cancel = false;
        (async () => {
            setLoading(true);
            try {
                const res = await registrationService.listForOrganizer();
                const items = Array.isArray(res) ? res : res.items;
                if (!cancel) setRows(items ?? []);
            } finally {
                if (!cancel) setLoading(false);
            }
        })();
        return () => { cancel = true; };
    }, []);


    const stats = useMemo(() => {
        const total = rows.length;
        // Best event by registrations
        const byEvent = new Map<number, number>();
        for (const r of rows) byEvent.set(r.eventId, (byEvent.get(r.eventId) || 0) + 1);
        let bestEventTitle = "—", bestCount = 0;
        for (const r of rows) {
            const c = byEvent.get(r.eventId)!;
            if (c > bestCount) { bestCount = c; bestEventTitle = r.event.title; }
        }
        return [
            { label: "Total registrations", value: total },
            { label: "Best event", value: bestEventTitle, hint: bestCount ? `${bestCount} regs` : undefined },
            { label: "Unique events", value: byEvent.size },
        ];
    }, [rows]);

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
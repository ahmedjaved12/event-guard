// app/dashboard/participant/registrations/page.tsx
"use client";
import { useEffect, useState } from "react";
import RegistrationTable from "../../../components/dashboard/RegistrationTable";
import { registrationService } from "../../../lib/registrationService";
import { EventRegistration } from "../../../lib/types";

export default function ParticipantRegistrationsPage() {
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState<EventRegistration[]>([]);

    useEffect(() => {
        let cancel = false;
        (async () => {
            setLoading(true);
            try {
                const res = await registrationService.listForParticipant();
                const items = Array.isArray(res) ? res : res.items;
                if (!cancel) setRows(items ?? []);
            } finally {
                if (!cancel) setLoading(false);
            }
        })();
        return () => {
            cancel = true;
        };
    }, []);

    return (
        <div style={{ display: "grid", gap: 16 }}>
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

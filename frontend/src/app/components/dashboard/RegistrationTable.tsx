// components/dashboard/RegistrationTable.tsx
"use client";
import { EventRegistration } from "../../lib/types";

interface Props {
    rows: EventRegistration[];
}

export default function RegistrationTable({ rows }: Props) {
    return (
        <div style={{ overflow: "auto", border: "1px solid #e5e7eb", borderRadius: 12 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
                <thead>
                    <tr>
                        {[
                            "Reg ID",
                            "Event",
                            "Event Date",
                            rows[0]?.user ? "Participant" : undefined,
                            rows[0]?.user ? "Email" : undefined,
                            "Registered At",
                        ]
                            .filter(Boolean)
                            .map((h) => (
                                <th key={h} style={th}>
                                    {h}
                                </th>
                            ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r) => (
                        <tr key={r.id}>
                            <td style={td}>#{r.id}</td>
                            <td style={td}>{r.event.title}</td>
                            <td style={td}>{new Date(r.event.date).toLocaleString()}</td>

                            {/* Show participant info only for organizer view */}
                            {r.user && (
                                <>
                                    <td style={td}>{r.user.name || "—"}</td>
                                    <td style={td}>{r.user.email || "—"}</td>
                                </>
                            )}

                            <td style={td}>{new Date(r.createdAt).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

const th: React.CSSProperties = {
    textAlign: "left",
    padding: "10px 12px",
    fontSize: 12,
    color: "#6b7280",
    borderBottom: "1px solid #e5e7eb",
    position: "sticky",
    top: 0,
    background: "#fafafa",
};

const td: React.CSSProperties = {
    padding: "12px",
    borderBottom: "1px solid #f3f4f6",
    fontSize: 14,
};

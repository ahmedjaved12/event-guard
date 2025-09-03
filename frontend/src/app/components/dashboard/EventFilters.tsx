"use client";
import { useState } from "react";
import { useDebounce } from "../../hooks/useDebounce";


export interface EventFilterState {
    q: string;
    status: "ALL" | "UPCOMING" | "COMPLETED" | "CANCELLED";
    from?: string;
    to?: string;
}


interface Props {
    onChange: (f: EventFilterState) => void;
}


export default function EventFilters({ onChange }: Props) {
    const [state, setState] = useState<EventFilterState>({ q: "", status: "ALL" });
    const debouncedQ = useDebounce(state.q, 400);


    // Notify parent when values change
    function push() { onChange({ ...state, q: debouncedQ }); }


    return (
        <section style={{
            display: "grid",
            gridTemplateColumns: "1fr 160px 1fr 1fr",
            gap: 8,
            alignItems: "end"
        }}>
            <label style={{ display: "grid", gap: 4 }}>
                <span style={{ fontSize: 12, color: "#6b7280" }}>Search</span>
                <input
                    placeholder="Search events..."
                    value={state.q}
                    onChange={(e) => setState((s) => ({ ...s, q: e.target.value }))}
                    onBlur={push}
                    style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #e5e7eb" }}
                />
            </label>
            <label style={{ display: "grid", gap: 4 }}>
                <span style={{ fontSize: 12, color: "#6b7280" }}>Status</span>
                <select
                    value={state.status}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onChange={(e) => { const v = e.target.value as any; const next = { ...state, status: v }; setState(next); onChange(next); }}
                    style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #e5e7eb" }}
                >
                    <option value="ALL">All</option>
                    <option value="UPCOMING">Upcoming</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
            </label>


            <label style={{ display: "grid", gap: 4 }}>
                <span style={{ fontSize: 12, color: "#6b7280" }}>From</span>
                <input type="date" onChange={(e) => { const next = { ...state, from: e.target.value }; setState(next); onChange(next); }} style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #e5e7eb" }} />
            </label>


            <label style={{ display: "grid", gap: 4 }}>
                <span style={{ fontSize: 12, color: "#6b7280" }}>To</span>
                <input type="date" onChange={(e) => { const next = { ...state, to: e.target.value }; setState(next); onChange(next); }} style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #e5e7eb" }} />
            </label>
        </section>
    );
}
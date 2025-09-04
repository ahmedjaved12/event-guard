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

    function push() { onChange({ ...state, q: debouncedQ }); }

    return (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">Search</span>
                <input
                    placeholder="Search events..."
                    value={state.q}
                    onChange={(e) => setState((s) => ({ ...s, q: e.target.value }))}
                    onBlur={push}
                    className="p-2 border border-gray-300 rounded-md"
                />
            </label>

            <label className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">Status</span>
                <select
                    value={state.status}
                    onChange={(e) => {
                        const v = e.target.value as EventFilterState["status"];
                        const next = { ...state, status: v };
                        setState(next);
                        onChange(next);
                    }}
                    className="p-2 border border-gray-300 rounded-md"
                >
                    <option value="ALL">All</option>
                    <option value="UPCOMING">Upcoming</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
            </label>

            <label className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">From</span>
                <input
                    type="date"
                    onChange={(e) => {
                        const next = { ...state, from: e.target.value };
                        setState(next);
                        onChange(next);
                    }}
                    className="p-2 border border-gray-300 rounded-md"
                />
            </label>

            <label className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">To</span>
                <input
                    type="date"
                    onChange={(e) => {
                        const next = { ...state, to: e.target.value };
                        setState(next);
                        onChange(next);
                    }}
                    className="p-2 border border-gray-300 rounded-md"
                />
            </label>
        </section>
    );
}
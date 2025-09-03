"use client";

interface Stat {
    label: string;
    value: number | string;
    hint?: string;
}

export default function StatsCards({ stats }: { stats: Stat[] }) {
    return (
        <section
            className="
        grid gap-4
        sm:grid-cols-2
        lg:grid-cols-3
        xl:grid-cols-4
      "
        >
            {stats.map((s) => (
                <article
                    key={s.label}
                    className="
            border border-gray-200 rounded-xl
            p-4 bg-white shadow-sm
            flex flex-col
          "
                >
                    <div className="text-xs text-gray-500">{s.label}</div>
                    <div className="text-2xl font-bold mt-2">{s.value}</div>
                    {s.hint && (
                        <div className="text-xs text-gray-500 mt-1">{s.hint}</div>
                    )}
                </article>
            ))}
        </section>
    );
}

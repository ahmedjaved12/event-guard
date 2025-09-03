"use client";
import { useRef } from "react";


interface Props {
    onFile: (f: File) => void;
    label?: string;
}


export default function FileUpload({ onFile, label = "Upload" }: Props) {
    const ref = useRef<HTMLInputElement>(null);
    return (
        <div style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
            <button type="button" onClick={() => ref.current?.click()} style={{
                padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer"
            }}>{label}</button>
            <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFile(f);
            }} />
        </div>
    );
}
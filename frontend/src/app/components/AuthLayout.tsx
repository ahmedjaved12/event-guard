import Image from "next/image";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
            {/* Left Side - Image / Illustration */}
            <div className="hidden lg:flex items-center justify-center bg-blue-600">
                <Image
                    src="/images/hero.png" // 🔹 put an SVG/PNG in /public
                    alt="Event illustration"
                    width={500}
                    height={500}
                    className="object-contain"
                />
            </div>

            {/* Right Side - Form */}
            <div className="flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">{children}</div>
            </div>
        </div>
    );
}

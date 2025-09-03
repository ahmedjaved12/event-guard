"use client";

import AuthLayout from "@/app/components/AuthLayout";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { loginUser } from "@/app/lib/authService";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { AppJwtPayload } from "@/app/lib/authService";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [touched, setTouched] = useState({ email: false, password: false });

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPasswordValid = password.length >= 6;
    const isFormValid = isEmailValid && isPasswordValid;

    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setTouched({ email: true, password: true });
        if (!isFormValid) return;
        setLoading(true);

        try {
            const res = await loginUser({ email, password });
            const token = res.token;

            // ✅ Save token
            localStorage.setItem("authToken", token);
            console.log("Token saved:", token);
            toast.success("Login successful!");

            // ✅ Decode token to get role
            const payload = jwtDecode<AppJwtPayload>(token);

            // ✅ Redirect based on role
            switch (payload.role) {
                case "ADMIN":
                    router.push("/dashboard/admin");
                    break;
                case "ORGANIZER":
                    router.push("/dashboard/organizer");
                    break;
                case "PARTICIPANT":
                    router.push("/dashboard/participant");
                    break;
                default:
                    router.push("/auth/login"); // fallback
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            toast.error(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <h2 className="text-3xl font-bold text-gray-900">Login</h2>

            <form onSubmit={handleLogin} className="mt-6 space-y-4" noValidate>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    required
                    className={`w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-blue-600 focus:outline-none ${touched.email && !isEmailValid ? "border-red-500" : "border-gray-300"
                        }`}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                    required
                    className={`w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-blue-600 focus:outline-none ${touched.password && !isPasswordValid ? "border-red-500" : "border-gray-300"
                        }`}
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>

                <p className="mt-2 text-sm text-gray-600 text-center">
                    New here?{" "}
                    <Link href="/auth/signup" className="text-blue-600 hover:underline">
                        Create an account
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}
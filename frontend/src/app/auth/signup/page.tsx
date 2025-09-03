"use client";
import AuthLayout from "@/app/components/AuthLayout";
import Link from "next/link";
import { useState } from "react";
import { signupUser, requestOtp } from "@/app/lib/authService";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function SignupPage() {
    const [role, setRole] = useState<"PARTICIPANT" | "ORGANIZER">("PARTICIPANT");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [touched, setTouched] = useState({
        name: false,
        email: false,
        password: false,
    });
    const router = useRouter();

    // Validation helpers
    const isNameValid = name.trim().length > 0;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPasswordValid = password.length >= 6;

    const isFormValid = isNameValid && isEmailValid && isPasswordValid;

    async function handleSignup(e: React.FormEvent) {
        e.preventDefault();
        setTouched({ name: true, email: true, password: true });
        if (!isFormValid) return;
        setLoading(true);
        try {
            const res = await signupUser({ name, email, password, role });
            const token = res.token;
            localStorage.setItem("authToken", token);
            await requestOtp({ email, purpose: "SIGNUP" });
            toast.success("Signup successful! Check your email for OTP.");
            router.push(`/auth/otp?email=${encodeURIComponent(email)}`);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            toast.error(err.message || "Signup failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthLayout>
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>

            {/* Role Selection */}
            <div className="mt-6 flex gap-4">
                <button
                    type="button"
                    onClick={() => setRole("PARTICIPANT")}
                    className={`flex-1 py-3 rounded-lg border font-medium transition ${role === "PARTICIPANT"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                        }`}
                >
                    Participant
                </button>
                <button
                    type="button"
                    onClick={() => setRole("ORGANIZER")}
                    className={`flex-1 py-3 rounded-lg border font-medium transition ${role === "ORGANIZER"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                        }`}
                >
                    Organizer
                </button>
            </div>

            {/* Sign Up Form */}
            <form className="mt-6 space-y-4" onSubmit={handleSignup} noValidate>
                <input
                    type="text"
                    placeholder="Full Name"
                    className={`w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-blue-600 focus:outline-none ${touched.name && !isNameValid ? "border-red-500" : "border-gray-300"}`}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                />
                <input
                    type="email"
                    placeholder="Email"
                    className={`w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-blue-600 focus:outline-none ${touched.email && !isEmailValid ? "border-red-500" : "border-gray-300"}`}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                />
                <input
                    type="password"
                    placeholder="Password"
                    className={`w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-blue-600 focus:outline-none ${touched.password && !isPasswordValid ? "border-red-500" : "border-gray-300"}`}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                />

                {/* Hidden role input for backend */}
                <input type="hidden" name="role" value={role} />

                <button
                    type="submit"
                    className="w-full rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition flex items-center justify-center"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                            </svg>
                            Signing Up...
                        </>
                    ) : (
                        <>Sign Up as {role === "PARTICIPANT" ? "Participant" : "Organizer"}</>
                    )}
                </button>
                <p className="mt-2 text-sm text-gray-600 text-center">
                    Already have an account?{" "}
                    <Link href="/auth/login" className="text-blue-600 hover:underline">
                        Login
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}
"use client";
import AuthLayout from "@/app/components/AuthLayout";
import Link from "next/link";

export default function LoginPage() {
    return (
        <AuthLayout>
            <h2 className="text-3xl font-bold text-gray-900">Login</h2>

            <form className="mt-6 space-y-4">
                <input
                    type="email"
                    placeholder="Email"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <button
                    type="submit"
                    className="w-full rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition"
                >
                    Login
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

"use client";
import { useEffect, useRef, useState } from "react";
import AuthLayout from "@/app/components/AuthLayout";
import { getOtpStatus, requestOtp, verifyOtp } from "@/app/lib/authService";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";

export default function OtpPage() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email");

    const OTP_LENGTH = 6;
    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [touched, setTouched] = useState(Array(OTP_LENGTH).fill(false));
    const [submitting, setSubmitting] = useState(false);

    // ✅ Fetch OTP status from backend
    useEffect(() => {
        if (!email) return;

        async function fetchOtpStatus() {
            try {
                const res = await getOtpStatus({ email, purpose: "SIGNUP" });
                setTimeLeft(res.data.remainingSeconds);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                toast.error(err.message || "Failed to fetch OTP status failed");
            }
        }

        fetchOtpStatus();
    }, [email]);

    // ✅ Countdown timer
    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft((t) => (t > 0 ? t - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const handleChange = (value: string, index: number) => {
        if (!/^[0-9]?$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        const newTouched = [...touched];
        newTouched[index] = true;
        setTouched(newTouched);

        if (value && index < OTP_LENGTH - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        index: number
    ) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    // Helper to check if all OTP digits are filled and valid
    const isOtpValid = otp.every((digit) => /^[0-9]$/.test(digit));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Mark all as touched to show errors if any
        setTouched(Array(OTP_LENGTH).fill(true));
        if (!isOtpValid || !email) return;
        setSubmitting(true);
        const otpValue = otp.join("");
        try {
            const res = await verifyOtp({ email, purpose: "SIGNUP", code: otpValue });
            toast.success("OTP verified successfully");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            toast.error(err.message || "OTP verification failed");
        } finally {
            setSubmitting(false);
        }
    };

    const handleResendOtp = async () => {
        if (!email) return;
        try {
            await requestOtp({ email, purpose: "SIGNUP" });
            const res = await getOtpStatus({ email, purpose: "SIGNUP" });
            setTimeLeft(res.data.remainingSeconds);
            setOtp(Array(OTP_LENGTH).fill(""));
            setTouched(Array(OTP_LENGTH).fill(false));
            inputsRef.current[0]?.focus();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            toast.error(err.message || "Failed to resend OTP");
        }
    };

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <AuthLayout>
            <h2 className="text-3xl font-bold text-gray-900">Verify OTP</h2>
            <p className="mt-2 text-sm text-gray-600">
                Enter the one-time password sent to your email.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                <div className="flex justify-between gap-2">
                    {otp.map((digit, i) => {
                        const showError = touched[i] && !/^[0-9]$/.test(digit);
                        return (
                            <input
                                key={i}
                                ref={(el) => {
                                    inputsRef.current[i] = el;
                                }}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(e.target.value, i)}
                                onKeyDown={(e) => handleKeyDown(e, i)}
                                className={`w-12 h-12 sm:w-10 sm:h-10 text-center text-xl font-semibold rounded-lg border focus:ring-2 focus:ring-blue-600 focus:outline-none ${showError
                                    ? "border-red-500 ring-red-500"
                                    : "border-gray-300"
                                    }`}
                                onBlur={() => {
                                    const newTouched = [...touched];
                                    newTouched[i] = true;
                                    setTouched(newTouched);
                                }}
                            />
                        );
                    })}
                </div>

                <button
                    type="submit"
                    className="w-full mt-6 rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition"
                    disabled={submitting}
                >
                    {submitting ? "Verifying..." : "Verify"}
                </button>

                <div className="text-center text-sm text-gray-600 mt-4">
                    {timeLeft > 0 ? (
                        <p>
                            Request new OTP in{" "}
                            <span className="font-medium text-gray-900">
                                {minutes}:{seconds.toString().padStart(2, "0")}
                            </span>
                        </p>
                    ) : (
                        <button
                            type="button"
                            onClick={handleResendOtp}
                            className="text-blue-600 font-semibold hover:underline"
                        >
                            Resend OTP
                        </button>
                    )}
                </div>
            </form>
        </AuthLayout>
    );
}
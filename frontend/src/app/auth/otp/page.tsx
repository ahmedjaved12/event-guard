"use client";
import { useEffect, useRef, useState } from "react";
import AuthLayout from "@/app/components/AuthLayout";

export default function OtpPage() {
    const OTP_LENGTH = 6;
    const EXP_MINUTES = 10;

    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
    const [timeLeft, setTimeLeft] = useState(EXP_MINUTES * 60); // seconds

    // Countdown timer
    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const handleChange = (value: string, index: number) => {
        if (!/^[0-9]?$/.test(value)) return; // only numbers allowed

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to next input automatically
        if (value && index < OTP_LENGTH - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const otpValue = otp.join("");
        console.log("OTP entered:", otpValue);
        // TODO: send OTP to backend for verification
    };

    const handleResendOtp = () => {
        setTimeLeft(EXP_MINUTES * 60);
        setOtp(Array(OTP_LENGTH).fill(""));
        inputsRef.current[0]?.focus();
        console.log("Resend OTP clicked");
        // TODO: call backend to resend OTP
    };

    // Format countdown as mm:ss
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
                    {otp.map((digit, i) => (
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
                            className="w-12 h-12 sm:w-10 sm:h-10 text-center text-xl font-semibold rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        />
                    ))}
                </div>

                <button
                    type="submit"
                    className="w-full mt-6 rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition"
                >
                    Verify
                </button>

                <div className="text-center text-sm text-gray-600 mt-4">
                    {timeLeft > 0 ? (
                        <p>
                            Request new OTP in {" "}
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

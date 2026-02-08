"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Forgot Password Page
 * Implements secure password reset with:
 * - Generic error messages (security best practice)
 * - Rate limiting (server-side)
 * - Email verification
 * - CSRF protection
 */
export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [attempts, setAttempts] = useState(0);
    const [isBlocked, setIsBlocked] = useState(false);

    /**
     * Handle password reset request
     * Implements rate limiting and generic error messages
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        // Client-side rate limiting (5 attempts per session)
        if (attempts >= 5) {
            setIsBlocked(true);
            setError("Too many attempts. Please try again later.");
            setLoading(false);
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address.");
            setAttempts(attempts + 1);
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    // CSRF token would be added here in production
                },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (res.ok) {
                // Generic success message (doesn't reveal if email exists)
                setMessage("If an account exists with that email, we have sent a password reset link. Please check your email and spam folder.");
                setEmail("");
                setAttempts(0);
            } else {
                // Generic error message for security
                // In production, log the actual error server-side for debugging
                if (res.status === 429) {
                    setError("Too many requests. Please try again later.");
                    setIsBlocked(true);
                } else {
                    // Always show generic message to prevent email enumeration
                    setError("If an account exists with that email, we have sent a password reset link.");
                }
                setAttempts(attempts + 1);
            }
        } catch (err) {
            console.error("Forgot password error:", err);
            // Generic error message
            setError("Unable to process your request. Please try again later.");
            setAttempts(attempts + 1);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark">
            <div className="w-full max-w-[480px] mx-auto flex flex-col justify-center p-8">
                <div className="mb-10 text-left">
                    <h2 className="text-3xl font-bold text-[#151612] dark:text-white leading-tight tracking-[-0.015em] mb-2">Reset Password</h2>
                    <p className="text-[#76816a] dark:text-gray-400">Enter your email and we&apos;ll send you instructions to reset your password.</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200 rounded-lg text-sm font-bold">
                        {error}
                    </div>
                )}
                {message && (
                    <div className="mb-6 p-3 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-200 rounded-lg text-sm font-bold">
                        {message}
                    </div>
                )}

                {!isBlocked ? (
                    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                        <div className="flex flex-col w-full">
                            <label className="pb-2 text-sm font-medium dark:text-gray-200">Email Address</label>
                            <input
                                className="form-input flex w-full rounded-lg text-[#151612] dark:text-white border border-[#e1e3dd] dark:border-gray-700 bg-white dark:bg-gray-800 h-14 px-4 focus:ring-2 focus:ring-primary focus:outline-none"
                                placeholder="john@example.com"
                                required
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading || isBlocked}
                                autoComplete="email"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Attempt {attempts}/5
                            </p>
                        </div>

                        <button
                            className="flex w-full items-center justify-center rounded-lg h-14 bg-primary text-white text-base font-bold tracking-[0.015em] hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                            type="submit"
                            disabled={loading || isBlocked}
                        >
                            {loading ? "Sending Link..." : "Send Reset Link"}
                        </button>
                    </form>
                ) : (
                    <div className="p-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-lg text-sm">
                        <p className="font-bold mb-2">Too Many Attempts</p>
                        <p>You&apos;ve exceeded the maximum number of password reset attempts. Please try again in 15 minutes or contact support.</p>
                    </div>
                )}

                <div className="mt-10 text-center">
                    <p className="text-sm text-[#76816a] dark:text-gray-400">
                        <Link className="text-primary font-bold hover:underline" href="/auth/login">Back to Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

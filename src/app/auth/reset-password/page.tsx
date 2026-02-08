"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            setError("Invalid or missing token");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password })
            });

            const data = await res.json();

            if (res.ok) {
                setMessage("Password reset successful! Redirecting to login...");
                setTimeout(() => {
                    router.push("/auth/login");
                }, 2000);
            } else {
                setError(data.error || "Failed to reset password");
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="text-center p-8">
                <h2 className="text-xl font-bold text-red-500 mb-4">Invalid Link</h2>
                <p className="text-slate-500 mb-6">This password reset link is invalid or has expired.</p>
                <Link className="text-primary font-bold hover:underline" href="/auth/forgot-password">Try Again</Link>
            </div>
        );
    }

    return (
        <>
            <div className="mb-10 text-left">
                <h2 className="text-3xl font-bold text-[#151612] dark:text-white leading-tight tracking-[-0.015em] mb-2">Set New Password</h2>
                <p className="text-[#76816a] dark:text-gray-400">Please enter your new password below.</p>
            </div>

            {error && <div className="mb-6 p-3 bg-red-100 text-red-600 rounded-lg text-sm font-bold">{error}</div>}
            {message && <div className="mb-6 p-3 bg-green-100 text-green-600 rounded-lg text-sm font-bold">{message}</div>}

            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                <div className="flex flex-col w-full">
                    <label className="pb-2 text-sm font-medium dark:text-gray-200">New Password</label>
                    <input
                        className="form-input flex w-full rounded-lg text-[#151612] dark:text-white border border-[#e1e3dd] dark:border-gray-700 bg-white dark:bg-gray-800 h-14 px-4 focus:ring-2 focus:ring-primary focus:outline-none"
                        placeholder="••••••••"
                        required
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className="flex flex-col w-full">
                    <label className="pb-2 text-sm font-medium dark:text-gray-200">Confirm Password</label>
                    <input
                        className="form-input flex w-full rounded-lg text-[#151612] dark:text-white border border-[#e1e3dd] dark:border-gray-700 bg-white dark:bg-gray-800 h-14 px-4 focus:ring-2 focus:ring-primary focus:outline-none"
                        placeholder="••••••••"
                        required
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>

                <button
                    className="flex w-full items-center justify-center rounded-lg h-14 bg-primary text-white text-base font-bold tracking-[0.015em] hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20 mt-4 disabled:opacity-50"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Resetting Password..." : "Reset Password"}
                </button>
            </form>

            <div className="mt-10 text-center">
                <p className="text-sm text-[#76816a] dark:text-gray-400">
                    <Link className="text-primary font-bold hover:underline" href="/auth/login">Back to Login</Link>
                </p>
            </div>
        </>
    );
}

export default function ResetPassword() {
    return (
        <div className="flex min-h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark">
            <div className="w-full max-w-[480px] mx-auto flex flex-col justify-center p-8">
                <Suspense fallback={<div>Loading...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}

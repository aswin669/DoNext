"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });
            if (res.ok) {
                router.push("/dashboard");
            } else {
                const data = await res.json();
                setError(data.error || "Signup failed");
            }
        } catch {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark">
            <div className="w-full max-w-[480px] mx-auto flex flex-col justify-center p-8">
                <div className="mb-10 text-left">
                    <h2 className="text-3xl font-bold text-[#151612] dark:text-white leading-tight tracking-[-0.015em] mb-2">Create Account</h2>
                    <p className="text-[#76816a] dark:text-gray-400">Join DoNext to start your productivity journey.</p>
                </div>

                {error && <div className="mb-6 p-3 bg-red-100 text-red-600 rounded-lg text-sm font-bold">{error}</div>}

                <form className="flex flex-col gap-5" onSubmit={handleSignup}>
                    <div className="flex flex-col w-full">
                        <label className="pb-2 text-sm font-medium dark:text-gray-200">Full Name</label>
                        <input
                            className="form-input flex w-full rounded-lg text-[#151612] dark:text-white border border-[#e1e3dd] dark:border-gray-700 bg-white dark:bg-gray-800 h-14 px-4 focus:ring-2 focus:ring-primary focus:outline-none"
                            placeholder="John Doe"
                            required
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col w-full">
                        <label className="pb-2 text-sm font-medium dark:text-gray-200">Email Address</label>
                        <input
                            className="form-input flex w-full rounded-lg text-[#151612] dark:text-white border border-[#e1e3dd] dark:border-gray-700 bg-white dark:bg-gray-800 h-14 px-4 focus:ring-2 focus:ring-primary focus:outline-none"
                            placeholder="john@example.com"
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col w-full">
                        <label className="pb-2 text-sm font-medium dark:text-gray-200">Password</label>
                        <div className="relative flex items-center">
                            <input
                                className="form-input flex w-full rounded-lg text-[#151612] dark:text-white border border-[#e1e3dd] dark:border-gray-700 bg-white dark:bg-gray-800 h-14 px-4 pr-12 focus:ring-2 focus:ring-primary focus:outline-none"
                                placeholder="Create a password"
                                required
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <div
                                className="absolute right-4 text-[#76816a] cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <span className="material-symbols-outlined">
                                    {showPassword ? "visibility_off" : "visibility"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        className="flex w-full items-center justify-center rounded-lg h-14 bg-primary text-white text-base font-bold tracking-[0.015em] hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20 mt-4 disabled:opacity-50"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Creating Account..." : "Sign Up"}
                    </button>
                </form>

                <div className="mt-10 text-center">
                    <p className="text-sm text-[#76816a] dark:text-gray-400">
                        Already have an account?
                        <Link className="text-primary font-bold hover:underline ml-1" href="/auth/login">Log In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            if (res.ok) {
                router.push("/dashboard");
            } else {
                const data = await res.json();
                setError(data.error || "Login failed");
            }
        } catch (error) {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full overflow-hidden">
            {/* Left Side: Visual/Motivational - Hidden on mobile */}
            <div className="hidden lg:flex w-1/2 bg-primary dark:bg-primary/90 flex-col justify-center items-center p-16 relative">
                <div className="z-10 max-w-lg text-white">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="size-8 text-white">
                            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path d="M39.5563 34.1455V13.8546C39.5563 15.708 36.8773 17.3437 32.7927 18.3189C30.2914 18.916 27.263 19.2655 24 19.2655C20.737 19.2655 17.7086 18.916 15.2073 18.3189C11.1227 17.3437 8.44365 15.708 8.44365 13.8546V34.1455C8.44365 35.9988 11.1227 37.6346 15.2073 38.6098C17.7086 39.2069 20.737 39.5564 24 39.5564C27.1288 39.5564 30.2914 39.2069 32.7927 38.6098C36.8773 37.6346 39.5563 35.9988 39.5563 34.1455Z" fill="currentColor"></path>
                                <path clipRule="evenodd" d="M10.4485 13.8519C10.4749 13.9271 10.6203 14.246 11.379 14.7361C12.298 15.3298 13.7492 15.9145 15.6717 16.3735C18.0007 16.9296 20.8712 17.2655 24 17.2655C27.1288 17.2655 29.9993 16.9296 32.3283 16.3735C34.2508 15.9145 35.702 15.3298 36.621 14.7361C37.3796 14.246 37.5251 13.9271 37.5515 13.8519C37.5287 13.7876 37.4333 13.5973 37.0635 13.2931C36.5266 12.8516 35.6288 12.3647 34.343 11.9175C31.79 11.0295 28.1333 10.4437 24 10.4437C19.8667 10.4437 16.2099 11.0295 13.657 11.9175C12.3712 12.3647 11.4734 12.8516 10.9365 13.2931C10.5667 13.5973 10.4713 13.7876 10.4485 13.8519ZM37.5563 18.7877C36.3176 19.3925 34.8502 19.8839 33.2571 20.2642C30.5836 20.9025 27.3973 21.2655 24 21.2655C20.6027 21.2655 17.4164 20.9025 14.7429 20.2642C13.1498 19.8839 11.6824 19.3925 10.4436 18.7877V34.1275C10.4515 34.1545 10.5427 34.4867 11.379 35.027C12.298 35.6207 13.7492 36.2054 15.6717 36.6644C18.0007 37.2205 20.8712 37.5564 24 37.5564C27.1288 37.5564 29.9993 37.2205 32.3283 36.6644C34.2508 36.2054 35.702 35.6207 36.621 35.027C37.4573 34.4867 37.5485 34.1546 37.5563 34.1275V18.7877ZM41.5563 13.8546V34.1455C41.5563 36.1078 40.158 37.5042 38.7915 38.3869C37.3498 39.3182 35.4192 40.0389 33.2571 40.5551C30.5836 41.1934 27.3973 41.5564 24 41.5564C20.6027 41.5564 17.4164 41.1934 14.7429 40.5551C12.5808 40.0389 10.6502 39.3182 9.20848 38.3869C7.84205 37.5042 6.44365 36.1078 6.44365 34.1455L6.44365 13.8546C6.44365 12.2684 7.37223 11.0454 8.39581 10.2036C9.43325 9.3505 10.8137 8.67141 12.343 8.13948C15.4203 7.06909 19.5418 6.44366 24 6.44366C28.4582 6.44366 32.5797 7.06909 35.657 8.13948C37.1863 8.67141 38.5667 9.3505 39.6042 10.2036C40.6278 11.0454 41.5563 12.2684 41.5563 13.8546Z" fill="currentColor" fillRule="evenodd"></path>
                            </svg>
                        </div>
                        <span className="text-2xl font-bold tracking-tight">DoNext</span>
                    </div>
                    <h1 className="text-5xl font-black leading-tight mb-6">
                        "The secret of your future is hidden in your daily routine."
                    </h1>
                    <p className="text-white/80 text-xl leading-relaxed mb-12">
                        Join thousands of high-achievers using DoNext to optimize their workflow and reclaim their time.
                    </p>
                    <div className="w-full bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-2xl">
                        <div className="bg-white/5 rounded-lg h-64 w-full flex items-center justify-center overflow-hidden">
                            <img
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbu_lsouxyqUhYvuwBPpLhyNDLvJRjBcHduLjWlFnukKLwDzFs19q_CirmvA96q3ewNiB_bU9SGCrJ5DtRALBqi2YTqIkIQJg41Jd_Ok9nMKC7Hp5KNCnjyEDv5bQP3jAwKk6xzZbfah3Z5w2L57zZLmkhpdRKlxVH03gTHN6ESrwvhLA4REJawP0UVMWnTkvItomG1WUwicNJlXO5l4DGAYIwsrmTGqEhbNg1pm8jDOtW6XfS0m7XiagZDivVzRzuK1Bj4Ytd3QQ"
                                alt="Productivity dashboard interface preview with charts"
                                className="w-full h-full object-cover opacity-60"
                            />
                        </div>
                    </div>
                </div>
                {/* Decorative background elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <svg height="100%" width="100%">
                        <pattern id="pattern-circles" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                            <circle cx="20" cy="20" r="1" fill="white"></circle>
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#pattern-circles)"></rect>
                    </svg>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-24 bg-background-light dark:bg-background-dark">
                <div className="w-full max-w-[480px]">
                    <div className="mb-10 text-left">
                        <h2 className="text-3xl font-bold text-[#151612] dark:text-white leading-tight tracking-[-0.015em] mb-2">Welcome Back!</h2>
                        <p className="text-[#76816a] dark:text-gray-400">Please enter your details to sign in to your account.</p>
                    </div>
                    {error && <div className="mb-6 p-3 bg-red-100 text-red-600 rounded-lg text-sm font-bold">{error}</div>}
                    <form className="flex flex-col gap-5" onSubmit={handleLogin}>
                        {/* Email Field */}
                        <div className="flex flex-col w-full">
                            <label className="pb-2">
                                <span className="text-[#151612] dark:text-gray-200 text-sm font-medium leading-normal">Email Address</span>
                            </label>
                            <input
                                className="form-input flex w-full rounded-lg text-[#151612] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary border border-[#e1e3dd] dark:border-gray-700 bg-white dark:bg-gray-800 h-14 placeholder:text-[#76816a] px-4 text-base font-normal"
                                placeholder="Enter your email"
                                required
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        {/* Password Field */}
                        <div className="flex flex-col w-full">
                            <div className="flex justify-between items-center pb-2">
                                <label className="text-[#151612] dark:text-gray-200 text-sm font-medium leading-normal">Password</label>
                                <a className="text-primary text-sm font-semibold hover:underline" href="/auth/forgot-password">Forgot Password?</a>
                            </div>
                            <div className="relative flex items-center">
                                <input
                                    className="form-input flex w-full rounded-lg text-[#151612] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary border border-[#e1e3dd] dark:border-gray-700 bg-white dark:bg-gray-800 h-14 placeholder:text-[#76816a] px-4 text-base font-normal pr-12"
                                    placeholder="Enter your password"
                                    required
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <div
                                    className="absolute right-4 text-[#76816a] cursor-pointer hover:text-primary select-none"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <span className="material-symbols-outlined">
                                        {showPassword ? "visibility_off" : "visibility"}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {/* Remember Me */}
                        <div className="flex items-center gap-2">
                            <input className="w-4 h-4 rounded border-[#e1e3dd] text-primary focus:ring-primary" id="remember" type="checkbox" />
                            <label className="text-sm text-[#76816a] dark:text-gray-400 select-none cursor-pointer" htmlFor="remember">Remember me for 30 days</label>
                        </div>
                        {/* Login Button */}
                        <button
                            className="flex w-full items-center justify-center rounded-lg h-14 bg-primary text-white text-base font-bold tracking-[0.015em] hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Authenticating..." : "Log In"}
                        </button>
                        {/* Divider */}
                        <div className="flex items-center gap-4 py-4">
                            <div className="flex-1 h-px bg-[#e1e3dd] dark:bg-gray-700"></div>
                            <span className="text-xs text-[#76816a] font-medium uppercase tracking-wider">Or sign in with</span>
                            <div className="flex-1 h-px bg-[#e1e3dd] dark:bg-gray-700"></div>
                        </div>
                        {/* Social Logins */}
                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center gap-2 rounded-lg h-12 border border-[#e1e3dd] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#151612] dark:text-white text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" type="button">
                                <img
                                    alt="Google Logo"
                                    className="w-5 h-5"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFCA4lmEBbw3swtdLfKDfAd6rf8gxUDmdptj7eQVqCl2bGXO_fxr-8dzw6dyr-DoM-N3iivi3wTMLvfB7V9wP5V1qBmrEDu8P6pUniMOp5DLhoV8RMb6Q_en1bZoSHBu25-kEnyRYjBSEuFrfqd-k6jkxhEHym1DtTmf68EvW1X_X1lRVvEtlZ7oMLdWtoP5YKcNrdZ7PZ-4VQcJTUf-PJsaROYervv33MzQIIQp8lFQvFBQsNGK5TF3qxOopNe4zT3Ku-mzUagEg"
                                />
                                Google
                            </button>
                            <button className="flex items-center justify-center gap-2 rounded-lg h-12 border border-[#e1e3dd] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#151612] dark:text-white text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" type="button">
                                <span className="material-symbols-outlined text-[20px]">phone_iphone</span>
                                Apple
                            </button>
                        </div>
                    </form>
                    <div className="mt-10 text-center">
                        <p className="text-sm text-[#76816a] dark:text-gray-400">
                            Don&apos;t have an account?
                            <Link className="text-primary font-bold hover:underline ml-1" href="/auth/signup">Sign Up</Link>
                        </p>
                    </div>
                    {/* Footer Links */}
                    <div className="mt-16 flex justify-center gap-6">
                        <Link className="text-xs text-[#76816a] hover:text-primary transition-colors" href="/settings">Settings</Link>
                        <a className="text-xs text-[#76816a] hover:text-primary transition-colors" href="#">Privacy Policy</a>
                        <a className="text-xs text-[#76816a] hover:text-primary transition-colors" href="#">Terms of Service</a>
                    </div>
                </div>
            </div>
        </div>
    );
}

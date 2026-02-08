"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useTheme } from "@/components/ThemeProvider";

export default function Settings() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [profilePicture, setProfilePicture] = useState("");
    const { theme, setTheme } = useTheme();
    const [darkMode, setDarkMode] = useState(theme === "dark");
    const [notifEmail, setNotifEmail] = useState(true);
    const [notifPush, setNotifPush] = useState(true);
    const [defaultView, setDefaultView] = useState("Dashboard Overview");
    const [showToast, setShowToast] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/user/settings");
                if (res.ok) {
                    const data = await res.json();
                    setName(data.name || "");
                    setEmail(data.email || "");
                    setProfilePicture(data.profilePicture || "");
                    const isDark = data.theme === "dark";
                    setDarkMode(isDark);
                    setTheme(data.theme || "light");
                    setNotifEmail(data.notifEmail);
                    setNotifPush(data.notifPush);
                    setDefaultView(data.defaultView);
                }
            } catch (error) {
                console.error("Fetch settings error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [setTheme]);

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        setTheme(newMode ? "dark" : "light");
    };

    const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePicture(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        try {
            const res = await fetch("/api/user/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
                    profilePicture,
                    theme: darkMode ? "dark" : "light",
                    notifEmail,
                    notifPush,
                    defaultView
                })
            });
            if (res.ok) {
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            }
        } catch (error) {
            console.error("Save settings error:", error);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#333] dark:text-white min-h-screen flex flex-col">
            {/* Header */}
            <Header />

            <div className="flex flex-1 w-full max-w-[1600px] mx-auto">
                <Sidebar />

                {/* Main Content */}
                <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                    <div className="max-w-4xl mx-auto flex flex-col gap-8">
                        <div>
                            <h1 className="text-2xl font-bold">App Settings</h1>
                            <p className="text-slate-500">Manage your profile, preferences, and subscription.</p>
                        </div>
                        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E0E0E0] dark:border-[#222] shadow-sm overflow-hidden">
                            {/* Account Settings */}
                            <div className="p-8 border-b border-slate-100 dark:border-[#222]">
                                <div className="flex items-center gap-2 mb-6">
                                    <span className="material-symbols-outlined text-primary">person</span>
                                    <h3 className="font-bold text-lg">Account Settings</h3>
                                </div>
                                <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                                    <div className="relative group">
                                        {profilePicture ? (
                                            <div className="size-24 rounded-full bg-cover bg-center border-4 border-slate-50 shadow-sm" style={{ backgroundImage: `url("${profilePicture}")` }}></div>
                                        ) : (
                                            <div className="size-24 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-slate-50 shadow-sm flex items-center justify-center">
                                                <span className="material-symbols-outlined text-4xl text-slate-400">person</span>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            id="profile-picture-input"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleProfilePictureChange}
                                        />
                                        <button
                                            onClick={() => document.getElementById('profile-picture-input')?.click()}
                                            className="absolute bottom-0 right-0 size-8 bg-primary text-white rounded-full flex items-center justify-center border-2 border-white shadow-md hover:scale-110 transition-transform"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">edit</span>
                                        </button>
                                    </div>
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                                            <input
                                                className="w-full bg-slate-50 dark:bg-[#2A2A2A] border-slate-200 dark:border-[#333] rounded-lg text-sm focus:ring-primary focus:border-primary px-4 py-2 text-[#333] dark:text-white"
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                                            <input
                                                className="w-full bg-slate-50 dark:bg-[#2A2A2A] border-slate-200 dark:border-[#333] rounded-lg text-sm focus:ring-primary focus:border-primary px-4 py-2 text-[#333] dark:text-white"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Preferences */}
                            <div className="p-8 border-b border-slate-100 dark:border-[#222]">
                                <div className="flex items-center gap-2 mb-6">
                                    <span className="material-symbols-outlined text-primary">tune</span>
                                    <h3 className="font-bold text-lg">Preferences</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#2A2A2A] rounded-xl">
                                        <div>
                                            <p className="text-sm font-bold">Dark Mode</p>
                                            <p className="text-xs text-slate-500">Toggle between light and dark themes</p>
                                        </div>
                                        <div className="relative inline-block w-10 h-6 align-middle select-none transition duration-200 ease-in">
                                            <input
                                                type="checkbox"
                                                name="toggle"
                                                id="dark-mode"
                                                className={`absolute block w-5 h-5 rounded-full bg-white border-2 border-slate-300 appearance-none cursor-pointer transition-all duration-300 top-0.5 ${darkMode ? 'right-0 border-primary bg-primary' : 'right-4'}`}
                                                checked={darkMode}
                                                onChange={toggleDarkMode}
                                            />
                                            <label htmlFor="dark-mode" className={`block overflow-hidden h-6 rounded-full bg-slate-200 cursor-pointer transition-colors duration-300 ${darkMode ? 'bg-primary/20' : ''}`}></label>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Default View</label>
                                        <select
                                            className="w-full bg-slate-50 dark:bg-[#2A2A2A] border-slate-200 dark:border-[#333] rounded-lg text-sm focus:ring-primary focus:border-primary px-4 py-2 text-[#333] dark:text-white appearance-none"
                                            value={defaultView}
                                            onChange={(e) => setDefaultView(e.target.value)}
                                        >
                                            <option>Dashboard Overview</option>
                                            <option>My Tasks (List)</option>
                                            <option>Habit Tracker</option>
                                            <option>Weekly Calendar</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Notifications */}
                            <div className="p-8 border-b border-slate-100 dark:border-[#222]">
                                <div className="flex items-center gap-2 mb-6">
                                    <span className="material-symbols-outlined text-primary">notifications_active</span>
                                    <h3 className="font-bold text-lg">Notifications</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold">Email Notifications</p>
                                            <p className="text-xs text-slate-500">Receive weekly summaries and task reminders via email</p>
                                        </div>
                                        <div className="relative inline-block w-10 h-6 align-middle select-none">
                                            <input
                                                type="checkbox"
                                                name="toggle"
                                                id="notif-email"
                                                className={`absolute block w-5 h-5 rounded-full bg-white border-2 border-slate-300 appearance-none cursor-pointer transition-all duration-300 top-0.5 ${notifEmail ? 'right-0 border-primary bg-primary' : 'right-4'}`}
                                                checked={notifEmail}
                                                onChange={() => setNotifEmail(!notifEmail)}
                                            />
                                            <label htmlFor="notif-email" className={`block overflow-hidden h-6 rounded-full bg-slate-200 cursor-pointer transition-colors duration-300 ${notifEmail ? 'bg-primary/20' : ''}`}></label>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-[#222]">
                                        <div>
                                            <p className="text-sm font-bold">Push Notifications</p>
                                            <p className="text-xs text-slate-500">Get real-time alerts on your browser</p>
                                        </div>
                                        <div className="relative inline-block w-10 h-6 align-middle select-none">
                                            <input
                                                type="checkbox"
                                                name="toggle"
                                                id="notif-push"
                                                className={`absolute block w-5 h-5 rounded-full bg-white border-2 border-slate-300 appearance-none cursor-pointer transition-all duration-300 top-0.5 ${notifPush ? 'right-0 border-primary bg-primary' : 'right-4'}`}
                                                checked={notifPush}
                                                onChange={() => setNotifPush(!notifPush)}
                                            />
                                            <label htmlFor="notif-push" className={`block overflow-hidden h-6 rounded-full bg-slate-200 cursor-pointer transition-colors duration-300 ${notifPush ? 'bg-primary/20' : ''}`}></label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Subscription */}
                            <div className="p-8">
                                <div className="flex items-center gap-2 mb-6">
                                    <span className="material-symbols-outlined text-primary">workspace_premium</span>
                                    <h3 className="font-bold text-lg">Subscription</h3>
                                </div>
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-primary/5 p-6 rounded-2xl border border-primary/10">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-sm font-bold">Free Plan</p>
                                            <span className="bg-white dark:bg-[#2A2A2A] px-2 py-0.5 rounded-full text-[10px] font-bold text-primary border border-primary/20 uppercase">Current</span>
                                        </div>
                                        <p className="text-xs text-slate-500">Your current plan includes up to 5 habits and basic task management.</p>
                                        <p className="text-xs font-bold text-primary mt-2">Next Billing Date: N/A</p>
                                    </div>
                                    <button className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:brightness-105 transition-all whitespace-nowrap">
                                        View Pricing Plans
                                    </button>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="p-8 bg-slate-50 dark:bg-[#222] flex justify-between items-center">
                                <button className="text-red-500 text-sm font-bold hover:underline flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                    Delete Account
                                </button>
                                <div className="flex gap-4">
                                    <button className="px-6 py-2.5 text-slate-500 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all">Cancel</button>
                                    <button onClick={handleSave} className="px-8 py-2.5 bg-primary text-white font-bold text-sm rounded-xl shadow-lg hover:brightness-110 transition-all">Save Changes</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-6 right-6 z-50">
                    <div className="flex items-center bg-primary text-white p-4 rounded-xl shadow-xl min-w-[300px] border border-white/20">
                        <div className="size-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
                            <span className="material-symbols-outlined text-[20px] font-bold">check</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold">Settings Updated!</p>
                            <p className="text-xs opacity-90">Your profile changes have been saved.</p>
                        </div>
                        <button onClick={() => setShowToast(false)} className="ml-4 opacity-70 hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}

"use client";

import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import { useEffect, useState } from "react";
import Header from "@/components/Header";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
    read: boolean;
    createdAt: string;
}

export default function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filter, setFilter] = useState("All Types");

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await fetch("/api/notifications");
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data);
                }
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            }
        };
        fetchNotifications();
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await fetch("/api/notifications", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            });

            if (id === "all") {
                setNotifications(notifications.map(n => ({ ...n, read: true })));
            } else {
                setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
            }
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "success": return "check_circle";
            case "warning": return "warning";
            case "error": return "error";
            default: return "notifications";
        }
    };

    const getIconColor = (type: string) => {
        switch (type) {
            case "success": return "text-primary bg-primary/10";
            case "warning": return "text-amber-500 bg-amber-100 dark:bg-amber-900/20";
            case "error": return "text-red-500 bg-red-100 dark:bg-red-900/20";
            default: return "text-blue-500 bg-blue-100 dark:bg-blue-900/20";
        }
    };

    const groupedNotifications = {
        Today: notifications.filter(n => new Date(n.createdAt).toDateString() === new Date().toDateString()),
        Yesterday: notifications.filter(n => {
            const date = new Date(n.createdAt);
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            return date.toDateString() === yesterday.toDateString();
        }),
        Earlier: notifications.filter(n => {
            const date = new Date(n.createdAt);
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            return date < yesterday;
        })
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#333] dark:text-white min-h-screen flex flex-col">
            <Header />

            <div className="flex flex-1 w-full max-w-[1600px] mx-auto">
                <Sidebar />

                {/* Main Content */}
                <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                    <div className="max-w-4xl mx-auto flex flex-col gap-6">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold">Notifications</h1>
                                <p className="text-slate-500">Stay updated with your habits and productivity goals.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <select
                                    className="bg-white dark:bg-[#1A1A1A] border-slate-200 dark:border-[#333] rounded-lg text-sm focus:ring-primary focus:border-primary px-3 py-2 min-w-[140px] text-[#333] dark:text-white appearance-none"
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                >
                                    <option>All Types</option>
                                    <option>info</option>
                                    <option>success</option>
                                    <option>warning</option>
                                    <option>error</option>
                                </select>
                                <button
                                    onClick={() => markAsRead("all")}
                                    className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors whitespace-nowrap"
                                >
                                    Mark all as read
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-8">
                            {Object.entries(groupedNotifications).map(([label, items]) => (
                                items.length > 0 && (
                                    <div key={label}>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-1">{label}</h3>
                                        <div className="flex flex-col gap-3">
                                            {items.filter(n => filter === "All Types" || n.type === filter).map(notification => (
                                                <div
                                                    key={notification.id}
                                                    onClick={() => markAsRead(notification.id)}
                                                    className={`bg-white dark:bg-[#1A1A1A] p-4 rounded-xl border ${notification.read ? 'border-transparent opacity-75' : 'border-slate-200 dark:border-[#222] border-l-4 border-l-primary'} shadow-sm flex items-start gap-4 hover:border-primary/30 transition-all cursor-pointer`}
                                                >
                                                    <div className={`size-10 rounded-full flex items-center justify-center flex-shrink-0 ${getIconColor(notification.type)}`}>
                                                        <span className="material-symbols-outlined text-[20px]">{getIcon(notification.type)}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <p className={`text-sm leading-tight pr-4 ${notification.read ? 'font-medium' : 'font-bold'}`}>{notification.title}</p>
                                                            <span className="text-[11px] text-slate-400 whitespace-nowrap">
                                                                {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 mb-3">{notification.message}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            ))}

                            {notifications.length === 0 && (
                                <div className="text-center py-20 text-slate-400">
                                    <span className="material-symbols-outlined text-4xl mb-2">notifications_off</span>
                                    <p>No notifications yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

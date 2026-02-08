"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import PomodoroTimer from "@/components/PomodoroTimer";

export default function PomodoroPage() {
    const [selectedTask, setSelectedTask] = useState<string | null>(null);

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#333] dark:text-white min-h-screen flex flex-col">
            <Header />
            <div className="flex flex-1 w-full max-w-[1600px] mx-auto">
                <Sidebar />
                <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#F9FBF9] dark:bg-background-dark">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold mb-2">Pomodoro Timer</h1>
                            <p className="text-slate-500">Boost your productivity with focused work sessions</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Timer Component */}
                            <div className="lg:col-span-2">
                                <PomodoroTimer />
                            </div>

                            {/* Task Selection Panel */}
                            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-slate-100 dark:border-[#222] p-6">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">assignment</span>
                                    Focus Task
                                </h2>
                                
                                <div className="space-y-3">
                                    <div className="p-3 border-2 border-dashed border-slate-200 dark:border-[#333] rounded-xl text-center">
                                        <span className="material-symbols-outlined text-3xl text-slate-300 mb-2">task</span>
                                        <p className="text-sm text-slate-500">No task selected</p>
                                        <p className="text-xs text-slate-400 mt-1">Select a task to track with your focus sessions</p>
                                    </div>
                                    
                                    <button className="w-full py-2.5 border-2 border-dashed border-slate-200 dark:border-[#333] rounded-xl text-xs font-bold text-slate-400 hover:text-primary hover:border-primary transition-all flex items-center justify-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">add</span>
                                        Link Task
                                    </button>
                                </div>

                                {/* Quick Stats */}
                                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-[#333]">
                                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Today's Focus</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-slate-500">Sessions Completed</span>
                                            <span className="font-bold text-primary">0</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-slate-500">Focus Time</span>
                                            <span className="font-bold text-green-500">0m</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-slate-500">Tasks Worked On</span>
                                            <span className="font-bold text-blue-500">0</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Productivity Tips */}
                                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-[#333]">
                                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Focus Tips</h3>
                                    <ul className="text-xs text-slate-500 space-y-2">
                                        <li className="flex items-start gap-2">
                                            <span className="material-symbols-outlined text-[14px] text-green-500 mt-0.5">check_circle</span>
                                            <span>Eliminate distractions during work sessions</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="material-symbols-outlined text-[14px] text-green-500 mt-0.5">check_circle</span>
                                            <span>Use breaks to stretch and refresh your mind</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="material-symbols-outlined text-[14px] text-green-500 mt-0.5">check_circle</span>
                                            <span>Track your most productive hours</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* How It Works Section */}
                        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-slate-100 dark:border-[#222] p-6 mt-8">
                            <h2 className="text-xl font-bold mb-4">How Pomodoro Works</h2>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="text-center">
                                    <div className="size-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <span className="material-symbols-outlined text-red-500">timer</span>
                                    </div>
                                    <h3 className="font-bold text-sm mb-1">25-Minute Focus</h3>
                                    <p className="text-xs text-slate-500">Work intensely on a single task without interruptions</p>
                                </div>
                                <div className="text-center">
                                    <div className="size-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <span className="material-symbols-outlined text-green-500">coffee</span>
                                    </div>
                                    <h3 className="font-bold text-sm mb-1">5-Minute Break</h3>
                                    <p className="text-xs text-slate-500">Take a short break to rest and recharge</p>
                                </div>
                                <div className="text-center">
                                    <div className="size-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <span className="material-symbols-outlined text-blue-500">loop</span>
                                    </div>
                                    <h3 className="font-bold text-sm mb-1">Repeat Cycle</h3>
                                    <p className="text-xs text-slate-500">Complete 4 cycles, then take a longer break</p>
                                </div>
                                <div className="text-center">
                                    <div className="size-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <span className="material-symbols-outlined text-purple-500">trending_up</span>
                                    </div>
                                    <h3 className="font-bold text-sm mb-1">Boost Productivity</h3>
                                    <p className="text-xs text-slate-500">Build momentum and maintain consistent progress</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
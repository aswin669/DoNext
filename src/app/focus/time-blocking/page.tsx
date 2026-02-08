"use client";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import TimeBlockingCalendar from "@/components/TimeBlockingCalendar";

export default function TimeBlockingPage() {
    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#333] dark:text-white min-h-screen flex flex-col">
            <Header />
            <div className="flex flex-1 w-full max-w-[1600px] mx-auto">
                <Sidebar />
                <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#F9FBF9] dark:bg-background-dark">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold mb-2">Time Blocking</h1>
                            <p className="text-slate-500">Plan your day with focused time blocks for maximum productivity</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main Calendar */}
                            <div className="lg:col-span-2">
                                <TimeBlockingCalendar />
                            </div>

                            {/* Sidebar Panel */}
                            <div className="space-y-6">
                                {/* Daily Overview */}
                                <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-slate-100 dark:border-[#222] p-6">
                                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">today</span>
                                        Today's Schedule
                                    </h2>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="size-3 bg-blue-500 rounded-full"></div>
                                                <div>
                                                    <div className="font-medium text-sm">Morning Deep Work</div>
                                                    <div className="text-xs text-slate-500">9:00 AM - 11:00 AM</div>
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold text-blue-600">2h</span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="size-3 bg-green-500 rounded-full"></div>
                                                <div>
                                                    <div className="font-medium text-sm">Lunch Break</div>
                                                    <div className="text-xs text-slate-500">12:00 PM - 1:00 PM</div>
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold text-green-600">1h</span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="size-3 bg-purple-500 rounded-full"></div>
                                                <div>
                                                    <div className="font-medium text-sm">Skill Development</div>
                                                    <div className="text-xs text-slate-500">2:00 PM - 4:00 PM</div>
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold text-purple-600">2h</span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-[#333]">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Total Blocked Time</span>
                                            <span className="font-bold">5 hours</span>
                                        </div>
                                        <div className="flex justify-between text-sm mt-1">
                                            <span className="text-slate-500">Available Time</span>
                                            <span className="font-bold text-green-500">3 hours</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Productivity Stats */}
                                <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-slate-100 dark:border-[#222] p-6">
                                    <h2 className="text-lg font-bold mb-4">This Week</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-sm font-medium">Work Blocks</span>
                                                <span className="text-sm font-bold text-blue-500">12</span>
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-[#222] rounded-full h-2">
                                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-sm font-medium">Focus Time</span>
                                                <span className="text-sm font-bold text-green-500">24h</span>
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-[#222] rounded-full h-2">
                                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-sm font-medium">Consistency</span>
                                                <span className="text-sm font-bold text-purple-500">85%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-[#222] rounded-full h-2">
                                                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Tips */}
                                <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-slate-100 dark:border-[#222] p-6">
                                    <h2 className="text-lg font-bold mb-4">Time Blocking Tips</h2>
                                    <ul className="space-y-3 text-sm">
                                        <li className="flex items-start gap-3">
                                            <span className="material-symbols-outlined text-green-500 text-[18px] mt-0.5">check</span>
                                            <span>Start with your most important task in the morning</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="material-symbols-outlined text-green-500 text-[18px] mt-0.5">check</span>
                                            <span>Include buffer time between blocks for transitions</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="material-symbols-outlined text-green-500 text-[18px] mt-0.5">check</span>
                                            <span>Block time for breaks and self-care</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="material-symbols-outlined text-green-500 text-[18px] mt-0.5">check</span>
                                            <span>Review and adjust your schedule daily</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Benefits Section */}
                        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-slate-100 dark:border-[#222] p-6 mt-8">
                            <h2 className="text-xl font-bold mb-4">Why Time Blocking Works</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="size-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="material-symbols-outlined text-blue-500 text-2xl">psychology</span>
                                    </div>
                                    <h3 className="font-bold mb-2">Reduces Decision Fatigue</h3>
                                    <p className="text-sm text-slate-500">Pre-plan your day to eliminate constant decision-making about what to do next</p>
                                </div>
                                
                                <div className="text-center">
                                    <div className="size-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="material-symbols-outlined text-green-500 text-2xl">bolt</span>
                                    </div>
                                    <h3 className="font-bold mb-2">Increases Focus</h3>
                                    <p className="text-sm text-slate-500">Dedicated time blocks help you stay concentrated on single tasks without multitasking</p>
                                </div>
                                
                                <div className="text-center">
                                    <div className="size-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="material-symbols-outlined text-purple-500 text-2xl">trending_up</span>
                                    </div>
                                    <h3 className="font-bold mb-2">Boosts Productivity</h3>
                                    <p className="text-sm text-slate-500">Structured scheduling leads to better time management and higher output quality</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
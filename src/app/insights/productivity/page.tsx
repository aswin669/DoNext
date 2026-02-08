"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function ProductivityInsightsPage() {
    const [insights, setInsights] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [timeRange, setTimeRange] = useState("30");

    useEffect(() => {
        fetchInsights();
    }, [timeRange]);

    const fetchInsights = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/insights/productivity");
            if (res.ok) {
                const data = await res.json();
                setInsights(data.insights);
                setError("");
            } else {
                const errorData = await res.json();
                setError(errorData.error || "Failed to load insights");
            }
        } catch (err) {
            setError("Network error occurred");
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-background-light dark:bg-background-dark font-display text-[#333] dark:text-white min-h-screen flex flex-col">
                <Header />
                <div className="flex flex-1 w-full max-w-[1600px] mx-auto">
                    <Sidebar />
                    <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#F9FBF9] dark:bg-background-dark">
                        <div className="max-w-6xl mx-auto">
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                                <span className="ml-3 text-lg">Analyzing your productivity patterns...</span>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#333] dark:text-white min-h-screen flex flex-col">
            <Header />
            <div className="flex flex-1 w-full max-w-[1600px] mx-auto">
                <Sidebar />
                <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#F9FBF9] dark:bg-background-dark">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-8">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">Productivity Insights</h1>
                                    <p className="text-slate-500">AI-powered analysis of your work patterns and habits</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-slate-500">Time Range:</span>
                                    <select 
                                        value={timeRange}
                                        onChange={(e) => setTimeRange(e.target.value)}
                                        className="px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222] text-sm"
                                    >
                                        <option value="7">Last 7 days</option>
                                        <option value="30">Last 30 days</option>
                                        <option value="90">Last 90 days</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
                                <div className="flex items-center">
                                    <span className="material-symbols-outlined mr-2">error</span>
                                    {error}
                                </div>
                            </div>
                        )}

                        {insights && (
                            <>
                                {/* Overall Score */}
                                <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl shadow-sm p-6 mb-8 text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-2xl font-bold">Productivity Score</h2>
                                            <p className="text-primary-100 mt-1">Based on your recent activity patterns</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-5xl font-black">{insights.performanceMetrics.productivityScore}</div>
                                            <div className="text-primary-100 text-sm">
                                                {insights.performanceMetrics.weeklyGrowth >= 0 ? '+' : ''}
                                                {insights.performanceMetrics.weeklyGrowth}% this week
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="w-full bg-primary-500 rounded-full h-3 mt-6">
                                        <div 
                                            className="bg-white h-3 rounded-full transition-all duration-1000"
                                            style={{ width: `${insights.performanceMetrics.productivityScore}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Productivity Patterns */}
                                    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-slate-100 dark:border-[#222] p-6">
                                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary">trending_up</span>
                                            Your Patterns
                                        </h2>
                                        
                                        <div className="space-y-5">
                                            <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-[#222] rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-primary">task</span>
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">Task Completion</div>
                                                        <div className="text-sm text-slate-500">Your task finishing rate</div>
                                                    </div>
                                                </div>
                                                <div className="text-2xl font-black text-primary">
                                                    {insights.productivityPatterns.taskCompletionRate}%
                                                </div>
                                            </div>
                                            
                                            <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-[#222] rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-full bg-green-500/10 flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-green-500">calendar_today</span>
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">Habit Consistency</div>
                                                        <div className="text-sm text-slate-500">Daily habit maintenance</div>
                                                    </div>
                                                </div>
                                                <div className="text-2xl font-black text-green-500">
                                                    {insights.productivityPatterns.habitCompletionRate}%
                                                </div>
                                            </div>
                                            
                                            <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-[#222] rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-purple-500">event</span>
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">Most Productive Day</div>
                                                        <div className="text-sm text-slate-500">Your peak performance day</div>
                                                    </div>
                                                </div>
                                                <div className="text-lg font-bold text-purple-500">
                                                    {insights.productivityPatterns.mostProductiveDay}
                                                </div>
                                            </div>
                                            
                                            <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-[#222] rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-blue-500">bolt</span>
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">Consistency Score</div>
                                                        <div className="text-sm text-slate-500">Regular activity pattern</div>
                                                    </div>
                                                </div>
                                                <div className="text-2xl font-black text-blue-500">
                                                    {insights.productivityPatterns.consistencyScore}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Time Analysis */}
                                    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-slate-100 dark:border-[#222] p-6">
                                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary">schedule</span>
                                            Time Patterns
                                        </h2>
                                        
                                        <div className="space-y-5">
                                            <div className="p-4 bg-slate-50 dark:bg-[#222] rounded-xl">
                                                <div className="flex justify-between items-center mb-3">
                                                    <div className="font-medium">Peak Productivity Hour</div>
                                                    <div className="text-2xl font-black text-primary">
                                                        {insights.timeAnalysis.mostProductiveHour}:00
                                                    </div>
                                                </div>
                                                <div className="text-sm text-slate-500">
                                                    This is when you're most active and productive
                                                </div>
                                            </div>
                                            
                                            <div className="p-4 bg-slate-50 dark:bg-[#222] rounded-xl">
                                                <div className="flex justify-between items-center mb-3">
                                                    <div className="font-medium">Average Session Length</div>
                                                    <div className="text-2xl font-black text-green-500">
                                                        {insights.timeAnalysis.averageSessionLength}m
                                                    </div>
                                                </div>
                                                <div className="text-sm text-slate-500">
                                                    Your typical focused work duration
                                                </div>
                                            </div>
                                            
                                            <div className="p-4 bg-slate-50 dark:bg-[#222] rounded-xl">
                                                <div className="flex justify-between items-center mb-3">
                                                    <div className="font-medium">Sessions Per Day</div>
                                                    <div className="text-2xl font-black text-purple-500">
                                                        {insights.timeAnalysis.sessionsPerDay}
                                                    </div>
                                                </div>
                                                <div className="text-sm text-slate-500">
                                                    Average daily focus sessions
                                                </div>
                                            </div>
                                            
                                            <div className="p-4 bg-slate-50 dark:bg-[#222] rounded-xl">
                                                <div className="font-medium mb-3">Preferred Time Blocks</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {insights.timeAnalysis.preferredTimeBlocks.map((block: string, index: number) => (
                                                        <span 
                                                            key={index}
                                                            className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full"
                                                        >
                                                            {block}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Habit Analysis */}
                                <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-slate-100 dark:border-[#222] p-6 mt-8">
                                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">fitness_center</span>
                                        Habit Performance
                                    </h2>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
                                            <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                                                {insights.habitAnalysis.bestPerformingCategory}
                                            </div>
                                            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Best Category</div>
                                        </div>
                                        
                                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-center">
                                            <div className="text-2xl font-black text-red-600 dark:text-red-400">
                                                {insights.habitAnalysis.worstPerformingCategory}
                                            </div>
                                            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Needs Attention</div>
                                        </div>
                                        
                                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
                                            <div className="text-2xl font-black text-green-600 dark:text-green-400">
                                                {insights.habitAnalysis.categoryPerformance.length}
                                            </div>
                                            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Categories Tracked</div>
                                        </div>
                                        
                                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-center">
                                            <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
                                                {Math.round(
                                                    insights.habitAnalysis.categoryPerformance.reduce((sum: number, cat: any) => 
                                                        sum + cat.averageCompletionRate, 0
                                                    ) / insights.habitAnalysis.categoryPerformance.length || 0
                                                )}%
                                            </div>
                                            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Average Success Rate</div>
                                        </div>
                                    </div>
                                    
                                    <div className="border-t border-slate-100 dark:border-[#333] pt-6">
                                        <h3 className="font-bold mb-4">Category Performance</h3>
                                        <div className="space-y-3">
                                            {insights.habitAnalysis.categoryPerformance.slice(0, 5).map((category: any, index: number) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#222] rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`size-3 rounded-full ${
                                                            index === 0 ? 'bg-green-500' : 
                                                            index === 1 ? 'bg-blue-500' : 
                                                            index === 2 ? 'bg-yellow-500' : 'bg-gray-500'
                                                        }`}></div>
                                                        <span className="font-medium">{category.category}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-24 bg-slate-100 dark:bg-[#333] rounded-full h-2">
                                                            <div 
                                                                className={`h-2 rounded-full ${
                                                                    category.averageCompletionRate >= 80 ? 'bg-green-500' :
                                                                    category.averageCompletionRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                                }`}
                                                                style={{ width: `${category.averageCompletionRate}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="font-bold w-12 text-right">
                                                            {category.averageCompletionRate}%
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* AI Recommendations */}
                                <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-slate-100 dark:border-[#222] p-6 mt-8">
                                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">auto_awesome</span>
                                        AI Recommendations
                                    </h2>
                                    
                                    <div className="space-y-4">
                                        {insights.recommendationEngine.map((recommendation: string, index: number) => (
                                            <div 
                                                key={index} 
                                                className="flex items-start gap-4 p-4 bg-gradient-to-r from-primary/5 to-blue-500/5 border border-primary/20 rounded-xl"
                                            >
                                                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                                                    <span className="material-symbols-outlined text-primary text-sm">lightbulb</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[#333] dark:text-gray-200">{recommendation}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="mt-6 p-4 bg-slate-50 dark:bg-[#222] rounded-xl">
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                            <span className="material-symbols-outlined text-[16px]">info</span>
                                            <span>These insights update automatically based on your activity patterns</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
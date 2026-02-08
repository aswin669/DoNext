"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function PredictiveAnalyticsPage() {
    const [forecast, setForecast] = useState<any>(null);
    const [trends, setTrends] = useState<any>(null);
    const [habitPredictions, setHabitPredictions] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("forecast");
    const [forecastDays, setForecastDays] = useState(30);

    useEffect(() => {
        fetchData();
    }, [activeTab, forecastDays]);

    const fetchData = async () => {
        try {
            setLoading(true);

            if (activeTab === 'forecast') {
                const res = await fetch(`/api/analytics/predictive?type=forecast&days=${forecastDays}`);
                if (res.ok) {
                    const data = await res.json();
                    setForecast(data.forecast);
                }
            } else if (activeTab === 'trends') {
                const res = await fetch(`/api/analytics/predictive?type=trends&period=month`);
                if (res.ok) {
                    const data = await res.json();
                    setTrends(data.trends);
                }
            } else if (activeTab === 'habits') {
                const res = await fetch(`/api/analytics/predictive?type=habitPredictions`);
                if (res.ok) {
                    const data = await res.json();
                    setHabitPredictions(data.predictions);
                }
            }

            setError("");
        } catch (err) {
            setError("Network error occurred");
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const getTrendIcon = (trend: number) => {
        if (trend > 0.1) return "trending_up";
        if (trend < -0.1) return "trending_down";
        return "trending_flat";
    };

    const getTrendColor = (trend: number) => {
        if (trend > 0.1) return "text-green-500";
        if (trend < -0.1) return "text-red-500";
        return "text-slate-500";
    };

    const getConfidenceColor = (lower: number, upper: number) => {
        const range = upper - lower;
        if (range < 10) return "text-green-500";
        if (range < 20) return "text-yellow-500";
        return "text-red-500";
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
                                <span className="ml-3 text-lg">Analyzing Predictive Data...</span>
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
                                    <h1 className="text-3xl font-bold mb-2">Predictive Analytics</h1>
                                    <p className="text-slate-500">AI-powered performance forecasting and trend analysis</p>
                                </div>
                                {activeTab === 'forecast' && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-slate-500">Forecast Period:</span>
                                        <select
                                            value={forecastDays}
                                            onChange={(e) => setForecastDays(parseInt(e.target.value))}
                                            className="px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222] text-sm"
                                        >
                                            <option value={7}>7 days</option>
                                            <option value={14}>14 days</option>
                                            <option value={30}>30 days</option>
                                            <option value={60}>60 days</option>
                                            <option value={90}>90 days</option>
                                        </select>
                                    </div>
                                )}
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

                        {/* Tab Navigation */}
                        <div className="flex gap-1 mb-6 bg-slate-100 dark:bg-[#222] p-1 rounded-xl w-fit">
                            {['forecast', 'trends', 'habits'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${activeTab === tab
                                            ? 'bg-white dark:bg-[#1A1A1A] text-primary shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                        }`}
                                >
                                    {tab === 'forecast' ? 'Performance Forecast' :
                                        tab === 'trends' ? 'Trend Analysis' : 'Habit Predictions'}
                                </button>
                            ))}
                        </div>

                        {/* Performance Forecast Tab */}
                        {activeTab === "forecast" && forecast && (
                            <div>
                                <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl shadow-sm p-6 mb-8 text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-2xl font-bold">Performance Forecast</h2>
                                            <p className="text-primary-100 mt-1">Predicted performance for the next {forecastDays} days</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-primary-100">Generated</div>
                                            <div className="text-sm font-medium">{new Date(forecast.generatedAt).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                    <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#222]">
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                                                <span className="material-symbols-outlined text-3xl">task</span>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Task Completion</p>
                                                <h3 className="text-2xl font-black">{forecast.forecasts.taskCompletion}%</h3>
                                                <div className={`text-sm font-medium flex items-center gap-1 ${getConfidenceColor(forecast.confidence.taskCompletion.lower, forecast.confidence.taskCompletion.upper)}`}>
                                                    <span className="material-symbols-outlined text-[16px]">trending_flat</span>
                                                    {forecast.confidence.taskCompletion.lower}-{forecast.confidence.taskCompletion.upper}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#222]">
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-500">
                                                <span className="material-symbols-outlined text-3xl">calendar_today</span>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Habit Adherence</p>
                                                <h3 className="text-2xl font-black">{forecast.forecasts.habitCompletion}%</h3>
                                                <div className={`text-sm font-medium flex items-center gap-1 ${getConfidenceColor(forecast.confidence.habitCompletion.lower, forecast.confidence.habitCompletion.upper)}`}>
                                                    <span className="material-symbols-outlined text-[16px]">trending_flat</span>
                                                    {forecast.confidence.habitCompletion.lower}-{forecast.confidence.habitCompletion.upper}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#222]">
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-500">
                                                <span className="material-symbols-outlined text-3xl">auto_awesome</span>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Productivity Score</p>
                                                <h3 className="text-2xl font-black">{forecast.forecasts.productivityScore}</h3>
                                                <div className={`text-sm font-medium flex items-center gap-1 ${getConfidenceColor(forecast.confidence.productivityScore.lower, forecast.confidence.productivityScore.upper)}`}>
                                                    <span className="material-symbols-outlined text-[16px]">trending_flat</span>
                                                    {forecast.confidence.productivityScore.lower}-{forecast.confidence.productivityScore.upper}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#222]">
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-500">
                                                <span className="material-symbols-outlined text-3xl">flag</span>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Goal Progress</p>
                                                <h3 className="text-2xl font-black">{forecast.forecasts.goalProgress}%</h3>
                                                <div className="text-sm text-slate-500">Projected</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Historical Trends */}
                                <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-slate-100 dark:border-[#222] p-6">
                                    <h2 className="text-xl font-bold mb-6">Historical Patterns</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="p-4 bg-slate-50 dark:bg-[#222] rounded-xl">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="material-symbols-outlined text-blue-500">task</span>
                                                <div>
                                                    <div className="font-medium">Task Completion Trend</div>
                                                    <div className="text-sm text-slate-500">Weekly rate change</div>
                                                </div>
                                            </div>
                                            <div className={`flex items-center gap-2 text-lg font-bold ${getTrendColor(forecast.historicalPatterns.taskCompletionTrend)}`}>
                                                <span className="material-symbols-outlined">{getTrendIcon(forecast.historicalPatterns.taskCompletionTrend)}</span>
                                                {forecast.historicalPatterns.taskCompletionTrend > 0 ? '+' : ''}
                                                {Math.round(forecast.historicalPatterns.taskCompletionTrend * 100)}%
                                            </div>
                                        </div>

                                        <div className="p-4 bg-slate-50 dark:bg-[#222] rounded-xl">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="material-symbols-outlined text-green-500">calendar_today</span>
                                                <div>
                                                    <div className="font-medium">Habit Completion Trend</div>
                                                    <div className="text-sm text-slate-500">Daily consistency</div>
                                                </div>
                                            </div>
                                            <div className={`flex items-center gap-2 text-lg font-bold ${getTrendColor(forecast.historicalPatterns.habitCompletionTrend)}`}>
                                                <span className="material-symbols-outlined">{getTrendIcon(forecast.historicalPatterns.habitCompletionTrend)}</span>
                                                {forecast.historicalPatterns.habitCompletionTrend > 0 ? '+' : ''}
                                                {Math.round(forecast.historicalPatterns.habitCompletionTrend * 100)}%
                                            </div>
                                        </div>

                                        <div className="p-4 bg-slate-50 dark:bg-[#222] rounded-xl">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="material-symbols-outlined text-purple-500">bolt</span>
                                                <div>
                                                    <div className="font-medium">Productivity Consistency</div>
                                                    <div className="text-sm text-slate-500">Score stability</div>
                                                </div>
                                            </div>
                                            <div className="text-lg font-bold text-slate-700 dark:text-slate-300">
                                                {Math.round(forecast.historicalPatterns.productivityPatterns.consistency * 100)}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Trend Analysis Tab */}
                        {activeTab === "trends" && trends && (
                            <div>
                                <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-slate-100 dark:border-[#222] p-6 mb-8">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold">Performance Trends</h2>
                                        <div className="text-sm text-slate-500">
                                            Period: {trends.period} • Analyzed: {new Date(trends.analysisDate).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                        {Object.entries(trends.trends).map(([metric, trend]) => (
                                            <div key={metric} className="p-4 bg-slate-50 dark:bg-[#222] rounded-xl">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-medium capitalize">{metric.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${trend === 'improving' ? 'bg-green-100 text-green-800' :
                                                            trend === 'declining' ? 'bg-red-100 text-red-800' :
                                                                'bg-slate-100 text-slate-800'
                                                        }`}>
                                                        {trend as string}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                                    {trend === 'improving' ? 'Positive trend detected' :
                                                        trend === 'declining' ? 'Declining performance' :
                                                            'Stable performance'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {trends.anomalies.length > 0 && (
                                        <div className="border-t border-slate-100 dark:border-[#333] pt-6">
                                            <h3 className="font-bold mb-4">Performance Anomalies</h3>
                                            <div className="space-y-3">
                                                {trends.anomalies.map((anomaly: any, index: number) => (
                                                    <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                                        <div className="font-medium text-yellow-800 dark:text-yellow-200">{anomaly.type}</div>
                                                        <div className="text-sm text-yellow-700 dark:text-yellow-300">{anomaly.description}</div>
                                                        <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                                                            {new Date(anomaly.date).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {trends.insights.length > 0 && (
                                    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-slate-100 dark:border-[#222] p-6">
                                        <h2 className="text-xl font-bold mb-6">AI Insights</h2>
                                        <div className="space-y-4">
                                            {trends.insights.map((insight: string, index: number) => (
                                                <div key={index} className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-[#222] rounded-xl">
                                                    <span className="material-symbols-outlined text-primary mt-0.5">auto_awesome</span>
                                                    <p className="text-[#333] dark:text-gray-200">{insight}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Habit Predictions Tab */}
                        {activeTab === "habits" && habitPredictions && (
                            <div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Overall Adherence Score */}
                                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-sm p-6 text-white">
                                        <div className="text-center">
                                            <h2 className="text-2xl font-bold mb-2">Overall Adherence Score</h2>
                                            <div className="text-5xl font-black mb-2">
                                                {Math.round(habitPredictions.overallAdherenceScore * 100)}%
                                            </div>
                                            <p className="text-green-100">Based on current patterns and trends</p>
                                        </div>
                                    </div>

                                    {/* High-Risk Habits */}
                                    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-slate-100 dark:border-[#222] p-6">
                                        <h2 className="text-xl font-bold mb-4">High-Risk Habits</h2>
                                        {habitPredictions.highRiskHabits.length > 0 ? (
                                            <div className="space-y-3">
                                                {habitPredictions.highRiskHabits.map((habit: any) => (
                                                    <div key={habit.habitId} className="p-3 border border-red-100 dark:border-red-900/30 rounded-lg bg-red-50 dark:bg-red-900/10">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="font-medium text-red-800 dark:text-red-200">{habit.name}</span>
                                                            <span className="text-lg font-bold text-red-600 dark:text-red-400">
                                                                {Math.round(habit.adherenceProbability * 100)}%
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-red-700 dark:text-red-300">
                                                            Low adherence probability detected
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-slate-500">
                                                <div className="text-3xl mb-2">🎉</div>
                                                <p>No high-risk habits identified</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Detailed Predictions */}
                                <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-slate-100 dark:border-[#222] p-6 mt-8">
                                    <h2 className="text-xl font-bold mb-6">Detailed Habit Predictions</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {habitPredictions.predictions.map((prediction: any) => (
                                            <div key={prediction.habitId} className="p-4 border border-slate-100 dark:border-[#333] rounded-xl">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h3 className="font-bold text-lg">{prediction.name}</h3>
                                                    <div className="text-right">
                                                        <div className="text-2xl font-black text-primary">
                                                            {Math.round(prediction.adherenceProbability * 100)}%
                                                        </div>
                                                        <div className="text-xs text-slate-500">Adherence Probability</div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2 mb-4">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-slate-500">Risk Level:</span>
                                                        <span className={`font-medium ${prediction.streakRisk > 0.5 ? 'text-red-500' :
                                                                prediction.streakRisk > 0.3 ? 'text-yellow-500' : 'text-green-500'
                                                            }`}>
                                                            {prediction.streakRisk > 0.5 ? 'High' :
                                                                prediction.streakRisk > 0.3 ? 'Medium' : 'Low'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {prediction.riskFactors.length > 0 && (
                                                    <div className="mb-3">
                                                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Risk Factors:</div>
                                                        <div className="flex flex-wrap gap-1">
                                                            {prediction.riskFactors.map((factor: string, index: number) => (
                                                                <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                                                    {factor}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {prediction.improvementSuggestions.length > 0 && (
                                                    <div>
                                                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Suggestions:</div>
                                                        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                                                            {prediction.improvementSuggestions.map((suggestion: string, index: number) => (
                                                                <li key={index} className="flex items-start gap-2">
                                                                    <span className="material-symbols-outlined text-[16px] mt-0.5">arrow_right</span>
                                                                    {suggestion}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
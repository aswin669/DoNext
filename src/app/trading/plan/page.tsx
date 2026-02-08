"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function DailyPlanPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        marketBias: "Neutral",
        goals: "",
        maxRisk: "",
        accountSize: "",
        notes: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.currentTarget;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const calculateMaxRiskPercent = () => {
        if (formData.maxRisk && formData.accountSize) {
            const percent = (parseFloat(formData.maxRisk) / parseFloat(formData.accountSize)) * 100;
            return percent.toFixed(2);
        }
        return "0.00";
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/trading/daily-plan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    date: new Date(formData.date),
                    marketBias: formData.marketBias,
                    goals: formData.goals,
                    maxRisk: parseFloat(formData.maxRisk),
                    accountSize: parseFloat(formData.accountSize),
                    notes: formData.notes
                })
            });

            if (response.ok) {
                router.push("/trading");
            } else {
                alert("Failed to create daily plan");
            }
        } catch (error) {
            console.error("Error creating daily plan:", error);
            alert("Error creating daily plan");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#333] dark:text-white min-h-screen flex flex-col">
            <Header />
            
            <div className="flex flex-1 w-full max-w-[1600px] mx-auto">
                <Sidebar />
                
                <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#F9FBF9] dark:bg-background-dark">
                    <div className="max-w-2xl mx-auto">
                        <div className="mb-6">
                            <Link href="/trading" className="text-primary font-bold hover:underline">
                                ← Back to Trading
                            </Link>
                        </div>

                        <div className="bg-white dark:bg-[#1A1A1A] p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-[#222]">
                            <h1 className="text-2xl font-black mb-2">Daily Trading Plan</h1>
                            <p className="text-slate-500 mb-6">Plan your trading day with discipline and clarity</p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Date */}
                                <div>
                                    <label className="block text-sm font-bold mb-2">Trading Date *</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#2A2A2A] focus:outline-none focus:border-primary"
                                        required
                                    />
                                </div>

                                {/* Market Bias */}
                                <div>
                                    <label className="block text-sm font-bold mb-2">Market Bias *</label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {['Bullish', 'Neutral', 'Bearish'].map(bias => (
                                            <button
                                                key={bias}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, marketBias: bias }))}
                                                className={`py-3 px-4 rounded-lg font-bold transition-all ${
                                                    formData.marketBias === bias
                                                        ? 'bg-primary text-white'
                                                        : 'bg-slate-100 dark:bg-[#2A2A2A] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#333]'
                                                }`}
                                            >
                                                {bias === 'Bullish' ? '📈' : bias === 'Bearish' ? '📉' : '➡️'} {bias}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Goals */}
                                <div>
                                    <label className="block text-sm font-bold mb-2">Trading Goals *</label>
                                    <textarea
                                        name="goals"
                                        value={formData.goals}
                                        onChange={handleChange}
                                        placeholder="What are your trading goals for today? (e.g., 2-3 high-quality setups, 1:2 R:R minimum)"
                                        rows={3}
                                        className="w-full px-4 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#2A2A2A] focus:outline-none focus:border-primary"
                                        required
                                    />
                                </div>

                                {/* Risk Management */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-2">Account Size *</label>
                                        <input
                                            type="number"
                                            name="accountSize"
                                            value={formData.accountSize}
                                            onChange={handleChange}
                                            placeholder="e.g., 10000"
                                            step="0.01"
                                            className="w-full px-4 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#2A2A2A] focus:outline-none focus:border-primary"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2">Max Daily Risk *</label>
                                        <input
                                            type="number"
                                            name="maxRisk"
                                            value={formData.maxRisk}
                                            onChange={handleChange}
                                            placeholder="e.g., 200"
                                            step="0.01"
                                            className="w-full px-4 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#2A2A2A] focus:outline-none focus:border-primary"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Risk Percentage Display */}
                                <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                                    <p className="text-sm font-bold text-primary">
                                        Max Risk: {calculateMaxRiskPercent()}% of account
                                    </p>
                                </div>

                                {/* Additional Notes */}
                                <div>
                                    <label className="block text-sm font-bold mb-2">Additional Notes</label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        placeholder="Any additional notes for today's trading session..."
                                        rows={3}
                                        className="w-full px-4 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#2A2A2A] focus:outline-none focus:border-primary"
                                    />
                                </div>

                                {/* Submit Button */}
                                <div className="flex gap-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 py-3 bg-primary text-white font-bold rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
                                    >
                                        {loading ? "Creating..." : "Create Daily Plan"}
                                    </button>
                                    <Link
                                        href="/trading"
                                        className="flex-1 py-3 border-2 border-slate-200 dark:border-[#333] text-center font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-[#2A2A2A] transition-all"
                                    >
                                        Cancel
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

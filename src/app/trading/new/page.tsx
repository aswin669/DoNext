"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function NewTradePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [entryImagePreview, setEntryImagePreview] = useState<string | null>(null);
    const [exitImagePreview, setExitImagePreview] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        symbol: "",
        tradeType: "Long",
        entryPrice: "",
        stopLoss: "",
        target: "",
        quantity: "",
        riskAmount: "",
        rewardAmount: "",
        priority: "Medium",
        strategy: "",
        notes: "",
        entryImage: null as File | null,
        exitImage: null as File | null
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.currentTarget;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, imageType: 'entryImage' | 'exitImage') => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                [imageType]: file
            }));
            
            const reader = new FileReader();
            reader.onloadend = () => {
                if (imageType === 'entryImage') {
                    setEntryImagePreview(reader.result as string);
                } else {
                    setExitImagePreview(reader.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const calculateRiskReward = () => {
        if (formData.riskAmount && formData.rewardAmount) {
            const ratio = parseFloat(formData.rewardAmount) / parseFloat(formData.riskAmount);
            return ratio.toFixed(2);
        }
        return "0.00";
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const submitData = new FormData();
            submitData.append("symbol", formData.symbol);
            submitData.append("tradeType", formData.tradeType);
            submitData.append("entryPrice", formData.entryPrice);
            submitData.append("stopLoss", formData.stopLoss);
            submitData.append("target", formData.target);
            submitData.append("quantity", formData.quantity);
            submitData.append("riskAmount", formData.riskAmount);
            submitData.append("rewardAmount", formData.rewardAmount);
            submitData.append("priority", formData.priority);
            submitData.append("strategy", formData.strategy);
            submitData.append("notes", formData.notes);
            
            if (formData.entryImage) {
                submitData.append("entryImage", formData.entryImage);
            }
            if (formData.exitImage) {
                submitData.append("exitImage", formData.exitImage);
            }

            const response = await fetch("/api/trading/trades", {
                method: "POST",
                body: submitData
            });

            if (response.ok) {
                router.push("/trading");
            } else {
                alert("Failed to create trade");
            }
        } catch (error) {
            console.error("Error creating trade:", error);
            alert("Error creating trade");
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
                            <h1 className="text-2xl font-black mb-6">Create New Trade</h1>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Symbol and Type */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-2">Symbol *</label>
                                        <input
                                            type="text"
                                            name="symbol"
                                            value={formData.symbol}
                                            onChange={handleChange}
                                            placeholder="e.g., EURUSD"
                                            className="w-full px-4 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#2A2A2A] focus:outline-none focus:border-primary"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2">Trade Type *</label>
                                        <select
                                            name="tradeType"
                                            value={formData.tradeType}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#2A2A2A] focus:outline-none focus:border-primary"
                                        >
                                            <option value="Long">Long</option>
                                            <option value="Short">Short</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Price Levels */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-2">Entry Price *</label>
                                        <input
                                            type="number"
                                            name="entryPrice"
                                            value={formData.entryPrice}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            step="0.0001"
                                            className="w-full px-4 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#2A2A2A] focus:outline-none focus:border-primary"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2">Stop Loss *</label>
                                        <input
                                            type="number"
                                            name="stopLoss"
                                            value={formData.stopLoss}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            step="0.0001"
                                            className="w-full px-4 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#2A2A2A] focus:outline-none focus:border-primary"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2">Target *</label>
                                        <input
                                            type="number"
                                            name="target"
                                            value={formData.target}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            step="0.0001"
                                            className="w-full px-4 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#2A2A2A] focus:outline-none focus:border-primary"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Risk Management */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-2">Quantity *</label>
                                        <input
                                            type="number"
                                            name="quantity"
                                            value={formData.quantity}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            step="0.01"
                                            className="w-full px-4 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#2A2A2A] focus:outline-none focus:border-primary"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2">Risk Amount *</label>
                                        <input
                                            type="number"
                                            name="riskAmount"
                                            value={formData.riskAmount}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            step="0.01"
                                            className="w-full px-4 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#2A2A2A] focus:outline-none focus:border-primary"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2">Reward Amount *</label>
                                        <input
                                            type="number"
                                            name="rewardAmount"
                                            value={formData.rewardAmount}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            step="0.01"
                                            className="w-full px-4 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#2A2A2A] focus:outline-none focus:border-primary"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Risk/Reward Ratio Display */}
                                <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                                    <p className="text-sm font-bold text-primary">
                                        Risk/Reward Ratio: {calculateRiskReward()}
                                    </p>
                                </div>

                                {/* Priority and Strategy */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-2">Priority</label>
                                        <select
                                            name="priority"
                                            value={formData.priority}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#2A2A2A] focus:outline-none focus:border-primary"
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2">Strategy</label>
                                        <input
                                            type="text"
                                            name="strategy"
                                            value={formData.strategy}
                                            onChange={handleChange}
                                            placeholder="e.g., Breakout, Support/Resistance"
                                            className="w-full px-4 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#2A2A2A] focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-bold mb-2">Notes</label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        placeholder="Add any additional notes about this trade..."
                                        rows={4}
                                        className="w-full px-4 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#2A2A2A] focus:outline-none focus:border-primary"
                                    />
                                </div>

                                {/* Image Uploads */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-2">Entry Screenshot</label>
                                        <div className="border-2 border-dashed border-slate-200 dark:border-[#333] rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageChange(e, 'entryImage')}
                                                className="hidden"
                                                id="entryImageInput"
                                            />
                                            <label htmlFor="entryImageInput" className="cursor-pointer block">
                                                {entryImagePreview ? (
                                                    <div className="space-y-2">
                                                        <img src={entryImagePreview} alt="Entry" className="w-full h-32 object-cover rounded" />
                                                        <p className="text-xs text-slate-500">Click to change</p>
                                                    </div>
                                                ) : (
                                                    <div className="py-4">
                                                        <p className="text-sm font-bold">📸 Upload Entry Image</p>
                                                        <p className="text-xs text-slate-500 mt-1">Screenshot of entry setup</p>
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2">Exit Screenshot</label>
                                        <div className="border-2 border-dashed border-slate-200 dark:border-[#333] rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageChange(e, 'exitImage')}
                                                className="hidden"
                                                id="exitImageInput"
                                            />
                                            <label htmlFor="exitImageInput" className="cursor-pointer block">
                                                {exitImagePreview ? (
                                                    <div className="space-y-2">
                                                        <img src={exitImagePreview} alt="Exit" className="w-full h-32 object-cover rounded" />
                                                        <p className="text-xs text-slate-500">Click to change</p>
                                                    </div>
                                                ) : (
                                                    <div className="py-4">
                                                        <p className="text-sm font-bold">📸 Upload Exit Image</p>
                                                        <p className="text-xs text-slate-500 mt-1">Screenshot of exit/P&L</p>
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="flex gap-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 py-3 bg-primary text-white font-bold rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
                                    >
                                        {loading ? "Creating..." : "Create Trade"}
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

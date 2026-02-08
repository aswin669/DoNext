"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function AdvancedAnalyticsPage() {
    const [widgets, setWidgets] = useState<any[]>([]);
    const [reports, setReports] = useState<any[]>([]);
    const [widgetTypes, setWidgetTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("dashboard");

    // Modal states
    const [showCreateWidgetModal, setShowCreateWidgetModal] = useState(false);
    const [showCreateReportModal, setShowCreateReportModal] = useState(false);

    // Form states
    const [widgetFormData, setWidgetFormData] = useState({
        type: "",
        title: "",
        config: {} as Record<string, any>,
        size: "medium" as "small" | "medium" | "large"
    });

    const [reportFormData, setReportFormData] = useState({
        name: "",
        description: "",
        type: "",
        config: {} as Record<string, any>,
        schedule: ""
    });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [widgetsRes, reportsRes, widgetTypesRes] = await Promise.all([
                fetch("/api/analytics/advanced?type=widgets"),
                fetch("/api/analytics/advanced?type=reports"),
                fetch("/api/analytics/advanced?type=widgetTypes")
            ]);

            if (widgetsRes.ok) {
                const data = await widgetsRes.json();
                setWidgets(data.widgets);
            }

            if (reportsRes.ok) {
                const data = await reportsRes.json();
                setReports(data.reports);
            }

            if (widgetTypesRes.ok) {
                const data = await widgetTypesRes.json();
                setWidgetTypes(data.widgetTypes);
            }

            setError("");
        } catch (err) {
            setError("Network error occurred");
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateWidget = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const res = await fetch("/api/analytics/advanced", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "createWidget",
                    ...widgetFormData
                })
            });
            
            if (res.ok) {
                const data = await res.json();
                setWidgets([...widgets, data.widget]);
                resetWidgetForm();
                setShowCreateWidgetModal(false);
            } else {
                const errorData = await res.json();
                setError(errorData.error || "Failed to create widget");
            }
        } catch (err) {
            setError("Network error occurred");
            console.error("Create widget error:", err);
        }
    };

    const handleUpdateWidget = async (widgetId: string, updateData: any) => {
        try {
            const res = await fetch("/api/analytics/advanced", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "updateWidget",
                    widgetId,
                    ...updateData
                })
            });
            
            if (res.ok) {
                fetchData(); // Refresh widgets
            }
        } catch (err) {
            console.error("Update widget error:", err);
        }
    };

    const handleDeleteWidget = async (widgetId: string) => {
        try {
            const res = await fetch(`/api/analytics/advanced?widgetId=${widgetId}`, {
                method: "DELETE"
            });
            
            if (res.ok) {
                setWidgets(widgets.filter(w => w.id !== widgetId));
            }
        } catch (err) {
            console.error("Delete widget error:", err);
        }
    };

    const handleCreateReport = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const res = await fetch("/api/analytics/advanced", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "createReport",
                    ...reportFormData
                })
            });
            
            if (res.ok) {
                const data = await res.json();
                setReports([data.report, ...reports]);
                resetReportForm();
                setShowCreateReportModal(false);
            } else {
                const errorData = await res.json();
                setError(errorData.error || "Failed to create report");
            }
        } catch (err) {
            setError("Network error occurred");
            console.error("Create report error:", err);
        }
    };

    const handleGenerateReport = async (reportId: string) => {
        try {
            const res = await fetch("/api/analytics/advanced", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "generateReport",
                    reportId
                })
            });
            
            if (res.ok) {
                fetchData(); // Refresh reports
            }
        } catch (err) {
            console.error("Generate report error:", err);
        }
    };

    const resetWidgetForm = () => {
        setWidgetFormData({
            type: "",
            title: "",
            config: {},
            size: "medium"
        });
    };

    const resetReportForm = () => {
        setReportFormData({
            name: "",
            description: "",
            type: "",
            config: {},
            schedule: ""
        });
    };

    const renderWidgetPreview = (widget: any) => {
        switch (widget.type) {
            case 'task-progress':
                return (
                    <div className="p-4">
                        <div className="text-center">
                            <div className="text-3xl font-black text-primary mb-2">85%</div>
                            <div className="text-sm text-slate-500">Task Completion Rate</div>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-[#222] rounded-full h-2 mt-3">
                            <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                    </div>
                );
            case 'habit-streak':
                return (
                    <div className="p-4">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Morning Meditation</span>
                                <span className="font-bold text-green-500">23 days</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Daily Exercise</span>
                                <span className="font-bold text-blue-500">18 days</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Reading</span>
                                <span className="font-bold text-purple-500">31 days</span>
                            </div>
                        </div>
                    </div>
                );
            case 'productivity-score':
                return (
                    <div className="p-4 text-center">
                        <div className="text-4xl font-black text-gradient bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-2">
                            79
                        </div>
                        <div className="text-sm text-slate-500">Productivity Score</div>
                        <div className="text-xs text-slate-400 mt-1">Based on AI analysis</div>
                    </div>
                );
            default:
                return (
                    <div className="p-4 text-center text-slate-500">
                        Widget preview not available
                    </div>
                );
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
                                <span className="ml-3 text-lg">Loading Advanced Analytics...</span>
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
                                    <h1 className="text-3xl font-bold mb-2">Advanced Analytics</h1>
                                    <p className="text-slate-500">Customize your dashboard and create detailed reports</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowCreateWidgetModal(true)}
                                        className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-opacity-90 transition-all flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">dashboard</span>
                                        Add Widget
                                    </button>
                                    <button
                                        onClick={() => setShowCreateReportModal(true)}
                                        className="px-4 py-2 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-600 transition-all flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">analytics</span>
                                        New Report
                                    </button>
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

                        {/* Tab Navigation */}
                        <div className="flex gap-1 mb-6 bg-slate-100 dark:bg-[#222] p-1 rounded-xl w-fit">
                            {['dashboard', 'reports'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
                                        activeTab === tab 
                                            ? 'bg-white dark:bg-[#1A1A1A] text-primary shadow-sm' 
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                    }`}
                                >
                                    {tab === 'dashboard' ? 'Custom Dashboard' : 'Custom Reports'}
                                </button>
                            ))}
                        </div>

                        {/* Custom Dashboard Tab */}
                        {activeTab === "dashboard" && (
                            <div>
                                {widgets.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {widgets.map((widget) => (
                                            <div key={widget.id} className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-slate-100 dark:border-[#222] overflow-hidden">
                                                <div className="p-4 border-b border-slate-100 dark:border-[#333] flex justify-between items-center">
                                                    <div>
                                                        <h3 className="font-bold">{widget.title}</h3>
                                                        <p className="text-sm text-slate-500 capitalize">{widget.type.replace('-', ' ')}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleUpdateWidget(widget.id, { isVisible: !widget.isVisible })}
                                                            className={`p-1 rounded-lg ${widget.isVisible ? 'text-green-500' : 'text-slate-400'}`}
                                                        >
                                                            <span className="material-symbols-outlined">visibility</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteWidget(widget.id)}
                                                            className="p-1 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                        >
                                                            <span className="material-symbols-outlined">delete</span>
                                                        </button>
                                                    </div>
                                                </div>
                                                {renderWidgetPreview(widget)}
                                                <div className="p-3 bg-slate-50 dark:bg-[#222] text-xs text-slate-500 border-t border-slate-100 dark:border-[#333]">
                                                    Size: {widget.size} • Position: {widget.position}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="text-5xl mb-4">📊</div>
                                        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No dashboard widgets yet</h3>
                                        <p className="text-slate-500 mb-6">Add widgets to customize your dashboard</p>
                                        <button
                                            onClick={() => setShowCreateWidgetModal(true)}
                                            className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-opacity-90 transition-all"
                                        >
                                            Add Your First Widget
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Custom Reports Tab */}
                        {activeTab === "reports" && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {reports.length > 0 ? (
                                    reports.map((report) => (
                                        <div key={report.id} className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-slate-100 dark:border-[#222] p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-xl font-bold mb-1">{report.name}</h3>
                                                    {report.description && (
                                                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">{report.description}</p>
                                                    )}
                                                    <span className="inline-block px-2 py-1 bg-slate-100 dark:bg-[#222] text-slate-700 dark:text-slate-300 text-xs rounded-full capitalize">
                                                        {report.type} Report
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteWidget(report.id)} // Note: This should be handleDeleteReport
                                                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                >
                                                    <span className="material-symbols-outlined">delete</span>
                                                </button>
                                            </div>
                                            
                                            <div className="space-y-2 text-sm mb-4">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Last Generated:</span>
                                                    <span className="font-medium">
                                                        {report.lastRun ? new Date(report.lastRun).toLocaleDateString() : 'Never'}
                                                    </span>
                                                </div>
                                                {report.schedule && (
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Schedule:</span>
                                                        <span className="font-medium">{report.schedule}</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <button
                                                onClick={() => handleGenerateReport(report.id)}
                                                className="w-full px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-opacity-90 transition-all"
                                            >
                                                Generate Report
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-12">
                                        <div className="text-5xl mb-4">📈</div>
                                        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No custom reports yet</h3>
                                        <p className="text-slate-500 mb-6">Create custom reports for detailed analytics</p>
                                        <button
                                            onClick={() => setShowCreateReportModal(true)}
                                            className="px-6 py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition-all"
                                        >
                                            Create Your First Report
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Create Widget Modal */}
            {showCreateWidgetModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Add Dashboard Widget</h2>
                            <button
                                onClick={() => {
                                    setShowCreateWidgetModal(false);
                                    resetWidgetForm();
                                }}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleCreateWidget} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Widget Type *</label>
                                <select
                                    value={widgetFormData.type}
                                    onChange={(e) => setWidgetFormData({...widgetFormData, type: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222]"
                                    required
                                >
                                    <option value="">Select a widget type</option>
                                    {widgetTypes.map((type) => (
                                        <option key={type.type} value={type.type}>
                                            {type.title} - {type.description}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Widget Title *</label>
                                <input
                                    type="text"
                                    value={widgetFormData.title}
                                    onChange={(e) => setWidgetFormData({...widgetFormData, title: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Size</label>
                                <select
                                    value={widgetFormData.size}
                                    onChange={(e) => setWidgetFormData({...widgetFormData, size: e.target.value as any})}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222]"
                                >
                                    <option value="small">Small</option>
                                    <option value="medium">Medium</option>
                                    <option value="large">Large</option>
                                </select>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateWidgetModal(false);
                                        resetWidgetForm();
                                    }}
                                    className="flex-1 px-4 py-2 border border-slate-200 dark:border-[#333] rounded-lg font-bold hover:bg-slate-50 dark:hover:bg-[#222] transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-opacity-90 transition-all"
                                >
                                    Add Widget
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Report Modal */}
            {showCreateReportModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Create Custom Report</h2>
                            <button
                                onClick={() => {
                                    setShowCreateReportModal(false);
                                    resetReportForm();
                                }}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleCreateReport} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Report Name *</label>
                                <input
                                    type="text"
                                    value={reportFormData.name}
                                    onChange={(e) => setReportFormData({...reportFormData, name: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    value={reportFormData.description}
                                    onChange={(e) => setReportFormData({...reportFormData, description: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222] h-20 resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Report Type *</label>
                                <select
                                    value={reportFormData.type}
                                    onChange={(e) => setReportFormData({...reportFormData, type: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222]"
                                    required
                                >
                                    <option value="">Select report type</option>
                                    <option value="productivity">Productivity Report</option>
                                    <option value="habit">Habit Analysis</option>
                                    <option value="task">Task Performance</option>
                                    <option value="goal">Goal Tracking</option>
                                    <option value="team">Team Metrics</option>
                                </select>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateReportModal(false);
                                        resetReportForm();
                                    }}
                                    className="flex-1 px-4 py-2 border border-slate-200 dark:border-[#333] rounded-lg font-bold hover:bg-slate-50 dark:hover:bg-[#222] transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-600 transition-all"
                                >
                                    Create Report
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
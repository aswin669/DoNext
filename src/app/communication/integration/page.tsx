"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function CommunicationIntegrationPage() {
    const [connections, setConnections] = useState<any[]>([]);
    const [platforms, setPlatforms] = useState<any[]>([]);
    const [defaultPreferences, setDefaultPreferences] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("connections");

    // Modal states
    const [showConnectModal, setShowConnectModal] = useState(false);
    const [showTestModal, setShowTestModal] = useState(false);

    // Form states
    const [connectFormData, setConnectFormData] = useState({
        platform: "",
        accessToken: "",
        webhookUrl: "",
        channelId: "",
        email: "",
        preferences: {
            taskReminders: true,
            habitReminders: true,
            goalMilestones: true,
            teamUpdates: true,
            accountabilityUpdates: true,
            dailySummary: true,
            weeklyReport: true,
            priorityThreshold: 2
        }
    });

    const [testNotificationData, setTestNotificationData] = useState({
        type: "task_reminder",
        title: "Test Notification",
        message: "This is a test notification from your productivity app",
        priority: "medium"
    });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [connectionsRes, platformsRes, preferencesRes] = await Promise.all([
                fetch("/api/communication?type=connections"),
                fetch("/api/communication?type=platforms"),
                fetch("/api/communication?type=preferences")
            ]);

            if (connectionsRes.ok) {
                const data = await connectionsRes.json();
                setConnections(data.connections);
            }

            if (platformsRes.ok) {
                const data = await platformsRes.json();
                setPlatforms(data.platforms);
            }

            if (preferencesRes.ok) {
                const data = await preferencesRes.json();
                setDefaultPreferences(data.preferences);
            }

            setError("");
        } catch (err) {
            setError("Network error occurred");
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleConnectPlatform = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const config: any = {
                platform: connectFormData.platform,
                preferences: connectFormData.preferences
            };
            
            // Add platform-specific fields
            if (connectFormData.platform === 'slack') {
                if (connectFormData.webhookUrl) {
                    config.webhookUrl = connectFormData.webhookUrl;
                    if (connectFormData.channelId) {
                        config.channelId = connectFormData.channelId;
                    }
                } else if (connectFormData.accessToken) {
                    config.accessToken = connectFormData.accessToken;
                }
            } else if (connectFormData.platform === 'email') {
                config.email = connectFormData.email;
            }
            
            const res = await fetch("/api/communication", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "connect",
                    ...config
                })
            });
            
            if (res.ok) {
                const data = await res.json();
                setConnections([data.connection, ...connections]);
                resetConnectForm();
                setShowConnectModal(false);
                fetchData();
            } else {
                const errorData = await res.json();
                setError(errorData.error || "Failed to connect platform");
            }
        } catch (err) {
            setError("Network error occurred");
            console.error("Connect platform error:", err);
        }
    };

    const handleSendTestNotification = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const res = await fetch("/api/communication", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "sendNotification",
                    ...testNotificationData
                })
            });
            
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    alert(`Test notification sent successfully to: ${data.sentTo.join(', ')}`);
                    setShowTestModal(false);
                    resetTestForm();
                } else {
                    setError(data.message || "Failed to send test notification");
                }
            } else {
                const errorData = await res.json();
                setError(errorData.error || "Failed to send test notification");
            }
        } catch (err) {
            setError("Network error occurred");
            console.error("Send test notification error:", err);
        }
    };

    const handleToggleConnection = async (connectionId: string, enabled: boolean) => {
        try {
            const res = await fetch("/api/communication", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ connectionId, enabled })
            });
            
            if (res.ok) {
                fetchData();
            }
        } catch (err) {
            console.error("Toggle connection error:", err);
        }
    };

    const handleDisconnectPlatform = async (connectionId: string) => {
        try {
            const res = await fetch(`/api/communication?connectionId=${connectionId}`, {
                method: "DELETE"
            });
            
            if (res.ok) {
                setConnections(connections.filter(c => c.id !== connectionId));
            }
        } catch (err) {
            console.error("Disconnect platform error:", err);
        }
    };

    const resetConnectForm = () => {
        setConnectFormData({
            platform: "",
            accessToken: "",
            webhookUrl: "",
            channelId: "",
            email: "",
            preferences: {
                taskReminders: true,
                habitReminders: true,
                goalMilestones: true,
                teamUpdates: true,
                accountabilityUpdates: true,
                dailySummary: true,
                weeklyReport: true,
                priorityThreshold: 2
            }
        });
    };

    const resetTestForm = () => {
        setTestNotificationData({
            type: "task_reminder",
            title: "Test Notification",
            message: "This is a test notification from your productivity app",
            priority: "medium"
        });
    };

    const getPlatformColor = (platform: string) => {
        switch (platform) {
            case 'slack': return 'text-purple-500';
            case 'email': return 'text-blue-500';
            case 'push': return 'text-orange-500';
            default: return 'text-slate-500';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'low': return 'bg-green-100 text-green-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'urgent': return 'bg-red-100 text-red-800';
            default: return 'bg-slate-100 text-slate-800';
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
                                <span className="ml-3 text-lg">Loading Communication Integration...</span>
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
                                    <h1 className="text-3xl font-bold mb-2">Communication Integration</h1>
                                    <p className="text-slate-500">Connect with Slack, Email, and Push notifications</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowTestModal(true)}
                                        className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-all flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">send</span>
                                        Test Notification
                                    </button>
                                    <button
                                        onClick={() => setShowConnectModal(true)}
                                        className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-opacity-90 transition-all flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">add</span>
                                        Connect Platform
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
                            {['connections', 'preferences'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
                                        activeTab === tab 
                                            ? 'bg-white dark:bg-[#1A1A1A] text-primary shadow-sm' 
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                    }`}
                                >
                                    {tab === 'connections' ? 'Platform Connections' : 'Notification Preferences'}
                                </button>
                            ))}
                        </div>

                        {/* Platform Connections Tab */}
                        {activeTab === "connections" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {connections.length > 0 ? (
                                    connections.map((connection) => (
                                        <div key={connection.id} className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-slate-100 dark:border-[#222] p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`size-12 rounded-2xl flex items-center justify-center ${
                                                        connection.platform === 'slack' ? 'bg-purple-50 text-purple-500' :
                                                        connection.platform === 'email' ? 'bg-blue-50 text-blue-500' :
                                                        'bg-orange-50 text-orange-500'
                                                    }`}>
                                                        <span className="material-symbols-outlined text-3xl">
                                                            {connection.platform === 'slack' ? 'slack' :
                                                             connection.platform === 'email' ? 'email' : 'notifications'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg capitalize">{connection.platform} Integration</h3>
                                                        <p className="text-slate-500 text-sm">
                                                            {connection.platform === 'slack' ? 'Slack notifications' :
                                                             connection.platform === 'email' ? connection.email :
                                                             'Browser push notifications'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-3 h-3 rounded-full ${connection.enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                    <button
                                                        onClick={() => handleToggleConnection(connection.id, !connection.enabled)}
                                                        className={`p-1 rounded-lg ${
                                                            connection.enabled ? 'text-green-500' : 'text-red-500'
                                                        } hover:bg-slate-100 dark:hover:bg-[#222]`}
                                                    >
                                                        <span className="material-symbols-outlined">
                                                            {connection.enabled ? 'notifications_active' : 'notifications_off'}
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-3 mb-4">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500">Status:</span>
                                                    <span className={`font-medium ${connection.enabled ? 'text-green-500' : 'text-red-500'}`}>
                                                        {connection.enabled ? 'Active' : 'Disabled'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500">Connected:</span>
                                                    <span className="font-medium">
                                                        {new Date(connection.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {connection.preferences && (
                                                    <div className="text-sm">
                                                        <span className="text-slate-500">Preferences:</span>
                                                        <div className="mt-1 text-xs bg-slate-50 dark:bg-[#222] rounded p-2">
                                                            {Object.entries(connection.preferences).slice(0, 3).map(([key, value]) => (
                                                                <div key={key} className="flex justify-between mb-1 last:mb-0">
                                                                    <span className="text-slate-600 dark:text-slate-400">{key}:</span>
                                                                    <span className="font-medium">{String(value)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <button
                                                onClick={() => handleDisconnectPlatform(connection.id)}
                                                className="w-full px-3 py-2 border border-red-200 text-red-500 rounded-lg text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                            >
                                                <span className="material-symbols-outlined text-[16px] mr-1">delete</span>
                                                Disconnect
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-12">
                                        <div className="text-5xl mb-4">📢</div>
                                        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No communication platforms connected</h3>
                                        <p className="text-slate-500 mb-6">Connect your preferred communication platforms to get started</p>
                                        <button
                                            onClick={() => setShowConnectModal(true)}
                                            className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-opacity-90 transition-all"
                                        >
                                            Connect Your First Platform
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Notification Preferences Tab */}
                        {activeTab === "preferences" && (
                            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-slate-100 dark:border-[#222] p-6">
                                <h2 className="text-2xl font-bold mb-6">Notification Preferences</h2>
                                
                                {defaultPreferences && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-bold">Notification Types</h3>
                                            {[
                                                { key: 'taskReminders', label: 'Task Reminders' },
                                                { key: 'habitReminders', label: 'Habit Reminders' },
                                                { key: 'goalMilestones', label: 'Goal Milestones' },
                                                { key: 'teamUpdates', label: 'Team Updates' },
                                                { key: 'accountabilityUpdates', label: 'Accountability Updates' },
                                                { key: 'dailySummary', label: 'Daily Summary' },
                                                { key: 'weeklyReport', label: 'Weekly Report' }
                                            ].map(({ key, label }) => (
                                                <div key={key} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#222] rounded-lg">
                                                    <span className="font-medium">{label}</span>
                                                    <div className={`w-3 h-3 rounded-full ${defaultPreferences[key] ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-bold">Settings</h3>
                                            <div className="p-4 bg-slate-50 dark:bg-[#222] rounded-lg">
                                                <div className="flex justify-between mb-2">
                                                    <span className="font-medium">Priority Threshold</span>
                                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                                        {defaultPreferences.priorityThreshold}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    Minimum priority level for sending notifications
                                                </p>
                                            </div>
                                            
                                            <div className="p-4 bg-slate-50 dark:bg-[#222] rounded-lg">
                                                <div className="flex justify-between mb-2">
                                                    <span className="font-medium">Timezone</span>
                                                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                                                        {defaultPreferences.timezone}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    Your local timezone for scheduling notifications
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Connect Platform Modal */}
            {showConnectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Connect Communication Platform</h2>
                            <button
                                onClick={() => {
                                    setShowConnectModal(false);
                                    resetConnectForm();
                                }}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleConnectPlatform} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Platform *</label>
                                <select
                                    value={connectFormData.platform}
                                    onChange={(e) => setConnectFormData({...connectFormData, platform: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222]"
                                    required
                                >
                                    <option value="">Select a platform</option>
                                    {platforms.map((platform) => (
                                        <option key={platform.id} value={platform.id}>
                                            {platform.name} - {platform.description}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {connectFormData.platform === 'slack' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Webhook URL</label>
                                        <input
                                            type="url"
                                            value={connectFormData.webhookUrl}
                                            onChange={(e) => setConnectFormData({...connectFormData, webhookUrl: e.target.value})}
                                            className="w-full px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222]"
                                            placeholder="https://hooks.slack.com/services/..."
                                        />
                                        <p className="text-xs text-slate-500 mt-1">For incoming webhooks (easier setup)</p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Channel ID (Optional)</label>
                                        <input
                                            type="text"
                                            value={connectFormData.channelId}
                                            onChange={(e) => setConnectFormData({...connectFormData, channelId: e.target.value})}
                                            className="w-full px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222]"
                                            placeholder="C1234567890"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Target specific Slack channel</p>
                                    </div>
                                </>
                            )}

                            {connectFormData.platform === 'email' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email Address *</label>
                                    <input
                                        type="email"
                                        value={connectFormData.email}
                                        onChange={(e) => setConnectFormData({...connectFormData, email: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222]"
                                        placeholder="your.email@example.com"
                                        required
                                    />
                                </div>
                            )}

                            <div className="pt-4 border-t border-slate-200 dark:border-[#333]">
                                <h3 className="font-bold mb-3">Notification Preferences</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {[
                                        { key: 'taskReminders', label: 'Task Reminders' },
                                        { key: 'habitReminders', label: 'Habit Reminders' },
                                        { key: 'goalMilestones', label: 'Goal Milestones' },
                                        { key: 'teamUpdates', label: 'Team Updates' },
                                        { key: 'accountabilityUpdates', label: 'Accountability Updates' },
                                        { key: 'dailySummary', label: 'Daily Summary' },
                                        { key: 'weeklyReport', label: 'Weekly Report' }
                                    ].map(({ key, label }) => (
                                        <div key={key} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={key}
                                                checked={connectFormData.preferences[key as keyof typeof connectFormData.preferences]}
                                                onChange={(e) => setConnectFormData({
                                                    ...connectFormData,
                                                    preferences: {
                                                        ...connectFormData.preferences,
                                                        [key]: e.target.checked
                                                    }
                                                })}
                                                className="mr-2"
                                            />
                                            <label htmlFor={key} className="text-sm">{label}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowConnectModal(false);
                                        resetConnectForm();
                                    }}
                                    className="flex-1 px-4 py-2 border border-slate-200 dark:border-[#333] rounded-lg font-bold hover:bg-slate-50 dark:hover:bg-[#222] transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-opacity-90 transition-all"
                                >
                                    Connect Platform
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Test Notification Modal */}
            {showTestModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Send Test Notification</h2>
                            <button
                                onClick={() => {
                                    setShowTestModal(false);
                                    resetTestForm();
                                }}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSendTestNotification} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Notification Type</label>
                                <select
                                    value={testNotificationData.type}
                                    onChange={(e) => setTestNotificationData({...testNotificationData, type: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222]"
                                >
                                    <option value="task_reminder">Task Reminder</option>
                                    <option value="habit_reminder">Habit Reminder</option>
                                    <option value="goal_milestone">Goal Milestone</option>
                                    <option value="team_update">Team Update</option>
                                    <option value="accountability_update">Accountability Update</option>
                                    <option value="daily_summary">Daily Summary</option>
                                    <option value="weekly_report">Weekly Report</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input
                                    type="text"
                                    value={testNotificationData.title}
                                    onChange={(e) => setTestNotificationData({...testNotificationData, title: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Message</label>
                                <textarea
                                    value={testNotificationData.message}
                                    onChange={(e) => setTestNotificationData({...testNotificationData, message: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222] h-24 resize-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Priority</label>
                                <select
                                    value={testNotificationData.priority}
                                    onChange={(e) => setTestNotificationData({...testNotificationData, priority: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222]"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowTestModal(false);
                                        resetTestForm();
                                    }}
                                    className="flex-1 px-4 py-2 border border-slate-200 dark:border-[#333] rounded-lg font-bold hover:bg-slate-50 dark:hover:bg-[#222] transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-all"
                                >
                                    Send Test
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function CalendarIntegrationPage() {
    const [connections, setConnections] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [providers, setProviders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("connections");

    // Modal states
    const [showConnectModal, setShowConnectModal] = useState(false);
    const [showCreateEventModal, setShowCreateEventModal] = useState(false);

    // Form states
    const [connectFormData, setConnectFormData] = useState({
        provider: "",
        authCode: ""
    });

    const [eventFormData, setEventFormData] = useState({
        title: "",
        description: "",
        start: "",
        end: "",
        location: "",
        attendees: "",
        eventType: "Event",
        isAllDay: false
    });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [connectionsRes, eventsRes, providersRes] = await Promise.all([
                fetch("/api/calendar?type=connections"),
                fetch("/api/calendar?type=events"),
                fetch("/api/calendar?type=providers")
            ]);

            if (connectionsRes.ok) {
                const data = await connectionsRes.json();
                setConnections(data.connections);
            }

            if (eventsRes.ok) {
                const data = await eventsRes.json();
                setEvents(data.events);
            }

            if (providersRes.ok) {
                const data = await providersRes.json();
                setProviders(data.providers);
            }

            setError("");
        } catch (err) {
            setError("Network error occurred");
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleConnectCalendar = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const res = await fetch("/api/calendar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "connect",
                    provider: connectFormData.provider,
                    authCode: connectFormData.authCode
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
                setError(errorData.error || "Failed to connect calendar");
            }
        } catch (err) {
            setError("Network error occurred");
            console.error("Connect calendar error:", err);
        }
    };

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const attendeesArray = eventFormData.attendees
                .split(',')
                .map(email => email.trim())
                .filter(email => email.length > 0);
                
            const res = await fetch("/api/calendar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "createEvent",
                    ...eventFormData,
                    attendees: attendeesArray.length > 0 ? attendeesArray : undefined
                })
            });
            
            if (res.ok) {
                const data = await res.json();
                setEvents([data.event, ...events]);
                resetEventForm();
                setShowCreateEventModal(false);
            } else {
                const errorData = await res.json();
                setError(errorData.error || "Failed to create event");
            }
        } catch (err) {
            setError("Network error occurred");
            console.error("Create event error:", err);
        }
    };

    const handleSyncCalendar = async (connectionId: string) => {
        try {
            const res = await fetch(`/api/calendar?type=sync&connectionId=${connectionId}`);
            if (res.ok) {
                fetchData();
            }
        } catch (err) {
            console.error("Sync calendar error:", err);
        }
    };

    const handleToggleSync = async (connectionId: string, enabled: boolean) => {
        try {
            const res = await fetch("/api/calendar", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ connectionId, enabled })
            });
            
            if (res.ok) {
                fetchData();
            }
        } catch (err) {
            console.error("Toggle sync error:", err);
        }
    };

    const handleDisconnectCalendar = async (connectionId: string) => {
        try {
            const res = await fetch(`/api/calendar?connectionId=${connectionId}`, {
                method: "DELETE"
            });
            
            if (res.ok) {
                setConnections(connections.filter(c => c.id !== connectionId));
            }
        } catch (err) {
            console.error("Disconnect calendar error:", err);
        }
    };

    const resetConnectForm = () => {
        setConnectFormData({ provider: "", authCode: "" });
    };

    const resetEventForm = () => {
        setEventFormData({
            title: "",
            description: "",
            start: "",
            end: "",
            location: "",
            attendees: "",
            eventType: "Event",
            isAllDay: false
        });
    };

    const getProviderColor = (provider: string) => {
        switch (provider) {
            case 'google': return 'text-red-500';
            case 'outlook': return 'text-blue-500';
            case 'apple': return 'text-gray-500';
            default: return 'text-slate-500';
        }
    };

    const getEventTypeColor = (eventType: string) => {
        switch (eventType) {
            case 'Task': return 'bg-blue-100 text-blue-800';
            case 'Habit': return 'bg-green-100 text-green-800';
            case 'Meeting': return 'bg-purple-100 text-purple-800';
            case 'Event': return 'bg-slate-100 text-slate-800';
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
                                <span className="ml-3 text-lg">Loading Calendar Integration...</span>
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
                                    <h1 className="text-3xl font-bold mb-2">Calendar Integration</h1>
                                    <p className="text-slate-500">Connect and sync with your external calendars</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowConnectModal(true)}
                                        className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-opacity-90 transition-all flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">add</span>
                                        Connect Calendar
                                    </button>
                                    <button
                                        onClick={() => setShowCreateEventModal(true)}
                                        className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-all flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">event</span>
                                        New Event
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
                            {['connections', 'events'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
                                        activeTab === tab 
                                            ? 'bg-white dark:bg-[#1A1A1A] text-primary shadow-sm' 
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                    }`}
                                >
                                    {tab === 'connections' ? 'Calendar Connections' : 'Calendar Events'}
                                </button>
                            ))}
                        </div>

                        {/* Calendar Connections Tab */}
                        {activeTab === "connections" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {connections.length > 0 ? (
                                    connections.map((connection) => (
                                        <div key={connection.id} className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-slate-100 dark:border-[#222] p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`size-12 rounded-2xl flex items-center justify-center ${
                                                        connection.provider === 'google' ? 'bg-red-50 text-red-500' :
                                                        connection.provider === 'outlook' ? 'bg-blue-50 text-blue-500' :
                                                        'bg-gray-50 text-gray-500'
                                                    }`}>
                                                        <span className="material-symbols-outlined text-3xl">
                                                            {connection.provider === 'google' ? 'google' :
                                                             connection.provider === 'outlook' ? 'microsoft' : 'apple'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg capitalize">{connection.provider} Calendar</h3>
                                                        <p className="text-slate-500 text-sm">ID: {connection.calendarId.substring(0, 15)}...</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-3 h-3 rounded-full ${connection.syncEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                    <button
                                                        onClick={() => handleToggleSync(connection.id, !connection.syncEnabled)}
                                                        className={`p-1 rounded-lg ${
                                                            connection.syncEnabled ? 'text-green-500' : 'text-red-500'
                                                        } hover:bg-slate-100 dark:hover:bg-[#222]`}
                                                    >
                                                        <span className="material-symbols-outlined">
                                                            {connection.syncEnabled ? 'sync' : 'sync_disabled'}
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-3 mb-4">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500">Sync Status:</span>
                                                    <span className={`font-medium ${connection.syncEnabled ? 'text-green-500' : 'text-red-500'}`}>
                                                        {connection.syncEnabled ? 'Active' : 'Disabled'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500">Last Sync:</span>
                                                    <span className="font-medium">
                                                        {connection.lastSync ? new Date(connection.lastSync).toLocaleDateString() : 'Never'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500">Connected:</span>
                                                    <span className="font-medium">
                                                        {new Date(connection.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleSyncCalendar(connection.id)}
                                                    className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-1"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">sync</span>
                                                    Sync Now
                                                </button>
                                                <button
                                                    onClick={() => handleDisconnectCalendar(connection.id)}
                                                    className="px-3 py-2 border border-red-200 text-red-500 rounded-lg text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-12">
                                        <div className="text-5xl mb-4">📅</div>
                                        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No calendar connections</h3>
                                        <p className="text-slate-500 mb-6">Connect your external calendars to get started</p>
                                        <button
                                            onClick={() => setShowConnectModal(true)}
                                            className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-opacity-90 transition-all"
                                        >
                                            Connect Your First Calendar
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Calendar Events Tab */}
                        {activeTab === "events" && (
                            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-slate-100 dark:border-[#222] p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold">Upcoming Events</h2>
                                    <button
                                        onClick={() => setShowCreateEventModal(true)}
                                        className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-all flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">add</span>
                                        Add Event
                                    </button>
                                </div>
                                
                                {events.length > 0 ? (
                                    <div className="space-y-4">
                                        {events.map((event) => (
                                            <div key={event.id} className="p-4 border border-slate-100 dark:border-[#333] rounded-xl hover:border-primary/30 transition-all">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h3 className="text-lg font-bold text-[#333] dark:text-gray-200">{event.title}</h3>
                                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getEventTypeColor(event.eventType)}`}>
                                                                {event.eventType}
                                                            </span>
                                                        </div>
                                                        {event.description && (
                                                            <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">{event.description}</p>
                                                        )}
                                                        {event.location && (
                                                            <div className="flex items-center gap-1 text-sm text-slate-500 mb-2">
                                                                <span className="material-symbols-outlined text-[16px]">location_on</span>
                                                                {event.location}
                                                            </div>
                                                        )}
                                                        {event.attendees && event.attendees.length > 0 && (
                                                            <div className="flex items-center gap-1 text-sm text-slate-500">
                                                                <span className="material-symbols-outlined text-[16px]">group</span>
                                                                {event.attendees.length} attendees
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="text-right ml-4">
                                                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                            {new Date(event.start).toLocaleDateString()}
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                                                            {new Date(event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {event.calendar && (
                                                    <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-[#333]">
                                                        <span className={`material-symbols-outlined text-[14px] ${getProviderColor(event.calendar.provider)}`}>
                                                            {event.calendar.provider === 'google' ? 'google' :
                                                             event.calendar.provider === 'outlook' ? 'microsoft' : 'apple'}
                                                        </span>
                                                        <span>Synced from {event.calendar.provider} calendar</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="text-5xl mb-4">🗓️</div>
                                        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No calendar events</h3>
                                        <p className="text-slate-500 mb-6">Create or sync events to see them here</p>
                                        <button
                                            onClick={() => setShowCreateEventModal(true)}
                                            className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-all"
                                        >
                                            Create Your First Event
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Connect Calendar Modal */}
            {showConnectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Connect Calendar</h2>
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

                        <form onSubmit={handleConnectCalendar} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Calendar Provider *</label>
                                <select
                                    value={connectFormData.provider}
                                    onChange={(e) => setConnectFormData({...connectFormData, provider: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222]"
                                    required
                                >
                                    <option value="">Select a provider</option>
                                    {providers.map((provider) => (
                                        <option key={provider.id} value={provider.id}>
                                            {provider.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Authorization Code *</label>
                                <input
                                    type="text"
                                    value={connectFormData.authCode}
                                    onChange={(e) => setConnectFormData({...connectFormData, authCode: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222]"
                                    placeholder="Enter authorization code"
                                    required
                                />
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
                                    Connect Calendar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Event Modal */}
            {showCreateEventModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Create Calendar Event</h2>
                            <button
                                onClick={() => {
                                    setShowCreateEventModal(false);
                                    resetEventForm();
                                }}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleCreateEvent} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Event Title *</label>
                                    <input
                                        type="text"
                                        value={eventFormData.title}
                                        onChange={(e) => setEventFormData({...eventFormData, title: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222]"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">Event Type</label>
                                    <select
                                        value={eventFormData.eventType}
                                        onChange={(e) => setEventFormData({...eventFormData, eventType: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222]"
                                    >
                                        <option value="Event">Event</option>
                                        <option value="Task">Task</option>
                                        <option value="Meeting">Meeting</option>
                                        <option value="Habit">Habit</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    value={eventFormData.description}
                                    onChange={(e) => setEventFormData({...eventFormData, description: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222] h-20 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Start Date/Time *</label>
                                    <input
                                        type="datetime-local"
                                        value={eventFormData.start}
                                        onChange={(e) => setEventFormData({...eventFormData, start: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222]"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">End Date/Time *</label>
                                    <input
                                        type="datetime-local"
                                        value={eventFormData.end}
                                        onChange={(e) => setEventFormData({...eventFormData, end: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222]"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Location</label>
                                    <input
                                        type="text"
                                        value={eventFormData.location}
                                        onChange={(e) => setEventFormData({...eventFormData, location: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222]"
                                        placeholder="Meeting location or venue"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">Attendees</label>
                                    <input
                                        type="text"
                                        value={eventFormData.attendees}
                                        onChange={(e) => setEventFormData({...eventFormData, attendees: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222]"
                                        placeholder="email1@example.com, email2@example.com"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Separate multiple emails with commas</p>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="allDay"
                                    checked={eventFormData.isAllDay}
                                    onChange={(e) => setEventFormData({...eventFormData, isAllDay: e.target.checked})}
                                    className="mr-2"
                                />
                                <label htmlFor="allDay" className="text-sm">All-day event</label>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateEventModal(false);
                                        resetEventForm();
                                    }}
                                    className="flex-1 px-4 py-2 border border-slate-200 dark:border-[#333] rounded-lg font-bold hover:bg-slate-50 dark:hover:bg-[#222] transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-all"
                                >
                                    Create Event
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
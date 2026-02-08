"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function AccountabilityPartnersPage() {
    const [partnerships, setPartnerships] = useState<any[]>([]);
    const [requests, setRequests] = useState<any>({ sent: [], received: [] });
    const [analytics, setAnalytics] = useState<any>(null);
    const [potentialPartners, setPotentialPartners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("partnerships");

    // Modal states
    const [showSendRequestModal, setShowSendRequestModal] = useState(false);
    const [showFindPartnersModal, setShowFindPartnersModal] = useState(false);

    // Form states
    const [requestFormData, setRequestFormData] = useState({
        email: "",
        message: ""
    });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [partnershipsRes, requestsRes, analyticsRes] = await Promise.all([
                fetch("/api/accountability?type=partnerships"),
                fetch("/api/accountability?type=requests"),
                fetch("/api/accountability?type=analytics")
            ]);

            if (partnershipsRes.ok) {
                const data = await partnershipsRes.json();
                setPartnerships(data.partnerships);
            }

            if (requestsRes.ok) {
                const data = await requestsRes.json();
                setRequests(data.requests);
            }

            if (analyticsRes.ok) {
                const data = await analyticsRes.json();
                setAnalytics(data.analytics);
            }

            setError("");
        } catch (err) {
            setError("Network error occurred");
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPotentialPartners = async () => {
        try {
            const res = await fetch("/api/accountability?type=potentialPartners");
            if (res.ok) {
                const data = await res.json();
                setPotentialPartners(data.potentialPartners);
            }
        } catch (err) {
            console.error("Fetch potential partners error:", err);
        }
    };

    const handleSendRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const res = await fetch("/api/accountability", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "sendRequest",
                    recipientEmail: requestFormData.email,
                    message: requestFormData.message
                })
            });
            
            if (res.ok) {
                const data = await res.json();
                // Refresh requests
                fetchData();
                resetRequestForm();
                setShowSendRequestModal(false);
            } else {
                const errorData = await res.json();
                setError(errorData.error || "Failed to send request");
            }
        } catch (err) {
            setError("Network error occurred");
            console.error("Send request error:", err);
        }
    };

    const handleRespondRequest = async (requestId: string, accept: boolean) => {
        try {
            const res = await fetch("/api/accountability", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "respondRequest",
                    requestId,
                    accept
                })
            });
            
            if (res.ok) {
                fetchData(); // Refresh all data
            } else {
                const errorData = await res.json();
                setError(errorData.error || "Failed to respond to request");
            }
        } catch (err) {
            setError("Network error occurred");
            console.error("Respond request error:", err);
        }
    };

    const handleUpdatePartnership = async (partnershipId: string, updateData: any) => {
        try {
            const res = await fetch("/api/accountability", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "updatePartnership",
                    partnershipId,
                    ...updateData
                })
            });
            
            if (res.ok) {
                fetchData(); // Refresh partnerships
            }
        } catch (err) {
            console.error("Update partnership error:", err);
        }
    };

    const handleRecordCheckIn = async (partnershipId: string) => {
        try {
            const res = await fetch("/api/accountability", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "recordCheckIn",
                    partnershipId
                })
            });
            
            if (res.ok) {
                fetchData(); // Refresh partnerships
            }
        } catch (err) {
            console.error("Record check-in error:", err);
        }
    };

    const resetRequestForm = () => {
        setRequestFormData({ email: "", message: "" });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-800';
            case 'Paused': return 'bg-yellow-100 text-yellow-800';
            case 'Ended': return 'bg-gray-100 text-gray-800';
            case 'Pending': return 'bg-blue-100 text-blue-800';
            case 'Accepted': return 'bg-green-100 text-green-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
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
                                <span className="ml-3 text-lg">Loading Accountability Partners...</span>
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
                                    <h1 className="text-3xl font-bold mb-2">Accountability Partners</h1>
                                    <p className="text-slate-500">Build accountability through peer partnerships</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowFindPartnersModal(true)}
                                        className="px-4 py-2 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-600 transition-all flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">search</span>
                                        Find Partners
                                    </button>
                                    <button
                                        onClick={() => setShowSendRequestModal(true)}
                                        className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-opacity-90 transition-all flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">person_add</span>
                                        Send Request
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

                        {analytics && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#222]">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                            <span className="material-symbols-outlined text-3xl">groups</span>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Partners</p>
                                            <h3 className="text-2xl font-black">{analytics.totalPartnerships}</h3>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#222]">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-500">
                                            <span className="material-symbols-outlined text-3xl">check_circle</span>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active</p>
                                            <h3 className="text-2xl font-black">{analytics.activePartnerships}</h3>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#222]">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                                            <span className="material-symbols-outlined text-3xl">event_repeat</span>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Check-in Rate</p>
                                            <h3 className="text-2xl font-black">{analytics.checkInRate}%</h3>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#222]">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-500">
                                            <span className="material-symbols-outlined text-3xl">trending_up</span>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Recent Check-ins</p>
                                            <h3 className="text-2xl font-black">{analytics.thirtyDayCheckInCount}</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab Navigation */}
                        <div className="flex gap-1 mb-6 bg-slate-100 dark:bg-[#222] p-1 rounded-xl w-fit">
                            {['partnerships', 'requests', 'analytics'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
                                        activeTab === tab 
                                            ? 'bg-white dark:bg-[#1A1A1A] text-primary shadow-sm' 
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                    }`}
                                >
                                    {tab === 'partnerships' ? 'My Partners' : 
                                     tab === 'requests' ? 'Requests' : 'Analytics'}
                                </button>
                            ))}
                        </div>

                        {/* Partnerships Tab */}
                        {activeTab === "partnerships" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {partnerships.length > 0 ? (
                                    partnerships.map((partnership) => (
                                        <div key={partnership.id} className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-slate-100 dark:border-[#222] p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                        {partnership.partner.name?.charAt(0) || partnership.partner.email.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg">{partnership.partner.name || partnership.partner.email}</h3>
                                                        <p className="text-slate-500 text-sm">{partnership.partner.email}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(partnership.status)}`}>
                                                    {partnership.status}
                                                </span>
                                            </div>
                                            
                                            <div className="space-y-3 mb-4">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500">Check-in Frequency:</span>
                                                    <span className="font-medium">{partnership.checkInFrequency}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500">Partner Since:</span>
                                                    <span className="font-medium">{new Date(partnership.startDate).toLocaleDateString()}</span>
                                                </div>
                                                {partnership.lastCheckIn && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-slate-500">Last Check-in:</span>
                                                        <span className="font-medium">{new Date(partnership.lastCheckIn).toLocaleDateString()}</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleRecordCheckIn(partnership.id)}
                                                    className="flex-1 px-3 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-opacity-90 transition-all"
                                                >
                                                    Check-in
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        // View partner progress
                                                        window.location.href = `/accountability/partner/${partnership.partnerId}`;
                                                    }}
                                                    className="px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-[#222] transition-all"
                                                >
                                                    View Progress
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-12">
                                        <div className="text-5xl mb-4">🤝</div>
                                        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No accountability partners yet</h3>
                                        <p className="text-slate-500 mb-6">Send a request or find potential partners to get started</p>
                                        <div className="flex justify-center gap-3">
                                            <button
                                                onClick={() => setShowSendRequestModal(true)}
                                                className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-opacity-90 transition-all"
                                            >
                                                Send Request
                                            </button>
                                            <button
                                                onClick={() => setShowFindPartnersModal(true)}
                                                className="px-6 py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition-all"
                                            >
                                                Find Partners
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Requests Tab */}
                        {activeTab === "requests" && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Sent Requests */}
                                <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-slate-100 dark:border-[#222] p-6">
                                    <h3 className="text-xl font-bold mb-4">Sent Requests ({requests.sent.length})</h3>
                                    <div className="space-y-3">
                                        {requests.sent.length > 0 ? (
                                            requests.sent.map((request: any) => (
                                                <div key={request.id} className="p-4 border border-slate-100 dark:border-[#333] rounded-xl">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h4 className="font-medium">{request.recipient.name || request.recipient.email}</h4>
                                                            <p className="text-slate-500 text-sm">{request.recipient.email}</p>
                                                        </div>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(request.status)}`}>
                                                            {request.status}
                                                        </span>
                                                    </div>
                                                    {request.message && (
                                                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">{request.message}</p>
                                                    )}
                                                    <div className="text-xs text-slate-500">
                                                        Sent {new Date(request.sentAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-slate-500 text-center py-4">No sent requests</p>
                                        )}
                                    </div>
                                </div>

                                {/* Received Requests */}
                                <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-slate-100 dark:border-[#222] p-6">
                                    <h3 className="text-xl font-bold mb-4">Received Requests ({requests.received.length})</h3>
                                    <div className="space-y-3">
                                        {requests.received.length > 0 ? (
                                            requests.received.map((request: any) => (
                                                <div key={request.id} className="p-4 border border-slate-100 dark:border-[#333] rounded-xl">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h4 className="font-medium">{request.sender.name || request.sender.email}</h4>
                                                            <p className="text-slate-500 text-sm">{request.sender.email}</p>
                                                        </div>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(request.status)}`}>
                                                            {request.status}
                                                        </span>
                                                    </div>
                                                    {request.message && (
                                                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-3 bg-slate-50 dark:bg-[#222] p-3 rounded-lg">
                                                            {request.message}
                                                        </p>
                                                    )}
                                                    {request.status === 'Pending' && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleRespondRequest(request.id, true)}
                                                                className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-bold hover:bg-green-600 transition-all"
                                                            >
                                                                Accept
                                                            </button>
                                                            <button
                                                                onClick={() => handleRespondRequest(request.id, false)}
                                                                className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 transition-all"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    )}
                                                    <div className="text-xs text-slate-500 mt-2">
                                                        Received {new Date(request.sentAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-slate-500 text-center py-4">No received requests</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Send Request Modal */}
            {showSendRequestModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Send Partnership Request</h2>
                            <button
                                onClick={() => {
                                    setShowSendRequestModal(false);
                                    resetRequestForm();
                                }}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSendRequest} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Partner's Email *</label>
                                <input
                                    type="email"
                                    value={requestFormData.email}
                                    onChange={(e) => setRequestFormData({...requestFormData, email: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Message (Optional)</label>
                                <textarea
                                    value={requestFormData.message}
                                    onChange={(e) => setRequestFormData({...requestFormData, message: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222] h-24 resize-none"
                                    placeholder="Tell them why you'd like to be accountability partners..."
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowSendRequestModal(false);
                                        resetRequestForm();
                                    }}
                                    className="flex-1 px-4 py-2 border border-slate-200 dark:border-[#333] rounded-lg font-bold hover:bg-slate-50 dark:hover:bg-[#222] transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-opacity-90 transition-all"
                                >
                                    Send Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Find Partners Modal */}
            {showFindPartnersModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Find Potential Partners</h2>
                            <button
                                onClick={() => setShowFindPartnersModal(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="mb-4">
                            <button
                                onClick={fetchPotentialPartners}
                                className="px-4 py-2 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-600 transition-all"
                            >
                                Search for Compatible Partners
                            </button>
                        </div>

                        {potentialPartners.length > 0 ? (
                            <div className="space-y-4">
                                {potentialPartners.map((partner: any) => (
                                    <div key={partner.id} className="p-4 border border-slate-100 dark:border-[#333] rounded-xl">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {partner.name?.charAt(0) || partner.email.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold">{partner.name || partner.email}</h3>
                                                    <p className="text-slate-500 text-sm">{partner.email}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-purple-500">
                                                    {Math.round(partner.compatibilityScore * 100)}% Match
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {partner.commonGoals.length > 0 && (
                                            <div className="mb-3">
                                                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Common Goals:</div>
                                                <div className="flex flex-wrap gap-1">
                                                    {partner.commonGoals.map((goal: any, index: number) => (
                                                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                            {goal.title}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {partner.complementaryHabits.length > 0 && (
                                            <div className="mb-4">
                                                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Complementary Habits:</div>
                                                <div className="text-slate-600 dark:text-slate-400 text-sm">
                                                    {partner.complementaryHabits.length} complementary habits found
                                                </div>
                                            </div>
                                        )}
                                        
                                        <button
                                            onClick={() => {
                                                setRequestFormData({ email: partner.email, message: "" });
                                                setShowFindPartnersModal(false);
                                                setShowSendRequestModal(true);
                                            }}
                                            className="w-full px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-opacity-90 transition-all"
                                        >
                                            Send Partnership Request
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-slate-500">Click "Search for Compatible Partners" to find potential matches</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function TeamCollaborationPage() {
    const [teams, setTeams] = useState<any[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
    const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
    const [activeTab, setActiveTab] = useState("teams");

    // Form states
    const [teamFormData, setTeamFormData] = useState({
        name: "",
        description: ""
    });

    const [memberFormData, setMemberFormData] = useState({
        email: "",
        role: "Member"
    });

    const [projectFormData, setProjectFormData] = useState({
        name: "",
        description: "",
        startDate: "",
        endDate: ""
    });

    const [taskFormData, setTaskFormData] = useState({
        title: "",
        description: "",
        assignedTo: "",
        priority: "Medium",
        dueDate: ""
    });

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/teams");
            if (res.ok) {
                const data = await res.json();
                setTeams(data.teams);
                setError("");
            } else {
                const errorData = await res.json();
                setError(errorData.error || "Failed to load teams");
            }
        } catch (err) {
            setError("Network error occurred");
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTeamDetails = async (teamId: string) => {
        try {
            const res = await fetch(`/api/teams?teamId=${teamId}&type=team`);
            if (res.ok) {
                const data = await res.json();
                setSelectedTeam(data.team);
                setActiveTab("team-details");
            }
        } catch (err) {
            console.error("Fetch team details error:", err);
        }
    };

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch("/api/teams", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "createTeam",
                    ...teamFormData
                })
            });

            if (res.ok) {
                const data = await res.json();
                setTeams([data.team, ...teams]);
                resetTeamForm();
                setShowCreateTeamModal(false);
            } else {
                const errorData = await res.json();
                setError(errorData.error || "Failed to create team");
            }
        } catch (err) {
            setError("Network error occurred");
            console.error("Submit error:", err);
        }
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedTeam) return;

        try {
            const res = await fetch("/api/teams", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "addMember",
                    teamId: selectedTeam.id,
                    memberEmail: memberFormData.email,
                    role: memberFormData.role
                })
            });

            if (res.ok) {
                const data = await res.json();
                // Refresh team details
                fetchTeamDetails(selectedTeam.id);
                resetMemberForm();
                setShowAddMemberModal(false);
            } else {
                const errorData = await res.json();
                setError(errorData.error || "Failed to add member");
            }
        } catch (err) {
            setError("Network error occurred");
            console.error("Add member error:", err);
        }
    };

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedTeam) return;

        try {
            const res = await fetch("/api/teams", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "createProject",
                    teamId: selectedTeam.id,
                    ...projectFormData
                })
            });

            if (res.ok) {
                const data = await res.json();
                // Refresh team details
                fetchTeamDetails(selectedTeam.id);
                resetProjectForm();
                setShowCreateProjectModal(false);
            } else {
                const errorData = await res.json();
                setError(errorData.error || "Failed to create project");
            }
        } catch (err) {
            setError("Network error occurred");
            console.error("Create project error:", err);
        }
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedTeam || !projectFormData.name) return;

        try {
            const res = await fetch("/api/teams", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "createTask",
                    projectId: projectFormData.name, // This should be the actual project ID
                    ...taskFormData
                })
            });

            if (res.ok) {
                const data = await res.json();
                // Refresh team details
                fetchTeamDetails(selectedTeam.id);
                resetTaskForm();
                setShowCreateTaskModal(false);
            } else {
                const errorData = await res.json();
                setError(errorData.error || "Failed to create task");
            }
        } catch (err) {
            setError("Network error occurred");
            console.error("Create task error:", err);
        }
    };

    const resetTeamForm = () => {
        setTeamFormData({ name: "", description: "" });
    };

    const resetMemberForm = () => {
        setMemberFormData({ email: "", role: "Member" });
    };

    const resetProjectForm = () => {
        setProjectFormData({ name: "", description: "", startDate: "", endDate: "" });
    };

    const resetTaskForm = () => {
        setTaskFormData({
            title: "",
            description: "",
            assignedTo: "",
            priority: "Medium",
            dueDate: ""
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Todo': return 'bg-gray-100 text-gray-800';
            case 'InProgress': return 'bg-blue-100 text-blue-800';
            case 'Review': return 'bg-yellow-100 text-yellow-800';
            case 'Completed': return 'bg-green-100 text-green-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High': return 'text-red-500';
            case 'Medium': return 'text-yellow-500';
            case 'Low': return 'text-green-500';
            default: return 'text-slate-500';
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
                                <span className="ml-3 text-lg">Loading Team Collaboration...</span>
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
                                    <h1 className="text-3xl font-bold mb-2">Team Collaboration</h1>
                                    <p className="text-slate-500">Work together with your team on shared projects and tasks</p>
                                </div>
                                <button
                                    onClick={() => setShowCreateTeamModal(true)}
                                    className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined">add</span>
                                    Create Team
                                </button>
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
                            <button
                                onClick={() => setActiveTab("teams")}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === "teams"
                                        ? 'bg-white dark:bg-[#1A1A1A] text-primary shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                    }`}
                            >
                                My Teams
                            </button>
                            {selectedTeam && (
                                <button
                                    onClick={() => setActiveTab("team-details")}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === "team-details"
                                            ? 'bg-white dark:bg-[#1A1A1A] text-primary shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                        }`}
                                >
                                    {selectedTeam.name}
                                </button>
                            )}
                        </div>

                        {/* Teams List */}
                        {activeTab === "teams" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {teams.length > 0 ? (
                                    teams.map((team) => (
                                        <div
                                            key={team.id}
                                            className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-slate-100 dark:border-[#222] p-6 hover:shadow-md transition-all cursor-pointer"
                                            onClick={() => fetchTeamDetails(team.id)}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="text-xl font-bold text-[#333] dark:text-gray-200">{team.name}</h3>
                                                <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
                                                    {team.members.length} members
                                                </span>
                                            </div>

                                            {team.description && (
                                                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">{team.description}</p>
                                            )}

                                            <div className="flex items-center justify-between text-sm text-slate-500">
                                                <span>Created {new Date(team.createdAt).toLocaleDateString()}</span>
                                                <span>{team.projects.length} projects</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-12">
                                        <div className="text-5xl mb-4">👥</div>
                                        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No teams yet</h3>
                                        <p className="text-slate-500 mb-6">Create your first team to start collaborating</p>
                                        <button
                                            onClick={() => setShowCreateTeamModal(true)}
                                            className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-opacity-90 transition-all"
                                        >
                                            Create Your First Team
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Team Details */}
                        {activeTab === "team-details" && selectedTeam && (
                            <div className="space-y-6">
                                {/* Team Header */}
                                <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-slate-100 dark:border-[#222] p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-2xl font-bold mb-2">{selectedTeam.name}</h2>
                                            {selectedTeam.description && (
                                                <p className="text-slate-600 dark:text-slate-400">{selectedTeam.description}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setShowAddMemberModal(true)}
                                                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition-all flex items-center gap-2"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">person_add</span>
                                                Add Member
                                            </button>
                                            <button
                                                onClick={() => setShowCreateProjectModal(true)}
                                                className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-all flex items-center gap-2"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">add</span>
                                                New Project
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Team Members */}
                                <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-slate-100 dark:border-[#222] p-6">
                                    <h3 className="text-xl font-bold mb-4">Team Members ({selectedTeam.members.length})</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {selectedTeam.members.map((member: any) => (
                                            <div key={member.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#222] rounded-lg">
                                                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {member.user.name?.charAt(0) || member.user.email.charAt(0)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium">{member.user.name || member.user.email}</div>
                                                    <div className="text-sm text-slate-500">{member.role}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Projects */}
                                <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-slate-100 dark:border-[#222] p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xl font-bold">Projects ({selectedTeam.projects.length})</h3>
                                        <button
                                            onClick={() => setShowCreateProjectModal(true)}
                                            className="px-3 py-1 bg-primary text-white rounded-lg text-sm font-bold hover:bg-opacity-90 transition-all"
                                        >
                                            + New Project
                                        </button>
                                    </div>

                                    {selectedTeam.projects.length > 0 ? (
                                        <div className="space-y-3">
                                            {selectedTeam.projects.map((project: any) => (
                                                <div key={project.id} className="p-4 border border-slate-100 dark:border-[#333] rounded-xl">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-bold text-lg">{project.name}</h4>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${project.status === 'Active' ? 'bg-blue-100 text-blue-800' :
                                                                project.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {project.status}
                                                        </span>
                                                    </div>
                                                    {project.description && (
                                                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">{project.description}</p>
                                                    )}
                                                    <div className="text-sm text-slate-500">
                                                        {project.tasks.length} tasks • Started {new Date(project.startDate).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-slate-500">No projects yet. Create your first project to get started.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Create Team Modal */}
            {showCreateTeamModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Create New Team</h2>
                            <button
                                onClick={() => {
                                    setShowCreateTeamModal(false);
                                    resetTeamForm();
                                }}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleCreateTeam} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Team Name *</label>
                                <input
                                    type="text"
                                    value={teamFormData.name}
                                    onChange={(e) => setTeamFormData({ ...teamFormData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    value={teamFormData.description}
                                    onChange={(e) => setTeamFormData({ ...teamFormData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222] h-20 resize-none"
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateTeamModal(false);
                                        resetTeamForm();
                                    }}
                                    className="flex-1 px-4 py-2 border border-slate-200 dark:border-[#333] rounded-lg font-bold hover:bg-slate-50 dark:hover:bg-[#222] transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-opacity-90 transition-all"
                                >
                                    Create Team
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Member Modal */}
            {showAddMemberModal && selectedTeam && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Add Team Member</h2>
                            <button
                                onClick={() => {
                                    setShowAddMemberModal(false);
                                    resetMemberForm();
                                }}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleAddMember} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Email Address *</label>
                                <input
                                    type="email"
                                    value={memberFormData.email}
                                    onChange={(e) => setMemberFormData({ ...memberFormData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Role</label>
                                <select
                                    value={memberFormData.role}
                                    onChange={(e) => setMemberFormData({ ...memberFormData, role: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222]"
                                >
                                    <option value="Member">Member</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddMemberModal(false);
                                        resetMemberForm();
                                    }}
                                    className="flex-1 px-4 py-2 border border-slate-200 dark:border-[#333] rounded-lg font-bold hover:bg-slate-50 dark:hover:bg-[#222] transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-opacity-90 transition-all"
                                >
                                    Add Member
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
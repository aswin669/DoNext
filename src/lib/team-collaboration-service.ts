import prisma from "./prisma";
import { Team, Project, ProjectTask, TeamMembership } from "@/types";

/**
 * Team Collaboration Service
 * Handles team management, project collaboration, and shared task tracking
 */
export class TeamCollaborationService {
    
    /**
     * Create a new team
     */
    static async createTeam(userId: string, teamData: {
        name: string;
        description?: string;
    }): Promise<Team> {
        try {
            // Check if user exists
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user) {
                throw new Error("User not found");
            }
            
            const team = await prisma.team.create({
                data: {
                    ...teamData,
                    ownerId: userId,
                    members: {
                        create: {
                            userId,
                            role: 'Owner'
                        }
                    }
                },
                include: {
                    owner: true,
                    members: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    profilePicture: true
                                }
                            }
                        }
                    },
                    projects: true
                }
            });
            
            return team as unknown as Team;
        } catch (error) {
            console.error("Error creating team:", error);
            throw new Error("Failed to create team");
        }
    }
    
    /**
     * Get user's teams
     */
    static async getUserTeams(userId: string): Promise<Team[]> {
        try {
            const memberships = await prisma.teamMembership.findMany({
                where: { userId },
                include: {
                    team: {
                        include: {
                            owner: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    profilePicture: true
                                }
                            },
                            members: {
                                include: {
                                    user: {
                                        select: {
                                            id: true,
                                            name: true,
                                            email: true,
                                            profilePicture: true
                                        }
                                    }
                                }
                            },
                            projects: {
                                include: {
                                    tasks: true
                                }
                            }
                        }
                    }
                }
            });
            
            return memberships.map(membership => membership.team) as Team[];
        } catch (error) {
            console.error("Error fetching user teams:", error);
            return [];
        }
    }
    
    /**
     * Get team details
     */
    static async getTeamById(teamId: string, userId: string): Promise<Team | null> {
        try {
            // Verify user is member of the team
            const membership = await prisma.teamMembership.findUnique({
                where: {
                    userId_teamId: {
                        userId,
                        teamId
                    }
                }
            });
            
            if (!membership) {
                throw new Error("Access denied: Not a team member");
            }
            
            const team = await prisma.team.findUnique({
                where: { id: teamId },
                include: {
                    owner: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profilePicture: true
                        }
                    },
                    members: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    profilePicture: true
                                }
                            }
                        }
                    },
                    projects: {
                        include: {
                            tasks: {
                                include: {
                                    assignedUser: {
                                        select: {
                                            id: true,
                                            name: true,
                                            email: true,
                                            profilePicture: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            
            return team as Team;
        } catch (error) {
            console.error("Error fetching team:", error);
            throw error;
        }
    }
    
    /**
     * Add member to team
     */
    static async addTeamMember(teamId: string, ownerId: string, memberEmail: string, role: 'Admin' | 'Member' = 'Member'): Promise<TeamMembership> {
        try {
            // Verify team ownership
            const team = await prisma.team.findUnique({
                where: { id: teamId, ownerId }
            });
            
            if (!team) {
                throw new Error("Team not found or access denied");
            }
            
            // Find user by email
            const user = await prisma.user.findUnique({
                where: { email: memberEmail }
            });
            
            if (!user) {
                throw new Error("User not found");
            }
            
            // Check if already a member
            const existingMembership = await prisma.teamMembership.findUnique({
                where: {
                    userId_teamId: {
                        userId: user.id,
                        teamId
                    }
                }
            });
            
            if (existingMembership) {
                throw new Error("User is already a team member");
            }
            
            const membership = await prisma.teamMembership.create({
                data: {
                    userId: user.id,
                    teamId,
                    role
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profilePicture: true
                        }
                    },
                    team: true
                }
            });
            
            return membership as TeamMembership;
        } catch (error) {
            console.error("Error adding team member:", error);
            throw error;
        }
    }
    
    /**
     * Create project in team
     */
    static async createProject(teamId: string, userId: string, projectData: {
        name: string;
        description?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<Project> {
        try {
            // Verify user is member of the team
            const membership = await prisma.teamMembership.findUnique({
                where: {
                    userId_teamId: {
                        userId,
                        teamId
                    }
                }
            });
            
            if (!membership) {
                throw new Error("Access denied: Not a team member");
            }
            
            const project = await prisma.project.create({
                data: {
                    ...projectData,
                    teamId,
                    startDate: projectData.startDate || new Date()
                },
                include: {
                    team: true,
                    tasks: true
                }
            });
            
            return project as Project;
        } catch (error) {
            console.error("Error creating project:", error);
            throw new Error("Failed to create project");
        }
    }
    
    /**
     * Create task in project
     */
    static async createProjectTask(projectId: string, userId: string, taskData: {
        title: string;
        description?: string;
        assignedTo?: string;
        priority?: 'High' | 'Medium' | 'Low';
        dueDate?: Date;
    }): Promise<ProjectTask> {
        try {
            // Verify user has access to the project
            const project = await prisma.project.findUnique({
                where: { id: projectId },
                include: { team: true }
            });
            
            if (!project) {
                throw new Error("Project not found");
            }
            
            // Verify user is member of the team
            const membership = await prisma.teamMembership.findUnique({
                where: {
                    userId_teamId: {
                        userId,
                        teamId: project.teamId
                    }
                }
            });
            
            if (!membership) {
                throw new Error("Access denied: Not a team member");
            }
            
            // If assigning to someone, verify they're team members
            if (taskData.assignedTo) {
                const assigneeMembership = await prisma.teamMembership.findUnique({
                    where: {
                        userId_teamId: {
                            userId: taskData.assignedTo,
                            teamId: project.teamId
                        }
                    }
                });
                
                if (!assigneeMembership) {
                    throw new Error("Assignee is not a team member");
                }
            }
            
            const task = await prisma.projectTask.create({
                data: {
                    ...taskData,
                    projectId,
                    priority: taskData.priority || 'Medium'
                },
                include: {
                    project: {
                        include: {
                            team: true
                        }
                    },
                    assignedUser: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profilePicture: true
                        }
                    }
                }
            });
            
            return task as ProjectTask;
        } catch (error) {
            console.error("Error creating project task:", error);
            throw error;
        }
    }
    
    /**
     * Update project task status
     */
    static async updateProjectTaskStatus(taskId: string, userId: string, status: 'Todo' | 'InProgress' | 'Review' | 'Completed'): Promise<ProjectTask> {
        try {
            // Get task with project and team info
            const task = await prisma.projectTask.findUnique({
                where: { id: taskId },
                include: {
                    project: {
                        include: {
                            team: true
                        }
                    }
                }
            });
            
            if (!task) {
                throw new Error("Task not found");
            }
            
            // Verify user is team member
            const membership = await prisma.teamMembership.findUnique({
                where: {
                    userId_teamId: {
                        userId,
                        teamId: task.project.teamId
                    }
                }
            });
            
            if (!membership) {
                throw new Error("Access denied: Not a team member");
            }
            
            // Update task
            const completedAt = status === 'Completed' ? new Date() : task.completedAt;
            
            const updatedTask = await prisma.projectTask.update({
                where: { id: taskId },
                data: {
                    status,
                    completedAt
                },
                include: {
                    project: {
                        include: {
                            team: true
                        }
                    },
                    assignedUser: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profilePicture: true
                        }
                    }
                }
            });
            
            return updatedTask as ProjectTask;
        } catch (error) {
            console.error("Error updating task status:", error);
            throw error;
        }
    }
    
    /**
     * Get team analytics and statistics
     */
    static async getTeamAnalytics(teamId: string, userId: string): Promise<any> {
        try {
            // Verify team membership
            const membership = await prisma.teamMembership.findUnique({
                where: {
                    userId_teamId: {
                        userId,
                        teamId
                    }
                }
            });
            
            if (!membership) {
                throw new Error("Access denied: Not a team member");
            }
            
            const team = await prisma.team.findUnique({
                where: { id: teamId },
                include: {
                    members: true,
                    projects: {
                        include: {
                            tasks: true
                        }
                    }
                }
            });
            
            if (!team) {
                throw new Error("Team not found");
            }
            
            // Calculate analytics
            const totalProjects = team.projects.length;
            const activeProjects = team.projects.filter(p => p.status === 'Active').length;
            const completedProjects = team.projects.filter(p => p.status === 'Completed').length;
            
            const totalTasks = team.projects.reduce((sum, project) => sum + project.tasks.length, 0);
            const completedTasks = team.projects.reduce((sum, project) => 
                sum + project.tasks.filter(t => t.status === 'Completed').length, 0
            );
            
            const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
            
            // Member activity
            const memberStats = await Promise.all(team.members.map(async (member) => {
                const userTasks = await prisma.projectTask.findMany({
                    where: {
                        assignedTo: member.userId,
                        project: {
                            teamId
                        }
                    }
                });
                
                const completedUserTasks = userTasks.filter(t => t.status === 'Completed').length;
                const completionRate = userTasks.length > 0 ? (completedUserTasks / userTasks.length) * 100 : 0;
                
                return {
                    userId: member.userId,
                    role: member.role,
                    totalTasks: userTasks.length,
                    completedTasks: completedUserTasks,
                    completionRate: Math.round(completionRate)
                };
            }));
            
            return {
                teamId,
                memberCount: team.members.length,
                totalProjects,
                activeProjects,
                completedProjects,
                totalTasks,
                completedTasks,
                taskCompletionRate: Math.round(taskCompletionRate),
                memberStats: memberStats.sort((a, b) => b.completionRate - a.completionRate)
            };
        } catch (error) {
            console.error("Error fetching team analytics:", error);
            throw error;
        }
    }
    
    /**
     * Remove team member
     */
    static async removeTeamMember(teamId: string, ownerId: string, memberId: string): Promise<void> {
        try {
            // Verify team ownership
            const team = await prisma.team.findUnique({
                where: { id: teamId, ownerId }
            });
            
            if (!team) {
                throw new Error("Team not found or access denied");
            }
            
            // Cannot remove owner
            if (memberId === ownerId) {
                throw new Error("Cannot remove team owner");
            }
            
            await prisma.teamMembership.delete({
                where: {
                    userId_teamId: {
                        userId: memberId,
                        teamId
                    }
                }
            });
        } catch (error) {
            console.error("Error removing team member:", error);
            throw error;
        }
    }
    
    /**
     * Send team invitation
     */
    static async sendInvitation(teamId: string, ownerId: string, inviteeEmail: string, role: 'Admin' | 'Member' = 'Member'): Promise<any> {
        try {
            // Verify team ownership
            const team = await prisma.team.findUnique({
                where: { id: teamId, ownerId }
            });
            
            if (!team) {
                throw new Error("Team not found or access denied");
            }
            
            // Check if user already exists and is a member
            const existingUser = await prisma.user.findUnique({
                where: { email: inviteeEmail }
            });
            
            if (existingUser) {
                const existingMembership = await prisma.teamMembership.findUnique({
                    where: {
                        userId_teamId: {
                            userId: existingUser.id,
                            teamId
                        }
                    }
                });
                
                if (existingMembership) {
                    throw new Error("User is already a team member");
                }
            }
            
            // Check for existing invitation
            // @ts-expect-error - prisma types may not be fully generated
            const existingInvitation = await prisma.teamInvitation.findFirst({
                where: {
                    teamId,
                    inviteeEmail,
                    status: 'Pending'
                }
            });
            
            if (existingInvitation) {
                throw new Error("Invitation already sent to this email");
            }
            
            // Create invitation
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 7); // 7-day expiry
            
            // @ts-expect-error - prisma types may not be fully generated
            const invitation = await prisma.teamInvitation.create({
                data: {
                    teamId,
                    inviteeEmail,
                    invitedBy: ownerId,
                    role,
                    expiryDate,
                    status: 'Pending'
                },
                include: {
                    team: true
                }
            });
            
            // Send email notification to invitee
            try {
                const invitingUser = await prisma.user.findUnique({
                    where: { id: ownerId },
                    select: { name: true, email: true }
                });
                
                if (invitingUser) {
                    // Email would be sent via SendGrid or similar service
                    console.log(`Email invitation sent to ${inviteeEmail} from ${invitingUser.name} for team ${team.name}`);
                    // In production, this would call an email service:
                    // await EmailService.sendTeamInvitation(inviteeEmail, invitingUser, team, invitation);
                }
            } catch (emailError) {
                console.error("Failed to send invitation email:", emailError);
                // Don't fail the invitation creation if email fails
            }
            
            return invitation;
        } catch (error) {
            console.error("Error sending invitation:", error);
            throw error;
        }
    }
    
    /**
     * Get user's pending invitations
     */
    static async getUserInvitations(userId: string): Promise<any[]> {
        try {
            // Get user's email
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });
            
            if (!user) {
                throw new Error("User not found");
            }
            
            // Find pending invitations for this email
            // @ts-expect-error - prisma types may not be fully generated
            const invitations = await prisma.teamInvitation.findMany({
                where: {
                    inviteeEmail: user.email,
                    status: 'Pending',
                    expiryDate: {
                        gte: new Date() // Not expired
                    }
                },
                include: {
                    team: {
                        include: {
                            owner: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            
            return invitations;
        } catch (error) {
            console.error("Error fetching invitations:", error);
            return [];
        }
    }
    
    /**
     * Accept team invitation
     */
    static async acceptInvitation(invitationId: string, userId: string): Promise<TeamMembership> {
        try {
            // Get invitation
            // @ts-expect-error - prisma types may not be fully generated
            const invitation = await prisma.teamInvitation.findUnique({
                where: { id: invitationId }
            });
            
            if (!invitation) {
                throw new Error("Invitation not found");
            }
            
            // Verify invitation is for this user
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });
            
            if (!user || user.email !== invitation.inviteeEmail) {
                throw new Error("Invitation is not for this user");
            }
            
            // Check if invitation is expired
            if (new Date() > invitation.expiryDate) {
                throw new Error("Invitation has expired");
            }
            
            // Check if already a member
            const existingMembership = await prisma.teamMembership.findUnique({
                where: {
                    userId_teamId: {
                        userId,
                        teamId: invitation.teamId
                    }
                }
            });
            
            if (existingMembership) {
                throw new Error("User is already a team member");
            }
            
            // Add user to team
            const membership = await prisma.teamMembership.create({
                data: {
                    userId,
                    teamId: invitation.teamId,
                    role: invitation.role
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profilePicture: true
                        }
                    },
                    team: true
                }
            });
            
            // Mark invitation as accepted
            // @ts-expect-error - prisma types may not be fully generated
            await prisma.teamInvitation.update({
                where: { id: invitationId },
                data: {
                    status: 'Accepted',
                    acceptedAt: new Date()
                }
            });
            
            return membership as TeamMembership;
        } catch (error) {
            console.error("Error accepting invitation:", error);
            throw error;
        }
    }
    
    /**
     * Reject team invitation
     */
    static async rejectInvitation(invitationId: string, userId: string): Promise<void> {
        try {
            // Get invitation
            // @ts-expect-error - prisma types may not be fully generated
            const invitation = await prisma.teamInvitation.findUnique({
                where: { id: invitationId }
            });
            
            if (!invitation) {
                throw new Error("Invitation not found");
            }
            
            // Verify invitation is for this user
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });
            
            if (!user || user.email !== invitation.inviteeEmail) {
                throw new Error("Invitation is not for this user");
            }
            
            // Mark invitation as rejected
            // @ts-expect-error - prisma types may not be fully generated
            await prisma.teamInvitation.update({
                where: { id: invitationId },
                data: {
                    status: 'Rejected',
                    rejectedAt: new Date()
                }
            });
        } catch (error) {
            console.error("Error rejecting invitation:", error);
            throw error;
        }
    }
    
    /**
     * Get team's sent invitations
     */
    static async getTeamInvitations(teamId: string, ownerId: string): Promise<any[]> {
        try {
            // Verify team ownership
            const team = await prisma.team.findUnique({
                where: { id: teamId, ownerId }
            });
            
            if (!team) {
                throw new Error("Team not found or access denied");
            }
            
            // @ts-expect-error - prisma types may not be fully generated
            const invitations = await prisma.teamInvitation.findMany({
                where: { teamId },
                orderBy: { createdAt: 'desc' }
            });
            
            return invitations;
        } catch (error) {
            console.error("Error fetching team invitations:", error);
            return [];
        }
    }
    
    /**
     * Cancel team invitation
     */
    static async cancelInvitation(invitationId: string, ownerId: string): Promise<void> {
        try {
            // Get invitation with team
            // @ts-expect-error - prisma types may not be fully generated
            const invitation = await prisma.teamInvitation.findUnique({
                where: { id: invitationId },
                include: { team: true }
            });
            
            if (!invitation) {
                throw new Error("Invitation not found");
            }
            
            // Verify team ownership
            if (invitation.team.ownerId !== ownerId) {
                throw new Error("Access denied");
            }
            
            // Can only cancel pending invitations
            if (invitation.status !== 'Pending') {
                throw new Error("Can only cancel pending invitations");
            }
            
            // Delete invitation
            // @ts-expect-error - prisma types may not be fully generated
            await prisma.teamInvitation.delete({
                where: { id: invitationId }
            });
        } catch (error) {
            console.error("Error canceling invitation:", error);
            throw error;
        }
    }
}
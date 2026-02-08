import prisma from "./prisma";

/**
 * Team Invitation Service
 * Handles team invitations, acceptance, and rejection
 */
export class TeamInvitationService {
    
    /**
     * Send team invitation
     */
    static async sendInvitation(teamId: string, senderId: string, recipientEmail: string, role: 'Admin' | 'Member' = 'Member'): Promise<any> {
        try {
            // Verify team ownership or admin status
            const team = await prisma.team.findUnique({
                where: { id: teamId }
            });
            
            if (!team) {
                throw new Error("Team not found");
            }
            
            // Check if sender is owner or admin
            const senderMembership = await prisma.teamMembership.findUnique({
                where: {
                    userId_teamId: {
                        userId: senderId,
                        teamId
                    }
                }
            });
            
            if (!senderMembership || (senderMembership.role !== 'Owner' && senderMembership.role !== 'Admin')) {
                throw new Error("Access denied: Only team owners and admins can send invitations");
            }
            
            // Check if recipient exists
            const recipient = await prisma.user.findUnique({
                where: { email: recipientEmail }
            });
            
            if (!recipient) {
                throw new Error("User with this email not found");
            }
            
            // Check if already a member
            const existingMembership = await prisma.teamMembership.findUnique({
                where: {
                    userId_teamId: {
                        userId: recipient.id,
                        teamId
                    }
                }
            });
            
            if (existingMembership) {
                throw new Error("User is already a team member");
            }
            
            // Create invitation record
            // @ts-expect-error - prisma types may not be fully generated
            const invitation = await prisma.teamInvitation.create({
                data: {
                    teamId,
                    inviteeEmail: recipientEmail,
                    invitedBy: senderId,
                    role,
                    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                    status: 'Pending'
                },
                include: {
                    team: true
                }
            });
            
            console.log(`Sent team invitation:`, invitation);
            
            return invitation;
        } catch (error) {
            console.error("Error sending team invitation:", error);
            throw error;
        }
    }
    
    /**
     * Get pending invitations for user
     */
    static async getUserInvitations(userId: string): Promise<any[]> {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });
            
            if (!user) return [];
            
            // @ts-expect-error - prisma types may not be fully generated
            const invitations = await prisma.teamInvitation.findMany({
                where: {
                    inviteeEmail: user.email,
                    status: 'Pending',
                    expiryDate: {
                        gte: new Date()
                    }
                },
                include: {
                    team: true
                }
            });
            
            return invitations;
        } catch (error) {
            console.error("Error fetching user invitations:", error);
            return [];
        }
    }
    
    /**
     * Accept team invitation
     */
    static async acceptInvitation(userId: string, invitationId: string): Promise<any> {
        try {
            // @ts-expect-error - prisma types may not be fully generated
            const invitation = await prisma.teamInvitation.findUnique({
                where: { id: invitationId }
            });
            
            if (!invitation || invitation.status !== 'Pending') {
                throw new Error("Invitation not found or no longer pending");
            }
            
            // Create team membership
            const membership = await prisma.teamMembership.create({
                data: {
                    userId,
                    teamId: invitation.teamId,
                    role: invitation.role
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
            
            console.log(`Accepted team invitation:`, membership);
            
            return membership;
        } catch (error) {
            console.error("Error accepting invitation:", error);
            throw error;
        }
    }
    
    /**
     * Reject team invitation
     */
    static async rejectInvitation(userId: string, invitationId: string): Promise<void> {
        try {
            // @ts-expect-error - prisma types may not be fully generated
            await prisma.teamInvitation.update({
                where: { id: invitationId },
                data: {
                    status: 'Rejected',
                    rejectedAt: new Date()
                }
            });
            console.log(`Rejected invitation ${invitationId} for user ${userId}`);
        } catch (error) {
            console.error("Error rejecting invitation:", error);
            throw error;
        }
    }
    
    /**
     * Cancel team invitation
     */
    static async cancelInvitation(teamId: string, senderId: string, invitationId: string): Promise<void> {
        try {
            // @ts-expect-error - prisma types may not be fully generated
            await prisma.teamInvitation.delete({
                where: { id: invitationId }
            });
            console.log(`Cancelled invitation ${invitationId}`);
        } catch (error) {
            console.error("Error cancelling invitation:", error);
            throw error;
        }
    }
    
    /**
     * Get team invitations sent
     */
    static async getTeamInvitations(teamId: string, userId: string): Promise<any[]> {
        try {
            // @ts-expect-error - prisma types may not be fully generated
            const invitations = await prisma.teamInvitation.findMany({
                where: { teamId }
            });
            
            return invitations;
        } catch (error) {
            console.error("Error fetching team invitations:", error);
            return [];
        }
    }
}

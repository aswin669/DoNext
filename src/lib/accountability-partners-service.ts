import prisma from "./prisma";
import { AccountabilityPartnership, AccountabilityRequest } from "@/types";

/**
 * Accountability Partners Service
 * Handles peer matching, partnership management, and progress sharing
 */
export class AccountabilityPartnersService {
    
    /**
     * Send accountability partnership request
     */
    static async sendPartnershipRequest(senderId: string, recipientEmail: string, message?: string): Promise<AccountabilityRequest> {
        try {
            // Verify sender exists
            const sender = await prisma.user.findUnique({ where: { id: senderId } });
            if (!sender) {
                throw new Error("Sender not found");
            }
            
            // Find recipient by email
            const recipient = await prisma.user.findUnique({ 
                where: { email: recipientEmail } 
            });
            
            if (!recipient) {
                throw new Error("Recipient not found");
            }
            
            // Check if already partners
            const existingPartnership = await prisma.accountabilityPartnership.findFirst({
                where: {
                    OR: [
                        { userId: senderId, partnerId: recipient.id },
                        { userId: recipient.id, partnerId: senderId }
                    ]
                }
            });
            
            if (existingPartnership) {
                throw new Error("You are already partnered with this user");
            }
            
            // Check for existing pending request
            const existingRequest = await prisma.accountabilityRequest.findFirst({
                where: {
                    senderId,
                    recipientId: recipient.id,
                    status: 'Pending'
                }
            });
            
            if (existingRequest) {
                throw new Error("Partnership request already sent");
            }
            
            const request = await prisma.accountabilityRequest.create({
                data: {
                    senderId,
                    recipientId: recipient.id,
                    message
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profilePicture: true
                        }
                    },
                    recipient: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profilePicture: true
                        }
                    }
                }
            });
            
            return request as unknown as AccountabilityRequest;
        } catch (error) {
            console.error("Error sending partnership request:", error);
            throw error;
        }
    }
    
    /**
     * Get user's partnership requests
     */
    static async getUserRequests(userId: string): Promise<{
        sent: AccountabilityRequest[];
        received: AccountabilityRequest[];
    }> {
        try {
            const [sentRequests, receivedRequests] = await Promise.all([
                prisma.accountabilityRequest.findMany({
                    where: { senderId: userId },
                    include: {
                        sender: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                profilePicture: true
                            }
                        },
                        recipient: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                profilePicture: true
                            }
                        }
                    },
                    orderBy: { sentAt: 'desc' }
                }),
                prisma.accountabilityRequest.findMany({
                    where: { recipientId: userId },
                    include: {
                        sender: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                profilePicture: true
                            }
                        },
                        recipient: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                profilePicture: true
                            }
                        }
                    },
                    orderBy: { sentAt: 'desc' }
                })
            ]);
            
            return {
                sent: sentRequests as AccountabilityRequest[],
                received: receivedRequests as AccountabilityRequest[]
            };
        } catch (error) {
            console.error("Error fetching user requests:", error);
            return { sent: [], received: [] };
        }
    }
    
    /**
     * Respond to partnership request
     */
    static async respondToRequest(requestId: string, recipientId: string, accept: boolean): Promise<AccountabilityRequest> {
        try {
            // Verify request exists and user is recipient
            const request = await prisma.accountabilityRequest.findUnique({
                where: { id: requestId },
                include: { recipient: true }
            });
            
            if (!request) {
                throw new Error("Request not found");
            }
            
            if (request.recipientId !== recipientId) {
                throw new Error("Access denied");
            }
            
            if (request.status !== 'Pending') {
                throw new Error("Request already responded to");
            }
            
            const updatedRequest = await prisma.accountabilityRequest.update({
                where: { id: requestId },
                data: {
                    status: accept ? 'Accepted' : 'Rejected',
                    respondedAt: new Date()
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profilePicture: true
                        }
                    },
                    recipient: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profilePicture: true
                        }
                    }
                }
            });
            
            // If accepted, create partnership
            if (accept) {
                await prisma.accountabilityPartnership.create({
                    data: {
                        userId: request.senderId,
                        partnerId: recipientId,
                        status: 'Active',
                        startDate: new Date()
                    }
                });
                
                // Create reverse partnership (mutual relationship)
                await prisma.accountabilityPartnership.create({
                    data: {
                        userId: recipientId,
                        partnerId: request.senderId,
                        status: 'Active',
                        startDate: new Date()
                    }
                });
            }
            
            return updatedRequest as unknown as AccountabilityRequest;
        } catch (error) {
            console.error("Error responding to request:", error);
            throw error;
        }
    }
    
    /**
     * Get user's accountability partners
     */
    static async getUserPartnerships(userId: string): Promise<AccountabilityPartnership[]> {
        try {
            const partnerships = await prisma.accountabilityPartnership.findMany({
                where: { userId, status: 'Active' },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profilePicture: true
                        }
                    },
                    partner: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profilePicture: true
                        }
                    }
                },
                orderBy: { startDate: 'desc' }
            });
            
            return partnerships as unknown as AccountabilityPartnership[];
        } catch (error) {
            console.error("Error fetching user partnerships:", error);
            return [];
        }
    }
    
    /**
     * Update partnership settings
     */
    static async updatePartnership(partnershipId: string, userId: string, updateData: {
        checkInFrequency?: 'Daily' | 'Weekly' | 'Bi-weekly';
        status?: 'Active' | 'Paused' | 'Ended';
        sharedGoals?: string[];
    }): Promise<AccountabilityPartnership> {
        try {
            // Verify partnership ownership
            const partnership = await prisma.accountabilityPartnership.findUnique({
                where: { id: partnershipId, userId }
            });
            
            if (!partnership) {
                throw new Error("Partnership not found");
            }
            
            const updatedPartnership = await prisma.accountabilityPartnership.update({
                where: { id: partnershipId },
                data: {
                    ...updateData,
                    sharedGoals: updateData.sharedGoals ? JSON.stringify(updateData.sharedGoals) : undefined,
                    endDate: updateData.status === 'Ended' ? new Date() : undefined
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
                    partner: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profilePicture: true
                        }
                    }
                }
            });
            
            return updatedPartnership as unknown as AccountabilityPartnership;
        } catch (error) {
            console.error("Error updating partnership:", error);
            throw error;
        }
    }
    
    /**
     * Record check-in
     */
    static async recordCheckIn(partnershipId: string, userId: string): Promise<AccountabilityPartnership> {
        try {
            // Verify partnership ownership
            const partnership = await prisma.accountabilityPartnership.findUnique({
                where: { id: partnershipId, userId }
            });
            
            if (!partnership) {
                throw new Error("Partnership not found");
            }
            
            const updatedPartnership = await prisma.accountabilityPartnership.update({
                where: { id: partnershipId },
                data: {
                    lastCheckIn: new Date()
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
                    partner: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profilePicture: true
                        }
                    }
                }
            });
            
            return updatedPartnership as unknown as AccountabilityPartnership;
        } catch (error) {
            console.error("Error recording check-in:", error);
            throw error;
        }
    }
    
    /**
     * Get partnership analytics and progress
     */
    static async getPartnershipAnalytics(userId: string): Promise<any> {
        try {
            const partnerships = await prisma.accountabilityPartnership.findMany({
                where: { userId },
                include: {
                    partner: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });
            
            const totalPartnerships = partnerships.length;
            const activePartnerships = partnerships.filter(p => p.status === 'Active').length;
            const pausedPartnerships = partnerships.filter(p => p.status === 'Paused').length;
            
            // Check-in frequency analysis
            const checkInStats = partnerships.reduce((acc, partnership) => {
                const frequency = partnership.checkInFrequency;
                acc[frequency] = (acc[frequency] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            
            // Recent check-ins (last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const recentCheckIns = partnerships.filter(p => 
                p.lastCheckIn && p.lastCheckIn >= thirtyDaysAgo
            ).length;
            
            const checkInRate = totalPartnerships > 0 
                ? Math.round((recentCheckIns / totalPartnerships) * 100)
                : 0;
            
            return {
                totalPartnerships,
                activePartnerships,
                pausedPartnerships,
                checkInStats,
                recentCheckIns,
                checkInRate,
                thirtyDayCheckInCount: recentCheckIns
            };
        } catch (error) {
            console.error("Error fetching partnership analytics:", error);
            return {
                totalPartnerships: 0,
                activePartnerships: 0,
                pausedPartnerships: 0,
                checkInStats: {},
                recentCheckIns: 0,
                checkInRate: 0,
                thirtyDayCheckInCount: 0
            };
        }
    }
    
    /**
     * Get partner's progress data (for sharing)
     */
    static async getPartnerProgress(partnerId: string, requestingUserId: string): Promise<any> {
        try {
            // Verify they are partners
            const partnership = await prisma.accountabilityPartnership.findFirst({
                where: {
                    userId: requestingUserId,
                    partnerId: partnerId,
                    status: 'Active'
                }
            });
            
            if (!partnership) {
                throw new Error("Access denied: Not an accountability partner");
            }
            
            // Get partner's recent activity (last 7 days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            
            const [tasks, habits, goals] = await Promise.all([
                prisma.task.findMany({
                    where: {
                        userId: partnerId,
                        createdAt: { gte: sevenDaysAgo }
                    }
                }),
                prisma.habitCompletion.findMany({
                    where: {
                        habit: { userId: partnerId },
                        date: { gte: sevenDaysAgo }
                    },
                    include: { habit: true }
                }),
                prisma.goal.findMany({
                    where: {
                        userId: partnerId,
                        status: 'Active'
                    }
                })
            ]);
            
            // Calculate progress metrics
            const taskCompletionRate = tasks.length > 0 
                ? (tasks.filter(t => t.completed).length / tasks.length) * 100
                : 0;
                
            const habitCompletions = habits.length;
            const uniqueHabits = new Set(habits.map(h => h.habitId)).size;
            
            const goalProgress = goals.length > 0 
                ? goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length
                : 0;
            
            return {
                partnerId,
                taskCompletionRate: Math.round(taskCompletionRate),
                habitCompletions,
                uniqueHabits,
                goalProgress: Math.round(goalProgress),
                activeGoals: goals.length,
                recentTasks: tasks.length,
                lastActive: Math.max(
                    ...tasks.map(t => t.updatedAt.getTime()),
                    ...habits.map(h => h.date.getTime()),
                    Date.now() - (7 * 24 * 60 * 60 * 1000) // Default to 7 days ago
                )
            };
        } catch (error) {
            console.error("Error fetching partner progress:", error);
            throw error;
        }
    }
    
    /**
     * Remove accountability partner
     */
    static async removePartner(partnershipId: string, userId: string): Promise<void> {
        try {
            // Verify partnership ownership
            const partnership = await prisma.accountabilityPartnership.findUnique({
                where: { id: partnershipId, userId }
            });
            
            if (!partnership) {
                throw new Error("Partnership not found");
            }
            
            // Update partnership status to Ended
            await prisma.accountabilityPartnership.update({
                where: { id: partnershipId },
                data: {
                    status: 'Ended',
                    endDate: new Date()
                }
            });
            
            // Also end the reverse partnership
            const reversePartnership = await prisma.accountabilityPartnership.findFirst({
                where: {
                    userId: partnership.partnerId,
                    partnerId: userId
                }
            });
            
            if (reversePartnership) {
                await prisma.accountabilityPartnership.update({
                    where: { id: reversePartnership.id },
                    data: {
                        status: 'Ended',
                        endDate: new Date()
                    }
                });
            }
        } catch (error) {
            console.error("Error removing partner:", error);
            throw error;
        }
    }
    
    /**
     * Find potential accountability partners (matching algorithm)
     */
    static async findPotentialPartners(userId: string): Promise<any[]> {
        try {
            // Get current user's activity patterns
            const userActivity = await this.getUserActivityPatterns(userId);
            
            // Find users with similar goals or complementary habits
            const potentialPartners = await prisma.user.findMany({
                where: {
                    id: { not: userId },
                    // Exclude users who are already partners
                    accountabilityPartnerships: {
                        none: {
                            partnerId: userId
                        }
                    },
                    sentPartnershipRequests: {
                        none: {
                            recipientId: userId,
                            status: 'Pending'
                        }
                    }
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profilePicture: true,
                    goals: {
                        where: { status: 'Active' }
                    },
                    habits: true
                }
            });
            
            // Score potential partners based on compatibility
            const scoredPartners = potentialPartners.map(partner => {
                const compatibilityScore = this.calculateCompatibilityScore(userActivity, partner);
                return {
                    ...partner,
                    compatibilityScore,
                    commonGoals: this.findCommonGoals(userActivity.goals, partner.goals),
                    complementaryHabits: this.findComplementaryHabits(userActivity.habits, partner.habits)
                };
            });
            
            // Sort by compatibility score
            return scoredPartners
                .filter(partner => partner.compatibilityScore > 0.3) // Minimum threshold
                .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
                .slice(0, 10); // Top 10 matches
        } catch (error) {
            console.error("Error finding potential partners:", error);
            return [];
        }
    }
    
    /**
     * Helper methods for partner matching
     */
    private static async getUserActivityPatterns(userId: string) {
        const [goals, habits] = await Promise.all([
            prisma.goal.findMany({
                where: { userId, status: 'Active' }
            }),
            prisma.habit.findMany({
                where: { userId }
            })
        ]);
        
        return { goals, habits };
    }
    
    private static calculateCompatibilityScore(userActivity: any, partner: any): number {
        let score = 0;
        
        // Goal alignment (25% weight)
        const commonGoals = this.findCommonGoals(userActivity.goals, partner.goals);
        score += (commonGoals.length / Math.max(userActivity.goals.length, 1)) * 0.25;
        
        // Habit complementarity (25% weight)
        const complementaryHabits = this.findComplementaryHabits(userActivity.habits, partner.habits);
        score += (complementaryHabits.length / Math.max(userActivity.habits.length, 1)) * 0.25;
        
        // Category overlap (25% weight)
        const userCategories = new Set(userActivity.goals.map((g: any) => g.category));
        const partnerCategories = new Set(partner.goals.map((g: any) => g.category));
        const categoryOverlap = [...userCategories].filter(cat => partnerCategories.has(cat)).length;
        score += (categoryOverlap / Math.max(userCategories.size, 1)) * 0.25;
        
        // Activity level similarity (25% weight)
        const userActivityLevel = userActivity.habits.length;
        const partnerActivityLevel = partner.habits.length;
        const levelDifference = Math.abs(userActivityLevel - partnerActivityLevel);
        const maxLevel = Math.max(userActivityLevel, partnerActivityLevel);
        score += (maxLevel > 0 ? (1 - levelDifference / maxLevel) * 0.25 : 0.25);
        
        return Math.min(score, 1); // Cap at 1.0
    }
    
    private static findCommonGoals(userGoals: any[], partnerGoals: any[]): any[] {
        return userGoals.filter(ug => 
            partnerGoals.some(pg => 
                ug.category === pg.category || 
                ug.title.toLowerCase().includes(pg.title.toLowerCase()) ||
                pg.title.toLowerCase().includes(ug.title.toLowerCase())
            )
        );
    }
    
    private static findComplementaryHabits(userHabits: any[], partnerHabits: any[]): any[] {
        // Look for habits that complement each other (e.g., morning vs evening routines)
        return userHabits.filter(uh => 
            partnerHabits.some(ph => 
                (uh.frequency !== ph.frequency) || // Different frequencies
                (uh.category !== ph.category) ||  // Different categories
                (uh.name !== ph.name)            // Different names
            )
        );
    }
}
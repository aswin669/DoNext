import { Goal, GoalMilestone } from "@/types";
import prisma from "./prisma";
import { AuthService } from "./auth-service";

/**
 * SMART Goal Management Service
 * Handles goal creation, tracking, and progress management
 */
export class SmartGoalService {
    
    /**
     * Create a new SMART goal
     */
    static async createGoal(goalData: Record<string, unknown>, userId: string): Promise<Goal> {
        try {
            // Validate SMART criteria
            const validatedGoal = this.validateSmartCriteria(goalData);
            
            // Calculate initial progress
            const initialProgress = validatedGoal.currentValue && validatedGoal.targetValue
                ? Math.min(100, (validatedGoal.currentValue / validatedGoal.targetValue) * 100)
                : 0;
            
            const goal = await prisma.goal.create({
                data: {
                    ...validatedGoal,
                    userId,
                    progress: initialProgress,
                    startDate: new Date(),
                    status: 'Active'
                }
            });
            
            return goal as Goal;
        } catch (error) {
            console.error("Error creating goal:", error);
            throw new Error("Failed to create goal");
        }
    }
    
    /**
     * Update goal progress
     */
    static async updateGoalProgress(goalId: string, userId: string, updateData: {
        currentValue?: number;
        status?: 'Active' | 'Completed' | 'Archived';
        specific?: string;
        measurable?: string;
        relevant?: string;
        timeBound?: Date;
    }): Promise<Goal> {
        try {
            // Verify goal ownership
            const goal = await prisma.goal.findUnique({
                where: { id: goalId, userId }
            });
            
            if (!goal) {
                throw new Error("Goal not found");
            }
            
            // Calculate new progress
            let newProgress = goal.progress;
            if (updateData.currentValue !== undefined && goal.targetValue) {
                newProgress = Math.min(100, (updateData.currentValue / goal.targetValue) * 100);
            }
            
            // Check if goal is completed
            let status = updateData.status || goal.status;
            let completedAt = goal.completedAt;
            
            if (newProgress >= 100 && status !== 'Archived') {
                status = 'Completed';
                completedAt = new Date();
            }
            
            const updatedGoal = await prisma.goal.update({
                where: { id: goalId },
                data: {
                    ...updateData,
                    progress: newProgress,
                    status,
                    completedAt
                }
            });
            
            return updatedGoal as Goal;
        } catch (error) {
            console.error("Error updating goal progress:", error);
            throw new Error("Failed to update goal progress");
        }
    }
    
    /**
     * Create a milestone for a goal
     */
    static async createMilestone(goalId: string, userId: string, milestoneData: {
        title: string;
        description?: string;
        targetValue: number;
        deadline?: Date;
    }): Promise<GoalMilestone> {
        try {
            // Verify goal ownership
            const goal = await prisma.goal.findUnique({
                where: { id: goalId, userId }
            });
            
            if (!goal) {
                throw new Error("Goal not found");
            }
            
            const milestone = await prisma.goalMilestone.create({
                data: {
                    ...milestoneData,
                    goalId
                }
            });
            
            return milestone as GoalMilestone;
        } catch (error) {
            console.error("Error creating milestone:", error);
            throw new Error("Failed to create milestone");
        }
    }
    
    /**
     * Update milestone progress
     */
    static async updateMilestoneProgress(milestoneId: string, userId: string, updateData: {
        currentValue?: number;
        completed?: boolean;
    }): Promise<GoalMilestone> {
        try {
            // Get milestone with goal relationship
            const milestone = await prisma.goalMilestone.findUnique({
                where: { id: milestoneId },
                include: { goal: true }
            });
            
            if (!milestone || milestone.goal.userId !== userId) {
                throw new Error("Milestone not found");
            }
            
            // Auto-complete if target reached
            let completed = updateData.completed || milestone.completed;
            let completedAt = milestone.completedAt;
            
            if (updateData.currentValue !== undefined && updateData.currentValue >= milestone.targetValue) {
                completed = true;
                completedAt = new Date();
            }
            
            const updatedMilestone = await prisma.goalMilestone.update({
                where: { id: milestoneId },
                data: {
                    ...updateData,
                    completed,
                    completedAt
                }
            });
            
            // Update parent goal progress
            await this.updateGoalFromMilestones(milestone.goalId, userId);
            
            return updatedMilestone as GoalMilestone;
        } catch (error) {
            console.error("Error updating milestone:", error);
            throw new Error("Failed to update milestone");
        }
    }
    
    /**
     * Get user's goals with progress tracking
     */
    static async getUserGoals(userId: string, status?: 'Active' | 'Completed' | 'Archived'): Promise<Goal[]> {
        try {
            const whereClause: Record<string, unknown> = { userId };
            if (status) {
                whereClause.status = status;
            }
            
            const goals = await prisma.goal.findMany({
                where: whereClause,
                include: {
                    milestones: {
                        orderBy: { deadline: 'asc' }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
            
            return goals as Goal[];
        } catch (error) {
            console.error("Error fetching user goals:", error);
            return [];
        }
    }
    
    /**
     * Get goal statistics and analytics
     */
    static async getGoalAnalytics(userId: string): Promise<Record<string, unknown>> {
        try {
            const goals = await prisma.goal.findMany({
                where: { userId },
                include: { milestones: true }
            });
            
            const totalGoals = goals.length;
            const activeGoals = goals.filter(g => g.status === 'Active').length;
            const completedGoals = goals.filter(g => g.status === 'Completed').length;
            const archivedGoals = goals.filter(g => g.status === 'Archived').length;
            
            // Progress statistics
            const averageProgress = totalGoals > 0 
                ? goals.reduce((sum, goal) => sum + goal.progress, 0) / totalGoals
                : 0;
                
            // Milestone statistics
            const totalMilestones = goals.reduce((sum, goal) => sum + goal.milestones.length, 0);
            const completedMilestones = goals.reduce((sum, goal) => 
                sum + goal.milestones.filter(m => m.completed).length, 0
            );
            
            const milestoneCompletionRate = totalMilestones > 0 
                ? (completedMilestones / totalMilestones) * 100
                : 0;
            
            // Category analysis
            const categories = goals.reduce((acc: Record<string, number>, goal) => {
                const category = goal.category || 'Uncategorized';
                acc[category] = (acc[category] || 0) + 1;
                return acc;
            }, {});
            
            // Priority distribution
            const priorityDistribution = goals.reduce((acc: Record<string, number>, goal) => {
                acc[goal.priority] = (acc[goal.priority] || 0) + 1;
                return acc;
            }, {});
            
            // Time-based analysis
            const overdueGoals = goals.filter(goal => 
                goal.deadline && new Date(goal.deadline) < new Date() && goal.status === 'Active'
            ).length;
            
            return {
                totalGoals,
                activeGoals,
                completedGoals,
                archivedGoals,
                averageProgress: Math.round(averageProgress),
                totalMilestones,
                completedMilestones,
                milestoneCompletionRate: Math.round(milestoneCompletionRate),
                categories,
                priorityDistribution,
                overdueGoals,
                completionRate: totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0
            };
        } catch (error) {
            console.error("Error fetching goal analytics:", error);
            return {
                totalGoals: 0,
                activeGoals: 0,
                completedGoals: 0,
                archivedGoals: 0,
                averageProgress: 0,
                totalMilestones: 0,
                completedMilestones: 0,
                milestoneCompletionRate: 0,
                categories: {},
                priorityDistribution: {},
                overdueGoals: 0,
                completionRate: 0
            };
        }
    }
    
    /**
     * Validate SMART criteria for goal creation
     */
    private static validateSmartCriteria(goalData: any): any {
        const validated: any = { ...goalData };
        
        // S - Specific: Must have a title
        if (!validated.title?.trim()) {
            throw new Error("Goal title is required");
        }
        
        // M - Measurable: Must have target value and unit if measurable
        if (validated.measurable && (!validated.targetValue || !validated.unit)) {
            throw new Error("Measurable goals must have target value and unit");
        }
        
        // A - Achievable: Validate realistic targets
        if (validated.targetValue && validated.targetValue <= 0) {
            throw new Error("Target value must be positive");
        }
        
        // R - Relevant: Must have relevance statement
        if (!validated.relevant?.trim()) {
            // Default relevance if not provided
            validated.relevant = "Personal development goal";
        }
        
        // T - Time-bound: Must have deadline
        if (!validated.deadline) {
            throw new Error("Goal must have a deadline");
        }
        
        if (new Date(validated.deadline) <= new Date()) {
            throw new Error("Deadline must be in the future");
        }
        
        return validated;
    }
    
    /**
     * Update goal progress based on milestone completion
     */
    private static async updateGoalFromMilestones(goalId: string, userId: string): Promise<void> {
        try {
            const goal = await prisma.goal.findUnique({
                where: { id: goalId, userId },
                include: { milestones: true }
            });
            
            if (!goal) return;
            
            // Calculate progress from milestones
            const completedMilestones = goal.milestones.filter(m => m.completed).length;
            const totalMilestones = goal.milestones.length;
            
            if (totalMilestones > 0) {
                const milestoneProgress = (completedMilestones / totalMilestones) * 100;
                
                // Update goal progress
                await prisma.goal.update({
                    where: { id: goalId },
                    data: { progress: milestoneProgress }
                });
            }
        } catch (error) {
            console.error("Error updating goal from milestones:", error);
        }
    }
    
    /**
     * Get overdue goals that need attention
     */
    static async getOverdueGoals(userId: string): Promise<Goal[]> {
        try {
            const now = new Date();
            const goals = await prisma.goal.findMany({
                where: {
                    userId,
                    status: 'Active',
                    deadline: { lt: now }
                },
                include: { milestones: true },
                orderBy: { deadline: 'asc' }
            });
            
            return goals as Goal[];
        } catch (error) {
            console.error("Error fetching overdue goals:", error);
            return [];
        }
    }
    
    /**
     * Get upcoming goals with approaching deadlines
     */
    static async getUpcomingGoals(userId: string, days: number = 7): Promise<Goal[]> {
        try {
            const now = new Date();
            const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
            
            const goals = await prisma.goal.findMany({
                where: {
                    userId,
                    status: 'Active',
                    deadline: {
                        gte: now,
                        lte: futureDate
                    }
                },
                include: { milestones: true },
                orderBy: { deadline: 'asc' }
            });
            
            return goals as Goal[];
        } catch (error) {
            console.error("Error fetching upcoming goals:", error);
            return [];
        }
    }
}
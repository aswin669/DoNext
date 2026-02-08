import { Task, TaskPriorityFactors, SmartPriorityResult, EisenhowerMatrixQuadrant } from "@/types";
import prisma from "./prisma";
import { AuthService } from "./auth-service";

/**
 * Smart Task Prioritization Service
 * AI-powered task prioritization based on multiple factors
 */
export class TaskPrioritizationService {
    
    /**
     * Calculate smart priority score for a task
     */
    static async calculateSmartPriority(task: Task, userId: string): Promise<SmartPriorityResult> {
        try {
            // Get user's productivity patterns
            const userPatterns = await this.getUserProductivityPatterns(userId);
            
            // Calculate priority factors
            const factors: TaskPriorityFactors = {
                deadlineUrgency: this.calculateDeadlineUrgency(task),
                importanceScore: this.calculateImportanceScore(task),
                estimatedEffort: this.calculateEffortScore(task),
                completionLikelihood: this.calculateCompletionLikelihood(task, userPatterns),
                userProductivityPattern: userPatterns.efficiencyScore
            };
            
            // Calculate weighted priority score (0-100)
            const priorityScore = this.calculateWeightedScore(factors);
            
            // Determine recommended action based on Eisenhower Matrix principles
            const recommendedAction = this.determineRecommendedAction(factors);
            
            return {
                taskId: task.id,
                priorityScore,
                factors,
                recommendedAction
            };
        } catch (error) {
            console.error("Error calculating smart priority:", error);
            // Fallback to basic priority calculation
            return {
                taskId: task.id,
                priorityScore: task.priority === 'High' ? 80 : task.priority === 'Medium' ? 50 : 20,
                factors: {
                    deadlineUrgency: 0,
                    importanceScore: 0,
                    estimatedEffort: 0,
                    completionLikelihood: 0,
                    userProductivityPattern: 0
                },
                recommendedAction: 'schedule'
            };
        }
    }
    
    /**
     * Calculate deadline urgency factor (0-100)
     */
    private static calculateDeadlineUrgency(task: Task): number {
        if (!task.deadline) return 30; // Default medium urgency
        
        const now = new Date();
        const timeUntilDeadline = task.deadline.getTime() - now.getTime();
        const daysUntilDeadline = timeUntilDeadline / (1000 * 60 * 60 * 24);
        
        if (daysUntilDeadline <= 0) return 100; // Overdue
        if (daysUntilDeadline <= 1) return 90;  // Due today/tomorrow
        if (daysUntilDeadline <= 3) return 75;  // Due this week
        if (daysUntilDeadline <= 7) return 50;  // Due this week
        if (daysUntilDeadline <= 14) return 25; // Due in two weeks
        return 10; // Far future
    }
    
    /**
     * Calculate importance score based on task properties (0-100)
     */
    private static calculateImportanceScore(task: Task): number {
        let score = 0;
        
        // Base priority
        switch (task.priority) {
            case 'High': score += 60; break;
            case 'Medium': score += 30; break;
            case 'Low': score += 10; break;
        }
        
        // Category importance
        const importantCategories = ['Important', 'Work', 'Urgent', 'Critical'];
        if (task.category && importantCategories.includes(task.category)) {
            score += 20;
        }
        
        // Task type importance
        const importantTypes = ['Meeting', 'Milestone', 'Deadline'];
        if (task.type && importantTypes.includes(task.type)) {
            score += 15;
        }
        
        // Has deadline (indicates importance)
        if (task.deadline) {
            score += 10;
        }
        
        return Math.min(score, 100);
    }
    
    /**
     * Calculate estimated effort score (0-100, lower = easier)
     */
    private static calculateEffortScore(task: Task): number {
        if (task.estimatedTime) {
            // Convert minutes to effort score (logarithmic scale)
            const hours = task.estimatedTime / 60;
            if (hours <= 0.5) return 90;    // Very easy
            if (hours <= 1) return 75;      // Easy
            if (hours <= 2) return 60;      // Moderate
            if (hours <= 4) return 40;      // Challenging
            if (hours <= 8) return 25;      // Difficult
            return 10;                      // Very difficult
        }
        
        // Default based on priority
        switch (task.priority) {
            case 'High': return 40;
            case 'Medium': return 60;
            case 'Low': return 80;
            default: return 50;
        }
    }
    
    /**
     * Calculate completion likelihood based on user patterns (0-100)
     */
    private static calculateCompletionLikelihood(task: Task, userPatterns: Record<string, unknown>): number {
        // Base likelihood
        let likelihood = 60;
        
        // Adjust based on task complexity and user efficiency
        const effortScore = this.calculateEffortScore(task);
        likelihood += (userPatterns.completionRate - 50) * 0.3; // User's historical completion rate
        likelihood += (effortScore - 50) * 0.2; // Task difficulty factor
        
        // Time of day factor (if task has time)
        if (task.time) {
            const taskHour = parseInt(task.time.split(':')[0]);
            const isOptimalTime = taskHour >= 9 && taskHour <= 16; // Business hours
            likelihood += isOptimalTime ? 10 : -5;
        }
        
        return Math.max(10, Math.min(90, likelihood)); // Clamp between 10-90
    }
    
    /**
     * Calculate weighted priority score
     */
    private static calculateWeightedScore(factors: TaskPriorityFactors): number {
        // Weighted calculation: higher weights for more critical factors
        const score = (
            factors.deadlineUrgency * 0.3 +      // 30% weight
            factors.importanceScore * 0.25 +     // 25% weight
            factors.estimatedEffort * 0.15 +     // 15% weight
            factors.completionLikelihood * 0.2 + // 20% weight
            factors.userProductivityPattern * 0.1 // 10% weight
        );
        
        return Math.round(score);
    }
    
    /**
     * Determine recommended action based on Eisenhower Matrix principles
     */
    private static determineRecommendedAction(factors: TaskPriorityFactors): 'do_now' | 'schedule' | 'delegate' | 'eliminate' {
        const isUrgent = factors.deadlineUrgency > 60;
        const isImportant = factors.importanceScore > 50;
        
        if (isUrgent && isImportant) return 'do_now';
        if (!isUrgent && isImportant) return 'schedule';
        if (isUrgent && !isImportant) return 'delegate';
        return 'eliminate';
    }
    
    /**
     * Get user's productivity patterns for personalization
     */
    private static async getUserProductivityPatterns(userId: string): Promise<any> {
        try {
            // Get user's historical task completion data
            const completedTasks = await prisma.task.count({
                where: { 
                    userId,
                    completed: true,
                    updatedAt: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                    }
                }
            });
            
            const totalTasks = await prisma.task.count({
                where: { 
                    userId,
                    updatedAt: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    }
                }
            });
            
            // Get completion rate
            const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 50;
            
            // Get average task completion time
            const tasksWithTime = await prisma.task.findMany({
                where: {
                    userId,
                    completed: true,
                    actualTime: { not: null },
                    updatedAt: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    }
                },
                select: { actualTime: true }
            });
            
            const avgTime = tasksWithTime.length > 0 
                ? tasksWithTime.reduce((sum, task) => sum + (task.actualTime || 0), 0) / tasksWithTime.length
                : 60; // Default 60 minutes
            
            // Efficiency score based on time estimation accuracy
            const efficiencyScore = Math.max(30, Math.min(90, 100 - Math.abs(avgTime - 60) / 2));
            
            return {
                completionRate,
                averageTaskTime: avgTime,
                efficiencyScore,
                totalTasks,
                completedTasks
            };
        } catch (error) {
            console.error("Error getting user patterns:", error);
            return {
                completionRate: 50,
                averageTaskTime: 60,
                efficiencyScore: 50,
                totalTasks: 0,
                completedTasks: 0
            };
        }
    }
    
    /**
     * Generate Eisenhower Matrix quadrants for tasks
     */
    static async generateEisenhowerMatrix(tasks: Task[], userId: string): Promise<EisenhowerMatrixQuadrant[]> {
        const quadrants: EisenhowerMatrixQuadrant[] = [
            { quadrant: 'urgent_important', tasks: [] },
            { quadrant: 'not_urgent_important', tasks: [] },
            { quadrant: 'urgent_not_important', tasks: [] },
            { quadrant: 'not_urgent_not_important', tasks: [] }
        ];
        
        // Calculate priority for each task
        const prioritizedTasks = await Promise.all(
            tasks.map(async task => {
                const priorityResult = await this.calculateSmartPriority(task, userId);
                return { ...task, priorityResult };
            })
        );
        
        // Categorize tasks into quadrants
        for (const task of prioritizedTasks) {
            const { factors } = task.priorityResult;
            const isUrgent = factors.deadlineUrgency > 60;
            const isImportant = factors.importanceScore > 50;
            
            if (isUrgent && isImportant) {
                quadrants[0].tasks.push(task);
            } else if (!isUrgent && isImportant) {
                quadrants[1].tasks.push(task);
            } else if (isUrgent && !isImportant) {
                quadrants[2].tasks.push(task);
            } else {
                quadrants[3].tasks.push(task);
            }
        }
        
        // Sort tasks within each quadrant by priority score
        quadrants.forEach(quadrant => {
            quadrant.tasks.sort((a, b) => {
                const aScore = (a as any).priorityResult?.priorityScore || 0;
                const bScore = (b as any).priorityResult?.priorityScore || 0;
                return bScore - aScore;
            });
        });
        
        return quadrants;
    }
    
    /**
     * Get personalized task recommendations
     */
    static async getTaskRecommendations(userId: string, limit: number = 5): Promise<Task[]> {
        try {
            const user = await AuthService.getCurrentUser();
            if (!user) return [];
            
            // Get incomplete tasks
            const tasks = await prisma.task.findMany({
                where: {
                    userId: user.id,
                    completed: false
                },
                orderBy: { createdAt: 'desc' }
            });
            
            // Calculate smart priorities
            const prioritizedTasks = await Promise.all(
                tasks.map(async task => {
                    const priorityResult = await this.calculateSmartPriority(task, userId);
                    return { ...task, priorityResult };
                })
            );
            
            // Sort by priority score and return top recommendations
            return prioritizedTasks
                .sort((a, b) => (b.priorityResult?.priorityScore || 0) - (a.priorityResult?.priorityScore || 0))
                .slice(0, limit)
                .map(task => {
                    // Remove the priorityResult property for clean return
                    const { priorityResult, ...cleanTask } = task;
                    return cleanTask as Task;
                });
        } catch (error) {
            console.error("Error getting task recommendations:", error);
            return [];
        }
    }
}
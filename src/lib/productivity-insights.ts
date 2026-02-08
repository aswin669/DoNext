import prisma from "./prisma";
import { AuthService } from "./auth-service";

/**
 * Productivity Insights Service
 * ML-based pattern analysis for personalized productivity recommendations
 */
export class ProductivityInsightsService {
    
    /**
     * Generate comprehensive productivity insights for a user
     */
    static async generateUserInsights(userId: string) {
        try {
            // Gather user data for analysis
            const [tasks, habits, completions, pomodoroSessions] = await Promise.all([
                prisma.task.findMany({
                    where: { userId, createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } }
                }),
                prisma.habit.findMany({
                    where: { userId },
                    include: { completions: true }
                }),
                prisma.habitCompletion.findMany({
                    where: { 
                        habit: { userId },
                        date: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
                    },
                    include: { habit: true }
                }),
                // Get real pomodoro session data
                // @ts-expect-error - prisma types may not be fully generated
                prisma.pomodoroSession.findMany({
                    where: { 
                        userId,
                        completedAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
                    }
                }).catch(() => []) // Fallback if table doesn't exist
            ]);
            
            // Analyze patterns
            const insights = {
                productivityPatterns: this.analyzeProductivityPatterns(tasks, habits, completions),
                timeAnalysis: this.analyzeTimePatterns(completions, pomodoroSessions),
                habitAnalysis: this.analyzeHabitPatterns(habits),
                recommendationEngine: this.generateRecommendations(tasks, habits, completions),
                performanceMetrics: this.calculatePerformanceMetrics(tasks, habits, completions)
            };
            
            return insights;
        } catch (error) {
            console.error("Error generating productivity insights:", error);
            return this.getDefaultInsights();
        }
    }
    
    /**
     * Analyze productivity patterns and trends
     */
    private static analyzeProductivityPatterns(tasks: Array<Record<string, unknown>>, habits: Array<Record<string, unknown>>, completions: Array<Record<string, unknown>>) {
        // Calculate completion rates
        const taskCompletionRate = tasks.length > 0 
            ? (tasks.filter(t => t.completed).length / tasks.length) * 100 
            : 0;
            
        const habitCompletionRate = completions.length > 0 && habits.length > 0
            ? (new Set(completions.map(c => c.habitId)).size / habits.length) * 100
            : 0;
        
        // Analyze daily patterns
        const dailyCompletions = this.groupByDay(completions);
        const mostProductiveDay = this.findMostProductiveDay(dailyCompletions);
        
        // Analyze consistency
        const consistencyScore = this.calculateConsistencyScore(dailyCompletions);
        
        return {
            taskCompletionRate: Math.round(taskCompletionRate),
            habitCompletionRate: Math.round(habitCompletionRate),
            mostProductiveDay,
            consistencyScore: Math.round(consistencyScore),
            totalActivities: tasks.length + completions.length,
            activeDays: Object.keys(dailyCompletions).length
        };
    }
    
    /**
     * Analyze time-based patterns
     */
    private static analyzeTimePatterns(completions: Array<Record<string, unknown>>, pomodoroSessions: Array<Record<string, unknown>>) {
        // Analyze completion times
        const completionHours = completions.map(c => new Date(c.date).getHours());
        const mostActiveHour = this.findMostFrequent(completionHours);
        
        // Analyze pomodoro patterns
        const avgSessionLength = pomodoroSessions.length > 0 
            ? pomodoroSessions.reduce((sum, session) => sum + session.duration, 0) / pomodoroSessions.length
            : 0;
            
        const sessionsPerDay = pomodoroSessions.length > 7 
            ? pomodoroSessions.length / 7
            : 0;
        
        return {
            mostProductiveHour: mostActiveHour,
            averageSessionLength: Math.round(avgSessionLength),
            sessionsPerDay: Math.round(sessionsPerDay * 10) / 10,
            focusTimeTotal: pomodoroSessions.reduce((sum, session) => sum + session.duration, 0),
            preferredTimeBlocks: this.identifyTimeBlocks(completionHours)
        };
    }
    
    /**
     * Analyze habit patterns and effectiveness
     */
    private static analyzeHabitPatterns(habits: Array<Record<string, unknown>>) {
        // Categorize habits by frequency and completion rate
        const habitCategories: Record<string, any[]> = {};
        
        habits.forEach(habit => {
            const category = habit.category || 'Uncategorized';
            if (!habitCategories[category]) {
                habitCategories[category] = [];
            }
            
            const completionRate = habit.completions.length > 0 
                ? (habit.completions.filter((c: any) => 
                    new Date(c.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                ).length / 30) * 100
                : 0;
                
            habitCategories[category].push({
                name: habit.name,
                icon: habit.icon,
                completionRate: Math.round(completionRate),
                streak: this.calculateCurrentStreak(habit.completions),
                frequency: habit.frequency
            });
        });
        
        // Find best performing categories
        const categoryPerformance = Object.entries(habitCategories).map(([category, habits]) => ({
            category,
            averageCompletionRate: habits.length > 0 
                ? Math.round(habits.reduce((sum, h) => sum + h.completionRate, 0) / habits.length)
                : 0,
            habitCount: habits.length
        }));
        
        return {
            categoryPerformance: categoryPerformance.sort((a, b) => b.averageCompletionRate - a.averageCompletionRate),
            habitCategories,
            bestPerformingCategory: categoryPerformance[0]?.category || 'None',
            worstPerformingCategory: categoryPerformance[categoryPerformance.length - 1]?.category || 'None'
        };
    }
    
    /**
     * Generate personalized recommendations
     */
    private static generateRecommendations(tasks: Array<Record<string, unknown>>, habits: Array<Record<string, unknown>>, completions: Array<Record<string, unknown>>) {
        const recommendations: string[] = [];
        
        // Task-based recommendations
        const incompleteTasks = tasks.filter(t => !t.completed);
        if (incompleteTasks.length > 5) {
            recommendations.push("You have many pending tasks. Try breaking them into smaller subtasks using the Eisenhower Matrix approach.");
        }
        
        if (tasks.length > 0) {
            const highPriorityTasks = tasks.filter(t => t.priority === 'High' && !t.completed);
            if (highPriorityTasks.length > 3) {
                recommendations.push("Focus on your high-priority tasks first. Consider using the Pomodoro technique for sustained focus.");
            }
        }
        
        // Habit-based recommendations
        const recentCompletions = completions.filter(c => 
            new Date(c.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        );
        
        if (recentCompletions.length < 10) {
            recommendations.push("Your habit completion rate is low this week. Try scheduling specific times for your habits.");
        }
        
        // Time-based recommendations
        const completionHours = completions.map(c => new Date(c.date).getHours());
        const morningCompletions = completionHours.filter(h => h >= 6 && h <= 11).length;
        const eveningCompletions = completionHours.filter(h => h >= 17 && h <= 22).length;
        
        if (morningCompletions > eveningCompletions * 2) {
            recommendations.push("You're most productive in the morning. Schedule your most challenging tasks for this time.");
        } else if (eveningCompletions > morningCompletions * 2) {
            recommendations.push("You're more active in the evening. Consider adjusting your schedule to leverage this energy.");
        }
        
        // Consistency recommendations
        const dailyCompletions = this.groupByDay(completions);
        const consistency = this.calculateConsistencyScore(dailyCompletions);
        
        if (consistency < 60) {
            recommendations.push("Work on building consistency by setting up time blocks for your daily activities.");
        }
        
        return recommendations.slice(0, 5); // Limit to 5 most relevant recommendations
    }
    
    /**
     * Calculate performance metrics
     */
    private static calculatePerformanceMetrics(tasks: any[], habits: any[], completions: any[]) {
        // Productivity score (0-100)
        const taskCompletionRate = tasks.length > 0 
            ? (tasks.filter(t => t.completed).length / tasks.length) * 100 
            : 50;
            
        const recentCompletions = completions.filter(c => 
            new Date(c.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        );
        
        const habitConsistency = habits.length > 0 
            ? (new Set(recentCompletions.map(c => c.habitId)).size / habits.length) * 100
            : 50;
            
        const productivityScore = Math.round((taskCompletionRate * 0.6 + habitConsistency * 0.4));
        
        // Growth metrics
        const lastWeekCompletions = completions.filter(c => 
            new Date(c.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) &&
            new Date(c.date) < new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length;
        
        const thisWeekCompletions = completions.filter(c => 
            new Date(c.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length;
        
        const weeklyGrowth = lastWeekCompletions > 0 
            ? Math.round(((thisWeekCompletions - lastWeekCompletions) / lastWeekCompletions) * 100)
            : 0;
        
        return {
            productivityScore,
            weeklyGrowth,
            tasksCompleted: tasks.filter(t => t.completed).length,
            habitsMaintained: new Set(recentCompletions.map(c => c.habitId)).size,
            totalCompletions: completions.length
        };
    }
    
    // Helper methods
    private static groupByDay(completions: any[]) {
        const grouped: Record<string, any[]> = {};
        completions.forEach(completion => {
            const date = new Date(completion.date).toISOString().split('T')[0];
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(completion);
        });
        return grouped;
    }
    
    private static findMostProductiveDay(dailyCompletions: Record<string, any[]>) {
        let maxCount = 0;
        let mostProductiveDay = 'Monday';
        
        Object.entries(dailyCompletions).forEach(([date, completions]) => {
            if (completions.length > maxCount) {
                maxCount = completions.length;
                const day = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
                mostProductiveDay = day;
            }
        });
        
        return mostProductiveDay;
    }
    
    private static calculateConsistencyScore(dailyCompletions: Record<string, any[]>) {
        const dates = Object.keys(dailyCompletions).sort();
        if (dates.length === 0) return 0;
        
        const activeDays = dates.length;
        const totalDays = this.daysBetweenDates(dates[0], dates[dates.length - 1]) + 1;
        
        return (activeDays / totalDays) * 100;
    }
    
    private static daysBetweenDates(startDate: string, endDate: string) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }
    
    private static findMostFrequent(numbers: number[]) {
        if (numbers.length === 0) return 9; // Default to morning
        
        const frequency: Record<number, number> = {};
        numbers.forEach(num => {
            frequency[num] = (frequency[num] || 0) + 1;
        });
        
        return Object.entries(frequency)
            .sort(([,a], [,b]) => b - a)[0][0];
    }
    
    private static identifyTimeBlocks(hours: number[]) {
        const blocks = [
            { name: 'Early Morning', start: 5, end: 9, count: 0 },
            { name: 'Morning', start: 9, end: 12, count: 0 },
            { name: 'Afternoon', start: 12, end: 17, count: 0 },
            { name: 'Evening', start: 17, end: 21, count: 0 },
            { name: 'Night', start: 21, end: 5, count: 0 }
        ];
        
        hours.forEach(hour => {
            const block = blocks.find(b => 
                b.end > b.start 
                    ? hour >= b.start && hour < b.end
                    : hour >= b.start || hour < b.end
            );
            if (block) block.count++;
        });
        
        return blocks
            .filter(b => b.count > 0)
            .sort((a, b) => b.count - a.count)
            .map(b => b.name);
    }
    
    private static calculateCurrentStreak(completions: any[]) {
        if (completions.length === 0) return 0;
        
        const sortedCompletions = completions
            .map(c => new Date(c.date).toISOString().split('T')[0])
            .sort()
            .reverse();
        
        let streak = 1;
        const today = new Date().toISOString().split('T')[0];
        
        // Check if completed today
        if (!sortedCompletions.includes(today)) {
            // Check yesterday
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            if (!sortedCompletions.includes(yesterday)) {
                return 0;
            }
        }
        
        for (let i = 1; i < sortedCompletions.length; i++) {
            const currentDate = new Date(sortedCompletions[i]);
            const previousDate = new Date(sortedCompletions[i - 1]);
            const dayDiff = (previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);
            
            if (Math.round(dayDiff) === 1) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }
    
    private static getDefaultInsights() {
        return {
            productivityPatterns: {
                taskCompletionRate: 0,
                habitCompletionRate: 0,
                mostProductiveDay: 'Monday',
                consistencyScore: 0,
                totalActivities: 0,
                activeDays: 0
            },
            timeAnalysis: {
                mostProductiveHour: 9,
                averageSessionLength: 0,
                sessionsPerDay: 0,
                focusTimeTotal: 0,
                preferredTimeBlocks: []
            },
            habitAnalysis: {
                categoryPerformance: [],
                habitCategories: {},
                bestPerformingCategory: 'None',
                worstPerformingCategory: 'None'
            },
            recommendationEngine: [
                "Start tracking your activities to receive personalized insights",
                "Try completing a few tasks to see productivity patterns emerge"
            ],
            performanceMetrics: {
                productivityScore: 50,
                weeklyGrowth: 0,
                tasksCompleted: 0,
                habitsMaintained: 0,
                totalCompletions: 0
            }
        };
    }
}
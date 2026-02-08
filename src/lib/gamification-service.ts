import prisma from "./prisma";

/**
 * Gamification Service
 * Handles achievements, streaks, badges, and gamification features
 */
export class GamificationService {
    
    /**
     * Calculate habit streaks
     */
    static async calculateHabitStreaks(userId: string): Promise<any[]> {
        try {
            const habits = await prisma.habit.findMany({
                where: { userId },
                include: {
                    completions: {
                        orderBy: { date: 'desc' }
                    },
                    streaks: {
                        orderBy: { startDate: 'desc' },
                        take: 1
                    }
                }
            });
            
            const streaks = habits.map(habit => {
                const completions = habit.completions;
                let currentStreak = 0;
                let longestStreak = 0;
                let tempStreak = 0;
                
                // Calculate streaks from completion history
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                for (let i = 0; i < 365; i++) {
                    const checkDate = new Date(today);
                    checkDate.setDate(checkDate.getDate() - i);
                    
                    const hasCompletion = completions.some(c => {
                        const compDate = new Date(c.date);
                        compDate.setHours(0, 0, 0, 0);
                        return compDate.getTime() === checkDate.getTime();
                    });
                    
                    if (hasCompletion) {
                        tempStreak++;
                        if (i === 0) currentStreak = tempStreak;
                    } else {
                        if (tempStreak > longestStreak) {
                            longestStreak = tempStreak;
                        }
                        tempStreak = 0;
                    }
                }
                
                return {
                    habitId: habit.id,
                    habitName: habit.name,
                    currentStreak,
                    longestStreak: Math.max(longestStreak, tempStreak),
                    totalCompletions: completions.length,
                    completionRate: Math.round((completions.length / 30) * 100) // Last 30 days
                };
            });
            
            return streaks;
        } catch (error) {
            console.error("Error calculating habit streaks:", error);
            return [];
        }
    }
    
    /**
     * Check and award achievements
     */
    static async checkAndAwardAchievements(userId: string): Promise<any[]> {
        try {
            const awardedAchievements: any[] = [];
            
            // Get user data
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    tasks: true,
                    habits: {
                        include: {
                            completions: true,
                            streaks: true
                        }
                    },
                    goals: true,
                    achievements: true
                }
            });
            
            if (!user) {
                throw new Error("User not found");
            }
            
            // Check various achievement conditions
            const achievements = [
                {
                    id: 'first_task',
                    name: 'Getting Started',
                    description: 'Complete your first task',
                    icon: '🚀',
                    condition: () => user.tasks.length > 0
                },
                {
                    id: 'task_master',
                    name: 'Task Master',
                    description: 'Complete 50 tasks',
                    icon: '✅',
                    condition: () => user.tasks.filter(t => t.completed).length >= 50
                },
                {
                    id: 'habit_starter',
                    name: 'Habit Starter',
                    description: 'Create your first habit',
                    icon: '🌱',
                    condition: () => user.habits.length > 0
                },
                {
                    id: 'habit_hero',
                    name: 'Habit Hero',
                    description: 'Maintain a 30-day streak',
                    icon: '🔥',
                    condition: () => user.habits.some(h => 
                        h.streaks.some(s => s.length >= 30)
                    )
                },
                {
                    id: 'goal_setter',
                    name: 'Goal Setter',
                    description: 'Create your first goal',
                    icon: '🎯',
                    condition: () => user.goals.length > 0
                },
                {
                    id: 'goal_achiever',
                    name: 'Goal Achiever',
                    description: 'Complete a goal',
                    icon: '🏆',
                    condition: () => user.goals.some(g => g.status === 'Completed')
                },
                {
                    id: 'week_warrior',
                    name: 'Week Warrior',
                    description: 'Complete 7 tasks in a week',
                    icon: '⚔️',
                    condition: () => true // Would need weekly aggregation
                },
                {
                    id: 'consistency_king',
                    name: 'Consistency King',
                    description: 'Maintain 3 habits for 30 days',
                    icon: '👑',
                    condition: () => user.habits.filter(h => 
                        h.streaks.some(s => s.length >= 30)
                    ).length >= 3
                }
            ];
            
            // Check each achievement
            for (const achievement of achievements) {
                // Check if already awarded
                const alreadyAwarded = user.achievements.some(a => a.type === achievement.id);
                
                if (!alreadyAwarded && achievement.condition()) {
                    // Award achievement
                    const newAchievement = await prisma.achievement.create({
                        data: {
                            userId,
                            type: achievement.id,
                            name: achievement.name,
                            description: achievement.description,
                            icon: achievement.icon
                        }
                    });
                    
                    awardedAchievements.push(newAchievement);
                }
            }
            
            return awardedAchievements;
        } catch (error) {
            console.error("Error checking achievements:", error);
            return [];
        }
    }
    
    /**
     * Get user's achievements
     */
    static async getUserAchievements(userId: string): Promise<any[]> {
        try {
            const achievements = await prisma.achievement.findMany({
                where: { userId },
                orderBy: { earnedAt: 'desc' }
            });
            
            return achievements;
        } catch (error) {
            console.error("Error fetching user achievements:", error);
            return [];
        }
    }
    
    /**
     * Get user's gamification stats
     */
    static async getUserGamificationStats(userId: string): Promise<any> {
        try {
            const achievements = await this.getUserAchievements(userId);
            const streaks = await this.calculateHabitStreaks(userId);
            
            // Calculate level based on achievements and streaks
            const totalPoints = achievements.length * 100 + streaks.reduce((sum, s) => sum + s.currentStreak * 10, 0);
            const level = Math.floor(totalPoints / 500) + 1;
            
            return {
                level,
                totalPoints,
                achievements: achievements.length,
                activeStreaks: streaks.filter(s => s.currentStreak > 0).length,
                longestStreak: Math.max(...streaks.map(s => s.longestStreak), 0),
                streaks,
                recentAchievements: achievements.slice(0, 5)
            };
        } catch (error) {
            console.error("Error fetching gamification stats:", error);
            return {
                level: 1,
                totalPoints: 0,
                achievements: 0,
                activeStreaks: 0,
                longestStreak: 0,
                streaks: [],
                recentAchievements: []
            };
        }
    }
    
    /**
     * Get leaderboard
     */
    static async getLeaderboard(limit: number = 10): Promise<any[]> {
        try {
            // Get top users by achievements and streaks
            const users = await prisma.user.findMany({
                include: {
                    achievements: true,
                    habits: {
                        include: {
                            streaks: true
                        }
                    }
                },
                take: limit
            });
            
            const leaderboard = users.map(user => {
                const totalPoints = user.achievements.length * 100 + 
                    user.habits.reduce((sum, h) => sum + (h.streaks[0]?.length || 0) * 10, 0);
                
                return {
                    userId: user.id,
                    name: user.name,
                    profilePicture: user.profilePicture,
                    totalPoints,
                    achievements: user.achievements.length,
                    longestStreak: Math.max(...user.habits.map(h => h.streaks[0]?.length || 0), 0)
                };
            }).sort((a, b) => b.totalPoints - a.totalPoints);
            
            return leaderboard;
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
            return [];
        }
    }
}

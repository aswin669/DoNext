import { Habit, HabitCompletion, HabitStreak } from "@/types";
import prisma from "./prisma";
import { AuthService } from "./auth-service";

/**
 * Habit Streak and Gamification Service
 * Handles streak tracking, achievements, and gamification features
 */
export class HabitGamificationService {
    
    /**
     * Calculate and update habit streaks
     */
    static async updateHabitStreak(habitId: string, userId: string): Promise<HabitStreak | null> {
        try {
            // Get habit completions for the last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const completions = await prisma.habitCompletion.findMany({
                where: {
                    habitId,
                    date: {
                        gte: thirtyDaysAgo
                    }
                },
                orderBy: { date: 'asc' }
            });
            
            // Get current active streak
            const currentStreak = await prisma.habitStreak.findFirst({
                where: {
                    habitId,
                    isActive: true
                },
                orderBy: { startDate: 'desc' }
            });
            
            // Calculate streak information
            const streakInfo = this.calculateStreak(completions);
            
            if (streakInfo.currentLength > 0) {
                if (currentStreak) {
                    // Update existing streak
                    const updatedStreak = await prisma.habitStreak.update({
                        where: { id: currentStreak.id },
                        data: {
                            length: streakInfo.currentLength,
                            endDate: streakInfo.currentEndDate
                        }
                    });
                    return updatedStreak as HabitStreak;
                } else {
                    // Create new streak
                    const newStreak = await prisma.habitStreak.create({
                        data: {
                            habitId,
                            startDate: streakInfo.currentStartDate,
                            endDate: streakInfo.currentEndDate,
                            length: streakInfo.currentLength,
                            isActive: true
                        }
                    });
                    return newStreak as HabitStreak;
                }
            }
            
            return currentStreak as HabitStreak | null;
        } catch (error) {
            console.error("Error updating habit streak:", error);
            return null;
        }
    }
    
    /**
     * Calculate streak information from completions
     */
    private static calculateStreak(completions: HabitCompletion[]): {
        currentLength: number;
        currentStartDate: Date;
        currentEndDate: Date;
        longestStreak: number;
        longestStartDate: Date | null;
        longestEndDate: Date | null;
    } {
        if (completions.length === 0) {
            return {
                currentLength: 0,
                currentStartDate: new Date(),
                currentEndDate: new Date(),
                longestStreak: 0,
                longestStartDate: null,
                longestEndDate: null
            };
        }
        
        // Sort completions by date
        const sortedCompletions = completions.sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        
        let currentStreak = 1;
        let currentStart = sortedCompletions[0].date;
        let currentEnd = sortedCompletions[0].date;
        
        let longestStreak = 1;
        let longestStart = sortedCompletions[0].date;
        let longestEnd = sortedCompletions[0].date;
        
        for (let i = 1; i < sortedCompletions.length; i++) {
            const prevDate = new Date(sortedCompletions[i - 1].date);
            const currentDate = new Date(sortedCompletions[i].date);
            
            // Calculate difference in days
            const timeDiff = currentDate.getTime() - prevDate.getTime();
            const dayDiff = Math.round(timeDiff / (1000 * 3600 * 24));
            
            if (dayDiff === 1) {
                // Consecutive day
                currentStreak++;
                currentEnd = currentDate;
            } else if (dayDiff > 1) {
                // Break in streak
                if (currentStreak > longestStreak) {
                    longestStreak = currentStreak;
                    longestStart = currentStart;
                    longestEnd = currentEnd;
                }
                currentStreak = 1;
                currentStart = currentDate;
                currentEnd = currentDate;
            }
            // If dayDiff === 0, it's the same day, so we don't increment
        }
        
        // Check if the last streak is the longest
        if (currentStreak > longestStreak) {
            longestStreak = currentStreak;
            longestStart = currentStart;
            longestEnd = currentEnd;
        }
        
        return {
            currentLength: currentStreak,
            currentStartDate: currentStart,
            currentEndDate: currentEnd,
            longestStreak,
            longestStartDate: longestStart,
            longestEndDate: longestEnd
        };
    }
    
    /**
     * Check and award achievements for habit completion
     */
    static async checkAndAwardAchievements(habitId: string, userId: string): Promise<any[]> {
        try {
            const habit = await prisma.habit.findUnique({
                where: { id: habitId },
                include: { completions: true }
            });
            
            if (!habit) return [];
            
            const achievements: any[] = [];
            
            // Check for various achievement conditions
            const completionCount = habit.completions.length;
            
            // First completion achievement
            if (completionCount === 1) {
                achievements.push(await this.createAchievement(
                    userId,
                    'first_completion',
                    'First Step',
                    'Completed your first habit tracking',
                    '⭐'
                ));
            }
            
            // Streak achievements
            const streakInfo = this.calculateStreak(habit.completions);
            
            if (streakInfo.currentLength >= 7) {
                achievements.push(await this.createAchievement(
                    userId,
                    'streak_7',
                    'Week Warrior',
                    'Maintained a 7-day streak',
                    '🔥'
                ));
            }
            
            if (streakInfo.currentLength >= 30) {
                achievements.push(await this.createAchievement(
                    userId,
                    'streak_30',
                    'Monthly Master',
                    'Maintained a 30-day streak',
                    '🏆'
                ));
            }
            
            if (streakInfo.longestStreak >= 100) {
                achievements.push(await this.createAchievement(
                    userId,
                    'streak_100',
                    'Century Champion',
                    'Reached 100-day streak',
                    '👑'
                ));
            }
            
            // Completion count achievements
            if (completionCount >= 10) {
                achievements.push(await this.createAchievement(
                    userId,
                    'completions_10',
                    'Deca-Completer',
                    'Completed 10 habit sessions',
                    '🔟'
                ));
            }
            
            if (completionCount >= 50) {
                achievements.push(await this.createAchievement(
                    userId,
                    'completions_50',
                    'Golden Tracker',
                    'Completed 50 habit sessions',
                    '🥇'
                ));
            }
            
            if (completionCount >= 100) {
                achievements.push(await this.createAchievement(
                    userId,
                    'completions_100',
                    'Centurion',
                    'Completed 100 habit sessions',
                    '💯'
                ));
            }
            
            return achievements;
        } catch (error) {
            console.error("Error checking achievements:", error);
            return [];
        }
    }
    
    /**
     * Create a new achievement
     */
    private static async createAchievement(
        userId: string,
        type: string,
        name: string,
        description: string,
        icon: string
    ): Promise<any> {
        // Check if achievement already exists
        const existingAchievement = await prisma.achievement.findFirst({
            where: {
                userId,
                type,
                name
            }
        });
        
        if (existingAchievement) {
            return existingAchievement;
        }
        
        return await prisma.achievement.create({
            data: {
                userId,
                type,
                name,
                description,
                icon
            }
        });
    }
    
    /**
     * Get user's achievements
     */
    static async getUserAchievements(userId: string): Promise<any[]> {
        try {
            return await prisma.achievement.findMany({
                where: { userId },
                orderBy: { earnedAt: 'desc' }
            });
        } catch (error) {
            console.error("Error fetching user achievements:", error);
            return [];
        }
    }
    
    /**
     * Get habit streak information
     */
    static async getHabitStreakInfo(habitId: string): Promise<any> {
        try {
            const [streak, completions] = await Promise.all([
                prisma.habitStreak.findFirst({
                    where: { habitId, isActive: true },
                    orderBy: { startDate: 'desc' }
                }),
                prisma.habitCompletion.findMany({
                    where: { habitId },
                    orderBy: { date: 'desc' },
                    take: 30
                })
            ]);
            
            const streakInfo = this.calculateStreak(completions);
            
            return {
                currentStreak: streak?.length || 0,
                currentStreakStart: streak?.startDate || null,
                currentStreakEnd: streak?.endDate || null,
                longestStreak: streakInfo.longestStreak,
                longestStreakStart: streakInfo.longestStartDate,
                longestStreakEnd: streakInfo.longestEndDate,
                totalCompletions: completions.length,
                recentCompletions: completions
            };
        } catch (error) {
            console.error("Error fetching habit streak info:", error);
            return {
                currentStreak: 0,
                currentStreakStart: null,
                currentStreakEnd: null,
                longestStreak: 0,
                longestStreakStart: null,
                longestStreakEnd: null,
                totalCompletions: 0,
                recentCompletions: []
            };
        }
    }
    
    /**
     * Get user's overall gamification stats
     */
    static async getUserGamificationStats(userId: string): Promise<any> {
        try {
            const [habits, completions, streaks, achievements] = await Promise.all([
                prisma.habit.count({ where: { userId } }),
                prisma.habitCompletion.count({ where: { habit: { userId } } }),
                prisma.habitStreak.findMany({
                    where: { habit: { userId } },
                    include: { habit: true }
                }),
                prisma.achievement.count({ where: { userId } })
            ]);
            
            // Calculate longest personal streak
            const longestStreak = streaks.length > 0 
                ? Math.max(...streaks.map(s => s.length)) 
                : 0;
            
            // Calculate current active streaks
            const activeStreaks = streaks.filter(s => s.isActive).length;
            
            // Calculate consistency (completion rate)
            const habitIds = Array.from(new Set(streaks.map(s => s.habitId)));
            const completionRate = habitIds.length > 0 
                ? (activeStreaks / habitIds.length) * 100 
                : 0;
            
            return {
                totalHabits: habits,
                totalCompletions: completions,
                activeStreaks,
                longestPersonalStreak: longestStreak,
                achievements: achievements,
                completionRate: Math.round(completionRate)
            };
        } catch (error) {
            console.error("Error fetching gamification stats:", error);
            return {
                totalHabits: 0,
                totalCompletions: 0,
                activeStreaks: 0,
                longestPersonalStreak: 0,
                achievements: 0,
                completionRate: 0
            };
        }
    }
}
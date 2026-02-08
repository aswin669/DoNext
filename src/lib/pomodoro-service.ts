import prisma from "./prisma";

/**
 * Pomodoro Timer Service
 * Handles pomodoro session tracking and focus time management
 */
export class PomodoroService {
    
    /**
     * Start a pomodoro session
     */
    static async startSession(userId: string, taskId?: string, duration: number = 25): Promise<any> {
        try {
            // Validate task if provided
            if (taskId) {
                const task = await prisma.task.findUnique({
                    where: { id: taskId, userId }
                });
                if (!task) {
                    throw new Error("Task not found");
                }
            }
            
            const session = {
                id: `session_${Date.now()}`,
                userId,
                taskId,
                startTime: new Date(),
                duration, // minutes
                status: 'active',
                breakTime: 5, // default break time
                completedPomodoros: 0
            };
            
            // Store in database (would need PomodoroSession model)
            console.log(`Started pomodoro session for user ${userId}`, session);
            
            return session;
        } catch (error) {
            console.error("Error starting pomodoro session:", error);
            throw error;
        }
    }
    
    /**
     * Complete a pomodoro session
     */
    static async completeSession(userId: string, sessionId: string): Promise<any> {
        try {
            const endTime = new Date();
            
            const session = {
                id: sessionId,
                userId,
                status: 'completed',
                endTime,
                focusMinutes: 25
            };
            
            console.log(`Completed pomodoro session for user ${userId}`, session);
            
            return session;
        } catch (error) {
            console.error("Error completing pomodoro session:", error);
            throw error;
        }
    }
    
    /**
     * Pause a pomodoro session
     */
    static async pauseSession(userId: string, sessionId: string): Promise<any> {
        try {
            const session = {
                id: sessionId,
                userId,
                status: 'paused',
                pausedAt: new Date()
            };
            
            console.log(`Paused pomodoro session for user ${userId}`, session);
            
            return session;
        } catch (error) {
            console.error("Error pausing pomodoro session:", error);
            throw error;
        }
    }
    
    /**
     * Resume a pomodoro session
     */
    static async resumeSession(userId: string, sessionId: string): Promise<any> {
        try {
            const session = {
                id: sessionId,
                userId,
                status: 'active',
                resumedAt: new Date()
            };
            
            console.log(`Resumed pomodoro session for user ${userId}`, session);
            
            return session;
        } catch (error) {
            console.error("Error resuming pomodoro session:", error);
            throw error;
        }
    }
    
    /**
     * Get user's pomodoro statistics
     */
    static async getUserStats(userId: string, days: number = 7): Promise<any> {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            
            // Get real pomodoro sessions from database
            const sessions = await (prisma as any).pomodoroSession.findMany({
                where: {
                    userId,
                    completedAt: {
                        gte: startDate
                    }
                },
                orderBy: { completedAt: 'asc' }
            }).catch(() => []); // Fallback if table doesn't exist
            
            // Calculate stats from real sessions
            const totalSessions = sessions.length;
            const totalFocusMinutes = sessions.reduce((sum: number, session: any) => sum + session.duration, 0);
            const averageSessionLength = totalSessions > 0 ? totalFocusMinutes / totalSessions : 0;
            const sessionsPerDay = totalSessions > 0 ? totalSessions / days : 0;
            
            // Calculate streaks
            const dailyCompletions: Record<string, number> = {};
            sessions.forEach((session: any) => {
                const date = new Date(session.completedAt).toISOString().split('T')[0];
                dailyCompletions[date] = (dailyCompletions[date] || 0) + 1;
            });
            
            const sortedDates = Object.keys(dailyCompletions).sort();
            let currentStreak = 0;
            let longestStreak = 0;
            let tempStreak = 1;
            
            for (let i = 0; i < sortedDates.length; i++) {
                if (i > 0) {
                    const prevDate = new Date(sortedDates[i - 1]);
                    const currDate = new Date(sortedDates[i]);
                    const dayDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
                    
                    if (Math.round(dayDiff) === 1) {
                        tempStreak++;
                    } else {
                        longestStreak = Math.max(longestStreak, tempStreak);
                        tempStreak = 1;
                    }
                }
            }
            
            longestStreak = Math.max(longestStreak, tempStreak);
            
            // Check if current streak is active (includes today)
            const today = new Date().toISOString().split('T')[0];
            if (sortedDates.includes(today)) {
                currentStreak = tempStreak;
            }
            
            // Generate daily breakdown
            const dailyBreakdown = [];
            for (let i = 0; i < days; i++) {
                const date = new Date();
                date.setDate(date.getDate() - (days - 1 - i));
                const dateStr = date.toISOString().split('T')[0];
                
                dailyBreakdown.push({
                    date: dateStr,
                    sessions: dailyCompletions[dateStr] || 0,
                    focusMinutes: (dailyCompletions[dateStr] || 0) * 25 // Assuming 25-min sessions
                });
            }
            
            const stats = {
                totalSessions,
                totalFocusMinutes,
                averageSessionLength: Math.round(averageSessionLength * 10) / 10,
                sessionsPerDay: Math.round(sessionsPerDay * 10) / 10,
                longestStreak,
                currentStreak,
                dailyBreakdown
            };
            
            return stats;
        } catch (error) {
            console.error("Error fetching pomodoro stats:", error);
            throw error;
        }
    }
    
    /**
     * Get active sessions for user
     */
    static async getActiveSessions(userId: string): Promise<any[]> {
        try {
            // Would query database for active sessions
            return [];
        } catch (error) {
            console.error("Error fetching active sessions:", error);
            return [];
        }
    }
}

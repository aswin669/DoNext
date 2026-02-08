import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth-service";

export async function GET() {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Heatmap Data (Last 90 days) - count completed tasks per day
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        ninetyDaysAgo.setHours(0, 0, 0, 0);
        
        const completedTasks = await prisma.task.findMany({
            where: {
                userId: user.id,
                completed: true,
                updatedAt: { gte: ninetyDaysAgo }
            }
        });

        const habitCompletions = await prisma.habitCompletion.findMany({
            where: {
                habit: { userId: user.id },
                date: { gte: ninetyDaysAgo }
            }
        });

        // Build intensity data using updatedAt (when task was completed)
        const intensityData: Record<string, number> = {};
        
        completedTasks.forEach((task: any) => {
            const taskDate = new Date(task.updatedAt);
            if (!isNaN(taskDate.getTime())) {
                const dateStr = taskDate.toISOString().split('T')[0];
                intensityData[dateStr] = (intensityData[dateStr] || 0) + 1;
            }
        });

        habitCompletions.forEach((habit: any) => {
            const habitDate = new Date(habit.date);
            if (!isNaN(habitDate.getTime())) {
                const dateStr = habitDate.toISOString().split('T')[0];
                intensityData[dateStr] = (intensityData[dateStr] || 0) + 1;
            }
        });

        // 2. Category Analysis - group tasks by actual categories
        const allTasks = await prisma.task.findMany({ 
            where: { userId: user.id }
        });
        
        const categoryMap = new Map<string, { total: number; completed: number }>();
        allTasks.forEach((t: any) => {
            if (t.category) {
                const current = categoryMap.get(t.category) || { total: 0, completed: 0 };
                current.total++;
                if (t.completed) current.completed++;
                categoryMap.set(t.category, current);
            }
        });

        const categoryAnalysis = Array.from(categoryMap.entries()).map(([name, data]) => ({
            name,
            percentage: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
        }));

        // 3. Habit Stats - completion percentage for last 30 days
        const habitData = await prisma.habit.findMany({
            where: { userId: user.id },
            include: { completions: true }
        });

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        const habitStats = habitData.map((h: any) => {
            const last30Days = h.completions.filter((c: any) => {
                const d = new Date(c.date);
                return d >= thirtyDaysAgo;
            }).length;

            // Calculate current streak
            let streak = 0;
            const sortedCompletions = h.completions
                .map((c: any) => new Date(c.date).toISOString().split('T')[0])
                .sort()
                .reverse();
            
            if (sortedCompletions.length > 0) {
                const today = new Date().toISOString().split('T')[0];
                let checkDate = today;
                
                for (const completion of sortedCompletions) {
                    const checkDateObj = new Date(checkDate);
                    const completionDateObj = new Date(completion);
                    const dayDiff = Math.floor((checkDateObj.getTime() - completionDateObj.getTime()) / (1000 * 60 * 60 * 24));
                    
                    if (dayDiff === 0 || dayDiff === 1) {
                        streak++;
                        checkDate = completion;
                    } else {
                        break;
                    }
                }
            }

            return {
                name: h.name,
                percentage: Math.round((last30Days / 30) * 100),
                streak
            };
        });

        // 4. Average Completion Rate (last 30 days)
        const recentTasks = await prisma.task.findMany({
            where: {
                userId: user.id,
                createdAt: { gte: thirtyDaysAgo }
            }
        });

        const completedCount = recentTasks.filter((t: any) => t.completed).length;
        const avgCompletion = recentTasks.length > 0 
            ? Math.round((completedCount / recentTasks.length) * 100) 
            : 0;

        // 5. Best Streak Calculation - consecutive days with activity
        const allDates = Object.keys(intensityData).sort();
        let currentStreakCount = 0;
        let bestStreakCount = 0;
        let previousDate: Date | null = null;

        allDates.forEach(dateStr => {
            const currentDate = new Date(dateStr);
            if (previousDate) {
                const dayDiff = Math.floor((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));
                if (dayDiff === 1) {
                    currentStreakCount++;
                } else {
                    currentStreakCount = 1;
                }
            } else {
                currentStreakCount = 1;
            }
            bestStreakCount = Math.max(bestStreakCount, currentStreakCount);
            previousDate = currentDate;
        });

        // 6. Weekly Trend - completion percentage for last 7 days (based on updatedAt)
        const weeklyTrend = [];

        for (let i = 6; i >= 0; i--) {
            const startOfDay = new Date();
            startOfDay.setDate(startOfDay.getDate() - i);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(startOfDay);
            endOfDay.setHours(23, 59, 59, 999);
            
            // Get all tasks completed on this day (using updatedAt)
            const dayCompletedTasks = await prisma.task.findMany({
                where: {
                    userId: user.id,
                    completed: true,
                    updatedAt: {
                        gte: startOfDay,
                        lte: endOfDay
                    }
                }
            });

            // Get all tasks created before or on this day
            const allTasksUpToDay = await prisma.task.findMany({
                where: {
                    userId: user.id,
                    createdAt: {
                        lte: endOfDay
                    }
                }
            });

            const dayPercentage = allTasksUpToDay.length > 0 
                ? Math.round((dayCompletedTasks.length / allTasksUpToDay.length) * 100) 
                : 0;

            weeklyTrend.push(dayPercentage);
        }

        return NextResponse.json({
            intensityData,
            categoryAnalysis,
            habitStats,
            avgCompletion,
            bestStreak: bestStreakCount,
            weeklyTrend
        });
    } catch (error) {
        console.error("Analytics API Error:", error);
        return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth-service";

export async function GET() {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Heatmap Data (Last 90 days)
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        ninetyDaysAgo.setHours(0, 0, 0, 0);
        
        const tasks = await prisma.task.findMany({
            where: {
                userId: user.id,
                updatedAt: { gte: ninetyDaysAgo }
            }
        });

        const habits = await prisma.habitCompletion.findMany({
            where: {
                habit: { userId: user.id },
                date: { gte: ninetyDaysAgo }
            }
        });

        const intensityData = tasks.concat(habits.map((h: any) => ({ ...h, updatedAt: h.date, completed: true }))).reduce((acc: any, item: any) => {
            const itemDate = new Date(item.updatedAt);
            if (!isNaN(itemDate.getTime())) {
                const dateStr = itemDate.toISOString().split('T')[0];
                acc[dateStr] = (acc[dateStr] || 0) + 1;
            }
            return acc;
        }, {});

        // 2. Category Analysis
        const allTasks = await prisma.task.findMany({ where: { userId: user.id } });
        const categories = ["Study", "Work", "Personal", "Health", "Important"];
        const categoryAnalysis = categories.map((cat: string) => {
            const catTasks = allTasks.filter((t: any) => t.category === cat);
            const completed = catTasks.filter((t: any) => t.completed).length;
            return {
                name: cat,
                percentage: catTasks.length > 0 ? Math.round((completed / catTasks.length) * 100) : 0
            };
        });

        // 3. Habit Stats
        const habitData = await prisma.habit.findMany({
            where: { userId: user.id },
            include: { completions: true }
        });

        const habitStats = habitData.map((h: any) => {
            const now = new Date();
            const thirtyDaysAgoStart = new Date();
            thirtyDaysAgoStart.setDate(thirtyDaysAgoStart.getDate() - 30);
            thirtyDaysAgoStart.setHours(0, 0, 0, 0);
            
            const last30Days = h.completions.filter((c: any) => {
                const d = new Date(c.date);
                return d >= thirtyDaysAgoStart && d <= now;
            }).length;

            return {
                name: h.name,
                percentage: Math.round((last30Days / 30) * 100),
                streak: 0
            };
        });

        // 4. Average Completion Rate (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);
        
        // @ts-expect-error - prisma types may not be fully generated
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

        // 4b. Filter only completed tasks for intensity/streaks (optional but usually preferred for "productivity" analytics)
        // const productivityTasks = tasks.filter((t: any) => t.completed);
        
        // 5. Best Streak Calculation
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

        const weeklyTrend = [];
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        for (let i = 6; i >= 0; i--) {
            const startOfDay = new Date();
            startOfDay.setDate(startOfDay.getDate() - i);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(startOfDay);
            endOfDay.setHours(23, 59, 59, 999);
            
            // @ts-expect-error - prisma types may not be fully generated
            const dayTasks = await prisma.task.findMany({
                where: {
                    userId: user.id,
                    createdAt: {
                        gte: startOfDay,
                        lte: endOfDay
                    }
                }
            });

            const dayCompleted = dayTasks.filter((t: any) => t.completed).length;
            const dayPercentage = dayTasks.length > 0 
                ? Math.round((dayCompleted / dayTasks.length) * 100) 
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

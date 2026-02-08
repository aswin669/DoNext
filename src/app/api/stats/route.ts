import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth-service";

/**
 * Stats API Route
 * Provides comprehensive statistics for dashboard including:
 * - Task completion metrics
 * - Habit tracking
 * - Weekly activity
 * - Focus time tracking
 * - Learning progress
 * - Study task analytics
 */
export async function GET() {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        // 1. Tasks Completion Stats
        const tasks = await prisma.task.findMany({
            where: { userId: user.id }
        });
        const completedTasksCount = tasks.filter((t: any) => t.completed).length;
        const totalTasksCount = tasks.length;

        // 2. Habits Count
        const habitsCount = await prisma.habit.count({
            where: { userId: user.id }
        });

        // 3. Weekly Activity (Last 7 Days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            d.setHours(0, 0, 0, 0);
            return d;
        });

        const weeklyActivity = await Promise.all(last7Days.map(async (date) => {
            const nextDay = new Date(date);
            nextDay.setDate(date.getDate() + 1);

            const taskCompletions = await prisma.task.count({
                where: {
                    userId: user.id,
                    completed: true,
                    updatedAt: {
                        gte: date,
                        lt: nextDay
                    }
                }
            });

            const habitCompletions = await prisma.habitCompletion.count({
                where: {
                    habit: { userId: user.id },
                    date: {
                        gte: date,
                        lt: nextDay
                    }
                }
            });

            // Focus time heuristic: 30 mins per task completion for now
            const focusMinutes = (taskCompletions + habitCompletions) * 30;

            return {
                day: date.toLocaleDateString("en-US", { weekday: "short" }),
                tasks: taskCompletions,
                focus: focusMinutes / 60 // hours
            };
        }));

        // 4. Focus Time Today
        const todayActivity = weeklyActivity[6];
        
        // 5. Critical Tasks (High Priority + Important Category)
        const importantTasks = await prisma.task.findMany({
            where: {
                userId: user.id,
                completed: false,
                priority: "High",
                category: "Important"
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 10
        });

        // 6. Learning Progress (Study Habits & Tasks)
        const studyHabits = await prisma.habit.findMany({
            where: { userId: user.id, category: "Study" },
            include: { completions: true }
        });

        const studyTasks = await prisma.task.findMany({
            where: { userId: user.id, category: "Study" }
        });

        const learningProgress = [];

        // Process Habits
        const last7DaysDate = new Date();
        last7DaysDate.setDate(last7DaysDate.getDate() - 7);

        for (const habit of studyHabits) {
            // Calculate consistency over last 7 days
            const completionsLast7Days = habit.completions.filter((c: any) => new Date(c.date) >= last7DaysDate).length;
            const target = 7; // Assuming daily for simplicity of "progress"
            const percentage = Math.min(Math.round((completionsLast7Days / target) * 100), 100);
            
            learningProgress.push({
                id: habit.id,
                title: habit.name,
                progress: percentage,
                type: 'habit',
                icon: habit.icon
            });
        }

        // 7. Study Task Schema Extension
        // Process Study Tasks with enhanced metrics
        if (studyTasks.length > 0) {
            const completedStudyTasks = studyTasks.filter((t: any) => t.completed).length;
            const progress = Math.round((completedStudyTasks / studyTasks.length) * 100);
            
            learningProgress.push({
                id: 'study-tasks-aggregate',
                title: 'Study Tasks Completion',
                progress: progress,
                type: 'task',
                icon: 'school',
                metrics: {
                    totalTasks: studyTasks.length,
                    completedTasks: completedStudyTasks
                }
            });
        }

        return NextResponse.json({
            tasksCompleted: completedTasksCount,
            totalTasks: totalTasksCount,
            activeHabits: habitsCount,
            focusTimeToday: `${Math.floor(todayActivity.focus)}h ${Math.round((todayActivity.focus % 1) * 60)}m`,
            weeklyActivity,
            importantTasks,
            learningProgress,
            studyMetrics: {
                totalStudyTasks: studyTasks.length,
                completedStudyTasks: studyTasks.filter((t: any) => t.completed).length,
                studyHabitsCount: studyHabits.length
            }
        });
    } catch (error) {
        console.error("Stats API Error:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}

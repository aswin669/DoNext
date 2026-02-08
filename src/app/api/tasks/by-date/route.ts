import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth-service";

export async function GET(req: Request) {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const start = searchParams.get("start");
        const end = searchParams.get("end");

        if (!start || !end) {
            return NextResponse.json({ error: "Missing start or end date" }, { status: 400 });
        }

        const startDate = new Date(start);
        const endDate = new Date(end);

        // Fetch all tasks for the user, then filter by completion date or creation date
        const allTasks = await prisma.task.findMany({
            where: {
                userId: user.id
            }
        });

        // Filter tasks that were either:
        // 1. Completed on this day (updatedAt within the date range)
        // 2. Created on this day (createdAt within the date range)
        const tasks = allTasks.filter((task: any) => {
            const createdDate = new Date(task.createdAt);
            const updatedDate = new Date(task.updatedAt);
            
            const createdInRange = createdDate >= startDate && createdDate <= endDate;
            const completedInRange = task.completed && updatedDate >= startDate && updatedDate <= endDate;
            
            return createdInRange || completedInRange;
        }).sort((a: any, b: any) => {
            // Sort by: incomplete first, then by priority, then by date
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            const priorityOrder: Record<string, number> = { "High": 0, "Medium": 1, "Low": 2 };
            const aPriority = priorityOrder[a.priority] ?? 3;
            const bPriority = priorityOrder[b.priority] ?? 3;
            if (aPriority !== bPriority) {
                return aPriority - bPriority;
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        return NextResponse.json(tasks);
    } catch (error) {
        console.error("Tasks by date GET Error:", error);
        return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
    }
}

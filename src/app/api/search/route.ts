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
        const query = searchParams.get("q");

        if (!query) {
            return NextResponse.json([]);
        }

        const tasks = await prisma.task.findMany({
            where: {
                userId: user.id,
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } }
                ]
            }
        });

        const habits = await prisma.habit.findMany({
            where: {
                userId: user.id,
                name: { contains: query, mode: 'insensitive' }
            }
        });

        const routines = await prisma.routineStep.findMany({
            where: {
                userId: user.id,
                task: { contains: query, mode: 'insensitive' }
            }
        });

        const results = [
            ...tasks.map((t: unknown) => {
                const task = t as { id: string; title: string; category?: string };
                return { id: task.id, title: task.title, type: 'Task', category: task.category, href: `/tasks/${task.id}` };
            }),
            ...habits.map((h: unknown) => {
                const habit = h as { id: string; name: string; category?: string };
                return { id: habit.id, title: habit.name, type: 'Habit', category: habit.category, href: `/habits` };
            }),
            ...routines.map((r: unknown) => {
                const routine = r as { id: string; task: string; category?: string };
                return { id: routine.id, title: routine.task, type: 'Routine', category: routine.category, href: `/routine` };
            })
        ];

        return NextResponse.json(results);
    } catch (error) {
        console.error("Search API Error:", error);
        return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }
}

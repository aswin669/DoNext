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
            ...tasks.map((t: any) => ({ id: t.id, title: t.title, type: 'Task', category: t.category, href: `/tasks/${t.id}` })),
            ...habits.map((h: any) => ({ id: h.id, title: h.name, type: 'Habit', category: h.category, href: `/habits` })),
            ...routines.map((r: any) => ({ id: r.id, title: r.task, type: 'Routine', category: r.category, href: `/routine` }))
        ];

        return NextResponse.json(results);
    } catch (error) {
        console.error("Search API Error:", error);
        return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }
}

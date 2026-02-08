import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth-service";
import { taskCreateSchema } from "@/lib/validation";

export async function GET() {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const tasks = await prisma.task.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" }
        });
        return NextResponse.json(tasks);
    } catch (error) {
        console.error("Tasks GET Error:", error);
        return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const body = await req.json();
        
        // Validate request body
        const validatedData = taskCreateSchema.parse(body);

        const newTask = await prisma.task.create({
            data: {
                ...validatedData,
                userId: user.id
            }
        });

        return NextResponse.json(newTask);
    } catch (error: any) {
        console.error("Task POST Error:", error);
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: "Invalid task data", details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
    }
}

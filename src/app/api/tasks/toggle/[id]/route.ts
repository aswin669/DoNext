import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const task = await prisma.task.findUnique({
            where: { id }
        });

        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        const updatedTask = await prisma.task.update({
            where: { id },
            data: { completed: !task.completed }
        });

        return NextResponse.json(updatedTask);
    } catch (error) {
        console.error("Task Toggle Error:", error);
        return NextResponse.json({ error: "Failed to toggle task" }, { status: 500 });
    }
}

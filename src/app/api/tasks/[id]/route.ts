import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth-service";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const { id } = await params;
        const task = await prisma.task.findUnique({
            where: { 
                id,
                userId: user.id
            }
        });
        
        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }
        
        return NextResponse.json(task);
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const { id } = await params;
        const body = await req.json();
        const { title, description, priority, category, completed } = body;

        const updatedTask = await prisma.task.update({
            where: { 
                id,
                userId: user.id
            },
            data: {
                title,
                description,
                priority,
                category,
                completed
            }
        });

        return NextResponse.json(updatedTask);
    } catch (error) {
        console.error("Task PUT Error:", error);
        return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const { id } = await params;
        
        await prisma.task.delete({
            where: { 
                id,
                userId: user.id
            }
        });
        
        return NextResponse.json({ message: "Task deleted" });
    } catch (error) {
        console.error("Task DELETE Error:", error);
        return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
    }
}
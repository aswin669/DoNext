import { NextResponse } from "next/server";
import { AuthService } from "@/lib/auth-service";
import { TaskPrioritizationService } from "@/lib/task-prioritization";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        // Get user's incomplete tasks
        const tasks: any[] = await prisma.task.findMany({
            where: {
                userId: user.id,
                completed: false
            },
            orderBy: { createdAt: 'desc' }
        });
        
        // Generate Eisenhower Matrix quadrants
        const matrix = await TaskPrioritizationService.generateEisenhowerMatrix(tasks, user.id);
        
        return NextResponse.json({
            success: true,
            matrix,
            totalTasks: tasks.length
        });
    } catch (error) {
        console.error("Eisenhower Matrix API error:", error);
        return NextResponse.json(
            { error: "Failed to generate Eisenhower Matrix" }, 
            { status: 500 }
        );
    }
}
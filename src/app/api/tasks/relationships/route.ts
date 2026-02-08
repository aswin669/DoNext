import { NextResponse } from "next/server";
import { AuthService } from "@/lib/auth-service";
import prisma from "@/lib/prisma";
import { validateRequestBody } from "@/lib/errors";
import { z } from "zod";

// Validation schemas
const createDependencySchema = z.object({
    dependencyId: z.string().min(1, "Dependency task ID is required"),
    dependentId: z.string().min(1, "Dependent task ID is required")
});

const createSubtaskSchema = z.object({
    parentTaskId: z.string().min(1, "Parent task ID is required"),
    title: z.string().min(1, "Title is required").max(200, "Title too long"),
    description: z.string().max(1000, "Description too long").optional(),
    priority: z.enum(['High', 'Medium', 'Low']).default('Medium'),
    category: z.string().max(50, "Category too long").optional(),
    estimatedTime: z.number().int().positive("Estimated time must be positive").optional()
});

export async function GET(req: Request) {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const { searchParams } = new URL(req.url);
        const taskId = searchParams.get('taskId');
        
        if (!taskId) {
            return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
        }
        
        // Get task with dependencies and subtasks
        const task: any = await prisma.task.findUnique({
            where: { id: taskId, userId: user.id }
        });
        
        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }
        
        // Get dependencies and subtasks separately
        const [dependencies, dependents, subtasks, parentTask] = await Promise.all([
            prisma.taskDependency.findMany({
                where: { dependentId: taskId },
                include: { dependency: true }
            }),
            prisma.taskDependency.findMany({
                where: { dependencyId: taskId },
                include: { dependent: true }
            }),
            prisma.task.findMany({
                where: { parentTaskId: taskId, userId: user.id }
            }),
            task.parentTaskId ? prisma.task.findUnique({
                where: { id: task.parentTaskId, userId: user.id }
            }) : Promise.resolve(null)
        ]);
        
        return NextResponse.json({
            success: true,
            task: {
                ...task,
                dependencies: dependencies.map((d: any) => d.dependency),
                dependents: dependents.map((d: any) => d.dependent),
                subtasks,
                parentTask
            }
        });
    } catch (error) {
        console.error("Task relationships GET error:", error);
        return NextResponse.json(
            { error: "Failed to fetch task relationships" }, 
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const body = await req.json();
        const { type } = body;
        
        if (type === 'dependency') {
            // Create task dependency
            const validatedData = createDependencySchema.parse(body);
            const { dependencyId, dependentId } = validatedData as { dependencyId: string; dependentId: string };
            
            // Verify both tasks exist and belong to user
            const [dependencyTask, dependentTask] = await Promise.all([
                prisma.task.findUnique({
                    where: { id: dependencyId, userId: user.id }
                }),
                prisma.task.findUnique({
                    where: { id: dependentId, userId: user.id }
                })
            ]);
            
            if (!dependencyTask || !dependentTask) {
                return NextResponse.json(
                    { error: "One or both tasks not found" }, 
                    { status: 404 }
                );
            }
            
            // Check for circular dependencies
            if (dependencyId === dependentId) {
                return NextResponse.json(
                    { error: "Cannot create dependency to self" }, 
                    { status: 400 }
                );
            }
            
            // Check if dependency already exists
            const existingDependency = await prisma.taskDependency.findUnique({
                where: {
                    dependencyId_dependentId: {
                        dependencyId,
                        dependentId
                    }
                }
            });
            
            if (existingDependency) {
                return NextResponse.json(
                    { error: "Dependency already exists" }, 
                    { status: 400 }
                );
            }
            
            // Create the dependency
            const dependency = await prisma.taskDependency.create({
                data: {
                    dependencyId,
                    dependentId
                }
            });
            
            return NextResponse.json({
                success: true,
                dependency,
                message: "Task dependency created successfully"
            });
        } else if (type === 'subtask') {
            // Create subtask
            const validatedData = createSubtaskSchema.parse(body);
            const { parentTaskId, title, description, priority, category, estimatedTime } = 
                validatedData as { parentTaskId: string; title: string; description?: string; priority: any; category?: string; estimatedTime?: number };
            
            // Verify parent task exists
            const parentTask = await prisma.task.findUnique({
                where: { id: parentTaskId, userId: user.id }
            });
            
            if (!parentTask) {
                return NextResponse.json(
                    { error: "Parent task not found" }, 
                    { status: 404 }
                );
            }
            
            // Create the subtask
            const subtask = await prisma.task.create({
                data: {
                    title,
                    description,
                    priority,
                    category,
                    estimatedTime,
                    userId: user.id,
                    parentTaskId
                }
            });
            
            return NextResponse.json({
                success: true,
                task: subtask,
                message: "Subtask created successfully"
            });
        } else {
            return NextResponse.json(
                { error: "Invalid type. Must be 'dependency' or 'subtask'" }, 
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error("Task relationships POST error:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: `Validation error: ${error.issues.map((e: any) => e.message).join(', ')}` },
                { status: 400 }
            );
        }
        if (error.message?.includes('Validation')) {
            return NextResponse.json(
                { error: error.message }, 
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: "Failed to create task relationship" }, 
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const { searchParams } = new URL(req.url);
        const dependencyId = searchParams.get('dependencyId');
        const subtaskId = searchParams.get('subtaskId');
        
        if (dependencyId) {
            // Delete task dependency
            const dependency = await prisma.taskDependency.findUnique({
                where: { id: dependencyId }
            });
            
            if (!dependency) {
                return NextResponse.json(
                    { error: "Dependency not found" }, 
                    { status: 404 }
                );
            }
            
            // Verify user owns either task in the dependency
            const [dependencyTask, dependentTask] = await Promise.all([
                prisma.task.findUnique({
                    where: { id: dependency.dependencyId }
                }),
                prisma.task.findUnique({
                    where: { id: dependency.dependentId }
                })
            ]);
            
            if ((dependencyTask?.userId !== user.id) && (dependentTask?.userId !== user.id)) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            
            await prisma.taskDependency.delete({
                where: { id: dependencyId }
            });
            
            return NextResponse.json({
                success: true,
                message: "Dependency removed successfully"
            });
        } else if (subtaskId) {
            // Delete subtask
            const subtask = await prisma.task.findUnique({
                where: { id: subtaskId }
            });
            
            if (!subtask) {
                return NextResponse.json(
                    { error: "Subtask not found" }, 
                    { status: 404 }
                );
            }
            
            if (subtask.userId !== user.id) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            
            await prisma.task.delete({
                where: { id: subtaskId }
            });
            
            return NextResponse.json({
                success: true,
                message: "Subtask deleted successfully"
            });
        } else {
            return NextResponse.json(
                { error: "dependencyId or subtaskId is required" }, 
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("Task relationships DELETE error:", error);
        return NextResponse.json(
            { error: "Failed to delete task relationship" }, 
            { status: 500 }
        );
    }
}
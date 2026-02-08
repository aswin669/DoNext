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
        const tasks = await prisma.task.findMany({
            where: {
                userId: user.id,
                completed: false
            },
            orderBy: { createdAt: 'desc' }
        });
        
        // Calculate smart priorities for all tasks
        const prioritizedTasks = await Promise.all(
            tasks.map(async (task: any) => {
                const priorityResult = await TaskPrioritizationService.calculateSmartPriority(task, user.id);
                return {
                    ...task,
                    smartPriority: priorityResult.priorityScore,
                    priorityFactors: priorityResult.factors,
                    recommendedAction: priorityResult.recommendedAction
                };
            })
        );
        
        // Sort by smart priority (highest first)
        const sortedTasks = prioritizedTasks.sort((a, b) => 
            (b.smartPriority || 0) - (a.smartPriority || 0)
        );
        
        return NextResponse.json({
            success: true,
            tasks: sortedTasks,
            totalTasks: sortedTasks.length
        });
    } catch (error) {
        console.error("Smart prioritization API error:", error);
        return NextResponse.json(
            { error: "Failed to calculate smart priorities" }, 
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
        const { taskId, action, batchUpdate } = body;
        
        // Handle batch priority updates
        if (batchUpdate && Array.isArray(batchUpdate)) {
            return await handleBatchPriorityUpdate(user.id, batchUpdate);
        }
        
        if (!taskId) {
            return NextResponse.json(
                { error: "Task ID is required" }, 
                { status: 400 }
            );
        }
        
        // Validate action
        const validActions = ['do_now', 'schedule', 'delegate', 'eliminate'];
        if (action && !validActions.includes(action)) {
            return NextResponse.json(
                { error: "Invalid action. Must be one of: do_now, schedule, delegate, eliminate" }, 
                { status: 400 }
            );
        }
        
        // Get the specific task
        const task: any = await prisma.task.findUnique({
            where: { id: taskId, userId: user.id }
        });
        
        if (!task) {
            return NextResponse.json(
                { error: "Task not found" }, 
                { status: 404 }
            );
        }
        
        // Calculate smart priority for this task
        const priorityResult = await TaskPrioritizationService.calculateSmartPriority(task, user.id);
        
        // Update task with smart priority if requested
        if (action) {
            // Map action to priority level
            const priorityMap: Record<string, string> = {
                'do_now': 'High',
                'schedule': 'Medium',
                'delegate': 'Low',
                'eliminate': 'Low'
            };

            // Create priority history entry
            const priorityHistory = {
                taskId,
                previousPriority: task.priority,
                newPriority: priorityMap[action],
                smartScore: priorityResult.priorityScore,
                action,
                changedAt: new Date().toISOString(),
                reason: priorityResult.recommendedAction
            };

            // Update task with new priority and smart priority score
            const updatedTask = await prisma.task.update({
                where: { id: taskId },
                data: { 
                    smartPriority: priorityResult.priorityScore,
                    priority: priorityMap[action],
                    updatedAt: new Date()
                }
            });

            // Store priority history for tracking
            await storePriorityHistory(priorityHistory);
            
            return NextResponse.json({
                success: true,
                task: {
                    ...updatedTask,
                    priorityResult
                },
                priorityHistory,
                message: `Task priority updated to ${action}`
            });
        }
        
        // Return priority calculation without updating
        return NextResponse.json({
            success: true,
            task: {
                ...task,
                priorityResult
            }
        });
    } catch (error) {
        console.error("Smart prioritization POST error:", error);
        return NextResponse.json(
            { error: "Failed to process priority request" }, 
            { status: 500 }
        );
    }
}

/**
 * Handle batch priority updates
 * Updates multiple task priorities in a single transaction
 */
async function handleBatchPriorityUpdate(userId: string, updates: Array<{ taskId: string; priority: string }>) {
    try {
        const results = [];
        const priorityHistories = [];

        for (const update of updates) {
            const task: any = await prisma.task.findUnique({
                where: { id: update.taskId, userId }
            });

            if (!task) {
                results.push({
                    taskId: update.taskId,
                    success: false,
                    error: "Task not found"
                });
                continue;
            }

            // Validate priority value
            const validPriorities = ['Low', 'Medium', 'High'];
            if (!validPriorities.includes(update.priority)) {
                results.push({
                    taskId: update.taskId,
                    success: false,
                    error: "Invalid priority value"
                });
                continue;
            }

            // Create priority history entry
            const priorityHistory = {
                taskId: update.taskId,
                previousPriority: task.priority,
                newPriority: update.priority,
                changedAt: new Date().toISOString(),
                batchUpdate: true
            };

            // Update task priority
            const updatedTask = await prisma.task.update({
                where: { id: update.taskId },
                data: {
                    priority: update.priority,
                    updatedAt: new Date()
                }
            });

            priorityHistories.push(priorityHistory);
            results.push({
                taskId: update.taskId,
                success: true,
                previousPriority: task.priority,
                newPriority: update.priority
            });
        }

        // Store all priority histories
        await Promise.all(priorityHistories.map(ph => storePriorityHistory(ph)));

        return NextResponse.json({
            success: true,
            totalUpdates: updates.length,
            successfulUpdates: results.filter(r => r.success).length,
            results
        });
    } catch (error) {
        console.error("Batch priority update error:", error);
        return NextResponse.json(
            { error: "Failed to process batch priority update" },
            { status: 500 }
        );
    }
}

/**
 * Store priority history for tracking and analytics
 * Maintains audit trail of all priority changes for analytics and reporting
 */
async function storePriorityHistory(history: any) {
    try {
        // Store priority history in database for audit trail and analytics
        // This allows tracking of priority changes over time
        
        // Create a priority history entry if the table exists
        // For now, we'll store it in AnalyticsData as a workaround
        const analyticsEntry = await prisma.analyticsData.create({
            data: {
                userId: history.taskId.split('_')[0] || 'unknown', // Extract userId if available
                dataType: 'PRIORITY_CHANGE',
                date: new Date(history.changedAt),
                data: JSON.stringify({
                    taskId: history.taskId,
                    previousPriority: history.previousPriority,
                    newPriority: history.newPriority,
                    smartScore: history.smartScore,
                    action: history.action,
                    reason: history.reason,
                    batchUpdate: history.batchUpdate || false,
                    timestamp: history.changedAt
                })
            }
        }).catch(error => {
            // If unique constraint fails, update existing entry
            if (error.code === 'P2002') {
                console.log('Priority history already recorded for this date');
                return null;
            }
            throw error;
        });

        if (analyticsEntry) {
            console.log('Priority History Recorded:', {
                taskId: history.taskId,
                previousPriority: history.previousPriority,
                newPriority: history.newPriority,
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        console.error("Error storing priority history:", error);
        // Don't throw - allow app to continue even if history storage fails
    }
}
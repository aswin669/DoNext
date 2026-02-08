import { NextResponse } from "next/server";
import { AuthService } from "@/lib/auth-service";
import { SmartGoalService } from "@/lib/smart-goal-service";
import { validateRequestBody } from "@/lib/errors";
import { z } from "zod";

// Validation schemas
const createGoalSchema = z.object({
    title: z.string().min(1, "Title is required").max(200, "Title too long"),
    description: z.string().max(1000, "Description too long").optional(),
    specific: z.string().max(500, "Specific details too long").optional(),
    measurable: z.string().max(300, "Measurement criteria too long").optional(),
    achievable: z.boolean().default(true),
    relevant: z.string().max(300, "Relevance too long").optional(),
    timeBound: z.string().datetime().optional(),
    targetValue: z.number().positive("Target value must be positive").optional(),
    currentValue: z.number().nonnegative("Current value cannot be negative").default(0),
    unit: z.string().max(50, "Unit too long").optional(),
    category: z.string().max(100, "Category too long").optional(),
    priority: z.enum(['High', 'Medium', 'Low']).default('Medium')
});

const updateProgressSchema = z.object({
    currentValue: z.number().nonnegative("Current value cannot be negative").optional(),
    status: z.enum(['Active', 'Completed', 'Archived']).optional(),
    specific: z.string().max(500, "Specific details too long").optional(),
    measurable: z.string().max(300, "Measurement criteria too long").optional(),
    relevant: z.string().max(300, "Relevance too long").optional(),
    timeBound: z.string().datetime().optional(),
    goalId: z.string()
});

export async function GET(req: Request) {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status') as 'Active' | 'Completed' | 'Archived' | null;
        const type = searchParams.get('type') || 'goals';
        
        if (type === 'analytics') {
            // Get goal analytics
            const analytics = await SmartGoalService.getGoalAnalytics(user.id);
            return NextResponse.json({
                success: true,
                analytics
            });
        } else if (type === 'overdue') {
            // Get overdue goals
            const goals = await SmartGoalService.getOverdueGoals(user.id);
            return NextResponse.json({
                success: true,
                goals
            });
        } else if (type === 'upcoming') {
            // Get upcoming goals
            const days = parseInt(searchParams.get('days') || '7');
            const goals = await SmartGoalService.getUpcomingGoals(user.id, days);
            return NextResponse.json({
                success: true,
                goals
            });
        } else {
            // Get user goals
            const goals = await SmartGoalService.getUserGoals(user.id, status || undefined);
            return NextResponse.json({
                success: true,
                goals
            });
        }
    } catch (error) {
        console.error("Goals GET error:", error);
        return NextResponse.json(
            { error: "Failed to fetch goals" }, 
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
        const { action } = body;
        
        if (action === 'create') {
            // Create new goal
            const validatedData = createGoalSchema.parse(body);
            const goalData = validatedData as any;
            
            // Convert timeBound string to Date if provided
            if (goalData.timeBound) {
                goalData.deadline = new Date(goalData.timeBound);
                delete goalData.timeBound;
            }
            
            const goal = await SmartGoalService.createGoal(goalData, user.id);
            
            return NextResponse.json({
                success: true,
                goal,
                message: "Goal created successfully"
            });
        } else if (action === 'updateProgress') {
            // Update goal progress
            const validatedData = updateProgressSchema.parse(body);
            const { goalId, ...updateData } = validatedData as { goalId: string } & Record<string, any>;
            
            if (!goalId) {
                return NextResponse.json(
                    { error: "Goal ID is required" }, 
                    { status: 400 }
                );
            }
            
            // Convert timeBound string to Date if provided
            if (updateData.timeBound) {
                updateData.deadline = new Date(updateData.timeBound);
                delete updateData.timeBound;
            }
            
            const goal = await SmartGoalService.updateGoalProgress(goalId, user.id, updateData);
            
            return NextResponse.json({
                success: true,
                goal,
                message: "Goal progress updated successfully"
            });
        } else if (action === 'createMilestone') {
            // Create milestone
            const { goalId, title, description, targetValue, deadline } = body;
            
            if (!goalId || !title || targetValue === undefined) {
                return NextResponse.json(
                    { error: "Goal ID, title, and target value are required" }, 
                    { status: 400 }
                );
            }
            
            const milestone = await SmartGoalService.createMilestone(goalId, user.id, {
                title,
                description,
                targetValue,
                deadline: deadline ? new Date(deadline) : undefined
            });
            
            return NextResponse.json({
                success: true,
                milestone,
                message: "Milestone created successfully"
            });
        } else {
            return NextResponse.json(
                { error: "Invalid action. Must be 'create', 'updateProgress', or 'createMilestone'" }, 
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error("Goals POST error:", error);
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
            { error: "Failed to process goal request" }, 
            { status: 500 }
        );
    }
}
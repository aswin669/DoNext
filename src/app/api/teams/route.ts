import { NextResponse } from "next/server";
import { AuthService } from "@/lib/auth-service";
import { TeamCollaborationService } from "@/lib/team-collaboration-service";
import { validateRequestBody } from "@/lib/errors";
import { z } from "zod";

// Validation schemas
const createTeamSchema = z.object({
    name: z.string().min(1, "Team name is required").max(100, "Team name too long"),
    description: z.string().max(500, "Description too long").optional()
});

const createProjectSchema = z.object({
    name: z.string().min(1, "Project name is required").max(100, "Project name too long"),
    description: z.string().max(1000, "Description too long").optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional()
});

const createTaskSchema = z.object({
    title: z.string().min(1, "Task title is required").max(200, "Task title too long"),
    description: z.string().max(1000, "Description too long").optional(),
    assignedTo: z.string().optional(),
    priority: z.enum(['High', 'Medium', 'Low']).default('Medium'),
    dueDate: z.string().datetime().optional()
});

const updateTaskStatusSchema = z.object({
    status: z.enum(['Todo', 'InProgress', 'Review', 'Completed']),
    taskId: z.string()
});

export async function GET(req: Request) {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const { searchParams } = new URL(req.url);
        const teamId = searchParams.get('teamId');
        const type = searchParams.get('type') || 'teams';
        
        if (type === 'teams') {
            // Get user's teams
            const teams = await TeamCollaborationService.getUserTeams(user.id);
            return NextResponse.json({
                success: true,
                teams
            });
        } else if (type === 'team' && teamId) {
            // Get specific team details
            const team = await TeamCollaborationService.getTeamById(teamId, user.id);
            return NextResponse.json({
                success: true,
                team
            });
        } else if (type === 'analytics' && teamId) {
            // Get team analytics
            const analytics = await TeamCollaborationService.getTeamAnalytics(teamId, user.id);
            return NextResponse.json({
                success: true,
                analytics
            });
        } else if (type === 'invitations') {
            // Get user invitations
            const invitations = await TeamCollaborationService.getUserInvitations(user.id);
            return NextResponse.json({
                success: true,
                invitations
            });
        } else {
            return NextResponse.json(
                { error: "Invalid request parameters" }, 
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error("Team collaboration GET error:", error);
        if (error.message?.includes('Access denied')) {
            return NextResponse.json(
                { error: "Access denied" }, 
                { status: 403 }
            );
        }
        return NextResponse.json(
            { error: "Failed to fetch team data" }, 
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
        
        if (action === 'createTeam') {
            // Create new team
            const validatedData = createTeamSchema.parse(body);
            const teamData = validatedData as { name: string; description?: string };
            const team = await TeamCollaborationService.createTeam(user.id, teamData);
            
            return NextResponse.json({
                success: true,
                team,
                message: "Team created successfully"
            });
        } else if (action === 'addMember') {
            // Add team member
            const { teamId, memberEmail, role } = body;
            
            if (!teamId || !memberEmail) {
                return NextResponse.json(
                    { error: "Team ID and member email are required" }, 
                    { status: 400 }
                );
            }
            
            const membership = await TeamCollaborationService.addTeamMember(
                teamId, 
                user.id, 
                memberEmail, 
                role || 'Member'
            );
            
            return NextResponse.json({
                success: true,
                membership,
                message: "Member added successfully"
            });
        } else if (action === 'createProject') {
            // Create project
            const { teamId } = body;
            const validatedData = createProjectSchema.parse(body);
            const projectData = validatedData as { name: string; description?: string; startDate?: Date; endDate?: Date };
            
            if (!teamId) {
                return NextResponse.json(
                    { error: "Team ID is required" }, 
                    { status: 400 }
                );
            }
            
            const project = await TeamCollaborationService.createProject(teamId, user.id, projectData);
            
            return NextResponse.json({
                success: true,
                project,
                message: "Project created successfully"
            });
        } else if (action === 'createTask') {
            // Create project task
            const { projectId } = body;
            const validatedData = createTaskSchema.parse(body);
            const taskData = validatedData as { title: string; description?: string; assignedTo?: string; priority?: 'High' | 'Medium' | 'Low'; dueDate?: Date };
            
            if (!projectId) {
                return NextResponse.json(
                    { error: "Project ID is required" }, 
                    { status: 400 }
                );
            }
            
            const task = await TeamCollaborationService.createProjectTask(projectId, user.id, taskData);
            
            return NextResponse.json({
                success: true,
                task,
                message: "Task created successfully"
            });
        } else if (action === 'updateTaskStatus') {
            // Update task status
            const validatedData = updateTaskStatusSchema.parse(body);
            const { taskId, status } = validatedData as { taskId: string; status: 'Todo' | 'InProgress' | 'Review' | 'Completed' };
            
            if (!taskId) {
                return NextResponse.json(
                    { error: "Task ID is required" }, 
                    { status: 400 }
                );
            }
            
            const task = await TeamCollaborationService.updateProjectTaskStatus(taskId, user.id, status);
            
            return NextResponse.json({
                success: true,
                task,
                message: "Task status updated successfully"
            });
        } else {
            return NextResponse.json(
                { error: "Invalid action" }, 
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error("Team collaboration POST error:", error);
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
        if (error.message?.includes('Access denied')) {
            return NextResponse.json(
                { error: "Access denied" }, 
                { status: 403 }
            );
        }
        if (error.message?.includes('not found')) {
            return NextResponse.json(
                { error: error.message }, 
                { status: 404 }
            );
        }
        return NextResponse.json(
            { error: "Failed to process team request" }, 
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
        const teamId = searchParams.get('teamId');
        const memberId = searchParams.get('memberId');
        
        if (teamId && memberId) {
            // Remove team member
            await TeamCollaborationService.removeTeamMember(teamId, user.id, memberId);
            
            return NextResponse.json({
                success: true,
                message: "Member removed successfully"
            });
        } else {
            return NextResponse.json(
                { error: "Team ID and Member ID are required" }, 
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error("Team collaboration DELETE error:", error);
        if (error.message?.includes('Access denied')) {
            return NextResponse.json(
                { error: "Access denied" }, 
                { status: 403 }
            );
        }
        if (error.message?.includes('Cannot remove team owner')) {
            return NextResponse.json(
                { error: error.message }, 
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: "Failed to remove team member" }, 
            { status: 500 }
        );
    }
}
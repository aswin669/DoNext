import { NextResponse } from "next/server";
import { AuthService } from "@/lib/auth-service";
import { CommunicationIntegrationService } from "@/lib/communication-integration-service";
import { validateRequestBody } from "@/lib/errors";
import { z } from "zod";

// Validation schemas
const connectPlatformSchema = z.object({
    platform: z.enum(['slack', 'email', 'push']),
    accessToken: z.string().optional(),
    refreshToken: z.string().optional(),
    tokenExpiry: z.string().datetime().optional(),
    webhookUrl: z.string().url().optional(),
    channelId: z.string().optional(),
    email: z.string().email().optional(),
    preferences: z.record(z.string(), z.any()).optional()
});

const updateConnectionSchema = z.object({
    enabled: z.boolean().optional(),
    preferences: z.record(z.string(), z.any()).optional(),
    webhookUrl: z.string().url().optional(),
    channelId: z.string().optional(),
    email: z.string().email().optional()
});

const sendNotificationSchema = z.object({
    type: z.enum(['task_reminder', 'habit_reminder', 'goal_milestone', 'team_update', 'accountability_update', 'daily_summary', 'weekly_report']),
    title: z.string().min(1, "Title is required").max(200, "Title too long"),
    message: z.string().min(1, "Message is required").max(1000, "Message too long"),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    data: z.record(z.string(), z.any()).optional(),
    platforms: z.array(z.enum(['slack', 'email', 'push'])).optional()
});

export async function GET(req: Request) {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'connections';
        
        if (type === 'connections') {
            // Get user's communication connections
            const connections = await CommunicationIntegrationService.getUserConnections(user.id);
            return NextResponse.json({
                success: true,
                connections
            });
        } else if (type === 'platforms') {
            // Get available communication platforms
            const platforms = CommunicationIntegrationService.getAvailablePlatforms();
            return NextResponse.json({
                success: true,
                platforms
            });
        } else if (type === 'preferences') {
            // Get default notification preferences
            const preferences = CommunicationIntegrationService.getDefaultPreferences();
            return NextResponse.json({
                success: true,
                preferences
            });
        } else {
            return NextResponse.json(
                { error: "Invalid request type" }, 
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error("Communication integration GET error:", error);
        return NextResponse.json(
            { error: "Failed to fetch communication data" }, 
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
        
        if (action === 'connect') {
            // Connect communication platform
            const config: z.infer<typeof connectPlatformSchema> = connectPlatformSchema.parse(body);
            
            // Process token expiry if provided as string
            const processedConfig: any = { ...config };
            if (config.tokenExpiry) {
                processedConfig.tokenExpiry = new Date(config.tokenExpiry);
            }
            
            const connection = await CommunicationIntegrationService.connectPlatform(
                user.id, 
                config.platform, 
                processedConfig
            );
            
            return NextResponse.json({
                success: true,
                connection,
                message: "Platform connected successfully"
            });
        } else if (action === 'sendNotification') {
            // Send notification
            const notificationData: z.infer<typeof sendNotificationSchema> = sendNotificationSchema.parse(body);
            
            const result = await CommunicationIntegrationService.sendNotification(user.id, notificationData);
            
            return NextResponse.json({
                success: result.success,
                sentTo: result.sentTo,
                failed: result.failed,
                message: result.success 
                    ? `Notification sent successfully to ${result.sentTo.join(', ')}`
                    : "Failed to send notification"
            });
        } else if (action === 'sendBulk') {
            // Send bulk notifications
            const { notifications } = body;
            
            if (!Array.isArray(notifications)) {
                return NextResponse.json(
                    { error: "Notifications must be an array" }, 
                    { status: 400 }
                );
            }
            
            // Add current user to each notification if not specified
            const notificationsWithUser = notifications.map((notif: any) => ({
                userId: notif.userId || user.id,
                ...notif
            }));
            
            const result = await CommunicationIntegrationService.sendBulkNotifications(notificationsWithUser);
            
            return NextResponse.json({
                success: true,
                results: result.results,
                message: `Bulk notification sent to ${result.results.filter(r => r.success).length} users`
            });
        } else if (action === 'validatePreferences') {
            // Validate notification preferences
            const { preferences } = body;
            
            if (!preferences) {
                return NextResponse.json(
                    { error: "Preferences are required" }, 
                    { status: 400 }
                );
            }
            
            const validation = CommunicationIntegrationService.validatePreferences(preferences);
            
            return NextResponse.json({
                success: validation.valid,
                valid: validation.valid,
                errors: validation.errors
            });
        } else {
            return NextResponse.json(
                { error: "Invalid action" }, 
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error("Communication integration POST error:", error);
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
        if (error.message?.includes('not found')) {
            return NextResponse.json(
                { error: error.message }, 
                { status: 404 }
            );
        }
        return NextResponse.json(
            { error: "Failed to process communication request" }, 
            { status: 500 }
        );
    }
}

export async function PUT(req: Request) {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const body = await req.json();
        const { connectionId, ...updateData } = body;
        
        if (!connectionId) {
            return NextResponse.json(
                { error: "Connection ID is required" }, 
                { status: 400 }
            );
        }
        
        const connection = await CommunicationIntegrationService.updateConnection(connectionId, user.id, updateData);
        
        return NextResponse.json({
            success: true,
            connection,
            message: "Connection updated successfully"
        });
    } catch (error: any) {
        console.error("Communication integration PUT error:", error);
        if (error.message?.includes('not found')) {
            return NextResponse.json(
                { error: error.message }, 
                { status: 404 }
            );
        }
        return NextResponse.json(
            { error: "Failed to update connection" }, 
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
        const connectionId = searchParams.get('connectionId');
        
        if (!connectionId) {
            return NextResponse.json(
                { error: "Connection ID is required" }, 
                { status: 400 }
            );
        }
        
        await CommunicationIntegrationService.disconnectPlatform(connectionId, user.id);
        
        return NextResponse.json({
            success: true,
            message: "Platform disconnected successfully"
        });
    } catch (error: any) {
        console.error("Communication integration DELETE error:", error);
        if (error.message?.includes('not found')) {
            return NextResponse.json(
                { error: error.message }, 
                { status: 404 }
            );
        }
        return NextResponse.json(
            { error: "Failed to disconnect platform" }, 
            { status: 500 }
        );
    }
}

// Additional endpoints for testing
export async function PATCH(req: Request) {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const body = await req.json();
        const { connectionId, enabled } = body;
        
        if (!connectionId || enabled === undefined) {
            return NextResponse.json(
                { error: "Connection ID and enabled status are required" }, 
                { status: 400 }
            );
        }
        
        const connection = await CommunicationIntegrationService.updateConnection(connectionId, user.id, { enabled });
        
        return NextResponse.json({
            success: true,
            connection,
            message: `Connection ${enabled ? 'enabled' : 'disabled'} successfully`
        });
    } catch (error: any) {
        console.error("Communication integration PATCH error:", error);
        if (error.message?.includes('not found')) {
            return NextResponse.json(
                { error: error.message }, 
                { status: 404 }
            );
        }
        return NextResponse.json(
            { error: "Failed to update connection status" }, 
            { status: 500 }
        );
    }
}
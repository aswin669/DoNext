import { NextResponse } from "next/server";
import { AuthService } from "@/lib/auth-service";
import { CalendarIntegrationService } from "@/lib/calendar-integration-service";
import { validateRequestBody } from "@/lib/errors";
import { z } from "zod";

// Validation schemas
const connectCalendarSchema = z.object({
    provider: z.enum(['google', 'outlook', 'apple']),
    authCode: z.string().min(1, "Authorization code is required")
});

const createEventSchema = z.object({
    title: z.string().min(1, "Title is required").max(200, "Title too long"),
    description: z.string().max(1000, "Description too long").optional(),
    start: z.string().datetime(),
    end: z.string().datetime(),
    location: z.string().max(200, "Location too long").optional(),
    attendees: z.array(z.string().email()).optional(),
    eventType: z.enum(['Task', 'Habit', 'Meeting', 'Event']).default('Event'),
    taskId: z.string().optional(),
    isAllDay: z.boolean().default(false),
    reminders: z.array(z.number().min(0)).optional(),
    calendarId: z.string().optional()
});

const updateEventSchema = z.object({
    title: z.string().min(1, "Title is required").max(200, "Title too long").optional(),
    description: z.string().max(1000, "Description too long").optional(),
    start: z.string().datetime().optional(),
    end: z.string().datetime().optional(),
    location: z.string().max(200, "Location too long").optional(),
    attendees: z.array(z.string().email()).optional(),
    eventType: z.enum(['Task', 'Habit', 'Meeting', 'Event']).optional(),
    isAllDay: z.boolean().optional(),
    reminders: z.array(z.number().min(0)).optional(),
    eventId: z.string()
});

export async function GET(req: Request) {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'connections';
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const connectionId = searchParams.get('connectionId');
        
        if (type === 'connections') {
            // Get user's calendar connections
            const connections = await CalendarIntegrationService.getUserConnections(user.id);
            return NextResponse.json({
                success: true,
                connections
            });
        } else if (type === 'events') {
            // Get user's calendar events
            const start = startDate ? new Date(startDate) : undefined;
            const end = endDate ? new Date(endDate) : undefined;
            const events = await CalendarIntegrationService.getUserEvents(user.id, start, end);
            return NextResponse.json({
                success: true,
                events
            });
        } else if (type === 'providers') {
            // Get available calendar providers
            const providers = CalendarIntegrationService.getAvailableProviders();
            return NextResponse.json({
                success: true,
                providers
            });
        } else if (type === 'sync' && connectionId) {
            // Sync specific calendar
            await CalendarIntegrationService.syncCalendarEvents(user.id, connectionId);
            return NextResponse.json({
                success: true,
                message: "Calendar synced successfully"
            });
        } else {
            return NextResponse.json(
                { error: "Invalid request type" }, 
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error("Calendar integration GET error:", error);
        return NextResponse.json(
            { error: "Failed to fetch calendar data" }, 
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
            // Connect calendar
            const { provider, authCode } = connectCalendarSchema.parse(body);
            const connection = await CalendarIntegrationService.connectCalendar(user.id, provider, authCode);
            
            return NextResponse.json({
                success: true,
                connection,
                message: "Calendar connected successfully"
            });
        } else if (action === 'createEvent') {
            // Create calendar event
            const eventData = createEventSchema.parse(body);
            
            // Convert string dates to Date objects
            const processedData = {
                ...eventData,
                start: new Date(eventData.start),
                end: new Date(eventData.end)
            };
            
            const event = await CalendarIntegrationService.createEvent(user.id, processedData);
            
            return NextResponse.json({
                success: true,
                event,
                message: "Event created successfully"
            });
        } else if (action === 'updateEvent') {
            // Update calendar event
            const { eventId, ...updateData } = updateEventSchema.parse(body);
            
            if (!eventId) {
                return NextResponse.json(
                    { error: "Event ID is required" }, 
                    { status: 400 }
                );
            }
            
            // Convert string dates to Date objects if provided
            const processedData: any = { ...updateData };
            if (updateData.start) processedData.start = new Date(updateData.start);
            if (updateData.end) processedData.end = new Date(updateData.end);
            
            const event = await CalendarIntegrationService.updateEvent(eventId, user.id, processedData);
            
            return NextResponse.json({
                success: true,
                event,
                message: "Event updated successfully"
            });
        } else if (action === 'syncAll') {
            // Sync all calendars
            await CalendarIntegrationService.syncCalendarEvents(user.id);
            return NextResponse.json({
                success: true,
                message: "All calendars synced successfully"
            });
        } else {
            return NextResponse.json(
                { error: "Invalid action" }, 
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error("Calendar integration POST error:", error);
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
            { error: "Failed to process calendar request" }, 
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
        const eventId = searchParams.get('eventId');
        
        if (connectionId) {
            // Disconnect calendar
            await CalendarIntegrationService.disconnectCalendar(connectionId, user.id);
            return NextResponse.json({
                success: true,
                message: "Calendar disconnected successfully"
            });
        } else if (eventId) {
            // Delete calendar event
            await CalendarIntegrationService.deleteEvent(eventId, user.id);
            return NextResponse.json({
                success: true,
                message: "Event deleted successfully"
            });
        } else {
            return NextResponse.json(
                { error: "Connection ID or Event ID is required" }, 
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error("Calendar integration DELETE error:", error);
        if (error.message?.includes('not found')) {
            return NextResponse.json(
                { error: error.message }, 
                { status: 404 }
            );
        }
        return NextResponse.json(
            { error: "Failed to delete calendar item" }, 
            { status: 500 }
        );
    }
}

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
        
        const connection = await CalendarIntegrationService.toggleCalendarSync(connectionId, user.id, enabled);
        
        return NextResponse.json({
            success: true,
            connection,
            message: `Calendar sync ${enabled ? 'enabled' : 'disabled'} successfully`
        });
    } catch (error: any) {
        console.error("Calendar integration PATCH error:", error);
        if (error.message?.includes('not found')) {
            return NextResponse.json(
                { error: error.message }, 
                { status: 404 }
            );
        }
        return NextResponse.json(
            { error: "Failed to update calendar sync status" }, 
            { status: 500 }
        );
    }
}
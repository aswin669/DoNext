import { NextResponse } from "next/server";
import { AuthService } from "@/lib/auth-service";
import { AdvancedAnalyticsService } from "@/lib/advanced-analytics-service";
import { validateRequestBody } from "@/lib/errors";
import { z } from "zod";

// Validation schemas
const createWidgetSchema = z.object({
    type: z.string().min(1, "Widget type is required"),
    title: z.string().min(1, "Widget title is required").max(100, "Title too long"),
    config: z.record(z.string(), z.any()),
    position: z.number().optional(),
    size: z.enum(['small', 'medium', 'large']).default('medium')
});

const updateWidgetSchema = z.object({
    title: z.string().min(1, "Widget title is required").max(100, "Title too long").optional(),
    config: z.record(z.string(), z.any()).optional(),
    position: z.number().optional(),
    size: z.enum(['small', 'medium', 'large']).optional(),
    isVisible: z.boolean().optional(),
    widgetId: z.string()
});

const createReportSchema = z.object({
    name: z.string().min(1, "Report name is required").max(100, "Name too long"),
    description: z.string().max(500, "Description too long").optional(),
    type: z.string().min(1, "Report type is required"),
    config: z.record(z.string(), z.any()),
    schedule: z.string().optional()
});

const updateReportSchema = z.object({
    name: z.string().min(1, "Report name is required").max(100, "Name too long").optional(),
    description: z.string().max(500, "Description too long").optional(),
    config: z.record(z.string(), z.any()).optional(),
    schedule: z.string().optional(),
    reportId: z.string()
});

const generateReportSchema = z.object({
    reportId: z.string()
});

export async function GET(req: Request) {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'widgets';
        const dataType = searchParams.get('dataType');
        const date = searchParams.get('date');
        
        if (type === 'widgets') {
            // Get user's dashboard widgets
            const widgets = await AdvancedAnalyticsService.getUserWidgets(user.id);
            return NextResponse.json({
                success: true,
                widgets
            });
        } else if (type === 'reports') {
            // Get user's custom reports
            const reports = await AdvancedAnalyticsService.getUserReports(user.id);
            return NextResponse.json({
                success: true,
                reports
            });
        } else if (type === 'widgetTypes') {
            // Get available widget types
            const widgetTypes = AdvancedAnalyticsService.getAvailableWidgetTypes();
            return NextResponse.json({
                success: true,
                widgetTypes
            });
        } else if (type === 'analyticsData' && dataType) {
            // Get specific analytics data
            const queryDate = date ? new Date(date) : undefined;
            const data = await AdvancedAnalyticsService.getAnalyticsData(user.id, dataType, queryDate);
            
            return NextResponse.json({
                success: true,
                data
            });
        } else {
            return NextResponse.json(
                { error: "Invalid request type" }, 
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error("Advanced analytics GET error:", error);
        return NextResponse.json(
            { error: "Failed to fetch analytics data" }, 
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
        
        if (action === 'createWidget') {
            // Create new widget
            const validatedData = createWidgetSchema.parse(body);
            const widgetData = validatedData as {
                type: string;
                title: string;
                config: Record<string, any>;
                position?: number;
                size?: 'small' | 'medium' | 'large';
            };
            const widget = await AdvancedAnalyticsService.createWidget(user.id, widgetData);
            
            return NextResponse.json({
                success: true,
                widget,
                message: "Widget created successfully"
            });
        } else if (action === 'updateWidget') {
            // Update widget
            const validatedData = updateWidgetSchema.parse(body);
            const { widgetId, ...updateData } = validatedData as { widgetId: string } & Record<string, any>;
            
            if (!widgetId) {
                return NextResponse.json(
                    { error: "Widget ID is required" }, 
                    { status: 400 }
                );
            }
            
            const widget = await AdvancedAnalyticsService.updateWidget(widgetId, user.id, updateData);
            
            return NextResponse.json({
                success: true,
                widget,
                message: "Widget updated successfully"
            });
        } else if (action === 'reorderWidgets') {
            // Reorder widgets
            const { widgetOrder } = body;
            
            if (!Array.isArray(widgetOrder)) {
                return NextResponse.json(
                    { error: "Widget order must be an array" }, 
                    { status: 400 }
                );
            }
            
            await AdvancedAnalyticsService.reorderWidgets(user.id, widgetOrder);
            
            return NextResponse.json({
                success: true,
                message: "Widgets reordered successfully"
            });
        } else if (action === 'createReport') {
            // Create custom report
            const validatedData = createReportSchema.parse(body);
            const reportData = validatedData as {
                name: string;
                description?: string;
                type: string;
                config: Record<string, any>;
                schedule?: string;
            };
            const report = await AdvancedAnalyticsService.createReport(user.id, reportData);
            
            return NextResponse.json({
                success: true,
                report,
                message: "Report created successfully"
            });
        } else if (action === 'updateReport') {
            // Update custom report
            const validatedData = updateReportSchema.parse(body);
            const { reportId, ...updateData } = validatedData as { reportId: string } & Record<string, any>;
            
            if (!reportId) {
                return NextResponse.json(
                    { error: "Report ID is required" }, 
                    { status: 400 }
                );
            }
            
            const report = await AdvancedAnalyticsService.updateReport(reportId, user.id, updateData);
            
            return NextResponse.json({
                success: true,
                report,
                message: "Report updated successfully"
            });
        } else if (action === 'generateReport') {
            // Generate report data
            const validatedData = generateReportSchema.parse(body);
            const { reportId } = validatedData;
            const report = await AdvancedAnalyticsService.generateReportData(reportId, user.id);
            
            return NextResponse.json({
                success: true,
                report,
                message: "Report data generated successfully"
            });
        } else if (action === 'storeAnalyticsData') {
            // Store analytics data
            const { dataType, data, date } = body;
            
            if (!dataType || !data) {
                return NextResponse.json(
                    { error: "Data type and data are required" }, 
                    { status: 400 }
                );
            }
            
            const analyticsData = await AdvancedAnalyticsService.storeAnalyticsData(
                user.id,
                dataType,
                data,
                date ? new Date(date) : undefined
            );
            
            return NextResponse.json({
                success: true,
                data: analyticsData,
                message: "Analytics data stored successfully"
            });
        } else {
            return NextResponse.json(
                { error: "Invalid action" }, 
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error("Advanced analytics POST error:", error);
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
            { error: "Failed to process analytics request" }, 
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
        const widgetId = searchParams.get('widgetId');
        const reportId = searchParams.get('reportId');
        
        if (widgetId) {
            // Delete widget
            await AdvancedAnalyticsService.deleteWidget(widgetId, user.id);
            
            return NextResponse.json({
                success: true,
                message: "Widget deleted successfully"
            });
        } else if (reportId) {
            // Delete report
            await AdvancedAnalyticsService.deleteReport(reportId, user.id);
            
            return NextResponse.json({
                success: true,
                message: "Report deleted successfully"
            });
        } else {
            return NextResponse.json(
                { error: "Widget ID or Report ID is required" }, 
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error("Advanced analytics DELETE error:", error);
        if (error.message?.includes('not found')) {
            return NextResponse.json(
                { error: error.message }, 
                { status: 404 }
            );
        }
        return NextResponse.json(
            { error: "Failed to delete analytics item" }, 
            { status: 500 }
        );
    }
}
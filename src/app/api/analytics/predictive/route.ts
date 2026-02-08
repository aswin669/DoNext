import { NextResponse } from "next/server";
import { AuthService } from "@/lib/auth-service";
import { PredictiveAnalyticsService } from "@/lib/predictive-analytics-service";

export async function GET(req: Request) {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'forecast';
        const forecastDays = parseInt(searchParams.get('days') || '30');
        const period = searchParams.get('period') || 'month';
        
        if (type === 'forecast') {
            // Generate performance forecast
            const forecast = await PredictiveAnalyticsService.generatePerformanceForecast(user.id, forecastDays);
            return NextResponse.json({
                success: true,
                forecast
            });
        } else if (type === 'trends') {
            // Analyze performance trends
            const trends = await PredictiveAnalyticsService.analyzePerformanceTrends(user.id, period as any);
            return NextResponse.json({
                success: true,
                trends
            });
        } else if (type === 'habitPredictions') {
            // Get habit adherence predictions
            const predictions = await PredictiveAnalyticsService.predictHabitAdherence(user.id);
            return NextResponse.json({
                success: true,
                predictions
            });
        } else {
            return NextResponse.json(
                { error: "Invalid request type" }, 
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error("Predictive analytics GET error:", error);
        return NextResponse.json(
            { error: "Failed to generate predictive analytics" }, 
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
        const { action, tasks } = body;
        
        if (action === 'predictTaskCompletion') {
            // Predict task completion likelihood
            if (!tasks || !Array.isArray(tasks)) {
                return NextResponse.json(
                    { error: "Tasks array is required" }, 
                    { status: 400 }
                );
            }
            
            const predictions = await PredictiveAnalyticsService.predictTaskCompletion(user.id, tasks);
            
            return NextResponse.json({
                success: true,
                predictions,
                message: "Task completion predictions generated successfully"
            });
        } else {
            return NextResponse.json(
                { error: "Invalid action" }, 
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error("Predictive analytics POST error:", error);
        return NextResponse.json(
            { error: "Failed to process predictive analytics request" }, 
            { status: 500 }
        );
    }
}
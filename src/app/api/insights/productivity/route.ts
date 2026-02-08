import { NextResponse } from "next/server";
import { AuthService } from "@/lib/auth-service";
import { ProductivityInsightsService } from "@/lib/productivity-insights";

export async function GET() {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const insights = await ProductivityInsightsService.generateUserInsights(user.id);
        
        return NextResponse.json({
            success: true,
            insights
        });
    } catch (error) {
        console.error("Productivity insights API error:", error);
        return NextResponse.json(
            { error: "Failed to generate productivity insights" }, 
            { status: 500 }
        );
    }
}
import { NextResponse } from "next/server";
import { AuthService } from "@/lib/auth-service";
import { TradingService } from "@/lib/trading-service";

export async function GET(req: Request) {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const { searchParams } = new URL(req.url);
        const date = searchParams.get("date") ? new Date(searchParams.get("date")!) : new Date();
        
        const plan = await TradingService.getDailyPlan(user.id, date);
        
        return NextResponse.json(plan || { message: "No plan for this date" });
    } catch (error) {
        console.error("Daily plan GET error:", error);
        return NextResponse.json({ error: "Failed to fetch daily plan" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const body = await req.json();
        const { date, marketBias, goals, maxRisk, maxRiskPercent, accountSize, notes } = body;
        
        if (!date || !marketBias || !goals || maxRisk === undefined || !accountSize) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }
        
        const plan = await TradingService.createDailyPlan(user.id, {
            date: new Date(date),
            marketBias,
            goals,
            maxRisk,
            maxRiskPercent: maxRiskPercent || (maxRisk / accountSize) * 100,
            accountSize,
            notes
        });
        
        return NextResponse.json(plan);
    } catch (error) {
        console.error("Daily plan POST error:", error);
        return NextResponse.json({ error: "Failed to create daily plan" }, { status: 500 });
    }
}

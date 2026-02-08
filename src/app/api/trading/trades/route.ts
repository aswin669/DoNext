import { NextResponse } from "next/server";
import { AuthService } from "@/lib/auth-service";
import { TradingService } from "@/lib/trading-service";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET(req: Request) {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const symbol = searchParams.get("symbol");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        
        const trades = await TradingService.getUserTrades(user.id, {
            status: status || undefined,
            symbol: symbol || undefined,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined
        });
        
        return NextResponse.json(trades);
    } catch (error) {
        console.error("Trades GET error:", error);
        return NextResponse.json({ error: "Failed to fetch trades" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const formData = await req.formData();
        const symbol = formData.get("symbol") as string;
        const tradeType = formData.get("tradeType") as "Long" | "Short";
        const entryPrice = formData.get("entryPrice") as string;
        const stopLoss = formData.get("stopLoss") as string;
        const target = formData.get("target") as string;
        const quantity = formData.get("quantity") as string;
        const riskAmount = formData.get("riskAmount") as string;
        const rewardAmount = formData.get("rewardAmount") as string;
        const priority = formData.get("priority") as "High" | "Medium" | "Low";
        const strategy = formData.get("strategy") as string;
        const notes = formData.get("notes") as string;
        const entryImageFile = formData.get("entryImage") as File | null;
        const exitImageFile = formData.get("exitImage") as File | null;
        
        if (!symbol || !tradeType || !entryPrice || !stopLoss || !target || !quantity) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }
        
        // Save images if provided
        let entryImagePath: string | undefined;
        let exitImagePath: string | undefined;
        
        const uploadDir = join(process.cwd(), "public", "uploads", "trades", user.id);
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }
        
        if (entryImageFile) {
            const buffer = await entryImageFile.arrayBuffer();
            const filename = `entry_${Date.now()}.${entryImageFile.type.split("/")[1]}`;
            const filepath = join(uploadDir, filename);
            await writeFile(filepath, Buffer.from(buffer));
            entryImagePath = `/uploads/trades/${user.id}/${filename}`;
        }
        
        if (exitImageFile) {
            const buffer = await exitImageFile.arrayBuffer();
            const filename = `exit_${Date.now()}.${exitImageFile.type.split("/")[1]}`;
            const filepath = join(uploadDir, filename);
            await writeFile(filepath, Buffer.from(buffer));
            exitImagePath = `/uploads/trades/${user.id}/${filename}`;
        }
        
        const riskRewardRatio = parseFloat(rewardAmount) / parseFloat(riskAmount);
        
        const trade = await TradingService.createTrade(user.id, {
            symbol,
            tradeType,
            entryPrice: parseFloat(entryPrice),
            stopLoss: parseFloat(stopLoss),
            target: parseFloat(target),
            quantity: parseFloat(quantity),
            riskAmount: parseFloat(riskAmount),
            rewardAmount: parseFloat(rewardAmount),
            riskRewardRatio,
            priority: priority || "Medium",
            strategy,
            notes,
            entryImage: entryImagePath,
            exitImage: exitImagePath
        });
        
        return NextResponse.json(trade);
    } catch (error) {
        console.error("Trades POST error:", error);
        return NextResponse.json({ error: "Failed to create trade" }, { status: 500 });
    }
}

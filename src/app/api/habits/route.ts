import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth-service";

export async function GET() {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const habits = await prisma.habit.findMany({
            where: { userId: user.id },
            include: { completions: true },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(habits);
    } catch (error) {
        console.error("Habits GET Error:", error);
        return NextResponse.json({ error: "Failed to fetch habits" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, icon, category, frequency, goalValue, goalUnit, reminderTime, motivation } = body;

        if (!name || !category) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const habit = await prisma.habit.create({
            data: {
                name,
                icon: icon || "🧘",
                category,
                frequency: frequency || "Daily",
                goalValue: parseInt(goalValue) || 1,
                goalUnit: goalUnit || "times",
                reminderTime: reminderTime || "08:00",
                motivation: motivation || "",
                userId: user.id
            }
        });

        return NextResponse.json(habit, { status: 201 });
    } catch (error) {
        console.error("Habit POST Error:", error);
        return NextResponse.json({ error: "Failed to create habit" }, { status: 500 });
    }
}

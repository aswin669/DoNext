import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth-service";
import { habitCreateSchema } from "@/lib/validation";

export async function GET() {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const habits = await prisma.habit.findMany({
            where: { userId: user.id },
            include: {
                completions: true,
                streaks: true
            }
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
        
        // Validate request body
        const validatedData = habitCreateSchema.parse(body);

        const newHabit = await prisma.habit.create({
            data: {
                ...validatedData,
                userId: user.id
            }
        });

        return NextResponse.json(newHabit);
    } catch (error: any) {
        console.error("Habit POST Error:", error);
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: "Invalid habit data", details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to create habit" }, { status: 500 });
    }
}

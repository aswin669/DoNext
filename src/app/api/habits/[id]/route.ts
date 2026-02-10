import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth-service";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const { id } = await params;
        const body = await req.json();
        const { name, icon, category, frequency, goalValue, goalUnit, reminderTime, motivation } = body;

        const updatedHabit = await prisma.habit.update({
            where: { 
                id,
                userId: user.id
            },
            data: {
                name,
                icon,
                category,
                frequency,
                goalValue: parseInt(goalValue) || 1,
                goalUnit,
                reminderTime,
                motivation
            }
        });

        return NextResponse.json(updatedHabit);
    } catch (error) {
        console.error("Habit PUT Error:", error);
        return NextResponse.json({ error: "Failed to update habit" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const { id } = await params;
        
        // Delete habit and its completions
        await prisma.habitCompletion.deleteMany({
            where: { habitId: id }
        });

        await prisma.habit.delete({
            where: { 
                id,
                userId: user.id
            }
        });
        
        return NextResponse.json({ message: "Habit deleted" });
    } catch (error) {
        console.error("Habit DELETE Error:", error);
        return NextResponse.json({ error: "Failed to delete habit" }, { status: 500 });
    }
}


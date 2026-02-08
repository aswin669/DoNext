import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { date } = await req.json(); // Expected date string like "2024-11-14"
        
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        
        const nextDay = new Date(targetDate);
        nextDay.setDate(targetDate.getDate() + 1);

        const existingCompletion = await prisma.habitCompletion.findFirst({
            where: {
                habitId: id,
                date: {
                    gte: targetDate,
                    lt: nextDay
                }
            }
        });

        if (existingCompletion) {
            await prisma.habitCompletion.delete({
                where: { id: existingCompletion.id }
            });
            return NextResponse.json({ completed: false });
        } else {
            await prisma.habitCompletion.create({
                data: {
                    habitId: id,
                    date: targetDate
                }
            });
            return NextResponse.json({ completed: true });
        }
    } catch (error) {
        console.error("Habit Toggle Error:", error);
        return NextResponse.json({ error: "Failed to toggle habit completion" }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        // Check if already completed today
        const existingCompletion = await prisma.routineCompletion.findFirst({
            where: {
                routineStepId: id,
                date: {
                    gte: todayStart,
                    lt: todayEnd
                }
            }
        });

        if (existingCompletion) {
            // Remove completion (toggle off)
            await prisma.routineCompletion.delete({
                where: { id: existingCompletion.id }
            });
            return NextResponse.json({ completed: false });
        } else {
            // Add completion (toggle on)
            await prisma.routineCompletion.create({
                data: {
                    routineStepId: id,
                    date: new Date()
                }
            });
            return NextResponse.json({ completed: true });
        }
    } catch (error) {
        console.error("Routine Toggle Error:", error);
        return NextResponse.json({ error: "Failed to toggle completion" }, { status: 500 });
    }
}

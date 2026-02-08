import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth-service";

export async function GET() {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const steps = await prisma.routineStep.findMany({
            where: { userId: user.id },
            orderBy: { time: "asc" },
            include: {
                completions: {
                    where: {
                        date: {
                            gte: new Date(new Date().setHours(0, 0, 0, 0)),
                            lt: new Date(new Date().setHours(23, 59, 59, 999))
                        }
                    }
                }
            }
        });

        // Transform to return completed status
        const transformedSteps = steps.map(step => ({
            ...step,
            completed: step.completions.length > 0
        }));

        return NextResponse.json(transformedSteps);
    } catch (error) {
        console.error("Routine GET Error:", error);
        return NextResponse.json({ error: "Failed to fetch routine" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const body = await req.json();
        const { task, time, category, icon } = body;

        const newStep = await prisma.routineStep.create({
            data: {
                task,
                time,
                category,
                icon,
                userId: user.id
            }
        });

        return NextResponse.json(newStep);
    } catch (error) {
        console.error("Routine POST Error:", error);
        return NextResponse.json({ error: "Failed to create routine step" }, { status: 500 });
    }
}

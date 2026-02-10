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
        const { task, time, category, icon } = body;

        const updatedStep = await prisma.routineStep.update({
            where: { 
                id,
                userId: user.id
            },
            data: {
                task,
                time,
                category,
                icon
            }
        });

        return NextResponse.json(updatedStep);
    } catch (error) {
        console.error("Routine PUT Error:", error);
        return NextResponse.json({ error: "Failed to update routine step" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const { id } = await params;
        
        // Delete step and its completions (cascading handled by Prisma if configured, otherwise manually)
        await prisma.routineCompletion.deleteMany({
            where: { stepId: id }
        });

        await prisma.routineStep.delete({
            where: { 
                id,
                userId: user.id
            }
        });
        
        return NextResponse.json({ message: "Routine step deleted" });
    } catch (error) {
        console.error("Routine DELETE Error:", error);
        return NextResponse.json({ error: "Failed to delete routine step" }, { status: 500 });
    }
}


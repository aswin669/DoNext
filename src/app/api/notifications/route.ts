import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth-service";

export async function GET() {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const notifications = await prisma.notification.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(notifications);
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}

export async function PUT(req: Request) {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { id } = await req.json();

        if (id === "all") {
            await prisma.notification.updateMany({
                where: { userId: user.id, read: false },
                data: { read: true }
            });
        } else {
            await prisma.notification.update({
                where: { id, userId: user.id },
                data: { read: true }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Notifications PUT Error:", error);
        return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { title, message, type } = await req.json();

        const notification = await prisma.notification.create({
            data: {
                title,
                message,
                type: type || "info",
                userId: user.id
            }
        });

        return NextResponse.json(notification);
    } catch (error) {
         console.error("Notifications POST Error:", error);
        return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
    }
}

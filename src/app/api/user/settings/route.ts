import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth-service";

export async function GET() {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        // prisma types may not be fully generated
        const fullUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                name: true,
                email: true,
                profilePicture: true,
                theme: true,
                notifEmail: true,
                notifPush: true,
                defaultView: true
            }
        });
        return NextResponse.json(fullUser);
    } catch (error) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}

export async function PUT(req: Request) {
    try {
        const user = await AuthService.getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const body = await req.json();
        
        // Only update fields that are provided
        const updateData: any = {};
        if (body.name !== undefined) updateData.name = body.name;
        if (body.email !== undefined) updateData.email = body.email;
        if (body.profilePicture !== undefined) updateData.profilePicture = body.profilePicture;
        if (body.theme !== undefined) updateData.theme = body.theme;
        if (body.notifEmail !== undefined) updateData.notifEmail = body.notifEmail;
        if (body.notifPush !== undefined) updateData.notifPush = body.notifPush;
        if (body.defaultView !== undefined) updateData.defaultView = body.defaultView;

        // @ts-expect-error - prisma types may not be fully generated
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: updateData
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Settings PUT Error:", error);
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Find user with valid reset token
        const users = await prisma.user.findMany({
            where: {
                resetToken: { not: null },
                resetTokenExpiry: {
                    gt: new Date()
                }
            }
        });

        // Validate token against hashed tokens
        let user = null;
        for (const u of users) {
            if (u.resetToken && await bcrypt.compare(token, u.resetToken)) {
                user = u;
                break;
            }
        }

        if (!user) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });

        return NextResponse.json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Reset Password Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

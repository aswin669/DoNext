import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            // Return success even if user not found to prevent email enumeration
            return NextResponse.json({ message: "If that email exists, we sent a link." });
        }

        // Generate secure reset token
        const rawToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = await bcrypt.hash(rawToken, 10);
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

        // Update user with encrypted token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken: hashedToken,
                resetTokenExpiry
            }
        });

        // Construct reset link
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const resetLink = `${baseUrl}/auth/reset-password?token=${rawToken}`;

        // Mock Email Sending
        console.log("==================================================");
        console.log("PASSWORD RESET LINK FOR:", email);
        console.log("Reset Link:", resetLink);
        console.log("==================================================");

        return NextResponse.json({ message: "Reset link sent" });
    } catch (error) {
        console.error("Forgot Password Error:", error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}

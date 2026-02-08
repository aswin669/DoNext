import { NextResponse } from "next/server";
import { AuthService } from "@/lib/auth-service";

export async function POST() {
    try {
        await AuthService.destroySession();
        return NextResponse.json({ message: "Logged out" });
    } catch (error) {
        return NextResponse.json({ error: "Logout failed" }, { status: 500 });
    }
}

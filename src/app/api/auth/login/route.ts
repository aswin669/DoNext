import { NextResponse } from "next/server";
import { AuthService } from "@/lib/auth-service";
import { validateRequestBody, createErrorResponse, createSuccessResponse } from "@/lib/errors";
import { loginSchema, LoginInput } from "@/lib/validation";

export async function POST(req: Request) {
    try {
        // Validate request body
        const { email, password }: LoginInput = await validateRequestBody(req, loginSchema);

        // Authenticate user using secure service
        const user = await AuthService.authenticateUser(email, password);
        if (!user) {
            return createErrorResponse(new Error("Invalid credentials"), 401);
        }

        // Create secure session
        await AuthService.createSession(user.id);

        return createSuccessResponse({ message: "Logged in" });
    } catch (error: any) {
        return createErrorResponse(error);
    }
}

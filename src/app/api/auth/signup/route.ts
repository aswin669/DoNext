import { NextResponse } from "next/server";
import { AuthService } from "@/lib/auth-service";
import { validateRequestBody, createErrorResponse, createSuccessResponse } from "@/lib/errors";
import { signupSchema, SignupInput } from "@/lib/validation";

export async function POST(req: Request) {
    try {
        // Validate request body
        const { name, email, password }: SignupInput = await validateRequestBody(req, signupSchema);

        // Register user using secure service
        const user = await AuthService.registerUser(name, email, password);

        // Create secure session
        await AuthService.createSession(user.id);

        return createSuccessResponse({ message: "User created" });
    } catch (error: any) {
        return createErrorResponse(error);
    }
}

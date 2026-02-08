import { AuthService } from "@/lib/auth-service";
import { validateRequestBody, createErrorResponse, createSuccessResponse } from "@/lib/errors";
import { loginSchema, LoginInput } from "@/lib/validation";
import { AuthenticationError } from "@/types";

export async function POST(req: Request) {
    try {
        // Validate request body
        const { email, password }: LoginInput = await validateRequestBody(req, loginSchema);

        // Authenticate user using secure service
        const user = await AuthService.authenticateUser(email, password);
        if (!user) {
            throw new AuthenticationError("Invalid email or password");
        }

        // Create secure session
        await AuthService.createSession(user.id);

        return createSuccessResponse({ message: "Logged in" });
    } catch (error: unknown) {
        return createErrorResponse(error);
    }
}

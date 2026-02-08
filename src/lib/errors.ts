import { NextResponse } from "next/server";
import { AppError, ValidationError, AuthenticationError, AuthorizationError, NotFoundError } from "@/types";

/**
 * Creates a standardized API error response
 */
export function createErrorResponse(error: Error | AppError, status?: number): NextResponse {
    // Handle custom AppError instances
    if (error instanceof AppError) {
        return NextResponse.json(
            { 
                success: false,
                error: error.message,
                code: error.code
            },
            { status: error.statusCode }
        );
    }

    // Handle specific error types
    if (error instanceof ValidationError) {
        return NextResponse.json(
            { 
                success: false,
                error: error.message,
                code: 'VALIDATION_ERROR'
            },
            { status: 400 }
        );
    }

    if (error instanceof AuthenticationError) {
        return NextResponse.json(
            { 
                success: false,
                error: error.message,
                code: 'AUTHENTICATION_ERROR'
            },
            { status: 401 }
        );
    }

    if (error instanceof AuthorizationError) {
        return NextResponse.json(
            { 
                success: false,
                error: error.message,
                code: 'AUTHORIZATION_ERROR'
            },
            { status: 403 }
        );
    }

    if (error instanceof NotFoundError) {
        return NextResponse.json(
            { 
                success: false,
                error: error.message,
                code: 'NOT_FOUND_ERROR'
            },
            { status: 404 }
        );
    }

    // Handle generic errors
    console.error("Unhandled error:", error);
    return NextResponse.json(
        { 
            success: false,
            error: "Internal server error",
            code: "INTERNAL_ERROR"
        },
        { status: status || 500 }
    );
}

/**
 * Creates a successful API response
 */
export function createSuccessResponse<T>(data: T, status: number = 200): NextResponse {
    return NextResponse.json(
        { 
            success: true,
            data 
        },
        { status }
    );
}

/**
 * Creates a message response
 */
export function createMessageResponse(message: string, status: number = 200): NextResponse {
    return NextResponse.json(
        { 
            success: true,
            message 
        },
        { status }
    );
}

/**
 * Wraps an API route handler with error handling
 */
export function withErrorHandling<T>(
    handler: (req: Request, context: T) => Promise<NextResponse>
) {
    return async (req: Request, context: T): Promise<NextResponse> => {
        try {
            return await handler(req, context);
        } catch (error: any) {
            return createErrorResponse(error);
        }
    };
}

/**
 * Validates request body against a schema
 */
export async function validateRequestBody<T>(req: Request, schema: any): Promise<T> {
    try {
        const body = await req.json();
        return schema.parse(body);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            throw new ValidationError(`Invalid request body: ${error.issues.map((e: any) => e.message).join(', ')}`);
        }
        throw new ValidationError('Invalid JSON in request body');
    }
}
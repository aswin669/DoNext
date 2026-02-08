import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Define protected routes
    const protectedRoutes = [
        "/dashboard",
        "/settings",
        "/tasks",
        "/habits",
        "/routine",
        "/analytics",
        "/notifications"
    ];

    // Check if the current path starts with any of the protected routes
    const isProtectedRoute = protectedRoutes.some((route) => 
        pathname.startsWith(route)
    );

    // Get the session cookie
    const userId = request.cookies.get("userId")?.value;

    // Redirect unauthenticated users
    if (isProtectedRoute && !userId) {
        const loginUrl = new URL("/auth/login", request.url);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - auth (auth routes need to be public)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|auth).*)',
    ],
};
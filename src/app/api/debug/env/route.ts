export async function GET() {
    return Response.json({
        DATABASE_URL: process.env.DATABASE_URL ? "✓ Configured" : "✗ Not configured",
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL
    });
}

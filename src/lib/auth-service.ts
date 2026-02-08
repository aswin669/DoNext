import { cookies } from "next/headers";
import prisma from "./prisma";
import bcrypt from "bcryptjs";
import { AppConfig } from "./config";
import { randomBytes } from "crypto";



export interface AuthUser {
    id: string;
    email: string;
    name: string | null;
    theme: string;
    notifEmail: boolean;
    notifPush: boolean;
    defaultView: string;
}

export class AuthService {
    /**
     * Get current authenticated user
     */
    static async getCurrentUser(): Promise<AuthUser | null> {
        try {
            const cookieStore = await cookies();
            const userId = cookieStore.get(AppConfig.SESSION.COOKIE_NAME)?.value;
            
            if (!userId) return null;

            // Validate session exists and is not expired
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    theme: true,
                    notifEmail: true,
                    notifPush: true,
                    defaultView: true
                }
            });

            return user as AuthUser | null;
        } catch (error) {
            console.error("Auth service error:", error);
            return null;
        }
    }

    /**
     * Authenticate user credentials
     */
    static async authenticateUser(email: string, password: string): Promise<AuthUser | null> {
        try {
            const user = await prisma.user.findUnique({
                where: { email }
            });

            if (!user) return null;

            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) return null;

            // Return user without password
            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword as AuthUser;
        } catch (error) {
            console.error("Authentication error:", error);
            return null;
        }
    }

    /**
     * Create session cookie
     */
    static async createSession(userId: string): Promise<void> {
        try {
            const cookieStore = await cookies();
            
            // Set main session cookie
            cookieStore.set(AppConfig.SESSION.COOKIE_NAME, userId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: AppConfig.SESSION.MAX_AGE,
                path: "/",
                sameSite: "lax"
            });

            // Set CSRF token
            const csrfToken = this.generateCSRFToken();
            cookieStore.set(AppConfig.SESSION.CSRF_COOKIE_NAME, csrfToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: AppConfig.SESSION.MAX_AGE,
                path: "/",
                sameSite: "lax"
            });
        } catch (error) {
            console.error("Session creation error:", error);
            throw new Error("Failed to create session");
        }
    }

    /**
     * Destroy session
     */
    static async destroySession(): Promise<void> {
        try {
            const cookieStore = await cookies();
            cookieStore.delete(AppConfig.SESSION.COOKIE_NAME);
            cookieStore.delete(AppConfig.SESSION.CSRF_COOKIE_NAME);
        } catch (error) {
            console.error("Session destruction error:", error);
            throw new Error("Failed to destroy session");
        }
    }

    /**
     * Validate CSRF token
     */
    static async validateCSRFToken(token: string): Promise<boolean> {
        try {
            const cookieStore = await cookies();
            const csrfToken = cookieStore.get(AppConfig.SESSION.CSRF_COOKIE_NAME)?.value;
            return csrfToken === token;
        } catch (error) {
            console.error("CSRF validation error:", error);
            return false;
        }
    }

    /**
     * Generate CSRF token
     */
    private static generateCSRFToken(): string {
        return randomBytes(32).toString('hex');
    }

    /**
     * Register new user
     */
    static async registerUser(name: string, email: string, password: string): Promise<AuthUser> {
        try {
            const hashedPassword = await bcrypt.hash(password, 12);
            
            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    theme: true,
                    notifEmail: true,
                    notifPush: true,
                    defaultView: true
                }
            });

            return user as AuthUser;
        } catch (error: any) {
            if (error.code === 'P2002') {
                throw new Error("User with this email already exists");
            }
            console.error("Registration error:", error);
            throw new Error("Failed to create user");
        }
    }
}
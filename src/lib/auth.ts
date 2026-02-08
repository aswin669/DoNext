import { AuthService } from "./auth-service";

// Export the new secure authentication service
export { AuthService };
export type { AuthUser } from "./auth-service";

/**
 * Legacy function for backward compatibility
 * @deprecated Use AuthService.getCurrentUser() instead
 */
export async function getCurrentUser() {
    return AuthService.getCurrentUser();
}

/**
 * Legacy function for backward compatibility
 * @deprecated This function has been removed for security reasons
 * Use proper authentication flow instead
 */
export async function ensureUser() {
    throw new Error("ensureUser() has been removed for security reasons. Use proper authentication.");
}

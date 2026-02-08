// Application Configuration
export const AppConfig = {
    // Session Configuration
    SESSION: {
        MAX_AGE: parseInt(process.env.SESSION_MAX_AGE || "604800"), // 1 week in seconds
        COOKIE_NAME: "userId",
        CSRF_COOKIE_NAME: "csrfToken"
    },

    // Security Configuration
    SECURITY: {
        PASSWORD_MIN_LENGTH: 6,
        RESET_TOKEN_EXPIRY: 3600000, // 1 hour in milliseconds
        SESSION_SECRET: process.env.SESSION_SECRET || "fallback-secret-key-change-in-production"
    },

    // Rate Limiting Configuration
    RATE_LIMIT: {
        WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
        MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100")
    },

    // Application URLs
    URLS: {
        BASE_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        LOGIN_PAGE: "/auth/login",
        DASHBOARD_PAGE: "/dashboard"
    },

    // Database Configuration
    DATABASE: {
        URL: process.env.DATABASE_URL
    },

    // Demo User Configuration
    DEMO_USER: {
        EMAIL: "demo@donext.com",
        NAME: "John Doe",
        PASSWORD: "DemoPassword123!"
    }
} as const;

// Type-safe configuration access
export type ConfigKey = keyof typeof AppConfig;
export type ConfigValue<T extends ConfigKey> = typeof AppConfig[T];

/**
 * Get configuration value with type safety
 */
export function getConfig<T extends ConfigKey>(key: T): ConfigValue<T> {
    return AppConfig[key];
}

/**
 * Validate required configuration
 */
export function validateConfig(): string[] {
    const errors: string[] = [];
    
    if (!AppConfig.DATABASE.URL) {
        errors.push("DATABASE_URL is required");
    }
    
    if (process.env.NODE_ENV === "production" && AppConfig.SECURITY.SESSION_SECRET === "fallback-secret-key-change-in-production") {
        errors.push("SESSION_SECRET must be changed in production");
    }
    
    return errors;
}
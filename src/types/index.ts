// User Types
export interface User {
    id: string;
    email: string;
    name: string | null;
    profilePicture: string | null;
    theme: string;
    notifEmail: boolean;
    notifPush: boolean;
    defaultView: string;
    createdAt: Date;
    updatedAt: Date;
}

// Task Types
export interface Task {
    id: string;
    title: string;
    description: string | null;
    completed: boolean;
    priority: 'High' | 'Medium' | 'Low';
    category: string | null;
    type: string | null;
    date: Date | null;
    time: string | null;
    location: string | null;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

// Habit Types
export interface Habit {
    id: string;
    name: string;
    icon: string;
    category: string;
    frequency: string;
    goalValue: number;
    goalUnit: string;
    reminderTime: string | null;
    motivation: string | null;
    userId: string;
    completions?: HabitCompletion[];
    createdAt: Date;
    updatedAt: Date;
}

export interface HabitCompletion {
    id: string;
    date: Date;
    habitId: string;
    createdAt: Date;
}

export interface NotificationPreferences {
    taskReminders: boolean;
    habitReminders: boolean;
    dailySummary: boolean;
    weeklyReport: boolean;
    priorityThreshold: number; // Minimum priority level for notifications
    quietHours?: {
        start: string; // HH:MM format
        end: string;   // HH:MM format
    };
    timezone: string;
}

// Routine Types
export interface RoutineStep {
    id: string;
    time: string;
    task: string;
    icon: string;
    category: string;
    active: boolean;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface RoutineCompletion {
    id: string;
    date: Date;
    routineStepId: string;
    createdAt: Date;
}

// Notification Types
export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    userId: string;
    createdAt: Date;
}

// API Response Types
export interface ApiResponse<T = Record<string, unknown>> {
    success?: boolean;
    error?: string;
    message?: string;
    data?: T;
}

// Auth Types
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignupCredentials extends LoginCredentials {
    name: string;
}

export interface ResetPasswordRequest {
    token: string;
    password: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

// Dashboard Stats Types
export interface DashboardStats {
    tasksCompleted: number;
    totalTasks: number;
    activeHabits: number;
    focusTimeToday: string;
    weeklyActivity: WeeklyActivity[];
    importantTasks: Task[];
    learningProgress: LearningProgress[];
}

export interface WeeklyActivity {
    day: string;
    tasks: number;
    focus: number; // hours
}

export interface LearningProgress {
    id: string;
    title: string;
    progress: number;
    type: 'habit' | 'task';
    icon?: string;
}

export class AppError extends Error {
    constructor(
        message: string,
        public statusCode: number = 500,
        public code?: string
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 400, 'VALIDATION_ERROR');
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = 'Authentication required') {
        super(message, 401, 'AUTHENTICATION_ERROR');
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = 'Access denied') {
        super(message, 403, 'AUTHORIZATION_ERROR');
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = 'Resource not found') {
        super(message, 404, 'NOT_FOUND_ERROR');
    }
}

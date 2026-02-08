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
    smartPriority?: number; // AI-calculated priority score
    category: string | null;
    type: string | null;
    date: Date | null;
    time: string | null;
    location: string | null;
    estimatedTime?: number; // Estimated time in minutes
    actualTime?: number;    // Actual time spent in minutes
    deadline?: Date;        // Hard deadline for the task
    userId: string;
    parentTaskId?: string;
    parentTask?: Task;
    subtasks?: Task[];
    dependencies?: TaskDependency[];
    dependents?: TaskDependency[];
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
    streaks?: HabitStreak[];
    achievements?: Achievement[];
    createdAt: Date;
    updatedAt: Date;
}

export interface HabitCompletion {
    id: string;
    date: Date;
    habitId: string;
    createdAt: Date;
}

export interface TaskDependency {
    id: string;
    dependencyId: string;
    dependentId: string;
    dependency?: Task;
    dependent?: Task;
    createdAt: Date;
}

export interface Achievement {
    id: string;
    userId: string;
    type: string;
    name: string;
    description: string;
    icon: string;
    earnedAt: Date;
    createdAt: Date;
}

export interface HabitStreak {
    id: string;
    habitId: string;
    startDate: Date;
    endDate?: Date;
    length: number;
    isActive: boolean;
    createdAt: Date;
}

export interface Goal {
    id: string;
    userId: string;
    title: string;
    description?: string;
    // SMART Criteria
    specific?: string;
    measurable?: string;
    achievable: boolean;
    relevant?: string;
    timeBound?: Date;
    // Progress Tracking
    targetValue?: number;
    currentValue?: number;
    unit?: string;
    category?: string;
    priority: 'High' | 'Medium' | 'Low';
    status: 'Active' | 'Completed' | 'Archived';
    progress: number;
    startDate: Date;
    deadline?: Date;
    completedAt?: Date;
    // Relations
    milestones?: GoalMilestone[];
    createdAt: Date;
    updatedAt: Date;
}

export interface GoalMilestone {
    id: string;
    goalId: string;
    title: string;
    description?: string;
    targetValue: number;
    currentValue: number;
    deadline?: Date;
    completed: boolean;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// Team Collaboration Types
export interface Team {
    id: string;
    name: string;
    description?: string;
    ownerId: string;
    owner: User;
    members: TeamMembership[];
    projects: Project[];
    createdAt: Date;
    updatedAt: Date;
}

export interface TeamMembership {
    id: string;
    userId: string;
    user: User;
    teamId: string;
    team: Team;
    role: 'Owner' | 'Admin' | 'Member';
    joinedAt: Date;
    createdAt: Date;
}

export interface Project {
    id: string;
    teamId: string;
    team: Team;
    name: string;
    description?: string;
    status: 'Active' | 'Completed' | 'Archived';
    startDate: Date;
    endDate?: Date;
    tasks: ProjectTask[];
    createdAt: Date;
    updatedAt: Date;
}

export interface ProjectTask {
    id: string;
    projectId: string;
    project: Project;
    title: string;
    description?: string;
    assignedTo?: string;
    assignedUser?: User;
    status: 'Todo' | 'InProgress' | 'Review' | 'Completed';
    priority: 'High' | 'Medium' | 'Low';
    dueDate?: Date;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// Accountability Partners Types
export interface AccountabilityPartnership {
    id: string;
    userId: string;
    user: User;
    partnerId: string;
    partner: User;
    status: 'Active' | 'Paused' | 'Ended';
    startDate: Date;
    endDate?: Date;
    sharedGoals?: string[]; // Array of goal IDs
    checkInFrequency: 'Daily' | 'Weekly' | 'Bi-weekly';
    lastCheckIn?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface AccountabilityRequest {
    id: string;
    senderId: string;
    sender: User;
    recipientId: string;
    recipient: User;
    message?: string;
    status: 'Pending' | 'Accepted' | 'Rejected';
    sentAt: Date;
    respondedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// Advanced Analytics Types
export interface DashboardWidget {
    id: string;
    userId: string;
    user: User;
    type: string; // task-progress, habit-streak, goal-tracking, productivity-score, etc.
    title: string;
    config: Record<string, any>; // JSON configuration
    position: number; // Widget position on dashboard
    size: 'small' | 'medium' | 'large';
    isVisible: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CustomReport {
    id: string;
    userId: string;
    user: User;
    name: string;
    description?: string;
    type: string; // productivity, habit, task, goal, team
    config: Record<string, any>; // JSON configuration
    data?: Record<string, any>; // Cached report data
    lastRun?: Date;
    schedule?: string; // Cron expression for automated runs
    createdAt: Date;
    updatedAt: Date;
}

export interface AnalyticsData {
    id: string;
    userId: string;
    user: User;
    dataType: string; // daily-summary, weekly-report, monthly-analysis
    date: Date;
    data: Record<string, any>; // JSON data
    createdAt: Date;
    updatedAt: Date;
}

// Calendar Integration Types
export interface CalendarConnection {
    id: string;
    userId: string;
    user: User;
    provider: 'google' | 'outlook' | 'apple';
    calendarId: string; // External calendar ID
    accessToken?: string;
    refreshToken?: string;
    tokenExpiry?: Date;
    syncEnabled: boolean;
    lastSync?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface CalendarEvent {
    id: string;
    userId: string;
    user: User;
    calendarId?: string;
    calendar?: CalendarConnection;
    externalId?: string; // ID from external calendar
    title: string;
    description?: string;
    start: Date;
    end: Date;
    location?: string;
    attendees?: string[]; // Array of email addresses
    eventType: 'Task' | 'Habit' | 'Meeting' | 'Event';
    taskId?: string; // Link to task if applicable
    task?: Task;
    isAllDay: boolean;
    reminders?: number[]; // Array of reminder times (minutes before)
    createdAt: Date;
    updatedAt: Date;
}

// Communication Platform Types
export interface CommunicationConnection {
    id: string;
    userId: string;
    user: User;
    platform: 'slack' | 'email' | 'push';
    connectionId: string; // External platform ID
    accessToken?: string;
    refreshToken?: string;
    tokenExpiry?: Date;
    webhookUrl?: string; // For Slack incoming webhooks
    channelId?: string; // For Slack channel targeting
    email?: string; // For email notifications
    enabled: boolean;
    preferences?: Record<string, any>; // JSON configuration
    createdAt: Date;
    updatedAt: Date;
}

export interface NotificationPreferences {
    taskReminders: boolean;
    habitReminders: boolean;
    goalMilestones: boolean;
    teamUpdates: boolean;
    accountabilityUpdates: boolean;
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
export interface ApiResponse<T = any> {
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
    type: 'habit' | 'task' | 'demo';
    icon?: string;
}

// Advanced Task Prioritization Types
export interface TaskPriorityFactors {
    deadlineUrgency: number;
    importanceScore: number;
    estimatedEffort: number;
    completionLikelihood: number;
    userProductivityPattern: number;
}

export interface EisenhowerMatrixQuadrant {
    quadrant: 'urgent_important' | 'not_urgent_important' | 'urgent_not_important' | 'not_urgent_not_important';
    tasks: Task[];
}

export interface SmartPriorityResult {
    taskId: string;
    priorityScore: number;
    factors: TaskPriorityFactors;
    recommendedAction: 'do_now' | 'schedule' | 'delegate' | 'eliminate';
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
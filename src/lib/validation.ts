import { z } from 'zod';

// Auth Validation Schemas
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters')
});

export const signupSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters')
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Token is required'),
    password: z.string().min(6, 'Password must be at least 6 characters')
});

export const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address')
});

// Task Validation Schemas
export const taskCreateSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    description: z.string().max(1000, 'Description too long').optional(),
    priority: z.enum(['High', 'Medium', 'Low']).default('Medium'),
    category: z.string().max(50, 'Category too long').optional(),
    type: z.string().max(50, 'Type too long').optional(),
    date: z.string().datetime().optional(),
    time: z.string().max(20, 'Time format too long').optional(),
    location: z.string().max(200, 'Location too long').optional()
});

export const taskUpdateSchema = taskCreateSchema.partial();

// Habit Validation Schemas
export const habitCreateSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    icon: z.string().default('🧘'),
    category: z.string().min(1, 'Category is required').max(50, 'Category too long'),
    frequency: z.string().min(1, 'Frequency is required').max(50, 'Frequency too long'),
    goalValue: z.number().int().positive('Goal value must be positive'),
    goalUnit: z.string().min(1, 'Goal unit is required').max(20, 'Goal unit too long'),
    reminderTime: z.string().max(20, 'Reminder time too long').optional(),
    motivation: z.string().max(500, 'Motivation too long').optional()
});

export const habitUpdateSchema = habitCreateSchema.partial();

// Routine Validation Schemas
export const routineStepSchema = z.object({
    time: z.string().min(1, 'Time is required').max(20, 'Time too long'),
    task: z.string().min(1, 'Task is required').max(200, 'Task too long'),
    icon: z.string().min(1, 'Icon is required').max(10, 'Icon too long'),
    category: z.string().min(1, 'Category is required').max(50, 'Category too long'),
    active: z.boolean().default(true)
});

// Utility function to validate and transform data
export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): T {
    try {
        return schema.parse(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const issues = error.issues.map(issue => ({
                field: issue.path.join('.'),
                message: issue.message
            }));
            throw new Error(`Validation failed: ${JSON.stringify(issues)}`);
        }
        throw error;
    }
}

// Type inference from schemas
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;
export type HabitCreateInput = z.infer<typeof habitCreateSchema>;
export type HabitUpdateInput = z.infer<typeof habitUpdateSchema>;
export type RoutineStepInput = z.infer<typeof routineStepSchema>;
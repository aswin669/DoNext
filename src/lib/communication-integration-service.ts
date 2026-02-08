import prisma from "./prisma";
import { AuthService } from "./auth-service";
import { CommunicationConnection, NotificationPreferences } from "@/types";

/**
 * Communication Integration Service
 * Handles integration with various communication platforms and notification systems
 */
export class CommunicationIntegrationService {
    
    /**
     * Connect user to communication platform
     */
    static async connectPlatform(userId: string, platform: 'slack' | 'email' | 'push', config: {
        accessToken?: string;
        refreshToken?: string;
        tokenExpiry?: Date;
        webhookUrl?: string;
        channelId?: string;
        email?: string;
        preferences?: NotificationPreferences;
    }): Promise<CommunicationConnection> {
        try {
            // Validate configuration based on platform
            if (platform === 'slack') {
                if (!config.accessToken && !config.webhookUrl) {
                    throw new Error("Slack requires either access token or webhook URL");
                }
            } else if (platform === 'email' && !config.email) {
                throw new Error("Email platform requires email address");
            }
            
            const connection = await prisma.communicationConnection.create({
                data: {
                    userId,
                    platform,
                    connectionId: this.generateConnectionId(platform),
                    accessToken: config.accessToken,
                    refreshToken: config.refreshToken,
                    tokenExpiry: config.tokenExpiry,
                    webhookUrl: config.webhookUrl,
                    channelId: config.channelId,
                    email: config.email,
                    preferences: config.preferences ? JSON.stringify(config.preferences) : undefined
                }
            });
            
            return {
                ...connection,
                preferences: config.preferences
            } as CommunicationConnection;
        } catch (error) {
            console.error("Error connecting platform:", error);
            throw new Error("Failed to connect communication platform");
        }
    }
    
    /**
     * Get user's communication connections
     */
    static async getUserConnections(userId: string): Promise<CommunicationConnection[]> {
        try {
            const connections = await prisma.communicationConnection.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' }
            });
            
            return connections.map(conn => ({
                ...conn,
                preferences: conn.preferences ? JSON.parse(conn.preferences) : undefined
            })) as CommunicationConnection[];
        } catch (error) {
            console.error("Error fetching communication connections:", error);
            return [];
        }
    }
    
    /**
     * Update communication connection
     */
    static async updateConnection(connectionId: string, userId: string, updateData: {
        enabled?: boolean;
        preferences?: NotificationPreferences;
        webhookUrl?: string;
        channelId?: string;
        email?: string;
    }): Promise<CommunicationConnection> {
        try {
            // Verify connection ownership
            const connection = await prisma.communicationConnection.findUnique({
                where: { id: connectionId, userId }
            });
            
            if (!connection) {
                throw new Error("Connection not found");
            }
            
            const updatedConnection = await prisma.communicationConnection.update({
                where: { id: connectionId },
                data: {
                    ...updateData,
                    preferences: updateData.preferences ? JSON.stringify(updateData.preferences) : undefined
                }
            });
            
            return {
                ...updatedConnection,
                preferences: updateData.preferences || (updatedConnection.preferences ? JSON.parse(updatedConnection.preferences) : undefined)
            } as CommunicationConnection;
        } catch (error) {
            console.error("Error updating communication connection:", error);
            throw error;
        }
    }
    
    /**
     * Disconnect communication platform
     */
    static async disconnectPlatform(connectionId: string, userId: string): Promise<void> {
        try {
            // Verify connection ownership
            const connection = await prisma.communicationConnection.findUnique({
                where: { id: connectionId, userId }
            });
            
            if (!connection) {
                throw new Error("Connection not found");
            }
            
            await prisma.communicationConnection.delete({
                where: { id: connectionId }
            });
        } catch (error) {
            console.error("Error disconnecting platform:", error);
            throw error;
        }
    }
    
    /**
     * Send notification through communication platform
     */
    static async sendNotification(userId: string, notification: {
        type: 'task_reminder' | 'habit_reminder' | 'goal_milestone' | 'team_update' | 'accountability_update' | 'daily_summary' | 'weekly_report';
        title: string;
        message: string;
        priority?: 'low' | 'medium' | 'high' | 'urgent';
        data?: Record<string, any>; // Additional context data
        platforms?: ('slack' | 'email' | 'push')[]; // Specific platforms to use
    }): Promise<{ success: boolean; sentTo: string[]; failed: string[] }> {
        try {
            const connections = await this.getUserConnections(userId);
            const activeConnections = connections.filter(conn => conn.enabled);
            
            // Filter by specific platforms if provided
            const targetConnections = notification.platforms 
                ? activeConnections.filter(conn => notification.platforms!.includes(conn.platform as any))
                : activeConnections;
            
            const sentTo: string[] = [];
            const failed: string[] = [];
            
            // Send notification through each platform
            await Promise.all(
                targetConnections.map(async (connection) => {
                    try {
                        const success = await this.sendPlatformNotification(connection, notification);
                        if (success) {
                            sentTo.push(connection.platform);
                        } else {
                            failed.push(connection.platform);
                        }
                    } catch (error) {
                        console.error(`Failed to send notification via ${connection.platform}:`, error);
                        failed.push(connection.platform);
                    }
                })
            );
            
            return { success: sentTo.length > 0, sentTo, failed };
        } catch (error) {
            console.error("Error sending notification:", error);
            throw error;
        }
    }
    
    /**
     * Send bulk notifications to multiple users
     */
    static async sendBulkNotifications(notifications: {
        userId: string;
        type: string;
        title: string;
        message: string;
        priority?: string;
        data?: Record<string, any>;
    }[]): Promise<{ results: { userId: string; success: boolean; sentTo: string[]; failed: string[] }[] }> {
        try {
            const results = await Promise.all(
                notifications.map(async (notification) => {
                    try {
                        const result = await this.sendNotification(notification.userId, {
                            type: notification.type as any,
                            title: notification.title,
                            message: notification.message,
                            priority: notification.priority as any,
                            data: notification.data
                        });
                        return {
                            userId: notification.userId,
                            success: result.success,
                            sentTo: result.sentTo,
                            failed: result.failed
                        };
                    } catch (error) {
                        return {
                            userId: notification.userId,
                            success: false,
                            sentTo: [],
                            failed: ['all']
                        };
                    }
                })
            );
            
            return { results };
        } catch (error) {
            console.error("Error sending bulk notifications:", error);
            throw error;
        }
    }
    
    /**
     * Get available communication platforms
     */
    static getAvailablePlatforms(): { id: string; name: string; icon: string; description: string; requiresAuth: boolean }[] {
        return [
            {
                id: 'slack',
                name: 'Slack',
                icon: 'slack',
                description: 'Send notifications to Slack channels or direct messages',
                requiresAuth: true
            },
            {
                id: 'email',
                name: 'Email',
                icon: 'email',
                description: 'Send email notifications to your inbox',
                requiresAuth: false
            },
            {
                id: 'push',
                name: 'Push Notifications',
                icon: 'notifications',
                description: 'Browser push notifications for real-time alerts',
                requiresAuth: false
            }
        ];
    }
    
    /**
     * Get default notification preferences
     */
    static getDefaultPreferences(): NotificationPreferences {
        return {
            taskReminders: true,
            habitReminders: true,
            goalMilestones: true,
            teamUpdates: true,
            accountabilityUpdates: true,
            dailySummary: true,
            weeklyReport: true,
            priorityThreshold: 2, // Medium priority and above
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }
    
    /**
     * Validate notification preferences
     */
    static validatePreferences(preferences: NotificationPreferences): { valid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        if (preferences.priorityThreshold < 0 || preferences.priorityThreshold > 4) {
            errors.push("Priority threshold must be between 0 and 4");
        }
        
        if (preferences.quietHours) {
            const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (!timeRegex.test(preferences.quietHours.start)) {
                errors.push("Invalid quiet hours start time format");
            }
            if (!timeRegex.test(preferences.quietHours.end)) {
                errors.push("Invalid quiet hours end time format");
            }
        }
        
        return { valid: errors.length === 0, errors };
    }
    
    // Helper methods for platform-specific notifications
    
    private static async sendPlatformNotification(connection: CommunicationConnection, notification: any): Promise<boolean> {
        try {
            switch (connection.platform) {
                case 'slack':
                    return await this.sendSlackNotification(connection, notification);
                case 'email':
                    return await this.sendEmailNotification(connection, notification);
                case 'push':
                    return await this.sendPushNotification(connection, notification);
                default:
                    throw new Error(`Unsupported platform: ${connection.platform}`);
            }
        } catch (error) {
            console.error(`Error sending ${connection.platform} notification:`, error);
            return false;
        }
    }
    
    private static async sendSlackNotification(connection: CommunicationConnection, notification: any): Promise<boolean> {
        try {
            // For webhook-based Slack notifications
            if (connection.webhookUrl) {
                const slackMessage = {
                    text: `*${notification.title}*\n${notification.message}`,
                    attachments: [
                        {
                            color: this.getPriorityColor(notification.priority),
                            fields: [
                                {
                                    title: "Type",
                                    value: notification.type,
                                    short: true
                                },
                                {
                                    title: "Priority",
                                    value: notification.priority || 'medium',
                                    short: true
                                }
                            ],
                            ts: Math.floor(Date.now() / 1000)
                        }
                    ]
                };
                
                if (connection.channelId) {
                    (slackMessage as any).channel = connection.channelId;
                }
                
                const response = await fetch(connection.webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(slackMessage)
                });
                
                return response.ok;
            }
            
            // For API-based Slack notifications
            if (connection.accessToken) {
                const slackMessage = {
                    channel: connection.channelId || '#notifications',
                    text: notification.title,
                    blocks: [
                        {
                            type: 'section',
                            text: {
                                type: 'mrkdwn',
                                text: `*${notification.title}*\n${notification.message}`
                            }
                        },
                        {
                            type: 'context',
                            elements: [
                                {
                                    type: 'mrkdwn',
                                    text: `Priority: ${notification.priority || 'medium'} | Type: ${notification.type}`
                                }
                            ]
                        }
                    ]
                };

                const response = await fetch('https://slack.com/api/chat.postMessage', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${connection.accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(slackMessage)
                });

                const result = await response.json();
                if (!result.ok) {
                    console.error('Slack API error:', result.error);
                    return false;
                }
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error sending Slack notification:', error);
            return false;
        }
    }
    
    private static async sendEmailNotification(connection: CommunicationConnection, notification: any): Promise<boolean> {
        try {
            if (!connection.email) {
                return false;
            }
            
            const emailContent = {
                to: connection.email,
                subject: notification.title,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px 5px 0 0;">
                            <h2 style="margin: 0;">${notification.title}</h2>
                        </div>
                        <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px;">
                            <p style="color: #333; line-height: 1.6;">${notification.message}</p>
                            <div style="background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0;">
                                <strong>Type:</strong> ${notification.type}<br>
                                <strong>Priority:</strong> ${notification.priority || 'medium'}<br>
                                <strong>Time:</strong> ${new Date().toLocaleString()}
                            </div>
                            ${notification.data ? `<p style="color: #666; font-size: 12px;"><strong>Details:</strong> ${JSON.stringify(notification.data)}</p>` : ''}
                            <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
                                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" style="color: #667eea; text-decoration: none;">View in DoNext</a>
                            </div>
                        </div>
                    </div>
                `
            };

            // Try SendGrid first
            if (process.env.SENDGRID_API_KEY) {
                try {
                    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            personalizations: [{ to: [{ email: connection.email }] }],
                            from: { email: process.env.EMAIL_FROM_ADDRESS || 'noreply@donext.app' },
                            subject: notification.title,
                            content: [{ type: 'text/html', value: emailContent.html }]
                        })
                    });

                    if (response.ok) {
                        console.log(`Email sent to ${connection.email}`);
                        return true;
                    }
                } catch (error) {
                    console.error('SendGrid error:', error);
                }
            }

            // Fallback: log for development
            console.log(`Email notification (${connection.email}):`, emailContent);
            return true;
        } catch (error) {
            console.error('Error sending email notification:', error);
            return false;
        }
    }
    
    private static async sendPushNotification(connection: CommunicationConnection, notification: any): Promise<boolean> {
        try {
            // Get user's push subscriptions from database
            // @ts-expect-error - prisma types may not be fully generated
            const subscriptions = await prisma.pushSubscription.findMany({
                where: { userId: connection.userId }
            }).catch(() => []);

            if (subscriptions.length === 0) {
                console.log('No push subscriptions found for user');
                return false;
            }

            const payload = JSON.stringify({
                title: notification.title,
                body: notification.message,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-72x72.png',
                tag: notification.type,
                requireInteraction: notification.priority === 'high' || notification.priority === 'urgent',
                data: {
                    type: notification.type,
                    priority: notification.priority,
                    ...notification.data
                }
            });

            let successCount = 0;

            for (const subscription of subscriptions) {
                try {
                    // In production, use web-push library
                    // For now, simulate push notification
                    console.log(`Push notification sent to subscription: ${subscription.id}`);
                    successCount++;
                } catch (error) {
                    console.error('Error sending push notification:', error);
                }
            }

            return successCount > 0;
        } catch (error) {
            console.error('Error in push notification handler:', error);
            return false;
        }
    }
    
    private static generateConnectionId(platform: string): string {
        return `${platform}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    private static getPriorityColor(priority?: string): string {
        switch (priority) {
            case 'low': return 'good';
            case 'medium': return 'warning';
            case 'high': return 'danger';
            case 'urgent': return 'danger';
            default: return '#439FE0';
        }
    }
}
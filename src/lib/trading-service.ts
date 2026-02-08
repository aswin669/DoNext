interface DailyPlanData {
    date: Date;
    marketBias: 'Bullish' | 'Bearish' | 'Neutral';
    goals: string;
    maxRisk: number;
    maxRiskPercent: number;
    accountSize: number;
    notes?: string;
}

interface DailyPlan extends DailyPlanData {
    id: string;
    userId: string;
    createdAt: Date;
    status: 'Active' | 'Completed';
}

/**
 * Trading Service
 * Handles trade planning, execution, and review with discipline and clarity
 */
export class TradingService {
    
    /**
     * Create daily trading plan
     */
    static async createDailyPlan(userId: string, planData: DailyPlanData): Promise<DailyPlan> {
        try {
            const plan: DailyPlan = {
                id: `plan_${Date.now()}`,
                userId,
                date: planData.date,
                marketBias: planData.marketBias,
                goals: planData.goals,
                maxRisk: planData.maxRisk,
                maxRiskPercent: planData.maxRiskPercent,
                accountSize: planData.accountSize,
                notes: planData.notes,
                createdAt: new Date(),
                status: 'Active'
            };
            
            console.log(`Created daily trading plan for user ${userId}`, plan);
            return plan;
        } catch (error) {
            console.error("Error creating daily plan:", error);
            throw error;
        }
    }
    
    /**
     * Get daily trading plan
     */
    static async getDailyPlan(userId: string, date: Date): Promise<DailyPlan | null> {
        try {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            
            // Would query database for plan
            return null;
        } catch (error) {
            console.error("Error fetching daily plan:", error);
            return null;
        }
    }
    
    /**
     * Create a trade
     */
    static async createTrade(userId: string, tradeData: {
        symbol: string;
        tradeType: 'Long' | 'Short';
        entryPrice: number;
        stopLoss: number;
        target: number;
        quantity: number;
        riskAmount: number;
        rewardAmount: number;
        riskRewardRatio: number;
        priority: 'High' | 'Medium' | 'Low';
        strategy?: string;
        notes?: string;
        templateId?: string;
        entryImage?: string;
        exitImage?: string;
    }): Promise<{ id: string; symbol: string; status: string }> {
        try {
            // Calculate risk-reward ratio
            const riskRewardRatio = tradeData.rewardAmount / tradeData.riskAmount;
            
            const trade = {
                id: `trade_${Date.now()}`,
                userId,
                symbol: tradeData.symbol,
                tradeType: tradeData.tradeType,
                entryPrice: tradeData.entryPrice,
                stopLoss: tradeData.stopLoss,
                target: tradeData.target,
                quantity: tradeData.quantity,
                riskAmount: tradeData.riskAmount,
                rewardAmount: tradeData.rewardAmount,
                riskRewardRatio,
                priority: tradeData.priority,
                strategy: tradeData.strategy,
                notes: tradeData.notes,
                templateId: tradeData.templateId,
                entryImage: tradeData.entryImage,
                exitImage: tradeData.exitImage,
                status: 'Planned',
                createdAt: new Date(),
                executedAt: null,
                completedAt: null,
                exitPrice: null,
                profitLoss: null,
                profitLossPercent: null
            };
            
            console.log(`Created trade for user ${userId}`, trade);
            return trade;
        } catch (error) {
            console.error("Error creating trade:", error);
            throw error;
        }
    }
    
    /**
     * Execute trade
     */
    static async executeTrade(userId: string, tradeId: string, executionData: {
        executionPrice: number;
        executionTime: Date;
        notes?: string;
    }): Promise<{ id: string; status: string }> {
        try {
            const trade = {
                id: tradeId,
                userId,
                status: 'Executed',
                executedAt: executionData.executionTime,
                executionPrice: executionData.executionPrice,
                executionNotes: executionData.notes
            };
            
            console.log(`Executed trade for user ${userId}`, trade);
            return trade;
        } catch (error) {
            console.error("Error executing trade:", error);
            throw error;
        }
    }
    
    /**
     * Close trade
     */
    static async closeTrade(userId: string, tradeId: string, closeData: {
        exitPrice: number;
        exitTime: Date;
        reason: 'TargetHit' | 'StopLoss' | 'ManualExit' | 'Cancelled';
        notes?: string;
        exitImage?: string;
    }): Promise<{ id: string; status: string }> {
        try {
            // Calculate P&L
            const trade = {
                id: tradeId,
                userId,
                status: closeData.reason === 'Cancelled' ? 'Cancelled' : 'Completed',
                exitPrice: closeData.exitPrice,
                completedAt: closeData.exitTime,
                exitReason: closeData.reason,
                exitNotes: closeData.notes,
                exitImage: closeData.exitImage
            };
            
            console.log(`Closed trade for user ${userId}`, trade);
            return trade;
        } catch (error) {
            console.error("Error closing trade:", error);
            throw error;
        }
    }
    
    /**
     * Get user's trades
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static async getUserTrades(_userId: string, _filters?: {
        status?: string;
        symbol?: string;
        startDate?: Date;
        endDate?: Date;
        priority?: string;
    }): Promise<Array<Record<string, unknown>>> {
        try {
            // Would query database with filters
            const trades: Array<Record<string, unknown>> = [];
            return trades;
        } catch (error) {
            console.error("Error fetching trades:", error);
            return [];
        }
    }
    
    /**
     * Add trade journal entry
     */
    static async addJournalEntry(userId: string, tradeId: string, entryData: {
        strategy: string;
        emotion: 'Confident' | 'Anxious' | 'Neutral' | 'Frustrated';
        mistakes?: string;
        lessons?: string;
        improvements?: string;
    }): Promise<{ id: string; tradeId: string }> {
        try {
            const entry = {
                id: `journal_${Date.now()}`,
                tradeId,
                userId,
                strategy: entryData.strategy,
                emotion: entryData.emotion,
                mistakes: entryData.mistakes,
                lessons: entryData.lessons,
                improvements: entryData.improvements,
                createdAt: new Date()
            };
            
            console.log(`Added journal entry for trade ${tradeId}`, entry);
            return entry;
        } catch (error) {
            console.error("Error adding journal entry:", error);
            throw error;
        }
    }
    
    /**
     * Get trade performance summary
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static async getPerformanceSummary(_userId: string, _period?: {
        startDate: Date;
        endDate: Date;
    }): Promise<{ totalTrades: number; winRate: number; totalProfitLoss: number }> {
        try {
            // Calculate performance metrics
            const summary = {
                totalTrades: 0,
                winningTrades: 0,
                losingTrades: 0,
                winRate: 0,
                totalProfitLoss: 0,
                averageWin: 0,
                averageLoss: 0,
                profitFactor: 0,
                consistencyScore: 0,
                bestTrade: 0,
                worstTrade: 0,
                averageRiskRewardRatio: 0
            };
            
            return summary;
        } catch (error) {
            console.error("Error fetching performance summary:", error);
            throw error;
        }
    }
    
    /**
     * Create trading strategy template
     */
    static async createTemplate(_userId: string, templateData: {
        name: string;
        description: string;
        entryRules: string;
        exitRules: string;
        riskManagement: string;
        defaultRiskRewardRatio: number;
        tags?: string[];
    }): Promise<{ id: string; name: string }> {
        try {
            const template = {
                id: `template_${Date.now()}`,
                userId: _userId,
                name: templateData.name,
                description: templateData.description,
                entryRules: templateData.entryRules,
                exitRules: templateData.exitRules,
                riskManagement: templateData.riskManagement,
                defaultRiskRewardRatio: templateData.defaultRiskRewardRatio,
                tags: templateData.tags || [],
                createdAt: new Date(),
                usageCount: 0
            };
            
            console.log(`Created trading template for user ${_userId}`, template);
            return template;
        } catch (error) {
            console.error("Error creating template:", error);
            throw error;
        }
    }
    
    /**
     * Get user's templates
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static async getUserTemplates(_userId: string): Promise<Array<Record<string, unknown>>> {
        try {
            const templates: Array<Record<string, unknown>> = [];
            return templates;
        } catch (error) {
            console.error("Error fetching templates:", error);
            return [];
        }
    }
    
    /**
     * Export trades to CSV
     */
    static async exportTradesToCSV(_userId: string, trades: Array<Record<string, unknown>>): Promise<string> {
        try {
            if (trades.length === 0) {
                return 'No trades to export';
            }

            // Create CSV header
            const headers = [
                'Date', 'Symbol', 'Type', 'Entry Price', 'Exit Price', 
                'Stop Loss', 'Target', 'Quantity', 'Risk', 'Reward', 
                'R:R Ratio', 'P&L', 'Status', 'Strategy', 'Notes'
            ];

            // Create CSV rows
            const rows = trades.map(trade => [
                new Date(trade.createdAt as string | number | Date).toLocaleDateString(),
                trade.symbol,
                trade.tradeType,
                trade.entryPrice,
                trade.exitPrice || 'N/A',
                trade.stopLoss,
                trade.target,
                trade.quantity,
                trade.riskAmount,
                trade.rewardAmount,
                trade.riskRewardRatio,
                trade.profitLoss || 'N/A',
                trade.status,
                trade.strategy || 'N/A',
                trade.notes || 'N/A'
            ]);

            // Combine headers and rows
            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');

            console.log(`Exported ${trades.length} trades to CSV for user ${_userId}`);
            return csvContent;
        } catch (error) {
            console.error("Error exporting to CSV:", error);
            throw error;
        }
    }
    
    /**
     * Export trades to JSON
     */
    static async exportTradesToJSON(_userId: string, trades: Array<Record<string, unknown>>): Promise<string> {
        try {
            const exportData = {
                exportDate: new Date().toISOString(),
                userId: _userId,
                totalTrades: trades.length,
                trades: trades.map(trade => ({
                    id: trade.id,
                    symbol: trade.symbol,
                    tradeType: trade.tradeType,
                    entryPrice: trade.entryPrice,
                    exitPrice: trade.exitPrice,
                    stopLoss: trade.stopLoss,
                    target: trade.target,
                    quantity: trade.quantity,
                    riskAmount: trade.riskAmount,
                    rewardAmount: trade.rewardAmount,
                    riskRewardRatio: trade.riskRewardRatio,
                    profitLoss: trade.profitLoss,
                    status: trade.status,
                    strategy: trade.strategy,
                    notes: trade.notes,
                    createdAt: trade.createdAt,
                    updatedAt: trade.updatedAt
                }))
            };

            console.log(`Exported ${trades.length} trades to JSON for user ${_userId}`);
            return JSON.stringify(exportData, null, 2);
        } catch (error) {
            console.error("Error exporting to JSON:", error);
            throw error;
        }
    }
    
    /**
     * Get trading calendar events
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static async getCalendarEvents(_userId: string, _month: Date): Promise<Array<{ id: string; date: Date; type: string; title: string; time: string; importance?: string }>> {
        try {
            const events = [
                {
                    id: 'event_1',
                    date: new Date(),
                    type: 'MarketOpen',
                    title: 'Market Open',
                    time: '09:30 AM'
                },
                {
                    id: 'event_2',
                    date: new Date(),
                    type: 'EconomicEvent',
                    title: 'FOMC Meeting',
                    time: '02:00 PM',
                    importance: 'High'
                }
            ];
            
            return events;
        } catch (error) {
            console.error("Error fetching calendar events:", error);
            return [];
        }
    }
    
    /**
     * Set trade reminder
     */
    static async setReminder(userId: string, reminderData: {
        type: 'MarketOpen' | 'TradeExecution' | 'TargetHit' | 'StopLoss' | 'EconomicEvent';
        tradeId?: string;
        time: Date;
        message: string;
        notificationMethod: 'Email' | 'Push' | 'Both';
    }): Promise<{ id: string; userId: string }> {
        try {
            const reminder = {
                id: `reminder_${Date.now()}`,
                userId,
                type: reminderData.type,
                tradeId: reminderData.tradeId,
                time: reminderData.time,
                message: reminderData.message,
                notificationMethod: reminderData.notificationMethod,
                createdAt: new Date(),
                sent: false
            };
            
            console.log(`Set reminder for user ${userId}`, reminder);
            return reminder;
        } catch (error) {
            console.error("Error setting reminder:", error);
            throw error;
        }
    }
    
    /**
     * Get pre-trade checklist
     */
    static getPreTradeChecklist(): Array<Record<string, unknown>> {
        return [
            {
                id: 'pre_1',
                category: 'Pre-Trade',
                item: 'Market bias confirmed',
                description: 'Verify market direction aligns with daily plan'
            },
            {
                id: 'pre_2',
                category: 'Pre-Trade',
                item: 'Risk/Reward ratio acceptable',
                description: 'Ensure R:R ratio meets minimum requirements'
            },
            {
                id: 'pre_3',
                category: 'Pre-Trade',
                item: 'Entry signal confirmed',
                description: 'Verify all entry conditions are met'
            },
            {
                id: 'pre_4',
                category: 'Pre-Trade',
                item: 'Stop loss level set',
                description: 'Define clear stop loss level'
            },
            {
                id: 'pre_5',
                category: 'Pre-Trade',
                item: 'Position size calculated',
                description: 'Calculate position size based on risk'
            }
        ];
    }
    
    /**
     * Get during-trade checklist
     */
    static getDuringTradeChecklist(): Array<Record<string, unknown>> {
        return [
            {
                id: 'during_1',
                category: 'During-Trade',
                item: 'Entry executed at planned price',
                description: 'Confirm entry execution'
            },
            {
                id: 'during_2',
                category: 'During-Trade',
                item: 'Stop loss order placed',
                description: 'Verify stop loss is active'
            },
            {
                id: 'during_3',
                category: 'During-Trade',
                item: 'Target order placed',
                description: 'Verify target order is active'
            },
            {
                id: 'during_4',
                category: 'During-Trade',
                item: 'Monitor trade progress',
                description: 'Watch for key levels and signals'
            },
            {
                id: 'during_5',
                category: 'During-Trade',
                item: 'Manage emotions',
                description: 'Stay disciplined and avoid impulsive decisions'
            }
        ];
    }
    
    /**
     * Get post-trade checklist
     */
    static getPostTradeChecklist(): Array<Record<string, unknown>> {
        return [
            {
                id: 'post_1',
                category: 'Post-Trade',
                item: 'Trade closed at planned level',
                description: 'Confirm exit execution'
            },
            {
                id: 'post_2',
                category: 'Post-Trade',
                item: 'Calculate P&L',
                description: 'Record profit or loss'
            },
            {
                id: 'post_3',
                category: 'Post-Trade',
                item: 'Review trade setup',
                description: 'Analyze if setup was correct'
            },
            {
                id: 'post_4',
                category: 'Post-Trade',
                item: 'Document lessons learned',
                description: 'Record what went well and what to improve'
            },
            {
                id: 'post_5',
                category: 'Post-Trade',
                item: 'Update trading journal',
                description: 'Log emotions, mistakes, and improvements'
            }
        ];
    }
    
    /**
     * Calculate consistency score
     */
    static calculateConsistencyScore(trades: Array<Record<string, unknown>>): number {
        try {
            if (trades.length === 0) return 0;
            
            // Calculate based on:
            // - Win rate consistency
            // - Risk management adherence
            // - Trade frequency
            // - Journal entries
            
            const completedTrades = trades.filter(t => t.status === 'Completed');
            const winRate = completedTrades.length > 0 
                ? completedTrades.filter(t => (t.profitLoss as number) > 0).length / completedTrades.length
                : 0;
            
            // Score from 0-100
            const score = Math.round(winRate * 100);
            return Math.min(score, 100);
        } catch (error) {
            console.error("Error calculating consistency score:", error);
            return 0;
        }
    }
}

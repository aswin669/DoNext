import { Task, Habit } from "@/types";

/**
 * PWA Client Service
 * Handles offline functionality, data synchronization, and PWA features
 */
export class PWAService {
    
    /**
     * Initialize PWA service
     */
    static async initialize(): Promise<void> {
        if ('serviceWorker' in navigator) {
            try {
                // Register service worker
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered with scope:', registration.scope);
                
                // Handle service worker updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // New update available
                                this.showUpdateNotification();
                            }
                        });
                    }
                });
                
                // Listen for messages from service worker
                navigator.serviceWorker.addEventListener('message', (event) => {
                    if (event.data && event.data.type === 'SYNC_COMPLETE') {
                        this.handleSyncComplete(event.data.data);
                    }
                });
                
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
        
        // Request notification permissions
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('Notification permission granted');
                }
            });
        }
    }
    
    /**
     * Check if app is installed as PWA
     */
    static isPWAInstalled(): boolean {
        return window.matchMedia('(display-mode: standalone)').matches || 
               (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    }
    
    /**
     * Check online status
     */
    static isOnline(): boolean {
        return navigator.onLine;
    }
    
    /**
     * Save task for offline sync
     */
    static async saveOfflineTask(task: Partial<Task>): Promise<void> {
        try {
            const pendingTasks = this.getPendingTasks();
            const offlineTask = {
                ...task,
                id: task.id || `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                offline: true,
                createdAt: new Date()
            } as unknown as Task;
            
            pendingTasks.push(offlineTask);
            localStorage.setItem('pendingTasks', JSON.stringify(pendingTasks));
            
            // Register background sync if available
            if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
                const registration = await navigator.serviceWorker.ready;
                await (registration as unknown as { sync: { register: (tag: string) => Promise<void> } }).sync.register('sync-tasks');
            }
        } catch (error) {
            console.error('Failed to save offline task:', error);
        }
    }
    
    /**
     * Save habit completion for offline sync
     */
    static async saveOfflineHabit(habit: Partial<Habit>): Promise<void> {
        try {
            const pendingHabits = this.getPendingHabits();
            const offlineHabit = {
                ...habit,
                id: habit.id || `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                offline: true,
                createdAt: new Date()
            };
            
            pendingHabits.push(offlineHabit);
            localStorage.setItem('pendingHabits', JSON.stringify(pendingHabits));
            
            // Register background sync if available
            if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
                const registration = await navigator.serviceWorker.ready;
                await (registration as unknown as { sync: { register: (tag: string) => Promise<void> } }).sync.register('sync-habits');
            }
        } catch (error) {
            console.error('Failed to save offline habit:', error);
        }
    }
    
    /**
     * Get pending offline tasks
     */
    static getPendingTasks(): Partial<Task>[] {
        try {
            const pendingTasks = localStorage.getItem('pendingTasks');
            return pendingTasks ? JSON.parse(pendingTasks) : [];
        } catch (error) {
            console.error('Failed to get pending tasks:', error);
            return [];
        }
    }
    
    /**
     * Get pending offline habits
     */
    static getPendingHabits(): Partial<Habit>[] {
        try {
            const pendingHabits = localStorage.getItem('pendingHabits');
            return pendingHabits ? JSON.parse(pendingHabits) : [];
        } catch (error) {
            console.error('Failed to get pending habits:', error);
            return [];
        }
    }
    
    /**
     * Clear pending offline data
     */
    static clearPendingData(): void {
        localStorage.removeItem('pendingTasks');
        localStorage.removeItem('pendingHabits');
    }
    
    /**
     * Show install prompt for PWA
     */
    static async showInstallPrompt(): Promise<boolean> {
        // Check if beforeinstallprompt event is available
        const beforeInstallPrompt = (window as unknown as { beforeInstallPromptEvent?: { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> } }).beforeInstallPromptEvent;
        
        if (beforeInstallPrompt) {
            try {
                // Show the install prompt
                await beforeInstallPrompt.prompt();
                
                // Wait for the user to respond to the prompt
                const userChoice = await beforeInstallPrompt.userChoice;
                
                if (userChoice.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                    return true;
                } else {
                    console.log('User dismissed the install prompt');
                    return false;
                }
            } catch (error) {
                console.error('Install prompt failed:', error);
                return false;
            }
        }
        
        return false;
    }
    
    /**
     * Send push notification
     */
    static async sendPushNotification(title: string, options: NotificationOptions = {}): Promise<void> {
        if (!('Notification' in window) || Notification.permission !== 'granted') {
            return;
        }
        
        try {
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification(title, {
                body: 'You have new updates in your productivity app',
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-192x192.png',
                tag: 'productivity-update',
                ...options
            });
        } catch (error) {
            console.error('Failed to send push notification:', error);
        }
    }
    
    /**
     * Handle online/offline events
     */
    static setupOnlineHandlers(
        onOnline?: () => void,
        onOffline?: () => void
    ): (() => void) | void {
        const handleOnline = () => {
            console.log('App is now online');
            onOnline?.();
            // Trigger sync when coming back online
            this.triggerSync();
        };
        
        const handleOffline = () => {
            console.log('App is now offline');
            onOffline?.();
        };
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        // Cleanup function
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }
    
    /**
     * Trigger manual sync
     */
    static async triggerSync(): Promise<void> {
        try {
            if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
                const registration = await navigator.serviceWorker.ready;
                await (registration as unknown as { sync: { register: (tag: string) => Promise<void> } }).sync.register('sync-tasks');
                await (registration as unknown as { sync: { register: (tag: string) => Promise<void> } }).sync.register('sync-habits');
            }
        } catch (error) {
            console.error('Manual sync failed:', error);
        }
    }
    
    /**
     * Get cached data for offline use
     */
    static async getCachedData<T>(key: string): Promise<T | null> {
        try {
            const cache = await caches.open('todolist-pwa-v1.0.0');
            const response = await cache.match(key);
            if (response) {
                return await response.json();
            }
            return null;
        } catch (error) {
            console.error('Failed to get cached data:', error);
            return null;
        }
    }
    
    /**
     * Save data to cache for offline use
     */
    static async saveToCache<T>(key: string, data: T): Promise<void> {
        try {
            const cache = await caches.open('todolist-pwa-v1.0.0');
            const response = new Response(JSON.stringify(data), {
                headers: { 'Content-Type': 'application/json' }
            });
            await cache.put(key, response);
        } catch (error) {
            console.error('Failed to save to cache:', error);
        }
    }
    
    /**
     * Handle service worker update notification
     */
    private static showUpdateNotification(): void {
        // Create update notification element
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
        notification.innerHTML = `
            <span>New version available!</span>
            <button id="update-btn" class="ml-2 px-2 py-1 bg-white text-blue-500 rounded text-sm font-medium">
                Update
            </button>
            <button id="close-btn" class="ml-1 text-white hover:text-blue-200">
                <span class="material-symbols-outlined text-base">close</span>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // Add event listeners
        document.getElementById('update-btn')?.addEventListener('click', async () => {
            try {
                const registration = await navigator.serviceWorker.ready;
                if (registration.waiting) {
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                }
            } catch (error) {
                console.error('Update failed:', error);
            }
        });
        
        document.getElementById('close-btn')?.addEventListener('click', () => {
            document.body.removeChild(notification);
        });
    }
    
    /**
     * Handle sync completion
     */
    private static handleSyncComplete(data: { category: string }): void {
        console.log(`Sync completed for ${data.category}`);
        
        // Show success notification
        this.sendPushNotification(
            'Sync Complete', 
            { 
                body: `Your ${data.category} have been synchronized with the server`,
                tag: 'sync-complete'
            }
        );
        
        // Clear pending data
        this.clearPendingData();
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('pwa-sync-complete', { detail: data }));
    }
}
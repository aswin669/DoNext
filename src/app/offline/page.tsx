"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function OfflinePage() {
    const [isOnline, setIsOnline] = useState(true);
    const [pendingActions, setPendingActions] = useState(0);

    useEffect(() => {
        // Check online status
        const updateOnlineStatus = () => {
            setIsOnline(navigator.onLine);
        };

        // Listen for online/offline events
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);

        // Initial check
        updateOnlineStatus();

        // Check for pending offline actions
        checkPendingActions();

        return () => {
            window.removeEventListener('online', updateOnlineStatus);
            window.removeEventListener('offline', updateOnlineStatus);
        };
    }, []);

    const checkPendingActions = async () => {
        try {
            // Check IndexedDB for pending actions
            if ('indexedDB' in window) {
                const db = await new Promise((resolve, reject) => {
                    const request = indexedDB.open('DoNextDB', 1);
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => resolve(request.result);
                });

                // Get pending tasks
                const pendingTasks = await new Promise((resolve, reject) => {
                    const transaction = db.transaction(['pendingTasks'], 'readonly');
                    const store = transaction.objectStore('pendingTasks');
                    const index = store.index('status');
                    const request = index.getAll('pending');
                    
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => resolve(request.result);
                });

                // Get pending habits
                const pendingHabits = await new Promise((resolve, reject) => {
                    const transaction = db.transaction(['pendingHabits'], 'readonly');
                    const store = transaction.objectStore('pendingHabits');
                    const index = store.index('status');
                    const request = index.getAll('pending');
                    
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => resolve(request.result);
                });

                const totalPending = (pendingTasks?.length || 0) + (pendingHabits?.length || 0);
                setPendingActions(totalPending);
            }
        } catch (error) {
            console.error('Error checking pending actions:', error);
            // Fallback to localStorage
            const pendingTasks = localStorage.getItem('pendingTasks');
            const pendingHabits = localStorage.getItem('pendingHabits');
            
            const taskCount = pendingTasks ? JSON.parse(pendingTasks).length : 0;
            const habitCount = pendingHabits ? JSON.parse(pendingHabits).length : 0;
            
            setPendingActions(taskCount + habitCount);
        }
    };

    const syncPendingActions = async () => {
        try {
            // Trigger background sync
            if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
                const registration = await navigator.serviceWorker.ready;
                await registration.sync.register('sync-tasks');
                await registration.sync.register('sync-habits');
                
                // Clear pending actions after sync request
                localStorage.removeItem('pendingTasks');
                localStorage.removeItem('pendingHabits');
                setPendingActions(0);
            }
        } catch (error) {
            console.error('Sync failed:', error);
        }
    };

    const retryConnection = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
                <div className="mb-6">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-4xl text-red-500 dark:text-red-400">
                            {isOnline ? 'cloud_off' : 'wifi_off'}
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {isOnline ? 'Connection Restored' : 'You\'re Offline'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        {isOnline 
                            ? 'Your connection is back online. Some features may require a refresh.' 
                            : 'You\'re currently offline. You can still use the app, but some features are limited.'
                        }
                    </p>
                </div>

                {!isOnline && (
                    <div className="space-y-4 mb-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">What you can do offline:</h3>
                            <ul className="text-sm text-blue-700 dark:text-blue-300 text-left space-y-1">
                                <li className="flex items-center">
                                    <span className="material-symbols-outlined text-base mr-2">check_circle</span>
                                    View existing tasks and habits
                                </li>
                                <li className="flex items-center">
                                    <span className="material-symbols-outlined text-base mr-2">check_circle</span>
                                    Mark tasks as complete
                                </li>
                                <li className="flex items-center">
                                    <span className="material-symbols-outlined text-base mr-2">check_circle</span>
                                    Track habit completions
                                </li>
                                <li className="flex items-center">
                                    <span className="material-symbols-outlined text-base mr-2">check_circle</span>
                                    View analytics and reports
                                </li>
                            </ul>
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                            <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">What\'s limited offline:</h3>
                            <ul className="text-sm text-amber-700 dark:text-amber-300 text-left space-y-1">
                                <li className="flex items-center">
                                    <span className="material-symbols-outlined text-base mr-2">warning</span>
                                    Creating new tasks/habits
                                </li>
                                <li className="flex items-center">
                                    <span className="material-symbols-outlined text-base mr-2">warning</span>
                                    Real-time notifications
                                </li>
                                <li className="flex items-center">
                                    <span className="material-symbols-outlined text-base mr-2">warning</span>
                                    Team collaboration features
                                </li>
                            </ul>
                        </div>
                    </div>
                )}

                {pendingActions > 0 && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-green-800 dark:text-green-200">
                                    {pendingActions} Pending Actions
                                </h3>
                                <p className="text-sm text-green-700 dark:text-green-300">
                                    These will sync automatically when you\'re back online
                                </p>
                            </div>
                            <button
                                onClick={syncPendingActions}
                                className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                            >
                                Sync Now
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={retryConnection}
                        className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">refresh</span>
                        {isOnline ? 'Refresh Page' : 'Retry Connection'}
                    </button>
                    
                    <Link 
                        href="/dashboard"
                        className="flex-1 px-4 py-3 border border-slate-200 dark:border-gray-600 text-slate-700 dark:text-gray-300 rounded-lg font-bold hover:bg-slate-50 dark:hover:bg-gray-700 transition-all text-center"
                    >
                        Go to Dashboard
                    </Link>
                </div>

                {isOnline && (
                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-gray-700">
                        <p className="text-sm text-slate-500 dark:text-gray-400">
                            All offline changes have been synchronized with the server.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
"use client";

import { useState, useEffect } from "react";
import { PWAService } from "@/lib/pwa-service";

export default function PWADashboard() {
    const [isPWA, setIsPWA] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const [installPromptAvailable, setInstallPromptAvailable] = useState(false);
    const [pendingTasks, setPendingTasks] = useState(0);
    const [pendingHabits, setPendingHabits] = useState(0);
    const [swStatus, setSwStatus] = useState<'unsupported' | 'installing' | 'installed' | 'waiting' | 'active'>('unsupported');
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        initializePWA();
        setupEventListeners();
    }, []);

    const initializePWA = async () => {
        // Check if running as PWA
        setIsPWA(PWAService.isPWAInstalled());
        
        // Check online status
        setIsOnline(PWAService.isOnline());
        
        // Check service worker status
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration) {
                setSwStatus(registration.active ? 'active' : 
                           registration.waiting ? 'waiting' : 
                           registration.installing ? 'installing' : 'installed');
            } else {
                setSwStatus('unsupported');
            }
        }
        
        // Check notification permission
        if ('Notification' in window) {
            setNotificationPermission(Notification.permission);
        }
        
        // Check for install prompt availability
        setInstallPromptAvailable(!!(window as any).beforeInstallPromptEvent);
        
        // Check pending data
        updatePendingCounts();
    };

    const setupEventListeners = () => {
        // Listen for beforeinstallprompt event
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            (window as any).beforeInstallPromptEvent = e;
            setInstallPromptAvailable(true);
        };
        
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        
        // Setup online/offline handlers
        PWAService.setupOnlineHandlers(
            () => setIsOnline(true),
            () => setIsOnline(false)
        );
        
        // Listen for sync complete events
        const handleSyncComplete = () => {
            updatePendingCounts();
        };
        
        window.addEventListener('pwa-sync-complete', handleSyncComplete);
        
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('pwa-sync-complete', handleSyncComplete);
        };
    };

    const updatePendingCounts = () => {
        setPendingTasks(PWAService.getPendingTasks().length);
        setPendingHabits(PWAService.getPendingHabits().length);
    };

    const handleInstallClick = async () => {
        const installed = await PWAService.showInstallPrompt();
        if (installed) {
            setInstallPromptAvailable(false);
            setIsPWA(true);
        }
    };

    const handleSyncClick = async () => {
        await PWAService.triggerSync();
        updatePendingCounts();
    };

    const handleRequestNotificationPermission = async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-500';
            case 'waiting': return 'bg-yellow-500';
            case 'installing': return 'bg-blue-500';
            case 'installed': return 'bg-purple-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active': return 'Active';
            case 'waiting': return 'Update Available';
            case 'installing': return 'Installing';
            case 'installed': return 'Installed';
            case 'unsupported': return 'Not Supported';
            default: return 'Unknown';
        }
    };

    return (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-slate-100 dark:border-[#222] p-6">
            <h2 className="text-2xl font-bold mb-6">PWA Status & Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* PWA Status */}
                <div className="bg-slate-50 dark:bg-[#222] rounded-xl p-4">
                    <h3 className="font-bold text-lg mb-3">PWA Status</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-600 dark:text-slate-400">App Installation</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                isPWA 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                            }`}>
                                {isPWA ? 'Installed' : 'Not Installed'}
                            </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <span className="text-slate-600 dark:text-slate-400">Service Worker</span>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${getStatusColor(swStatus)}`}></div>
                                <span className="text-sm">{getStatusText(swStatus)}</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <span className="text-slate-600 dark:text-slate-400">Network Status</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                isOnline 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {isOnline ? 'Online' : 'Offline'}
                            </span>
                        </div>
                    </div>
                </div>
                
                {/* Pending Actions */}
                <div className="bg-slate-50 dark:bg-[#222] rounded-xl p-4">
                    <h3 className="font-bold text-lg mb-3">Pending Actions</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-600 dark:text-slate-400">Pending Tasks</span>
                            <span className="font-bold">{pendingTasks}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <span className="text-slate-600 dark:text-slate-400">Pending Habits</span>
                            <span className="font-bold">{pendingHabits}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <span className="text-slate-600 dark:text-slate-400">Notifications</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                notificationPermission === 'granted'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                                {notificationPermission === 'granted' ? 'Granted' : 'Not Granted'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-4">
                {installPromptAvailable && !isPWA && (
                    <button
                        onClick={handleInstallClick}
                        className="w-full md:w-auto px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px]">download</span>
                        Install App
                    </button>
                )}
                
                {!isOnline && (
                    <button
                        onClick={handleSyncClick}
                        disabled={pendingTasks === 0 && pendingHabits === 0}
                        className="w-full md:w-auto px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined text-[18px]">sync</span>
                        Sync Offline Data
                    </button>
                )}
                
                {notificationPermission !== 'granted' && (
                    <button
                        onClick={handleRequestNotificationPermission}
                        className="w-full md:w-auto px-4 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px]">notifications</span>
                        Enable Notifications
                    </button>
                )}
                
                <div className="text-sm text-slate-500 dark:text-slate-400">
                    <p className="mb-1">💡 Pro Tips:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Install the app for full offline functionality</li>
                        <li>Enable notifications to receive productivity reminders</li>
                        <li>Offline changes automatically sync when you're back online</li>
                        <li>Use the app from your home screen for the best experience</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
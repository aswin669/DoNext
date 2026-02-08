"use client";

import { useState, useEffect, useRef } from "react";

type TimerState = 'idle' | 'work' | 'break' | 'paused';
type PomodoroSettings = {
    workDuration: number;    // 25 minutes default
    breakDuration: number;   // 5 minutes default
    longBreakDuration: number; // 15 minutes default
    sessionsBeforeLongBreak: number; // 4 sessions
};

const DEFAULT_SETTINGS: PomodoroSettings = {
    workDuration: 25 * 60 * 1000,    // 25 minutes
    breakDuration: 5 * 60 * 1000,     // 5 minutes
    longBreakDuration: 15 * 60 * 1000, // 15 minutes
    sessionsBeforeLongBreak: 4
};

export default function PomodoroTimer() {
    const [timerState, setTimerState] = useState<TimerState>('idle');
    const [timeLeft, setTimeLeft] = useState<number>(DEFAULT_SETTINGS.workDuration);
    const [currentSession, setCurrentSession] = useState<number>(1);
    const [totalSessions, setTotalSessions] = useState<number>(0);
    const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
    
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(0);
    const pausedTimeRef = useRef<number>(0);

    // Format time for display
    const formatTime = (milliseconds: number): string => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Start the timer
    const startTimer = () => {
        if (timerState === 'idle' || timerState === 'paused') {
            setTimerState('work');
            startTimeRef.current = Date.now() - (timerState === 'paused' ? pausedTimeRef.current : 0);
            
            intervalRef.current = setInterval(() => {
                const elapsed = Date.now() - startTimeRef.current;
                const timeRemaining = Math.max(0, DEFAULT_SETTINGS.workDuration - elapsed);
                
                setTimeLeft(timeRemaining);
                
                if (timeRemaining <= 0) {
                    completeSession();
                }
            }, 1000);
        }
    };

    // Pause the timer
    const pauseTimer = () => {
        if (timerState === 'work' || timerState === 'break') {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            pausedTimeRef.current = Date.now() - startTimeRef.current;
            setTimerState('paused');
        }
    };

    // Reset the timer
    const resetTimer = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setTimerState('idle');
        setTimeLeft(DEFAULT_SETTINGS.workDuration);
        setCurrentSession(1);
    };

    // Complete current session
    const completeSession = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        setTotalSessions(prev => prev + 1);
        
        // Determine next session type
        if (currentSession % settings.sessionsBeforeLongBreak === 0) {
            // Long break
            setTimerState('break');
            setTimeLeft(settings.longBreakDuration);
            // Don't increment session counter for breaks
        } else if (timerState === 'work') {
            // Short break
            setTimerState('break');
            setTimeLeft(settings.breakDuration);
            // Don't increment session counter for breaks
        } else {
            // Back to work
            setTimerState('work');
            setTimeLeft(DEFAULT_SETTINGS.workDuration);
            setCurrentSession(prev => prev + 1);
        }
    };

    // Skip current session
    const skipSession = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        completeSession();
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    // Get progress percentage
    const getProgress = (): number => {
        const totalTime = timerState === 'work' 
            ? DEFAULT_SETTINGS.workDuration 
            : currentSession % settings.sessionsBeforeLongBreak === 0
                ? settings.longBreakDuration
                : settings.breakDuration;
        
        return ((totalTime - timeLeft) / totalTime) * 100;
    };

    // Get current session type for display
    const getSessionType = (): string => {
        if (timerState === 'work') return 'Focus Time';
        if (timerState === 'break') {
            return currentSession % settings.sessionsBeforeLongBreak === 0 
                ? 'Long Break' 
                : 'Short Break';
        }
        return 'Ready';
    };

    // Get session color
    const getSessionColor = (): string => {
        if (timerState === 'work') return 'text-red-500';
        if (timerState === 'break') return 'text-green-500';
        return 'text-slate-500';
    };

    return (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-slate-100 dark:border-[#222] p-8 max-w-md mx-auto">
            <div className="text-center">
                {/* Session Info */}
                <div className="mb-6">
                    <h2 className={`text-2xl font-bold ${getSessionColor()}`}>
                        {getSessionType()}
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Session {currentSession} of {settings.sessionsBeforeLongBreak} cycle
                    </p>
                </div>

                {/* Timer Circle */}
                <div className="relative size-64 mx-auto mb-8">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                        {/* Background circle */}
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="8"
                            className="dark:stroke-[#333]"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke={timerState === 'work' ? "#ef4444" : "#10b981"}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray="283"
                            strokeDashoffset={283 - (283 * getProgress()) / 100}
                            transform="rotate(-90 50 50)"
                            className="transition-all duration-1000 ease-linear"
                        />
                    </svg>
                    
                    {/* Timer text in center */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-4xl font-black text-[#333] dark:text-white">
                                {formatTime(timeLeft)}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                                {timerState === 'idle' ? 'Ready to focus' : 
                                 timerState === 'paused' ? 'Paused' : 
                                 timerState === 'work' ? 'Stay focused!' : 'Take a break'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-4 mb-6">
                    {timerState === 'idle' || timerState === 'paused' ? (
                        <button
                            onClick={startTimer}
                            className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">play_arrow</span>
                            {timerState === 'idle' ? 'Start Focus' : 'Resume'}
                        </button>
                    ) : (
                        <button
                            onClick={pauseTimer}
                            className="px-6 py-3 bg-yellow-500 text-white rounded-xl font-bold hover:bg-yellow-600 transition-all flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">pause</span>
                            Pause
                        </button>
                    )}
                    
                    {(timerState === 'work' || timerState === 'break') && (
                        <button
                            onClick={skipSession}
                            className="px-6 py-3 bg-slate-500 text-white rounded-xl font-bold hover:bg-slate-600 transition-all flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">skip_next</span>
                            Skip
                        </button>
                    )}
                    
                    <button
                        onClick={resetTimer}
                        className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-all flex items-center gap-2 dark:bg-[#222] dark:text-slate-300 dark:hover:bg-[#333]"
                    >
                        <span className="material-symbols-outlined">replay</span>
                        Reset
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-[#333]">
                    <div className="text-center">
                        <div className="text-2xl font-black text-primary">{totalSessions}</div>
                        <div className="text-xs text-slate-500 uppercase font-bold">Total Sessions</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-black text-green-500">
                            {Math.floor((totalSessions * 25) / 60)}h {(totalSessions * 25) % 60}m
                        </div>
                        <div className="text-xs text-slate-500 uppercase font-bold">Focus Time</div>
                    </div>
                </div>

                {/* Settings (simplified) */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#333]">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Pomodoro Settings</h3>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-slate-50 dark:bg-[#222] p-2 rounded-lg">
                            <div className="font-bold text-primary">25m</div>
                            <div className="text-slate-500">Work</div>
                        </div>
                        <div className="bg-slate-50 dark:bg-[#222] p-2 rounded-lg">
                            <div className="font-bold text-green-500">5m</div>
                            <div className="text-slate-500">Short Break</div>
                        </div>
                        <div className="bg-slate-50 dark:bg-[#222] p-2 rounded-lg">
                            <div className="font-bold text-blue-500">15m</div>
                            <div className="text-slate-500">Long Break</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
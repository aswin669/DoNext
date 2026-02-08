"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface ThemeContextType {
    theme: string;
    setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children, initialTheme }: { children: ReactNode; initialTheme: string }) => {
    const [theme, setTheme] = useState(initialTheme);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Check localStorage for saved theme preference
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            setTheme(savedTheme);
        }
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const root = window.document.documentElement;

        // Remove both theme classes
        root.classList.remove("light", "dark");

        // Add the current theme
        root.classList.add(theme);

        // Store in localStorage for persistence
        localStorage.setItem("theme", theme);
    }, [theme, mounted]);

    const value: ThemeContextType = { theme, setTheme };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};

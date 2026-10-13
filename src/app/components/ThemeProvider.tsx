"use client";

import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
    theme: "dark",
    toggleTheme: () => { },
});

export function useTheme() {
    return useContext(ThemeContext);
}

const STORAGE_KEY = "portfolio-theme";

const subscribeToTheme = (onChange: () => void) => {
    const observer = new MutationObserver(onChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
};

/** The theme to render with: "light" during SSR and hydration, then the live value. */
export function useRenderedTheme(): Theme {
    return useSyncExternalStore(
        subscribeToTheme,
        () => (document.documentElement.dataset.theme === "dark" ? "dark" : "light"),
        () => "light"
    );
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    // Read the theme already set by the inline script on html[data-theme]
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window === "undefined") return "light";
        const current = document.documentElement.dataset.theme as Theme | undefined;
        if (current === "light" || current === "dark") {
            return current;
        }
        // Mobile: dark mode, Desktop: light mode
        const isMobile = window.innerWidth < 768;
        return isMobile ? "dark" : "light";
    });

    // Keep data-theme in sync whenever theme changes
    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        try {
            window.localStorage.setItem(STORAGE_KEY, theme);
        } catch {
            // ignore
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

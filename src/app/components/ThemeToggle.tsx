"use client";

import { useRenderedTheme, useTheme } from "./ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";

const SunIcon = () => (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 2.8v2.1M12 19.1v2.1M4.9 4.9l1.5 1.5M17.6 17.6l1.5 1.5M2.8 12h2.1M19.1 12h2.1M4.9 19.1l1.5-1.5M17.6 6.4l1.5-1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
);

const MoonIcon = () => (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden="true">
        <path d="M14.8 3.6a7.8 7.8 0 1 0 5.6 13.2A8.6 8.6 0 0 1 14.8 3.6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
);

export default function ThemeToggle() {
    const { toggleTheme } = useTheme();
    const theme = useRenderedTheme();

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="fixed bottom-6 left-6 lg:top-6 lg:left-6 lg:bottom-auto z-[120] h-9 w-9 rounded-full border border-[var(--site-border)] bg-[var(--site-surface)]/95 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.22)] flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-[0_10px_28px_rgb(var(--site-accent-rgb)/0.24)] group cursor-pointer"
        >
            <AnimatePresence mode="wait" initial={false}>
                {theme === "dark" ? (
                    <motion.span
                        key="sun"
                        initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="text-[var(--site-accent)] flex items-center justify-center"
                        aria-hidden="true"
                    >
                        <SunIcon />
                    </motion.span>
                ) : (
                    <motion.span
                        key="moon"
                        initial={{ opacity: 0, rotate: 90, scale: 0.6 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: -90, scale: 0.6 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="text-[var(--site-muted)] flex items-center justify-center"
                        aria-hidden="true"
                    >
                        <MoonIcon />
                    </motion.span>
                )}
            </AnimatePresence>
        </button>
    );
}

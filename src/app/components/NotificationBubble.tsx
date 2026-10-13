"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import PixelMark from "./PixelMark";
import { AnimatePresence, motion } from "framer-motion";
import { useHyderabadPhase } from "./SceneAtmosphere";

/** Let any part of the site have the mascot say something. */
export const say = (text: string) => window.dispatchEvent(new CustomEvent("mascot:say", { detail: text }));

const GREETING = { dawn: "Good morning from Hyderabad.", day: "Good afternoon from Hyderabad.", dusk: "Good evening from Hyderabad.", night: "Late night in Hyderabad. Welcome in." };

const pageMessages: Record<string, string[]> = {
    "/": [
        "Press ⌘K anywhere for my terminal",
        "The top pill is live: pushes, CI and my local time",
        "Light or dark? The toggle is in the corner",
        "There's a secret page. Can you find it?",
    ],
    "/about": [
        "My GitHub stats below refresh every hour",
        "Grab the resume that fits your role",
        "Experience is further down",
        "Yes, I also run a clothing label",
    ],
    "/work": [
        "Click any card for the full breakdown",
        "The ▾ button shows each project's numbers",
        "Every diagram is the real pipeline",
        "ivm runs right in your browser on its page",
        "Somewhere out there, an egg is waiting",
    ],
    "/contact": [
        "Type help in the terminal, or press ⌘K anywhere",
        "Email or call, whichever you prefer",
        "There's a secret page. Did you find it?",
    ],
};

const projectMessages = [
    "Scroll down for the tech stack",
    "These numbers are measured, not estimated",
    "The source code button goes to GitHub",
];

export default function NotificationBubble() {
    const [show, setShow] = useState(false);
    const [message, setMessage] = useState("");
    const [shown, setShown] = useState<Set<string>>(new Set());
    const pathname = usePathname();
    const phase = useHyderabadPhase();

    const pop = (text: string) => {
        setMessage(text);
        setShow(true);
        const audio = new Audio("/sfx/notification.mp3");
        audio.volume = 0.3;
        audio.play().catch(() => {});
        window.setTimeout(() => setShow(false), 4500);
    };

    useEffect(() => {
        const onSay = (e: Event) => pop((e as CustomEvent<string>).detail);
        window.addEventListener("mascot:say", onSay);
        return () => window.removeEventListener("mascot:say", onSay);
    });

    useEffect(() => {
        // Reset on route change
        const timeoutId = setTimeout(() => {
            let msgs: string[];

            if (pathname.startsWith("/project/")) {
                msgs = projectMessages;
            } else {
                msgs = pageMessages[pathname] || [];
            }
            // First hello on home is a greeting for the hour where Faizan is.
            if (pathname === "/" && phase && !shown.has("greeting")) {
                setShown((prev) => new Set(prev).add("greeting"));
                return pop(GREETING[phase]);
            }

            // Pick a message NOT yet shown
            const unseen = msgs.filter((m) => !shown.has(m));
            if (unseen.length === 0) return;

            const pick = unseen[Math.floor(Math.random() * unseen.length)];
            setShown((prev) => new Set(prev).add(pick));
            pop(pick);
        }, 1800);

        return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per route, after the hour is known
    }, [pathname, phase]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9, filter: "blur(4px)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="fixed bottom-32 md:bottom-16 right-4 md:right-8 z-[999] flex items-center gap-2.5 bg-[var(--site-card-bg)] border border-[var(--site-border)] backdrop-blur-xl px-3.5 py-2 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.15)] cursor-pointer"
                    onClick={() => setShow(false)}
                >
                    <div className="relative w-7 h-7 rounded-full border border-[var(--site-border)] overflow-hidden bg-[var(--site-card-bg-strong)] shrink-0">
                        <PixelMark className="h-full w-full" />
                    </div>
                    <p className="text-xs font-semibold text-[var(--text-heading)] tracking-wide pr-1">
                        {message}
                    </p>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

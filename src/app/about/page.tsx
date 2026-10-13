import type { Metadata } from "next";
import About from "../components/About";
import { getCalendar, getProfileStats, getPushes } from "../lib/github";

export const metadata: Metadata = {
    title: "About",
    description: "About Mohammed Faizan Ahmed: final-year CS at Mahindra University, two years of production backend and AI work, live GitHub activity, experience and hackathon wins.",
    alternates: { canonical: "/about" },
    openGraph: { url: "/about", title: "About · Mohammed Faizan Ahmed", description: "About Mohammed Faizan Ahmed: final-year CS at Mahindra University, two years of production backend and AI work, live GitHub activity, experience and hackathon wins." },
};

export const revalidate = 3600;

export default async function AboutPage() {
    const [stats, pushes, calendar] = await Promise.all([getProfileStats(), getPushes(), getCalendar()]);
    return (
        <main className="relative isolate flex-1 flex flex-col pt-32 pb-40 min-h-screen overflow-hidden">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_14%_20%,rgb(var(--site-accent-rgb)/0.16),transparent_38%),radial-gradient(circle_at_84%_78%,rgb(var(--site-accent-solid-rgb)/0.16),transparent_42%)]" />
            <div className="pointer-events-none absolute -top-16 -left-16 -z-10 h-72 w-72 rounded-full bg-[var(--site-accent)]/20 blur-3xl" />
            <div className="pointer-events-none absolute top-8 right-2 -z-10 h-80 w-80 rounded-full bg-[var(--site-accent-deep)]/18 blur-3xl" />
            <About live={{ stats, lastPush: pushes[0] ?? null, calendar }} />
        </main>
    );
}

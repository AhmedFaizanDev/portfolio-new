"use client";
import { motion, useReducedMotion, useMotionValue, useSpring } from "framer-motion";
import { useRef } from "react";
import PixelMark from "./PixelMark";
import { useRenderedTheme } from "./ThemeProvider";
import Ago from "./Ago";
import ContributionGraph from "./ContributionGraph";
import type { Calendar, Push } from "../lib/github";
import {
    achievements,
    areaLabels,
    certifications,
    education,
    experience,
    profile,
    projects,
    resumes,
    ventures,
    type Area,
} from "../data/profile";

interface MagneticButtonProps {
    children: React.ReactNode;
    className?: string;
    href: string;
    download?: string;
}

function MagneticButton({ children, className, href, download }: MagneticButtonProps) {
    const ref = useRef<HTMLAnchorElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

    function onMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        x.set(e.clientX - (rect.left + rect.width / 2));
        y.set(e.clientY - (rect.top + rect.height / 2));
    }

    return (
        <motion.a
            ref={ref}
            href={href}
            download={download}
            onMouseMove={onMouseMove}
            onMouseLeave={() => { x.set(0); y.set(0); }}
            style={{ translateX: mouseX, translateY: mouseY }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.a>
    );
}

const icons8 = (name: string) => `https://img.icons8.com/color/96/${name}.png`;
const coreStack = [
    { name: "Python", icon: icons8("python--v1") },
    { name: "TypeScript", icon: icons8("typescript") },
    { name: "JavaScript", icon: icons8("javascript--v1") },
    { name: "Django", icon: icons8("django") },
    { name: "Node.js", icon: icons8("nodejs") },
    { name: "PostgreSQL", icon: icons8("postgreesql") },
    { name: "Redis", icon: icons8("redis") },
    { name: "SQLite", icon: "https://cdn.simpleicons.org/sqlite" },
    { name: "Docker", icon: icons8("docker") },
    { name: "AWS", icon: icons8("amazon-web-services") },
    { name: "Nginx", icon: icons8("nginx") },
    { name: "Linux", icon: icons8("linux") },
    { name: "PyTorch", icon: "https://cdn.simpleicons.org/pytorch" },
    { name: "OpenCV", icon: icons8("opencv") },
    { name: "Git", icon: icons8("git") },
];

const loopTitles = [
    "Backend Engineering",
    "Incremental Computation",
    "Multi-Tenant SaaS",
    "LLM Routing",
    "Autonomous Agents",
    "Evaluation Harnesses",
    "PostgreSQL & Redis",
    "Docker & CI/CD",
    "Applied ML",
    "Systems from the Spec",
];

// Bar length = how many featured builds touch each area. Counted, not self-rated.
const areaCounts = (Object.keys(areaLabels) as Area[]).map((area) => ({
    label: areaLabels[area],
    count: projects.filter((p) => p.areas.includes(area)).length,
}));
const maxCount = Math.max(...areaCounts.map((a) => a.count));

const reveal = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export type AboutLive = {
    stats: { repos: number; followers: number; since: string } | null;
    lastPush: Push | null;
    calendar: Calendar | null;
};

const fmtDay = (iso: string) =>
    new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

export default function About({ live }: { live: AboutLive }) {
    const reduceMotion = useReducedMotion();
    const theme = useRenderedTheme();
    const { stats: gh, lastPush, calendar } = live;

    const stats = [
        { label: "Public repositories", value: gh?.repos },
        { label: "Contributions, last year", value: calendar?.total.toLocaleString("en-US") ?? gh?.followers, altLabel: calendar ? undefined : "Followers" },
        { label: "On GitHub since", value: gh?.since },
        { label: "Last push", value: lastPush ? <Ago iso={lastPush.pushedAt} /> : undefined, note: lastPush?.name },
    ];

    return (
        <section id="about" className="relative w-full min-h-screen pb-10 overflow-hidden">
            <div className="relative px-6 md:px-12 w-full max-w-7xl mx-auto">
                <motion.div {...reveal()} className="text-center mb-12 md:mb-14">
                    <h2 className="mt-5 text-4xl sm:text-5xl md:text-7xl font-extrabold font-doto text-[var(--text-heading)] tracking-tight leading-[0.95]">
                        Build it right, <br />
                        Prove it works<span className="font-doto text-4xl sm:text-5xl md:text-7xl font-extrabold rubber-spin-dot inline-flex items-center justify-center w-[1em] h-[1em] leading-none align-middle text-[var(--site-accent)]">+</span>
                    </h2>
                    <p className="mt-6 text-lg md:text-xl text-[var(--text-secondary)] font-medium max-w-3xl mx-auto">
                        I like owning a system end to end: the schema, the API contract, and the eval harness that says whether a change actually helped.
                    </p>
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5">
                        <MagneticButton
                            href={resumes[0].href}
                            download={resumes[0].file}
                            className="group relative inline-flex items-center gap-2 rounded-full border border-[var(--site-border)] bg-[var(--site-card-bg-strong)] px-6 py-3 text-sm md:text-base font-extrabold tracking-[0.08em] uppercase text-[var(--site-accent)] shadow-[0_10px_24px_rgb(var(--site-accent-rgb)/0.08)] backdrop-blur-md transition-all hover:bg-[var(--site-card-bg)] hover:shadow-[0_14px_32px_rgb(var(--site-accent-rgb)/0.15)] overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Download Resume
                                <span className="material-symbols-outlined text-[1rem]" aria-hidden="true">download</span>
                            </span>
                            <motion.span
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--site-accent)]/10 to-transparent -translate-x-full"
                                whileHover={{ x: "200%" }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                            />
                        </MagneticButton>
                        <p className="text-sm font-semibold text-[var(--text-muted)]">
                            or tailored:{" "}
                            {resumes.slice(1).map((r, i) => (
                                <span key={r.slug}>
                                    {i > 0 ? " · " : ""}
                                    <a href={r.href} download={r.file} className="text-[var(--site-accent)] underline decoration-[var(--site-accent)]/30 underline-offset-4 hover:decoration-[var(--site-accent)]">
                                        {r.label}
                                    </a>
                                </span>
                            ))}
                        </p>
                    </div>
                </motion.div>

                <motion.div {...reveal()} className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 mb-10">
                    <motion.aside
                        {...reveal(0.1)}
                        className="lg:col-span-5 rounded-[2.6rem] border border-[var(--site-accent)]/20 bg-[var(--site-card-bg-accent)] backdrop-blur-xl p-7 md:p-9 shadow-[0_24px_64px_rgba(0,0,0,0.2)] relative overflow-hidden"
                    >
                        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-[var(--site-accent)]/10 blur-2xl" />
                        <div className="relative z-10 flex items-start gap-4">
                            <div className="relative w-24 h-24 rounded-2xl border border-[var(--site-border)] overflow-hidden shadow-[0_14px_24px_rgba(0,0,0,0.2)] shrink-0">
                                <PixelMark className="h-full w-full" />
                            </div>
                            <div>
                                <p className="text-sm tracking-[0.14em] uppercase text-[var(--text-secondary)] font-bold">Hello there, I&apos;m</p>
                                <h4 className="text-2xl font-black leading-tight mt-1 text-[var(--text-heading)]">{profile.name}</h4>
                                <p className="text-xs tracking-[0.14em] uppercase text-[var(--site-accent)] mt-1.5 font-bold">B.Tech CSE &apos;27 · {profile.location}</p>
                            </div>
                        </div>
                        <p className="relative z-10 mt-6 text-[var(--text-secondary)] text-base leading-relaxed font-medium">
                            I&apos;m a final-year Computer Science student at {education.institution}, with two years of production work across backend, full-stack and applied AI. I&apos;m drawn to problems where a wrong answer looks exactly like a right one: incremental database views, multi-tenant isolation, LLM routing. So I usually build the check before the system. An oracle, a baseline, a test that has to return 403.
                        </p>
                        <div className="relative z-10 mt-6 flex flex-wrap gap-2.5">
                            {["Backend", "Databases", "LLM Systems", "Evaluation", "DevOps"].map((chip) => (
                                <span key={chip} className="rounded-full px-3 py-1.5 text-xs font-bold tracking-[0.1em] uppercase border border-[var(--site-accent)]/25 bg-[var(--site-accent)]/10 text-[var(--site-accent)]">
                                    {chip}
                                </span>
                            ))}
                        </div>
                    </motion.aside>

                    <motion.article
                        {...reveal(0.15)}
                        className="lg:col-span-7 rounded-[2.6rem] border border-[var(--site-border)] bg-[var(--site-card-bg)] backdrop-blur-xl p-7 md:p-10 shadow-[0_24px_64px_rgba(0,0,0,0.12)]"
                    >
                        <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] tracking-[0.16em] uppercase font-bold text-[var(--site-live)] bg-[var(--site-live)]/10 border border-[var(--site-live)]/25">
                            <span className="h-1.5 w-1.5 rounded-full bg-[var(--site-live)] motion-safe:animate-pulse" aria-hidden="true" />
                            Live from GitHub
                        </p>
                        <h3 className="mt-5 text-3xl md:text-5xl font-extrabold font-doto text-[var(--text-heading)] leading-[1.04]">
                            Code in public, numbers attached.
                        </h3>
                        <p className="mt-4 text-base md:text-lg text-[var(--text-secondary)] max-w-2xl leading-relaxed font-medium">
                            Most of what I build is open source. These figures are pulled from the GitHub API and refreshed every hour.
                        </p>
                        <div className="mt-7 grid grid-cols-2 gap-3 md:gap-4">
                            {stats.map((item) => (
                                <div key={item.label} className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-card-bg-strong)] px-4 py-4 shadow-sm">
                                    <p className="text-[11px] tracking-[0.14em] uppercase text-[var(--site-accent)] font-bold">{item.altLabel ?? item.label}</p>
                                    <p className="mt-1 text-xl md:text-2xl font-black text-[var(--text-card)] tabular-nums">{item.value ?? "—"}</p>
                                    {item.note ? <p className="mt-0.5 font-mono text-[11px] text-[var(--text-muted)] truncate">{item.note}</p> : null}
                                </div>
                            ))}
                        </div>
                    </motion.article>
                </motion.div>

                <motion.section
                    {...reveal()}
                    className="mb-10 rounded-[2.4rem] border border-[var(--site-border)] bg-[var(--site-card-bg)] backdrop-blur-lg p-5 md:p-7 shadow-[0_18px_45px_rgba(0,0,0,0.05)]"
                >
                    <div className="flex flex-row items-center justify-between gap-3 mb-4">
                        <p className="text-[11px] tracking-[0.16em] uppercase font-bold text-[var(--site-accent)]">A year of commits</p>
                        <a
                            href={`https://github.com/${profile.githubUsername}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex w-fit px-3 py-1.5 rounded-full text-xs font-bold tracking-[0.1em] uppercase bg-[var(--site-accent)]/10 text-[var(--site-accent)] border border-[var(--site-accent)]/20"
                        >
                            @{profile.githubUsername}
                        </a>
                    </div>
                    {calendar ? (
                        <>
                            <div className="mb-5 grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                    ["Active days", `${calendar.activeDays} / ${calendar.weeks.flat().length}`],
                                    ["Longest streak", `${calendar.longestStreak} days`],
                                    ["Per active day", (calendar.total / Math.max(1, calendar.activeDays)).toFixed(1)],
                                    ["Busiest day", `${calendar.busiest.count} on ${fmtDay(calendar.busiest.date)}`],
                                ].map(([k, v]) => (
                                    <div key={k} className="rounded-xl border border-[var(--site-border)] bg-[var(--site-card-bg-strong)] px-3.5 py-2.5">
                                        <p className="text-[10px] tracking-[0.14em] uppercase text-[var(--text-muted)] font-bold">{k}</p>
                                        <p className="mt-0.5 font-doto font-black text-lg text-[var(--text-heading)] tabular-nums">{v}</p>
                                    </div>
                                ))}
                            </div>
                            <ContributionGraph calendar={calendar} />
                        </>
                    ) : (
                        /* eslint-disable-next-line @next/next/no-img-element -- fallback when no GitHub token is configured */
                        <img
                            src={`https://ghchart.rshah.org/${theme === 'light' ? '1f6fc2' : '8fd0f2'}/${profile.githubUsername}`}
                            alt={`${profile.githubUsername} GitHub contributions graph`}
                            className="w-full h-auto rounded-2xl border border-[var(--site-border)] bg-[var(--site-card-bg-strong)] p-2"
                            loading="lazy"
                        />
                    )}
                </motion.section>

                <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden rounded-none border-y border-[var(--site-border)] bg-[var(--site-card-bg)] backdrop-blur-2xl shadow-[0_12px_32px_rgba(0,0,0,0.2)] mb-10">
                    <motion.div
                        className="flex gap-4 w-max py-4 px-6 md:px-12"
                        animate={reduceMotion ? undefined : { x: [0, -900] }}
                        transition={reduceMotion ? undefined : { duration: 24, ease: "linear", repeat: Infinity }}
                    >
                        {[...loopTitles, ...loopTitles, ...loopTitles].map((title, index) => (
                            <span
                                key={`loop-${index}`}
                                className="px-4 py-1.5 rounded-full text-xs md:text-sm tracking-[0.13em] uppercase font-extrabold bg-[var(--site-accent)]/8 text-[var(--site-accent)] border border-[var(--site-accent)]/15 whitespace-nowrap"
                            >
                                {title}
                            </span>
                        ))}
                    </motion.div>
                </div>

                <motion.div {...reveal()} className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 mb-10">
                    <motion.article
                        {...reveal()}
                        className="lg:col-span-7 relative rounded-[2.3rem] bg-[var(--site-card-bg)] border border-[var(--site-border)] p-7 md:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-lg overflow-hidden"
                    >
                        <div className="absolute -top-20 -right-20 w-52 h-52 rounded-full bg-[var(--site-accent)]/5 blur-3xl" />
                        <h3 className="text-3xl md:text-4xl font-extrabold font-doto text-[var(--text-heading)] leading-tight mb-4">Off the Clock</h3>
                        <p className="text-lg text-[var(--text-secondary)] leading-relaxed font-medium">
                            Not everything I run is a server. Outside engineering, I build small things of my own.
                        </p>
                        <div className="relative z-10 mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {ventures.map((v) => (
                                <div key={v.name} className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-card-bg-strong)] px-5 py-4">
                                    <p className="font-doto text-xl font-black text-[var(--text-heading)]">{v.name}</p>
                                    <p className="mt-1 text-sm text-[var(--text-secondary)] font-medium leading-relaxed">{v.blurb}</p>
                                </div>
                            ))}
                        </div>
                        <h4 className="text-xl md:text-2xl font-extrabold font-doto text-[var(--text-heading)] leading-tight mt-7">Also on the list</h4>
                        <div className="relative z-10 mt-4 flex flex-wrap gap-2.5">
                            {["Head of Tech & Design · Qubit Club", "Hackathon regular", "Coffee. Code. Conquer."].map((chip) => (
                                <span key={chip} className="rounded-full px-3 py-1.5 text-xs font-bold tracking-[0.1em] uppercase border border-[var(--site-accent)]/20 bg-[var(--site-accent)]/10 text-[var(--site-accent)]">
                                    {chip}
                                </span>
                            ))}
                        </div>
                    </motion.article>

                    <motion.article
                        id="skills"
                        {...reveal(0.1)}
                        className="lg:col-span-5 rounded-[2.3rem] bg-[var(--site-card-bg-strong)] border border-[var(--site-border)] p-7 md:p-9 shadow-[0_22px_54px_rgba(0,0,0,0.15)] backdrop-blur-lg scroll-mt-28"
                    >
                        <h3 className="text-3xl font-extrabold font-doto mb-2 text-[var(--text-heading)]">Skills</h3>
                        <p className="text-xs font-semibold text-[var(--text-muted)] mb-5">Bars count the featured builds in each area.</p>
                        <div className="space-y-4 mb-7">
                            {areaCounts.map((item) => (
                                <div key={item.label}>
                                    <div className="flex items-center justify-between text-sm font-semibold mb-2 text-[var(--text-secondary)]">
                                        <span>{item.label}</span>
                                        <span className="font-mono text-xs text-[var(--site-accent)]">{item.count} builds</span>
                                    </div>
                                    <div className="flex gap-1">
                                        {[...Array(20)].map((_, index) => {
                                            const filled = index < Math.round((item.count / maxCount) * 20);
                                            return (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    whileInView={{ opacity: 1, scale: 1 }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 0.3, delay: index * 0.025 }}
                                                    className={`w-2.5 h-2.5 rounded-sm border ${filled
                                                        ? 'bg-[var(--site-accent-solid)] border-[var(--site-accent-hover)]'
                                                        : 'bg-[var(--site-card-bg-strong)] border-[var(--site-border)]'
                                                        }`}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                            {coreStack.map((skill) => (
                                <div
                                    key={skill.name}
                                    title={skill.name}
                                    className="rounded-xl border border-[var(--site-border)] bg-[var(--site-card-bg-strong)] hover:border-[var(--site-accent)]/40 px-1.5 py-2.5 flex items-center justify-center min-h-[56px] transition-colors"
                                >
                                    <span className="rounded-lg bg-white/90 p-1 shadow-sm">
                                        {/* eslint-disable-next-line @next/next/no-img-element -- remote icon CDN */}
                                        <img src={skill.icon} alt={skill.name} loading="lazy" width={28} height={28} className="h-6 w-6 object-contain" />
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.article>
                </motion.div>

                <motion.div {...reveal()} className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 mb-10">
                    <motion.div
                        {...reveal()}
                        className="lg:col-span-4 rounded-[2.3rem] border border-[var(--site-border)] bg-[var(--site-card-bg)] backdrop-blur-lg p-7 md:p-9 shadow-[0_16px_40px_rgba(0,0,0,0.1)]"
                    >
                        <h3 className="text-2xl md:text-3xl font-extrabold font-doto text-[var(--text-heading)]">Right Now</h3>
                        <ul className="mt-4 space-y-3 text-[var(--text-secondary)] font-medium leading-relaxed">
                            <li className="flex gap-2"><span className="text-[var(--site-accent)]">▸</span>Final year of B.Tech CSE, class of 2027</li>
                            <li className="flex gap-2">
                                <span className="text-[var(--site-accent)]">▸</span>
                                <span>
                                    {lastPush ? (
                                        <>Last pushed to <a href={lastPush.url} target="_blank" rel="noreferrer" className="font-mono text-[var(--site-accent)] hover:underline">{lastPush.name}</a> <Ago iso={lastPush.pushedAt} /></>
                                    ) : (
                                        "Shipping on GitHub"
                                    )}
                                </span>
                            </li>
                            <li className="flex gap-2"><span className="text-[var(--site-accent)]">▸</span>{profile.openTo}</li>
                        </ul>
                    </motion.div>

                    <motion.article
                        id="education"
                        {...reveal(0.1)}
                        className="lg:col-span-8 rounded-[2.3rem] bg-[var(--site-card-bg)] border border-[var(--site-border)] p-7 md:p-9 shadow-[0_18px_48px_rgba(0,0,0,0.1)] backdrop-blur-lg scroll-mt-28"
                    >
                        <h3 className="text-3xl md:text-4xl font-extrabold font-doto text-[var(--text-heading)] mb-6">Education & Wins</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="rounded-2xl bg-[var(--site-card-bg-strong)] border border-[var(--site-border)] px-4 py-4">
                                <p className="text-lg font-bold text-[var(--text-card)] leading-snug">{education.institution}</p>
                                <p className="mt-2 text-[11px] tracking-[0.08em] uppercase text-[var(--site-accent)] font-bold">{education.period}</p>
                                <p className="mt-2 text-sm text-[var(--text-secondary)] font-semibold">{education.degree}</p>
                                <p className="mt-1 text-xs text-[var(--text-muted)] font-medium">{education.campus} · {education.place}</p>
                            </div>
                            {achievements.map((a) => (
                                <div key={a.title} className="rounded-2xl bg-[var(--site-card-bg-strong)] border border-[var(--site-border)] px-4 py-4">
                                    <p className="text-lg font-bold text-[var(--text-card)] leading-snug">{a.title}</p>
                                    <p className="mt-2 text-[11px] tracking-[0.08em] uppercase text-[var(--site-accent)] font-bold">{a.when} · {a.where}</p>
                                    <p className="mt-2 text-sm text-[var(--text-secondary)] font-medium leading-relaxed">{a.blurb}</p>
                                </div>
                            ))}
                        </div>
                    </motion.article>

                    <motion.article
                        id="experience"
                        {...reveal(0.1)}
                        className="lg:col-span-8 rounded-[2.3rem] bg-[var(--site-card-bg)] border border-[var(--site-border)] p-7 md:p-9 shadow-[0_18px_48px_rgba(0,0,0,0.1)] backdrop-blur-lg scroll-mt-28"
                    >
                        <h3 className="text-3xl md:text-4xl font-extrabold font-doto text-[var(--text-heading)] mb-6">Experience</h3>
                        <div className="space-y-4">
                            {experience.map((item, index) => (
                                <div key={`${item.company}-${item.role}`} className="relative">
                                    <p className="text-xs tracking-[0.14em] uppercase text-[var(--site-accent)] font-bold">{item.period}</p>
                                    <h4 className="mt-1 text-xl font-bold text-[var(--text-card)]">
                                        {item.role} <span className="text-[var(--text-muted)] font-semibold">· {item.company}</span>
                                    </h4>
                                    <p className="mt-2 text-[var(--text-secondary)] font-medium leading-relaxed">{item.blurb}</p>
                                    {index < experience.length - 1 ? <div className="mt-4 border-b border-[var(--site-border)]" /> : null}
                                </div>
                            ))}
                        </div>
                    </motion.article>

                    <motion.article
                        {...reveal(0.1)}
                        className="lg:col-span-4 rounded-[2.3rem] bg-[var(--site-card-bg)] border border-[var(--site-border)] p-7 md:p-9 shadow-[0_22px_55px_rgba(0,0,0,0.15)]"
                    >
                        <h3 className="text-3xl font-extrabold font-doto mb-5 text-[var(--text-heading)]">Credentials</h3>
                        <div className="space-y-4">
                            {certifications.map((cert) => (
                                <div key={cert.name} className="rounded-2xl bg-[var(--site-card-bg-strong)] border border-[var(--site-border)] px-4 py-3">
                                    <p className="text-xs tracking-[0.12em] uppercase text-[var(--site-accent)] font-bold">{cert.issuer} · {cert.when}</p>
                                    <p className="mt-1 font-bold text-[var(--text-card)] text-lg leading-tight">{cert.name}</p>
                                </div>
                            ))}
                        </div>
                    </motion.article>
                </motion.div>
            </div>
        </section>
    );
}

"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Project } from '../../data/profile';
import ProjectDiagram from '../../components/ProjectDiagram';
import PixelScene from '../../components/PixelScene';
import { useEffect, useRef, useState } from 'react';
import IvmPlayground from '../../components/IvmPlayground';
import Ago from '../../components/Ago';
import type { RepoLive } from '../../lib/github';

const card = 'rounded-[1.8rem] border border-[var(--site-border)] bg-[var(--site-card-bg)] backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.2)]';
const label = 'text-[10px] tracking-[0.16em] uppercase font-black text-[var(--site-accent)]/80';
const rise = (delay: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const, delay },
});

function Walkthrough({ project }: { project: Project }) {
    const [step, setStep] = useState(0);
    const refs = useRef<(HTMLDivElement | null)[]>([]);
    useEffect(() => {
        const io = new IntersectionObserver(
            (entries) => entries.forEach((e) => e.isIntersecting && setStep(Number((e.target as HTMLElement).dataset.step))),
            { rootMargin: '-45% 0px -45% 0px' }
        );
        refs.current.forEach((el) => el && io.observe(el));
        return () => io.disconnect();
    }, []);
    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 lg:gap-10">
            <div className="lg:sticky lg:top-24 self-start rounded-[1.4rem] border border-[var(--site-border-strong)] bg-[var(--site-surface-strong)] p-4 md:p-5">
                <p className="mb-3 font-mono text-[11px] text-[var(--text-muted)]">~/{project.id}/architecture · step {step + 1}/{project.highlights.length}</p>
                <ProjectDiagram diagram={project.diagram} active={project.steps[step]} />
            </div>
            <div className="space-y-4 lg:py-[18vh]">
                {project.highlights.map((item, i) => (
                    <div
                        key={item}
                        ref={(el) => { refs.current[i] = el; }}
                        data-step={i}
                        onMouseEnter={() => setStep(i)}
                        className={`flex items-start gap-3 rounded-xl border px-4 py-4 transition-colors duration-300 ${i === step ? 'border-[var(--site-accent)]/50 bg-[var(--site-card-bg-strong)]' : 'border-[var(--site-border)] bg-transparent'}`}
                    >
                        <span className={`mt-0.5 font-mono text-[11px] ${i === step ? 'text-[var(--site-live)]' : 'text-[var(--text-muted)]'}`}>{String(i + 1).padStart(2, '0')}</span>
                        <span className={`text-sm md:text-[0.95rem] font-medium leading-relaxed ${i === step ? 'text-[var(--text-card)]' : 'text-[var(--text-muted)]'}`}>{item}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function ProjectDetail({ project, next, live }: { project: Project; next: { id: string; name: string }; live: RepoLive | null }) {
    return (
        <div className="relative min-h-screen overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgb(var(--site-accent-rgb)/0.10),transparent_70%)]" />

            <motion.nav className="relative z-50 p-4 md:p-6 pl-16 lg:pl-20" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                <Link
                    href="/work"
                    className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--site-card-bg)] border border-[var(--site-border)] backdrop-blur-xl text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--site-accent)] transition-colors"
                >
                    <span className="material-symbols-outlined text-[1rem] transition-transform group-hover:-translate-x-0.5">arrow_back</span>
                    All work
                </Link>
            </motion.nav>

            <main className="relative z-10 px-4 md:px-8 pb-36 max-w-6xl mx-auto">
                {/* ── Hero ── */}
                <motion.section {...rise(0)} className={`${card} p-5 md:p-8 overflow-hidden`}>
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-center">
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex px-3 py-1 rounded-full text-[10px] tracking-[0.14em] uppercase font-bold text-[var(--site-accent)] bg-[var(--site-accent)]/10 border border-[var(--site-accent)]/20">
                                    {project.badge}
                                </span>
                                <span className="inline-flex px-3 py-1 rounded-full text-[10px] tracking-[0.14em] uppercase font-bold text-[var(--text-muted)] bg-[var(--site-card-bg-strong)] border border-[var(--site-border)]">
                                    {project.year}
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] tracking-[0.14em] uppercase font-bold border text-[var(--site-accent)] bg-[var(--site-accent)]/10 border-[var(--site-accent)]/20">
                                    <span className={`w-1.5 h-1.5 rounded-full bg-[var(--site-accent-solid)] ${project.status === 'Active' ? 'animate-pulse' : ''}`} />
                                    {project.status}
                                </span>
                            </div>

                            <h1 className="mt-4 text-4xl md:text-5xl font-black font-doto text-[var(--text-heading)] leading-[1.1]">{project.name}</h1>
                            <p className="mt-2 text-base md:text-lg font-semibold text-[var(--text-card)]">{project.short}</p>
                            <p className="mt-3 text-sm md:text-base text-[var(--text-secondary)] leading-relaxed font-medium max-w-xl">{project.description}</p>

                            <div className="mt-5 flex flex-wrap gap-3">
                                {project.repoUrl ? (
                                    <a
                                        href={project.repoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--site-accent-solid)] text-white text-sm font-bold transition-transform hover:-translate-y-0.5 shadow-[0_6px_0_var(--site-accent-hover)]"
                                    >
                                        Source Code
                                        <span className="material-symbols-outlined text-[1rem] group-hover:translate-x-0.5 transition-transform">arrow_outward</span>
                                    </a>
                                ) : (
                                    <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[var(--site-border)] bg-[var(--site-card-bg-strong)] text-[var(--text-muted)] text-sm font-bold">
                                        <span className="material-symbols-outlined text-[1rem]">lock</span>
                                        Private repository
                                    </span>
                                )}
                                <Link
                                    href={`/project/${next.id}`}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[var(--site-border)] bg-[var(--site-card-bg-strong)] text-[var(--text-secondary)] text-sm font-bold transition-colors hover:text-[var(--site-accent)]"
                                >
                                    Next: {next.name}
                                    <span className="material-symbols-outlined text-[1rem]">arrow_forward</span>
                                </Link>
                            </div>

                            {live ? (
                                <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[12px] text-[var(--text-muted)]">
                                    <span className="inline-flex items-center gap-1.5 text-[var(--site-live)]">
                                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--site-live)] motion-safe:animate-pulse" aria-hidden="true" />
                                        live
                                    </span>
                                    <span>last push <span className="text-[var(--text-card)]"><Ago iso={live.pushedAt} /></span></span>
                                    {live.ci ? (
                                        <a href={live.ci.url} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--site-accent)] transition-colors">
                                            {live.ci.name} <span className={live.ci.passing ? "text-[var(--site-accent)]" : "text-red-400"}>{live.ci.passing ? "passing" : "failing"}</span> · <Ago iso={live.ci.at} />
                                        </a>
                                    ) : null}
                                </p>
                            ) : null}
                        </div>

                        {/* The idea, as a pixel scene */}
                        <div className="w-full lg:w-[46%] shrink-0 rounded-[1.4rem] border border-[var(--site-border-strong)] bg-[var(--site-surface-strong)] shadow-[0_24px_60px_rgba(0,0,0,0.35)] overflow-hidden">
                            <div className="flex items-center gap-1.5 px-4 h-9 border-b border-[var(--site-border)] bg-[var(--site-card-bg-strong)]">
                                <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
                                <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
                                <span className="h-2 w-2 rounded-full bg-[#28c840]" />
                                <span className="ml-2 font-mono text-[11px] text-[var(--text-muted)]">~/{project.id}</span>
                            </div>
                            <div className="p-4 md:p-5">
                                <PixelScene id={project.id} />
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* ── Telemetry: measured, not estimated ── */}
                <motion.section {...rise(0.15)} className={`${card} mt-5 p-5 md:p-7`}>
                    <div className="flex items-center gap-2 mb-5">
                        <span className="w-2 h-2 rounded-full bg-[var(--site-accent-solid)] animate-pulse" />
                        <h2 className={label}>Project Telemetry</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {project.metrics.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                                className="relative rounded-[1rem] border border-[var(--site-border)] bg-[var(--site-card-bg-strong)] p-4 overflow-hidden group"
                            >
                                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgb(var(--site-accent-rgb)/0.06),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                <p className="text-[9px] uppercase tracking-[0.16em] text-[var(--site-accent)] font-black">{stat.label}</p>
                                <p className="mt-1.5 text-xl md:text-2xl font-doto font-black text-[var(--text-heading)] tabular-nums">{stat.value}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {project.id === 'ivm' ? (
                    <motion.section {...rise(0.2)} className={`${card} mt-5 p-5 md:p-7`}>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-[var(--site-live)] animate-pulse" />
                            <h2 className={label}>Run it in your browser</h2>
                        </div>
                        <p className="mb-5 text-sm text-[var(--text-secondary)] font-medium">
                            A pocket version of the engine. Change the base table and the view is patched by that one row&apos;s ±1 weight, then checked against a full recompute.
                        </p>
                        <IvmPlayground />
                    </motion.section>
                ) : null}

                {/* ── How it works: the diagram follows the reading ── */}
                <motion.section {...rise(0.25)} className={`${card} mt-5 p-5 md:p-7`}>
                    <h2 className={`${label} mb-5`}>How it works</h2>
                    <Walkthrough project={project} />
                </motion.section>

                {/* ── Info ── */}
                <div className="mt-5 grid grid-cols-1">
                    <motion.section {...rise(0.25)} className={`${card} p-5`}>
                        <h2 className={`${label} mb-4`}>Project Info</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                            {[
                                ['Domain', project.domain],
                                ['Role', project.role],
                                ['Year', project.year],
                                ['Status', project.status],
                            ].map(([k, v]) => (
                                <div key={k} className="flex items-center justify-between gap-4 rounded-xl border border-[var(--site-border)] bg-[var(--site-card-bg-strong)] px-4 py-3">
                                    <span className="text-[10px] uppercase tracking-[0.14em] text-[var(--site-accent)] font-bold">{k}</span>
                                    <span className="text-sm font-bold text-[var(--text-heading)] text-right">{v}</span>
                                </div>
                            ))}
                        </div>
                    </motion.section>

                </div>

                {/* ── Tech Stack ── */}
                <motion.section {...rise(0.35)} className={`${card} mt-5 p-5`}>
                    <h2 className={`${label} mb-4`}>Tech Stack</h2>
                    <div className="flex flex-wrap gap-2.5">
                        {project.stack.map((tech) => (
                            <span
                                key={tech}
                                className="px-4 py-2 rounded-full text-sm font-bold bg-[var(--site-card-bg-strong)] text-[var(--site-accent)] border border-[var(--site-border)] hover:bg-[var(--site-accent)]/15 hover:border-[var(--site-accent)]/40 transition-colors"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                </motion.section>
            </main>
        </div>
    );
}

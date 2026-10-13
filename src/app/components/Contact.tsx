"use client";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { profile, resumes } from "../data/profile";
import { run, type Line } from "../lib/terminal";
import { useTerminalActions } from "./TerminalOverlay";
import { useHyderabadTime } from "./ShipLog";

const focusTags = ["Backend", "Databases", "AI Systems", "Evaluation", "DevOps", "Full Stack"];

type TerminalEntry = { command: string; output: Line[]; isError?: boolean };

type TerminalWindowState = "open" | "minimized" | "closed";

const quickCommands = ["whoami", "cat focus.txt", "ls projects", "resume --list", "echo $PHONE", "sudo hire faizan"];

export default function Contact() {
    const hyderabadTime = useHyderabadTime();
    const act = useTerminalActions();
    const [terminalInput, setTerminalInput] = useState("");
    const [terminalHistory, setTerminalHistory] = useState<TerminalEntry[]>([]);
    const [terminalWindowState, setTerminalWindowState] = useState<TerminalWindowState>("open");
    const [isTerminalZoomed, setIsTerminalZoomed] = useState(false);
    const terminalInputRef = useRef<HTMLInputElement>(null);

    const isTerminalClosed = terminalWindowState === "closed";
    const isTerminalMinimized = terminalWindowState === "minimized";

    const executeCommand = (value: string) => {
        if (isTerminalClosed || isTerminalMinimized) {
            return;
        }

        const raw = value.trim();
        if (!raw) {
            return;
        }

        setTerminalInput("");
        const res = run(raw);
        if (res.action?.type === "clear") return setTerminalHistory([]);
        setTerminalHistory((prev) => [...prev, { command: raw, output: res.output, isError: res.isError }]);
        act(res.action);
    };

    const runCommand = () => {
        executeCommand(terminalInput);
        setTerminalInput("");
    };

    const handleClose = () => {
        setTerminalWindowState("closed");
    };

    const handleMinimize = () => {
        setTerminalWindowState((prev) => {
            if (prev === "closed") {
                return "minimized";
            }
            return prev === "minimized" ? "open" : "minimized";
        });
    };

    const handleZoom = () => {
        setTerminalWindowState("open");
        setIsTerminalZoomed((prev) => !prev);
        requestAnimationFrame(() => terminalInputRef.current?.focus());
    };

    return (
        <section className="relative w-full min-h-screen flex items-center py-20 md:py-24 lg:py-16 overflow-hidden" id="contact">
            <div className="px-6 md:px-12 w-full max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-8 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -22 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-center lg:text-left"
                    >

                        <h2 className="mt-5 text-4xl sm:text-5xl md:text-7xl font-extrabold font-headline font-doto text-[var(--text-heading)] leading-[0.95] tracking-tight">
                            Let&apos;s build
                            <br />
                            something
                            <br />
                            reliable.
                        </h2>

                        <p className="mt-5 max-w-2xl mx-auto lg:mx-0 text-[var(--text-secondary)] text-lg md:text-xl font-medium leading-relaxed">
                            Backend services, data systems and AI pipelines. If it has to stay correct at 3 a.m., I&apos;m interested. {profile.openTo}
                        </p>

                        <div className="mt-6 flex flex-wrap gap-3 justify-center lg:justify-start">
                            {focusTags.map((word) => (
                                <span
                                    key={word}
                                    className="px-3 py-1.5 rounded-full text-xs tracking-[0.12em] uppercase font-bold bg-[var(--site-card-bg-strong)] border border-[var(--site-border)] text-[var(--site-accent)] backdrop-blur-md"
                                >
                                    {word}
                                </span>
                            ))}
                        </div>

                        <div className="mt-5 relative overflow-hidden rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-card-bg)] backdrop-blur-xl shadow-[0_20px_56px_rgba(0,0,0,0.2)] px-5 py-4 md:px-6">
                            <div className="absolute inset-y-0 right-[-10%] w-[40%] rounded-full bg-[var(--site-accent)]/8 blur-2xl" />
                            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                <a
                                    href={`mailto:${profile.email}`}
                                    className="inline-flex items-center justify-center gap-2.5 rounded-full bg-[var(--site-accent-solid)] text-white px-7 py-3 font-extrabold text-base md:text-lg shadow-[0_7px_0_var(--site-accent-hover)] hover:-translate-y-1 hover:shadow-[0_10px_0_var(--site-accent-hover)] active:translate-y-1 active:shadow-[0_4px_0_var(--site-accent-hover)] transition-all cursor-pointer"
                                >
                                    Mail Now
                                    <span className="material-symbols-outlined text-[1.1rem]">arrow_outward</span>
                                </a>
                                <a
                                    href={resumes[0].href}
                                    download={resumes[0].file}
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--site-border)] bg-[var(--site-card-bg-strong)] px-5 py-3 text-sm md:text-base font-extrabold tracking-[0.08em] uppercase text-[var(--text-primary)] shadow-[0_8px_18px_rgba(0,0,0,0.1)] hover:bg-[var(--site-card-bg)] transition-all cursor-pointer"
                                >
                                    Resume
                                    <span className="material-symbols-outlined text-[1rem]" aria-hidden="true">download</span>
                                </a>
                                <a href={profile.phoneHref} className="text-[var(--text-muted)] font-semibold text-sm md:text-base text-center sm:text-left hover:text-[var(--site-accent)] transition-colors">
                                    or call <span className="text-[var(--text-card)] tabular-nums">{profile.phone}</span>
                                </a>
                            </div>
                        </div>
                        <p className="mt-4 min-h-[1.25rem] font-mono text-xs text-[var(--text-muted)]" aria-live="off">
                            {hyderabadTime ? (
                                <><span className="text-[var(--site-live)]">●</span> It&apos;s {hyderabadTime} in Hyderabad (IST, UTC+5:30)</>
                            ) : null}
                        </p>
                    </motion.div>

                    <motion.aside
                        initial={{ opacity: 0, x: 22 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.06 }}
                        className={`w-full ${isTerminalZoomed ? "max-w-2xl" : "max-w-xl"} mx-auto lg:mx-0`}
                    >
                        {/* Terminal window */}
                        <div className="relative rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-terminal-bg)] backdrop-blur-3xl shadow-[0_8px_20px_rgba(0,0,0,0.15)] overflow-hidden text-left">
                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgb(var(--site-accent-rgb)/0.08)_0%,rgb(var(--site-accent-rgb)/0.01)_48%,rgb(var(--site-accent-rgb)/0)_100%)]" />
                            <div className="pointer-events-none absolute -bottom-16 right-[-10%] h-48 w-48 rounded-full bg-[var(--site-accent)]/5 blur-3xl" />

                            {/* Terminal titlebar */}
                            <div className="relative z-10 h-11 px-4 flex items-center justify-between border-b border-[var(--site-border)] bg-[var(--site-card-bg-strong)] backdrop-blur-2xl">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        aria-label="Close terminal"
                                        title="Close"
                                        onClick={handleClose}
                                        className="group h-2.5 w-2.5 rounded-full bg-[#ff5f57] ring-1 ring-black/10 flex items-center justify-center cursor-pointer"
                                    >
                                        <span className="text-[8px] leading-none text-black/65 opacity-0 group-hover:opacity-100">x</span>
                                    </button>
                                    <button
                                        type="button"
                                        aria-label="Minimize terminal"
                                        title="Minimize"
                                        onClick={handleMinimize}
                                        className="group h-2.5 w-2.5 rounded-full bg-[#febc2e] ring-1 ring-black/10 flex items-center justify-center cursor-pointer"
                                    >
                                        <span className="text-[9px] leading-none text-black/65 opacity-0 group-hover:opacity-100">-</span>
                                    </button>
                                    <button
                                        type="button"
                                        aria-label="Zoom terminal"
                                        title="Zoom"
                                        onClick={handleZoom}
                                        className="group h-2.5 w-2.5 rounded-full bg-[#28c840] ring-1 ring-black/10 flex items-center justify-center cursor-pointer"
                                    >
                                        <span className="text-[8px] leading-none text-black/65 opacity-0 group-hover:opacity-100">+</span>
                                    </button>
                                </div>
                                <p className="font-mono text-[11px] font-bold text-[var(--site-accent)]">faizan@hyderabad: ~</p>
                            </div>

                            {isTerminalClosed ? (
                                <div className="relative z-10 px-4 md:px-5 py-5 font-mono bg-[var(--site-card-bg-strong)] text-[12px] md:text-[13px] text-[var(--text-muted)]">
                                    Window closed. Click the green dot to reopen.
                                </div>
                            ) : isTerminalMinimized ? null : (
                                <div className="relative z-10 px-4 md:px-5 py-4 font-mono bg-[var(--site-card-bg-strong)] text-[12px] md:text-[13px] leading-relaxed text-[var(--text-card)]">
                                    <div className={`min-h-[220px] ${isTerminalZoomed ? "max-h-[360px]" : "max-h-[260px]"} overflow-y-auto pr-1 no-scrollbar`}>
                                        {terminalHistory.length === 0 ? (
                                            <p className="text-[var(--text-muted)]">Type <span className="text-[var(--site-accent)]">help</span> and press Enter.</p>
                                        ) : (
                                            terminalHistory.map((entry, idx) => (
                                                <div key={`${entry.command}-${idx}`} className="mb-3 last:mb-0">
                                                    <p className="text-[var(--site-accent)]">$ {entry.command}</p>
                                                    {entry.output.map((line, lineIdx) => (
                                                        typeof line === "string" ? (
                                                            <p key={`${line}-${lineIdx}`} className={`${entry.isError ? "text-red-400" : "text-[var(--text-secondary)]"} whitespace-pre-wrap break-words`}>
                                                                {line}
                                                            </p>
                                                        ) : (
                                                            <a
                                                                key={`${line.href}-${lineIdx}`}
                                                                href={line.href}
                                                                {...(line.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                                                                className="block whitespace-pre-wrap break-words text-[var(--text-secondary)] hover:text-[var(--site-accent)] underline decoration-[var(--site-accent)]/30 underline-offset-2"
                                                            >
                                                                {line.label}
                                                            </a>
                                                        )
                                                    ))}
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <form
                                        className="mt-3 pt-3 border-t border-[var(--site-border)] flex items-center gap-2"
                                        onSubmit={(event) => {
                                            event.preventDefault();
                                            runCommand();
                                        }}
                                        onClick={() => terminalInputRef.current?.focus()}
                                    >
                                        <span className="text-[var(--site-accent)] shrink-0">$</span>
                                        <input
                                            ref={terminalInputRef}
                                            type="text"
                                            disabled={isTerminalClosed || isTerminalMinimized}
                                            value={terminalInput}
                                            onChange={(event) => setTerminalInput(event.target.value)}
                                            placeholder="whoami"
                                            autoCapitalize="none"
                                            autoCorrect="off"
                                            spellCheck={false}
                                            className="w-full bg-transparent text-[var(--text-card)] placeholder:text-[var(--text-muted)] focus:outline-none"
                                        />
                                        <button
                                            type="submit"
                                            disabled={isTerminalClosed || isTerminalMinimized}
                                            className="shrink-0 rounded-md border border-[var(--site-border)] bg-[var(--site-card-bg-strong)] px-2 py-1 text-[10px] tracking-[0.08em] uppercase font-bold text-[var(--site-accent)] hover:bg-[var(--site-card-bg)] transition-colors cursor-pointer"
                                        >
                                            Run
                                        </button>
                                    </form>
                                    <div className="mt-2 text-[10px] text-[var(--text-muted)]">
                                        Try: help, open ivm, resume ai · ⌘K opens this anywhere
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Command Deck */}
                        <div className="mt-4 relative rounded-[1.35rem] border border-[var(--site-border)] bg-[var(--site-card-bg)] shadow-[0_6px_16px_rgba(0,0,0,0.1)] overflow-hidden">
                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_84%_12%,rgb(var(--site-accent-rgb)/0.08)_0%,rgb(var(--site-accent-rgb)/0.01)_52%,rgb(var(--site-accent-rgb)/0)_100%)]" />
                            <div className="relative z-10 px-4 md:px-5 py-4">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="font-mono text-[11px] md:text-xs uppercase tracking-[0.14em] font-bold text-[var(--site-accent)]">Command Deck</p>
                                    <span className="text-[10px] text-[var(--text-muted)]">Tap to run quick actions</span>
                                </div>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    {quickCommands.map((command) => (
                                        <button
                                            key={command}
                                            type="button"
                                            onClick={() => {
                                                executeCommand(command);
                                                setTerminalInput("");
                                                requestAnimationFrame(() => terminalInputRef.current?.focus());
                                            }}
                                            className="rounded-full border border-[var(--site-border)] bg-[var(--site-card-bg-strong)] px-3 py-1.5 text-[11px] md:text-xs font-mono font-semibold text-[var(--text-card)] hover:bg-[var(--site-card-bg)] hover:border-[var(--site-border)] hover:-translate-y-0.5 transition-all cursor-pointer"
                                        >
                                            {command}
                                        </button>
                                    ))}
                                </div>

                                {/* Progress dots */}
                                <div className="mt-3 grid grid-cols-5 gap-1.5">
                                    {[0, 1, 2, 3, 4].map((idx) => (
                                        <span
                                            key={idx}
                                            className={`h-1.5 rounded-full ${idx < 4 ? "bg-[var(--site-accent-solid)]" : "bg-[var(--site-border)]"}`}
                                            aria-hidden="true"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.aside>
                </div>
            </div>
        </section>
    );
}

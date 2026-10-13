"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { COMMAND_NAMES, run, type Action, type Line, type StatusSnapshot } from "../lib/terminal";
import { timeAgo } from "./Ago";
import { useHyderabadTime, type Status } from "./ShipLog";
import { useTheme } from "./ThemeProvider";
import { say } from "./NotificationBubble";

type Entry = { command: string; output: Line[]; isError?: boolean };

export function useTerminalActions() {
  const { theme, toggleTheme } = useTheme();
  return (action?: Action) => {
    if (!action) return;
    if (action.type === "navigate") window.dispatchEvent(new CustomEvent("pixel:navigate", { detail: action.href }));
    if (action.type === "theme" && action.mode !== theme) toggleTheme();
    if (action.type === "download") {
      const a = document.createElement("a");
      a.href = action.href;
      a.download = action.file;
      a.click();
    }
  };
}

export function TerminalLines({ entries }: { entries: Entry[] }) {
  return (
    <>
      {entries.map((e, i) => (
        <div key={i} className="mb-3 last:mb-0">
          <p className="text-[var(--site-accent)]">$ {e.command}</p>
          {e.output.map((line, j) =>
            typeof line === "string" ? (
              <p key={j} className={`${e.isError ? "text-red-400" : "text-[var(--text-secondary)]"} whitespace-pre-wrap break-words`}>{line}</p>
            ) : (
              <a key={j} href={line.href} {...(line.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})} className="block whitespace-pre-wrap break-words text-[var(--text-secondary)] hover:text-[var(--site-accent)] underline decoration-[var(--site-accent)]/30 underline-offset-2">
                {line.label}
              </a>
            )
          )}
        </div>
      ))}
    </>
  );
}

/** ⌘K or ` anywhere opens the site shell. */
export default function TerminalOverlay({ status }: { status: Status & { fetchedAt: string } }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const time = useHyderabadTime();
  const act = useTerminalActions();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && (e.target.isContentEditable || ["INPUT", "TEXTAREA"].includes(e.target.tagName));
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "`" && !typing)) {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [entries]);

  const snapshot = (): StatusSnapshot => ({
    lastPush: status.pushes[0] && { name: status.pushes[0].name, ago: timeAgo(status.pushes[0].pushedAt) },
    ci: status.ci ? { repo: status.ci.repo, passing: status.ci.passing, ago: timeAgo(status.ci.at) } : undefined,
    weekly: status.activity?.weekly,
    build: { sha: status.build.sha, ago: timeAgo(status.build.builtAt) },
    refreshedAgo: timeAgo(status.fetchedAt),
    time,
  });

  const submit = () => {
    const raw = input.trim();
    setInput("");
    setCursor(-1);
    if (!raw) return;
    setHistory((h) => [raw, ...h].slice(0, 30));
    const res = run(raw, snapshot());
    if (res.action?.type === "clear") return setEntries([]);
    setEntries((list) => [...list, { command: raw, output: res.output, isError: res.isError }]);
    if (raw.toLowerCase() === "sudo hire faizan") say("Excellent choice.");
    if (res.action?.type === "navigate") setTimeout(() => setOpen(false), 250);
    act(res.action);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") submit();
    else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.max(-1, Math.min(history.length - 1, cursor + (e.key === "ArrowUp" ? 1 : -1)));
      setCursor(next);
      setInput(next === -1 ? "" : history[next]);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const match = COMMAND_NAMES.find((c) => c.startsWith(input.toLowerCase()) && input);
      if (match) setInput(match);
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1500] flex items-start justify-center bg-[var(--site-overlay)] backdrop-blur-[2px] px-4 pt-[14vh]"
          onClick={() => setOpen(false)}
        >
          <motion.div
            role="dialog"
            aria-label="Site terminal"
            initial={{ y: 16, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-[1.4rem] border border-[var(--site-border-strong)] bg-[var(--site-terminal-bg)] backdrop-blur-2xl shadow-[0_24px_64px_rgba(0,0,0,0.4)] overflow-hidden"
          >
            <div className="h-10 px-4 flex items-center justify-between border-b border-[var(--site-border)] bg-[var(--site-card-bg-strong)]">
              <div className="flex gap-2">
                <button type="button" aria-label="Close terminal" onClick={() => setOpen(false)} className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              </div>
              <p className="font-mono text-[11px] font-bold text-[var(--site-accent)]">faizan@hyderabad: ~</p>
              <kbd className="font-mono text-[10px] text-[var(--text-muted)]">esc</kbd>
            </div>
            <div ref={scrollRef} className="max-h-[48vh] overflow-y-auto px-5 py-4 font-mono text-[13px] leading-relaxed no-scrollbar">
              {entries.length ? <TerminalLines entries={entries} /> : (
                <p className="text-[var(--text-muted)]">Type <span className="text-[var(--site-accent)]">help</span>, or try <span className="text-[var(--site-accent)]">status</span>, <span className="text-[var(--site-accent)]">open ivm</span>, <span className="text-[var(--site-accent)]">resume ai</span>. Tab completes.</p>
              )}
            </div>
            <div className="flex items-center gap-2 border-t border-[var(--site-border)] px-5 py-3 font-mono text-[13px]">
              <span className="text-[var(--site-accent)]">$</span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                aria-label="Command"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className="flex-1 bg-transparent text-[var(--text-card)] placeholder:text-[var(--text-muted)] focus:outline-none"
                placeholder="help"
              />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

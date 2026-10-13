"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import pixelatedArrow from "../assets/imgs/pixelated_arrow.png";
import { resumes } from "../data/profile";

export default function ResumeDownloadFab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: "easeOut", delay: 0.3 }}
        className="fixed right-6 lg:right-12 bottom-6 lg:bottom-auto lg:top-6 z-[100] flex items-center justify-center p-0 m-0"
      >
        <div className="relative group flex items-center justify-center">
          <p className="hidden md:block absolute right-14 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface)] backdrop-blur-xl px-2.5 py-1 text-[9px] font-bold tracking-[0.07em] uppercase text-[var(--site-accent-hover)] shadow-[0_10px_24px_rgb(var(--site-accent-solid-rgb)/0.14)] opacity-0 translate-x-1 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
            Download my resume
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Choose a resume to download"
            className="group relative h-8 w-8 md:h-9 md:w-9 flex items-center justify-center rounded-full border border-[var(--site-accent-ghost)] bg-[var(--site-accent-solid)] text-white shadow-[0_8px_18px_rgb(var(--site-accent-solid-rgb)/0.2)] hover:scale-110 hover:bg-[var(--site-accent-hover)] active:scale-95 transition-all duration-300"
          >
            <Image
              src={pixelatedArrow}
              alt=""
              aria-hidden="true"
              className="block h-[14px] w-[14px] md:h-[16px] md:w-[16px] object-contain rotate-90 mx-auto my-auto"
            />
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1200] flex items-center justify-center bg-[var(--site-overlay)] backdrop-blur-[2px] px-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="resume-title"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-sm rounded-[1.6rem] border border-[var(--site-accent-ghost)] bg-[var(--site-surface-strong)] backdrop-blur-xl p-5 shadow-[0_12px_32px_rgb(var(--site-accent-solid-rgb)/0.14)]"
            >
              <p className="text-[11px] tracking-[0.14em] uppercase text-[var(--site-accent)] font-bold">Resume Download</p>
              <h4 id="resume-title" className="mt-2 text-xl font-black text-[var(--site-foreground)]">Which version fits the role?</h4>

              <div className="mt-4 space-y-2">
                {resumes.map((r) => (
                  <a
                    key={r.slug}
                    href={r.href}
                    download={r.file}
                    onClick={() => setOpen(false)}
                    className="group flex items-center justify-between gap-3 rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface)] px-4 py-3 transition-colors hover:border-[var(--site-accent)]/50 hover:bg-[var(--site-accent-soft)]"
                  >
                    <span>
                      <span className="block font-bold text-[var(--site-foreground)]">{r.label}</span>
                      <span className="block text-xs text-[var(--site-muted)]">{r.note}</span>
                    </span>
                    <span className="material-symbols-outlined text-[var(--site-accent)] transition-transform group-hover:translate-y-0.5" aria-hidden="true">download</span>
                  </a>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-4 w-full rounded-full border border-[var(--site-border)] bg-[var(--site-surface)] text-[var(--site-foreground)] font-semibold py-2.5 hover:bg-[var(--site-surface-strong)] transition-colors"
              >
                Maybe later
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

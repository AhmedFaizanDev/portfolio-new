"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import bush2 from "../assets/glacier/bush.png";
import pixelatedArrow from "../assets/imgs/pixelated_arrow.png";
import ShipLog, { type Status } from "./ShipLog";
import { achievements, education, experience, profile, projects, skills } from "../data/profile";

type HomeQuickSearchProps = {
  showShipLog?: boolean;
  status: Status;
};

type SearchEntry = {
  label: string;
  context: string;
  href: string;
  keywords: string[];
};

const MAX_DYNAMIC_ENTRIES = 320;

const words = (...parts: string[]) => tokenize(parts.join(" "));

const searchIndex: SearchEntry[] = [
  {
    label: "Home",
    context: `${profile.name} · ${profile.role}`,
    href: "/#hero",
    keywords: ["home", "faizan", "mohammed", "ahmed", "backend", "systems", "ai", "engineer", "intro"],
  },
  {
    label: "About",
    context: "Who I am, how I work, what I've shipped",
    href: "/about#about",
    keywords: ["about", "profile", "who", "me", "background", "bio", "github", "stats"],
  },
  {
    label: "Experience",
    context: experience.map((e) => e.company).join(" · "),
    href: "/about#experience",
    keywords: ["experience", "career", "intern", "internship", "job", ...experience.flatMap((e) => words(e.role, e.company))],
  },
  {
    label: "Skills",
    context: Object.values(skills).flat().slice(0, 12).join(" "),
    href: "/about#skills",
    keywords: ["skills", "stack", "tools", ...Object.values(skills).flat().flatMap((x) => words(x))],
  },
  {
    label: "Education",
    context: `${education.institution} · ${education.degree} · ${education.period}`,
    href: "/about#education",
    keywords: ["education", "university", "college", "degree", "btech", ...words(education.institution, education.campus)],
  },
  {
    label: "Achievements",
    context: achievements.map((a) => a.title).join(" · "),
    href: "/about#education",
    keywords: ["achievements", "hackathon", "winner", "award", "sudhee", "aminoverse", "certification", "oracle", "red hat"],
  },
  {
    label: "Work",
    context: "Systems built: engines, backends and AI pipelines",
    href: "/work#projects",
    keywords: ["projects", "work", "portfolio", "systems", "case studies"],
  },
  ...projects.map((p) => ({
    label: p.name,
    context: p.short,
    href: `/project/${p.id}`,
    keywords: [p.id, ...words(p.name, p.badge, p.domain, ...p.stack)],
  })),
  {
    label: "Contact",
    context: `${profile.email} · ${profile.phone}`,
    href: "/contact#contact",
    keywords: ["contact", "email", "mail", "phone", "call", "hire", "reach", "message", "open to work", "resume", "cv"],
  },
  {
    label: "Easter Egg",
    context: "A hidden pixel town with a few secrets",
    href: "/easter",
    keywords: ["easter egg", "secret", "game", "hidden", "town"],
  },
];

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .trim()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function scoreEntry(entry: SearchEntry, rawQuery: string): number {
  const query = rawQuery.toLowerCase().trim();
  if (!query) {
    return 0;
  }

  const queryTokens = tokenize(query);
  const entryText = `${entry.label} ${entry.context} ${entry.keywords.join(" ")}`.toLowerCase();
  let score = 0;

  if (entryText.includes(query)) {
    score += 24;
  }

  for (const keyword of entry.keywords) {
    const normalizedKeyword = keyword.toLowerCase();
    if (normalizedKeyword === query) {
      score += 40;
    } else if (normalizedKeyword.startsWith(query)) {
      score += 18;
    } else if (normalizedKeyword.includes(query)) {
      score += 12;
    }
  }

  for (const token of queryTokens) {
    if (entryText.includes(` ${token} `) || entryText.startsWith(`${token} `) || entryText.endsWith(` ${token}`)) {
      score += 10;
    } else if (entryText.includes(token)) {
      score += 6;
    }
  }

  return score;
}

function getNearestAnchor(element: Element, pathname: string): string {
  const anchorHost = element.closest("[id]") as HTMLElement | null;
  if (anchorHost?.id) {
    return `${pathname}#${anchorHost.id}`;
  }

  return pathname;
}

function collectPageEntries(pathname: string): SearchEntry[] {
  const root = document.querySelector("main");
  if (!root) {
    return [];
  }

  const seen = new Set<string>();
  const entries: SearchEntry[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

  while (walker.nextNode()) {
    if (entries.length >= MAX_DYNAMIC_ENTRIES) {
      break;
    }

    const current = walker.currentNode;
    const parent = current.parentElement;
    if (!parent) {
      continue;
    }

    const tag = parent.tagName;
    if (["SCRIPT", "STYLE", "NOSCRIPT", "SVG", "CANVAS"].includes(tag)) {
      continue;
    }

    const text = (current.nodeValue ?? "").replace(/\s+/g, " ").trim();
    if (text.length < 2) {
      continue;
    }

    const context = text.slice(0, 140);
    const href = getNearestAnchor(parent, pathname);
    const key = `${context.toLowerCase()}::${href}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    entries.push({
      label: context.slice(0, 44),
      context,
      href,
      keywords: tokenize(context),
    });
  }

  return entries;
}

export default function HomeQuickSearch({ showShipLog = false, status }: HomeQuickSearchProps) {
  const pathname = usePathname();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState<SearchEntry[]>([]);

  useEffect(() => {
    const updateIndex = () => {
      setPageIndex(collectPageEntries(pathname));
    };

    const timeoutId = window.setTimeout(updateIndex, 60);
    window.addEventListener("resize", updateIndex, { passive: true });

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      window.removeEventListener("resize", updateIndex);
    };
  }, [pathname]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current) {
        return;
      }

      if (containerRef.current.contains(event.target as Node)) {
        return;
      }

      setIsOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const matches = useMemo(() => {
    const q = query.trim();
    if (!q) {
      return [] as SearchEntry[];
    }

    const merged = [...searchIndex, ...pageIndex];
    const deduped = new Map<string, SearchEntry>();
    for (const entry of merged) {
      const key = `${entry.href}::${entry.context.toLowerCase()}`;
      if (!deduped.has(key)) {
        deduped.set(key, entry);
      }
    }

    return [...deduped.values()]
      .map((entry) => ({ entry, score: scoreEntry(entry, q) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((item) => item.entry);
  }, [query, pageIndex]);

  const buildSearchHref = (baseHref: string, term: string): string => {
    const cleanTerm = term.trim();
    if (!cleanTerm) {
      return baseHref;
    }

    const [pathWithQuery, hash = ""] = baseHref.split("#");
    const separator = pathWithQuery.includes("?") ? "&" : "?";
    const nextPath = `${pathWithQuery}${separator}q=${encodeURIComponent(cleanTerm)}`;
    return hash ? `${nextPath}#${hash}` : nextPath;
  };

  const navigateToMatch = (value: string, explicitHref?: string) => {
    const href = explicitHref ?? matches[0]?.href;

    if (href) {
      setIsOpen(false);
      router.push(buildSearchHref(href, value));
    }
  };

  return (
    <div ref={containerRef} className="w-[min(75vw,28rem)]">
      <div className="md:hidden absolute -top-4 left-0 right-0 h-4 bg-gradient-to-b from-[var(--site-surface)] to-transparent blur-sm" />
      <Image
        src={bush2}
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none absolute -right-9 -top-2 w-20 rotate-[90deg] opacity-75 -z-100000"
      />

      {/* Main pill container */}
      <div className="relative rounded-full border border-[var(--site-border)] bg-[var(--site-surface)] backdrop-blur-2xl shadow-[0_12px_32px_rgba(4,15,36,0.15),0_0_0_1px_rgba(28,79,138,0.05)] h-11">

        {/* Search Input */}
        {!showShipLog && (
          <>
            <label htmlFor="home-search" className="sr-only">
              Search profile keywords
            </label>
            <input
              id="home-search"
              type="text"
              value={query}
              onFocus={() => setIsOpen(true)}
              onChange={(event) => {
                setQuery(event.target.value);
                setIsOpen(true);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  navigateToMatch(query);
                }
              }}
              placeholder="Search projects, skills, experience"
              className="w-full h-full bg-transparent py-2.5 pl-11 pr-[3.55rem] rounded-full text-sm font-semibold text-[var(--site-foreground)] placeholder:text-[var(--site-muted)] focus:outline-none"
            />
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[1.02rem] text-[var(--site-accent)]" aria-hidden="true">
              search
            </span>
            <button
              type="button"
              aria-label="Submit search"
              onClick={() => navigateToMatch(query)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-[var(--site-accent-solid)] text-white border border-[var(--site-accent-solid)] shadow-[0_6px_14px_rgb(var(--site-accent-rgb)/0.24)] hover:bg-[var(--site-accent-hover)] transition-colors flex items-center justify-center"
            >
              <Image
                src={pixelatedArrow}
                alt=""
                aria-hidden="true"
                className="block absolute -right-0.65 h-[20px] w-[20px] object-contain mx-auto my-auto"
              />
            </button>
          </>
        )}

        {/* Live ship log */}
        {showShipLog && (
          <div className="h-full px-3 flex items-center">
            <ShipLog status={status} />
          </div>
        )}
      </div>

      {/* Search Results */}
      {!showShipLog && query && isOpen ? (
        matches.length ? (
          <div className="mt-2 rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-strong)] backdrop-blur-2xl shadow-[0_12px_32px_rgba(4,15,36,0.15)] overflow-hidden">
            {matches.map((item) => (
              <button
                key={`${item.href}-${item.label}`}
                type="button"
                onClick={() => navigateToMatch(query, item.href)}
                className="w-full text-left px-3 py-2.5 text-xs md:text-sm font-semibold text-[var(--site-foreground)] hover:bg-[var(--site-surface-soft)] transition-colors"
              >
                <span className="block">{item.label}</span>
                <span className="block text-[11px] font-medium text-[var(--site-muted)] mt-0.5">{item.context}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-1.5 text-center text-[11px] font-semibold text-[var(--site-muted)]">No match in visible content yet. Try a different keyword.</p>
        )
      ) : null}
    </div>
  );
}

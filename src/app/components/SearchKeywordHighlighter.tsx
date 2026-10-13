"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const HIGHLIGHT_ATTR = "data-site-search-highlight";
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "INPUT", "TEXTAREA", "BUTTON", "SELECT", "OPTION", "SVG", "CANVAS"]);

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function clearHighlights() {
  const highlighted = document.querySelectorAll(`span[${HIGHLIGHT_ATTR}="true"]`);
  highlighted.forEach((node) => {
    const parent = node.parentNode;
    if (!parent) {
      return;
    }

    parent.replaceChild(document.createTextNode(node.textContent ?? ""), node);
    parent.normalize();
  });
}

function shouldSkipNode(parent: Node | null): boolean {
  if (!(parent instanceof HTMLElement)) {
    return true;
  }

  if (SKIP_TAGS.has(parent.tagName)) {
    return true;
  }

  if (parent.isContentEditable) {
    return true;
  }

  return false;
}

function buildTerms(rawQuery: string): string[] {
  const normalized = rawQuery.trim().toLowerCase();
  if (!normalized || normalized.length < 2) {
    return [];
  }

  const tokens = normalized.split(/\s+/).filter((token) => token.length > 1);
  return [...new Set([normalized, ...tokens])];
}

function applyHighlights(query: string) {
  const root = document.querySelector("main");
  if (!root) {
    return;
  }

  const terms = buildTerms(query);
  if (!terms.length) {
    return;
  }

  const pattern = new RegExp(`(${terms.map(escapeRegex).join("|")})`, "gi");
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let matchCount = 0;
  const MAX_MATCHES = 140;

  while (walker.nextNode()) {
    if (matchCount >= MAX_MATCHES) {
      break;
    }

    const current = walker.currentNode as Text;
    const value = current.nodeValue;
    if (!value || !value.trim()) {
      continue;
    }

    if (shouldSkipNode(current.parentNode)) {
      continue;
    }

    pattern.lastIndex = 0;
    if (!pattern.test(value)) {
      continue;
    }

    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    pattern.lastIndex = 0;

    value.replace(pattern, (matched, _group, offset: number) => {
      if (offset > lastIndex) {
        fragment.appendChild(document.createTextNode(value.slice(lastIndex, offset)));
      }

      const marker = document.createElement("span");
      marker.setAttribute(HIGHLIGHT_ATTR, "true");
      marker.className = "site-search-highlight";
      marker.textContent = matched;
      fragment.appendChild(marker);

      lastIndex = offset + matched.length;
      matchCount += 1;
      return matched;
    });

    if (lastIndex < value.length) {
      fragment.appendChild(document.createTextNode(value.slice(lastIndex)));
    }

    current.parentNode?.replaceChild(fragment, current);
  }
}

export default function SearchKeywordHighlighter() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    clearHighlights();

    const query = searchParams.get("q")?.trim();
    if (!query) {
      return;
    }

    let timeout: number | undefined;
    let idleId: number | undefined;
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    const scheduleHighlight = () => {
      if (typeof idleWindow.requestIdleCallback === "function") {
        idleId = idleWindow.requestIdleCallback(
          () => applyHighlights(query),
          { timeout: 180 },
        );
      } else {
        timeout = window.setTimeout(() => {
          applyHighlights(query);
        }, 120);
      }
    };

    // Delay slightly so route transition and hash scrolling can settle first.
    timeout = window.setTimeout(scheduleHighlight, 80);

    return () => {
      if (timeout) {
        window.clearTimeout(timeout);
      }
      if (idleId && typeof idleWindow.cancelIdleCallback === "function") {
        idleWindow.cancelIdleCallback(idleId);
      }
      clearHighlights();
    };
  }, [pathname, searchParams]);

  return null;
}

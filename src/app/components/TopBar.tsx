"use client";

import { useState } from "react";
import HomeQuickSearch from "./HomeQuickSearch";
import type { Status } from "./ShipLog";

// Top-centre pill: the live status feed by default, swappable for site search.
export default function TopBar({ status }: { status: Status }) {
  const [showShipLog, setShowShipLog] = useState(true);

  return (
    <div className="fixed top-5 left-[47.5%] md:left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 md:gap-2.5">
      <button
        type="button"
        onClick={() => setShowShipLog((v) => !v)}
        className="w-10 h-10 rounded-full bg-[var(--site-surface)]/90 backdrop-blur-md border border-[var(--site-border)] shadow-[0_8px_24px_rgba(0,0,0,0.15)] flex items-center justify-center hover:bg-[var(--site-surface)] transition-colors flex-shrink-0"
        aria-label={showShipLog ? "Search the site" : "Show live status"}
      >
        <span className="material-symbols-outlined text-[var(--site-accent)]" aria-hidden="true">
          {showShipLog ? "search" : "sensors"}
        </span>
      </button>
      <HomeQuickSearch showShipLog={showShipLog} status={status} />
    </div>
  );
}

"use client";
import { useState, type MouseEvent } from 'react';
import Link from 'next/link';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { areaLabels, getProject, moreBuilds, projects, type Area, type Project } from '../data/profile';
import PixelScene from './PixelScene';

type CardKind = 'compact' | 'vertical' | 'landscape';

// Bento order: flagship systems get the big tiles, the rest stack around them.
const desktopLayout: { id: string; kind: CardKind; span: string }[] = [
  { id: 'web-agent', kind: 'compact', span: 'col-span-1 row-span-1' },
  { id: 'ivm', kind: 'landscape', span: 'col-span-2 row-span-2' },
  { id: 'tinyrouter', kind: 'vertical', span: 'col-span-1 row-span-2' },
  { id: 'content-pipeline', kind: 'compact', span: 'col-span-1 row-span-1' },
  { id: 'pytor', kind: 'compact', span: 'col-span-1 row-span-1' },
  { id: 'trinetra', kind: 'compact', span: 'col-span-2 row-span-1' },
  { id: 'glacier', kind: 'compact', span: 'col-span-1 row-span-1' },
  { id: 'blackgrid', kind: 'landscape', span: 'col-span-2 row-span-1' },
  { id: 'cadence', kind: 'compact', span: 'col-span-1 row-span-1' },
];

const mobileOrder = ['ivm', 'tinyrouter', 'blackgrid', 'web-agent', 'content-pipeline', 'pytor', 'trinetra', 'glacier', 'cadence'];
const bigCards = new Set(['ivm', 'tinyrouter', 'blackgrid']);

const cardBase =
  'group relative h-full border border-[var(--site-border)] bg-[var(--site-card-bg)] backdrop-blur-lg transition-[border-color,box-shadow] duration-300 hover:border-[var(--site-accent)]/45';

function BracketButton({ onClick, label, expanded }: { onClick: (event: MouseEvent<HTMLButtonElement>) => void; label: string; expanded: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-expanded={expanded}
      className="absolute top-3 right-3 z-20 h-8 w-8 rounded-xl border border-[var(--site-accent-solid)]/70 bg-[var(--site-accent-solid)] text-white backdrop-blur-md shadow-[0_10px_24px_rgb(var(--site-accent-rgb)/0.20)] inline-flex items-center justify-center transition-colors hover:bg-[var(--site-accent-hover)]"
    >
      <span className="material-symbols-outlined block text-[0.9rem] leading-none" aria-hidden="true">{expanded ? 'expand_less' : 'expand_more'}</span>
    </button>
  );
}

// Whole-card link that sits under the expand button, so the markup stays valid.
function CardLink({ project }: { project: Project }) {
  return <Link href={`/project/${project.id}`} aria-label={`Open ${project.name}`} className="absolute inset-0 z-10 rounded-[inherit]" />;
}

function MetricStrip({ project, dense = false }: { project: Project; dense?: boolean }) {
  return (
    <div className={`grid grid-cols-2 ${dense ? 'gap-1.5' : 'gap-2 lg:grid-cols-4'}`}>
      {project.metrics.map((m) => (
        <div key={m.label} className="rounded-xl border border-[var(--site-border)] bg-[var(--site-card-bg-strong)] px-3 py-2">
          <p className={`font-doto font-black text-[var(--site-accent)] leading-none tabular-nums ${dense ? 'text-base' : 'text-lg md:text-xl'}`}>{m.value}</p>
          <p className="mt-1 text-[9px] tracking-[0.12em] uppercase font-bold text-[var(--text-secondary)] line-clamp-1">{m.label}</p>
        </div>
      ))}
    </div>
  );
}

function SceneWindow({ project, tilt = 0, className = '' }: { project: Project; tilt?: number; className?: string }) {
  return (
    <div
      className={`rounded-[1.4rem] border border-[var(--site-border-strong)] bg-[var(--site-surface-strong)] shadow-[0_24px_48px_rgba(0,0,0,0.3)] overflow-hidden transition-transform duration-500 hover:rotate-0 ${className}`}
      style={{ rotate: `${tilt}deg` }}
    >
      <div className="flex items-center gap-1.5 px-3 h-7 border-b border-[var(--site-border)] bg-[var(--site-card-bg-strong)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#ff5f57]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#febc2e]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#28c840]" />
        <span className="ml-1.5 truncate font-mono text-[9px] text-[var(--text-muted)]">~/{project.id}</span>
      </div>
      <div className="p-3">
        <PixelScene id={project.id} />
      </div>
    </div>
  );
}

function Details({ project, dense = false }: { project: Project; dense?: boolean }) {
  return (
    <div className={`mt-3 ${dense ? 'space-y-3' : 'space-y-4'}`}>
      <p className={`${dense ? 'text-[0.9rem] line-clamp-3' : 'text-sm md:text-[0.98rem] line-clamp-3'} leading-relaxed text-[var(--text-secondary)] font-medium`}>
        {project.description}
      </p>
      <div className="grid grid-cols-3 gap-2">
        {[
          ['Domain', project.domain],
          ['Role', project.role],
          ['When', project.year],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-[var(--site-border)] bg-[var(--site-card-bg-strong)] px-3 py-2">
            <p className="text-[9px] tracking-[0.12em] uppercase text-[var(--site-accent)] font-bold">{label}</p>
            <p className="mt-0.5 text-[11px] md:text-xs font-bold text-[var(--text-card)] line-clamp-1">{value}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {project.stack.slice(0, dense ? 3 : 5).map((tech) => (
          <span key={tech} className="px-2.5 py-1 rounded-full text-[10px] md:text-xs font-semibold bg-[var(--site-card-bg-strong)] text-[var(--site-accent)] border border-[var(--site-border)]">
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ProjectGrid() {
  const reduceMotion = useReducedMotion();
  const [filter, setFilter] = useState<Area | 'all'>('all');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ ivm: true, tinyrouter: true, blackgrid: true });

  const toggle = (id: string) => (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const enter = (delay: number) => ({
    initial: reduceMotion ? false : { opacity: 0, scale: 0.94, y: 22 },
    whileInView: { opacity: 1, scale: 1, y: 0 },
    viewport: { once: true, margin: '-24px' },
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const, delay },
  });

  const renderCompact = (p: Project, delay: number) => (
    <motion.div id={p.id} key={p.id} {...enter(delay)} className={`${cardBase} min-h-[176px] rounded-[1.7rem] px-4 py-4 md:px-5 flex flex-col justify-center gap-3 shadow-[0_18px_45px_rgba(0,0,0,0.15)]`}>
      <CardLink project={p} />
      <div className="flex items-center gap-4 pr-9">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm md:text-base font-black font-doto text-[var(--text-card)]">{p.name}</p>
        <p className="text-xs md:text-sm text-[var(--text-muted)] font-medium line-clamp-2">{p.short}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="rounded-full border border-[var(--site-border)] bg-[var(--site-card-bg-strong)] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--site-accent)]">{p.badge}</span>
          <span className="rounded-full border border-[var(--site-border)] bg-[var(--site-card-bg-strong)] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--text-secondary)]">{p.year}</span>
        </div>
      </div>
      <div className="hidden sm:block w-[168px] shrink-0 rounded-xl border border-[var(--site-border)] bg-[var(--site-card-bg-strong)] p-1.5">
        <PixelScene id={p.id} />
      </div>
      </div>
      {expanded[p.id] ? (
        <motion.div initial={reduceMotion ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <MetricStrip project={p} dense />
        </motion.div>
      ) : null}
      <BracketButton onClick={toggle(p.id)} label={`${expanded[p.id] ? 'Hide' : 'Show'} ${p.name} numbers`} expanded={!!expanded[p.id]} />
    </motion.div>
  );

  const renderVertical = (p: Project, delay: number) => (
    <motion.div id={p.id} key={p.id} {...enter(delay)} className={`${cardBase} min-h-[380px] rounded-[1.7rem] p-5 md:p-6 flex flex-col gap-4 overflow-hidden shadow-[0_18px_45px_rgba(0,0,0,0.15)]`}>
      <CardLink project={p} />
      <BracketButton onClick={toggle(p.id)} label={`${expanded[p.id] ? 'Hide' : 'Show'} ${p.name} numbers`} expanded={!!expanded[p.id]} />
      <div className="flex flex-col">
        <p className="inline-flex w-fit text-[var(--site-accent)] font-bold text-[10px] tracking-[0.14em] uppercase bg-[var(--site-accent)]/10 px-3 py-1.5 rounded-full mb-3">{p.badge}</p>
        <h3 className="text-2xl md:text-3xl font-black font-doto text-[var(--text-heading)] leading-tight">{p.name}</h3>
        <p className="mt-2 text-sm md:text-base text-[var(--text-secondary)] font-medium leading-relaxed">{p.short}</p>
        <Details project={p} dense />
        {expanded[p.id] ? <div className="mt-4"><MetricStrip project={p} dense /></div> : null}
      </div>
      <SceneWindow project={p} className="mt-auto" />
    </motion.div>
  );

  const renderLandscape = (p: Project, delay: number, diagramFirst: boolean) => (
    <motion.div id={p.id} key={p.id} {...enter(delay)} className={`${cardBase} min-h-[320px] overflow-hidden rounded-[2.35rem] p-5 md:p-6 shadow-[0_22px_54px_rgba(0,0,0,0.2)]`}>
      <CardLink project={p} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgb(var(--site-accent-rgb)/0.16),_transparent_40%),radial-gradient(circle_at_bottom_left,_rgb(var(--site-accent-rgb)/0.08),_transparent_32%)]" />
      <BracketButton onClick={toggle(p.id)} label={`${expanded[p.id] ? 'Hide' : 'Show'} ${p.name} numbers`} expanded={!!expanded[p.id]} />
      <div className={`relative grid h-full grid-cols-1 gap-6 md:items-center ${diagramFirst ? 'md:grid-cols-[0.9fr_1.1fr]' : 'md:grid-cols-[1.1fr_0.9fr]'}`}>
        <div className={`flex h-full flex-col ${diagramFirst ? 'md:order-2' : ''}`}>
          <p className="mt-2 inline-flex w-fit text-[var(--site-accent)] font-bold text-[10px] tracking-[0.14em] uppercase bg-[var(--site-accent)]/10 px-4 py-1.5 rounded-full">{p.badge}</p>
          <h3 className="mt-3 text-3xl md:text-4xl font-black font-doto text-[var(--text-heading)] leading-tight">{p.name}</h3>
          <p className="mt-2 max-w-xl text-sm md:text-base text-[var(--text-secondary)] font-medium leading-relaxed">{p.short}</p>
          <Details project={p} />
          {expanded[p.id] ? <div className="mt-auto pt-4"><MetricStrip project={p} dense /></div> : null}
        </div>
        <div className={`relative flex items-center justify-center ${diagramFirst ? 'md:order-1' : ''}`}>
          <SceneWindow project={p} tilt={diagramFirst ? -3 : 3} className="w-full max-w-[340px]" />
        </div>
      </div>
    </motion.div>
  );

  const render = (id: string, kind: CardKind, delay: number) => {
    const p = getProject(id)!;
    if (kind === 'landscape') return renderLandscape(p, delay, id === 'ivm');
    if (kind === 'vertical') return renderVertical(p, delay);
    return renderCompact(p, delay);
  };

  return (
    <section id="projects" className="px-6 md:px-12 w-full max-w-7xl mx-auto scroll-mt-28">
      <div className="text-center mb-20">
        <h2 className="text-4xl sm:text-5xl md:text-7xl font-extrabold font-doto text-[var(--text-heading)] mb-6">
          Systems Built<span className="font-doto text-4xl sm:text-5xl md:text-7xl font-extrabold rubber-spin-dot inline-flex items-center justify-center w-[1em] h-[1em] leading-none align-middle text-[var(--site-accent)]">+</span>
        </h2>
        <p className="text-xl text-[var(--text-secondary)] font-medium max-w-3xl mx-auto">
          Engines, backends and AI pipelines. Each one ships with the numbers that show it works.
        </p>
      </div>

      {/* ── Filter ── */}
      <div className="mb-8 flex gap-2 overflow-x-auto no-scrollbar md:justify-center" role="group" aria-label="Filter projects">
        {(['all', ...Object.keys(areaLabels)] as const).map((key) => {
          const count = key === 'all' ? projects.length : projects.filter((p) => p.areas.includes(key as Area)).length;
          const on = filter === key;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={on}
              onClick={() => setFilter(key as Area | 'all')}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold tracking-[0.06em] transition-colors ${on ? 'border-[var(--site-accent-solid)] bg-[var(--site-accent-solid)] text-white' : 'border-[var(--site-border)] bg-[var(--site-card-bg)] text-[var(--text-secondary)] hover:border-[var(--site-accent)]/50'}`}
            >
              {key === 'all' ? 'All' : areaLabels[key as Area]} <span className="opacity-60 font-mono">{count}</span>
            </button>
          );
        })}
      </div>

      {filter === 'all' ? (
        <>
          {/* ── Desktop magazine grid ── */}
          <div className="hidden md:grid grid-flow-dense gap-5 auto-rows-[minmax(176px,auto)] grid-cols-2 lg:grid-cols-3">
            {desktopLayout.map(({ id, kind, span }, i) => (
              <div key={id} className={`${span} ${bigCards.has(id) ? '' : 'max-lg:col-span-1'}`}>
                {render(id, kind, 0.04 * (i % 3))}
              </div>
            ))}
          </div>

          {/* ── Mobile list ── */}
          <div className="space-y-4 md:hidden">
            {mobileOrder.map((id, i) => render(id, bigCards.has(id) ? 'vertical' : 'compact', i * 0.04))}
          </div>
        </>
      ) : (
        <LayoutGroup>
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {projects.filter((p) => p.areas.includes(filter)).map((p, i) => (
                <motion.div key={p.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.25, delay: i * 0.03 }}>
                  {renderCompact(p, 0)}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>
      )}

      {/* ── Smaller builds ── */}
      <div className="mt-20">
        <div className="flex items-center gap-4 mb-6">
          <h3 className="text-2xl md:text-3xl font-black font-doto text-[var(--text-heading)]">Also built</h3>
          <span className="h-px flex-1 bg-[var(--site-border)]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {moreBuilds.map((b, i) => {
            const body = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <p className="font-doto font-black text-[var(--text-card)] leading-tight">{b.name}</p>
                  {b.href ? <span className="material-symbols-outlined text-[1rem] text-[var(--site-accent)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true">arrow_outward</span> : null}
                </div>
                <p className="mt-1.5 text-sm text-[var(--text-secondary)] font-medium leading-relaxed">{b.note}</p>
                <p className="mt-3 font-mono text-[10px] tracking-[0.08em] uppercase text-[var(--site-accent)]">{b.stack}</p>
              </>
            );
            const cls = `${cardBase} block rounded-[1.4rem] px-5 py-4 shadow-[0_12px_30px_rgba(0,0,0,0.12)]`;
            return (
              <motion.div key={b.name} {...enter(0.04 * (i % 3))}>
                {b.href ? (
                  <a href={b.href} target="_blank" rel="noopener noreferrer" className={cls}>{body}</a>
                ) : (
                  <div className={cls}>{body}</div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

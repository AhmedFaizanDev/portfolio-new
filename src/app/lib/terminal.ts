// The site's shell: one command set shared by the contact-page terminal and the
// ⌘K overlay. Pure: it returns output lines plus an optional action for the caller.
import { profile, projects, resumes, socials } from "../data/profile";

export type Line = string | { label: string; href: string };
export type Action =
  | { type: "navigate"; href: string }
  | { type: "download"; href: string; file: string }
  | { type: "theme"; mode: "dark" | "light" }
  | { type: "clear" };
export type Result = { output: Line[]; isError?: boolean; action?: Action };

export type StatusSnapshot = {
  lastPush?: { name: string; ago: string };
  ci?: { repo: string; passing: boolean; ago: string };
  weekly?: number[];
  build: { sha: string | null; ago: string };
  refreshedAgo: string;
  time: string | null;
};

const PAGES: Record<string, string> = { home: "/", work: "/work", about: "/about", contact: "/contact" };
const SPARK = "▁▂▃▄▅▆▇█";

export const HELP: Line[] = [
  "whoami            who you're talking to",
  "cat focus.txt     what I work on",
  "ls projects       featured builds",
  "open <project>    jump to a project, e.g. open ivm",
  "goto <page>       home, work, about, contact",
  "resume [type]     download general, swe or ai",
  "status            live data: pushes, CI, build, cache age",
  "theme dark|light  switch the theme",
  "echo $EMAIL       email address",
  "echo $PHONE       phone number",
  "socials           where else to find me",
  "play              the hidden game",
  "clear             wipe the screen",
  "anything else     searches the site",
];

export const COMMAND_NAMES = ["help", "whoami", "cat focus.txt", "ls projects", "open ", "goto ", "resume ", "status", "theme ", "echo $EMAIL", "echo $PHONE", "socials", "play", "clear", "sudo hire faizan"];

function search(q: string): Line[] {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const hits = projects
    .map((p) => ({ p, score: terms.filter((t) => `${p.name} ${p.badge} ${p.domain} ${p.short} ${p.stack.join(" ")}`.toLowerCase().includes(t)).length }))
    .filter((h) => h.score)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  return hits.map(({ p }) => ({ label: `${p.id.padEnd(17)} ${p.short}`, href: `/project/${p.id}` }));
}

export function run(input: string, status?: StatusSnapshot): Result {
  const raw = input.trim();
  const cmd = raw.toLowerCase();
  const [head, ...rest] = cmd.split(/\s+/);
  const arg = rest.join(" ");

  if (cmd === "clear") return { output: [], action: { type: "clear" } };
  if (cmd === "help" || cmd === "?") return { output: HELP };
  if (cmd === "whoami") return { output: [`${profile.name} · ${profile.role} · ${profile.location}`] };
  if (cmd === "cat focus.txt")
    return { output: ["Backends that stay correct under load, data systems that update incrementally,", "and AI pipelines measured against real baselines. Checks first, then the system."] };
  if (cmd === "ls projects" || cmd === "ls")
    return { output: projects.map((p) => ({ label: `${p.id.padEnd(17)} ${p.badge.toLowerCase()}`, href: `/project/${p.id}` })) };
  if (cmd === "echo $email") return { output: [{ label: profile.email, href: `mailto:${profile.email}` }] };
  if (cmd === "echo $phone") return { output: [{ label: profile.phone, href: profile.phoneHref }] };
  if (cmd === "socials" || cmd === "socials --list")
    return { output: socials.filter((s) => s.icon !== "email").map((s) => ({ label: `${s.name.toLowerCase().padEnd(10)} ${s.href}`, href: s.href })) };
  if (cmd === "sudo hire faizan")
    return { output: ["[sudo] permission granted.", { label: `→ opening a draft to ${profile.email}`, href: `mailto:${profile.email}?subject=Let's%20talk` }] };
  if (cmd === "play") return { output: ["loading the pixel town…"], action: { type: "navigate", href: "/easter" } };

  if (head === "open") {
    const p = projects.find((x) => x.id === arg || x.name.toLowerCase() === arg);
    return p
      ? { output: [`opening ${p.name}…`], action: { type: "navigate", href: `/project/${p.id}` } }
      : { output: [`no project "${arg}". try: ${projects.map((x) => x.id).join(", ")}`], isError: true };
  }
  if (head === "goto" || head === "cd") {
    const href = PAGES[arg.replace(/^\//, "") || "home"];
    return href ? { output: [`→ ${href}`], action: { type: "navigate", href } } : { output: [`no page "${arg}". try: ${Object.keys(PAGES).join(", ")}`], isError: true };
  }
  if (head === "resume") {
    if (!arg || arg === "--list") return { output: resumes.map((r) => ({ label: `${r.slug.padEnd(8)} ${r.label}`, href: r.href })) };
    const r = resumes.find((x) => x.slug === arg);
    return r ? { output: [`downloading ${r.label} resume…`], action: { type: "download", href: r.href, file: r.file } } : { output: [`no resume "${arg}". try: general, swe, ai`], isError: true };
  }
  if (head === "theme") {
    return arg === "dark" || arg === "light" ? { output: [`theme → ${arg}`], action: { type: "theme", mode: arg } } : { output: ["usage: theme dark | theme light"], isError: true };
  }
  if (cmd === "status") {
    if (!status) return { output: ["status is available from the ⌘K terminal"], isError: true };
    const peak = Math.max(1, ...(status.weekly ?? [0]));
    return {
      output: [
        `live data   refreshed ${status.refreshedAgo} (hourly cache)`,
        status.lastPush ? `last push   ${status.lastPush.name} · ${status.lastPush.ago}` : "last push   unavailable",
        status.ci ? `${status.ci.repo} CI      ${status.ci.passing ? "passing" : "failing"} · ${status.ci.ago}` : "CI          unavailable",
        status.weekly ? `activity    ${status.weekly.map((n) => SPARK[Math.round((n / peak) * 7)]).join("")}  (12 weeks)` : "activity    needs a GitHub token",
        `build       ${status.build.sha ?? "local"} · ${status.build.ago}`,
        status.time ? `local time  ${status.time} in Hyderabad` : "",
      ].filter(Boolean),
    };
  }

  const hits = search(raw);
  return hits.length
    ? { output: [`no command "${raw}", but the site has:`, ...hits] }
    : { output: [`command not found: ${raw}`, "type 'help' to list commands"], isError: true };
}

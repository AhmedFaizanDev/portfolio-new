// Server-side live data. Every call is cached for an hour (ISR), so a visit never
// touches GitHub directly and the 60/hr anonymous limit can't take the site down.
// With GITHUB_TOKEN set (read-only, public data) the contribution calendar unlocks
// and the rate limit rises to 5,000/hr. Every function degrades to null, never throws.
import { cache } from "react";
import { profile } from "../data/profile";

const REVALIDATE = 3600;
const TOKEN = process.env.GITHUB_TOKEN;
const USER = profile.githubUsername;
// Profile-readme repos are noise in an activity feed.
const HIDDEN = new Set([USER.toLowerCase(), "github-readme"]);

const headers = {
  Accept: "application/vnd.github+json",
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
};

async function rest<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`https://api.github.com${path}`, { headers, next: { revalidate: REVALIDATE } });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

export type Push = { name: string; url: string; description: string | null; pushedAt: string };
export type CalendarDay = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };
export type Calendar = {
  weeks: CalendarDay[][];
  total: number;
  activeDays: number;
  longestStreak: number;
  busiest: CalendarDay;
  last7: number;
  last30: number;
  /** Totals for the last 12 weeks, oldest first: the status-bar sparkline. */
  weekly: number[];
};
export type RepoLive = {
  pushedAt: string;
  ci: { name: string; passing: boolean; at: string; url: string } | null;
};
export type Build = { sha: string | null; builtAt: string };

export const getPushes = cache(async (limit: number = 6): Promise<Push[]> => {
  type R = { name: string; html_url: string; description: string | null; pushed_at: string; fork: boolean };
  const repos = await rest<R[]>(`/users/${USER}/repos?sort=pushed&per_page=30`);
  return (repos ?? [])
    .filter((r) => !r.fork && !HIDDEN.has(r.name.toLowerCase()))
    .slice(0, limit)
    .map((r) => ({ name: r.name, url: r.html_url, description: r.description, pushedAt: r.pushed_at }));
});

export const getProfileStats = cache(async () => {
  const user = await rest<{ public_repos: number; followers: number; created_at: string }>(`/users/${USER}`);
  return user ? { repos: user.public_repos, followers: user.followers, since: user.created_at.slice(0, 4) } : null;
});

/** Latest push and CI state for one repo ("owner/name" or a github.com URL). */
export const getRepoLive = cache(async (repoUrl: string): Promise<RepoLive | null> => {
  const slug = repoUrl.replace("https://github.com/", "");
  type Runs = { total_count: number; workflow_runs: { name: string; conclusion: string | null; created_at: string; html_url: string }[] };
  const [repo, runs] = await Promise.all([
    rest<{ pushed_at: string }>(`/repos/${slug}`),
    rest<Runs>(`/repos/${slug}/actions/runs?per_page=1&status=completed`),
  ]);
  if (!repo) return null;
  const run = runs?.workflow_runs[0];
  return {
    pushedAt: repo.pushed_at,
    ci: run ? { name: run.name, passing: run.conclusion === "success", at: run.created_at, url: run.html_url } : null,
  };
});

const LEVEL: Record<string, CalendarDay["level"]> = {
  NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4,
};

/** Last 52 weeks of contributions. GraphQL requires a token, so no token -> null. */
export const getCalendar = cache(async (): Promise<Calendar | null> => {
  if (!TOKEN) return null;
  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `query { user(login: "${USER}") { contributionsCollection { contributionCalendar { totalContributions
          weeks { contributionDays { date contributionCount contributionLevel } } } } } }`,
      }),
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const cal = json?.data?.user?.contributionsCollection?.contributionCalendar;
    if (!cal) return null;

    type RawDay = { date: string; contributionCount: number; contributionLevel: string };
    const weeks: CalendarDay[][] = cal.weeks.map((w: { contributionDays: RawDay[] }) =>
      w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount, level: LEVEL[d.contributionLevel] ?? 0 }))
    );
    return summarise(weeks, cal.totalContributions);
  } catch {
    return null;
  }
});

const sum = (days: CalendarDay[]) => days.reduce((n, d) => n + d.count, 0);

export function summarise(weeks: CalendarDay[][], total: number): Calendar {
  const days = weeks.flat();
  let longest = 0, run = 0;
  for (const d of days) {
    run = d.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  return {
    weeks,
    total,
    activeDays: days.filter((d) => d.count > 0).length,
    longestStreak: longest,
    busiest: days.reduce((a, b) => (b.count > a.count ? b : a), days[0]),
    last7: sum(days.slice(-7)),
    last30: sum(days.slice(-30)),
    weekly: weeks.slice(-12).map(sum),
  };
}

export function getBuild(): Build {
  return {
    sha: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
    builtAt: process.env.BUILD_TIME ?? new Date().toISOString(),
  };
}

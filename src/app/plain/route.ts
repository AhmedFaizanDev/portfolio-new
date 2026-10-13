import { achievements, education, experience, profile, projects, resumes, socials } from "../data/profile";

export const dynamic = "force-static";

// Served to curl/wget on / via the proxy: the site, minus the browser.
export function GET() {
  const site = `https://${profile.site}`;
  const lines = [
    profile.name.toUpperCase(),
    `${profile.role} · ${profile.location}`,
    "",
    profile.tagline,
    "",
    "PROJECTS",
    ...projects.flatMap((p) => [
      `  * ${p.name} (${p.year})${p.repoUrl ? `  ${p.repoUrl}` : ""}`,
      `    ${p.short}`,
      `    ${p.metrics.map((m) => `${m.label}: ${m.value}`).join(" · ")}`,
    ]),
    "",
    "EXPERIENCE",
    ...experience.map((e) => `  * ${e.role} · ${e.company} (${e.period})`),
    "",
    "EDUCATION",
    `  * ${education.degree}, ${education.institution} (${education.period})`,
    ...achievements.map((a) => `  * ${a.title} (${a.when})`),
    "",
    "CONTACT",
    `  email      ${profile.email}`,
    `  phone      ${profile.phone}`,
    ...socials.filter((s) => s.icon !== "email").map((s) => `  ${s.name.toLowerCase().padEnd(10)} ${s.href}`),
    ...resumes.map((r) => `  ${`resume/${r.slug}`.padEnd(10)} ${site}${r.href}`),
    "",
    `browser version: ${site}. But this works too.`,
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

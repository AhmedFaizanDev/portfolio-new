import type { MetadataRoute } from "next";
import { profile, projects } from "./data/profile";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = `https://${profile.site}`;
  const lastModified = process.env.BUILD_TIME ? new Date(process.env.BUILD_TIME) : new Date();
  return [
    { url: base, lastModified, changeFrequency: "weekly", priority: 1 },
    ...["/work", "/about", "/contact"].map((path) => ({ url: `${base}${path}`, lastModified, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...projects.map((p) => ({ url: `${base}/project/${p.id}`, lastModified, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}

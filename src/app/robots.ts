import type { MetadataRoute } from "next";
import { profile } from "./data/profile";

export default function robots(): MetadataRoute.Robots {
  return {
    // /plain is the curl-only text version. /easter stays crawlable so its noindex is seen.
    rules: { userAgent: "*", allow: "/", disallow: "/plain" },
    sitemap: `https://${profile.site}/sitemap.xml`,
    host: `https://${profile.site}`,
  };
}

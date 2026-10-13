import { ImageResponse } from "next/og";
import { CHAR_PIXELS } from "./components/PixelMark";
import { profile } from "./data/profile";

export const alt = `${profile.name} · ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The link-preview card: the loader's dot-matrix "FA" on the site's navy.
export default function OpengraphImage() {
  const cell = 26;
  const letters = ["F", "A"] as const;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "linear-gradient(160deg, #030a17 0%, #071630 55%, #030914 100%)", color: "#eef6ff", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", gap: cell }}>
          {letters.map((ch) => (
            <div key={ch} style={{ display: "flex", flexWrap: "wrap", width: cell * 5 }}>
              {Array.from({ length: 20 }, (_, i) => (
                <div key={i} style={{ width: cell - 4, height: cell - 4, margin: 2, borderRadius: 4, background: "#8fd0f2", opacity: (CHAR_PIXELS[ch] as readonly number[]).includes(i) ? 1 : 0.12 }} />
              ))}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 800, letterSpacing: -2 }}>{profile.name}</div>
          <div style={{ fontSize: 40, fontWeight: 700, color: "#8fd0f2", marginTop: 8 }}>{profile.role}</div>
          <div style={{ fontSize: 26, color: "#8aa6c4", marginTop: 24 }}>{`${profile.site} · ${profile.location}`}</div>
        </div>
      </div>
    ),
    size
  );
}

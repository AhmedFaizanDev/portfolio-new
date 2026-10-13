// Re-grades the original green pixel art into the Glacier palette.
// Gradient map: each pixel's luminance picks a colour from a hand-set ramp,
// so the art keeps its tonal depth instead of a flat hue rotation.
// Run: node scripts/grade-assets.cjs
const sharp = require("sharp");

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

async function gradeMap(src, out, ramp, width) {
  const { data, info } = await sharp(src).resize(width).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const stops = ramp.map(hex);
  const lum = (i) => 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
  let lo = 255, hi = 0;
  for (let i = 0; i < data.length; i += 4) if (data[i + 3] > 20) { lo = Math.min(lo, lum(i)); hi = Math.max(hi, lum(i)); }
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const t = Math.min(1, Math.max(0, (lum(i) - lo) / (hi - lo || 1))) * (stops.length - 1);
    const k = Math.min(stops.length - 2, Math.floor(t)), f = t - k;
    for (let c = 0; c < 3; c++) data[i + c] = Math.round(stops[k][c] + (stops[k + 1][c] - stops[k][c]) * f);
  }
  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png({ compressionLevel: 9 }).toFile(out);
  console.log("graded", out);
}

const A = "src/app/assets";
(async () => {
  await gradeMap(`${A}/imgs/desk-bg.png`, `${A}/glacier/mountain.png`, ["#071a33", "#113d6b", "#2270b5", "#62b2ee", "#eef8ff"]);
  await gradeMap(`${A}/forest assets/pixelated_bush_v2.png`, `${A}/glacier/bush.png`, ["#0a2040", "#16477a", "#2b7cc0", "#7cc2f1", "#e6f4ff"]);
  await gradeMap(`${A}/imgs/easter.png`, `${A}/glacier/egg.png`, ["#02060d", "#0b2a55", "#1f5fa8", "#4d9ae0", "#a8d6fa", "#f4fbff"], 96);
  await gradeMap("public/cursor/cursor-tri-21.png", "public/cursor/glacier-21.png", ["#04101f", "#0d3560", "#2677cc", "#8fd0f2"]);
})();

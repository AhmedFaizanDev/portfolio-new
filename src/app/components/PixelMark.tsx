// 5×4 dot-matrix letters, shared by the page loader and the avatar mark.
// Pixel index map:
//  0  1  2  3  4
//  5  6  7  8  9
// 10 11 12 13 14
// 15 16 17 18 19
export const CHAR_PIXELS = {
  F: [0, 1, 2, 3, 4, 5, 10, 11, 12, 15],
  A: [0, 1, 2, 3, 4, 5, 9, 10, 11, 12, 13, 14, 15, 19],
  I: [0, 1, 2, 3, 4, 7, 12, 15, 16, 17, 18, 19],
  Z: [0, 1, 2, 3, 4, 8, 11, 15, 16, 17, 18, 19],
  N: [0, 4, 5, 6, 9, 10, 12, 14, 15, 18, 19],
} as const;

export type PixelChar = keyof typeof CHAR_PIXELS;

/**
 * The "FA" monogram drawn in the same dot-matrix as the loader: the site's
 * avatar wherever a face would go.
 */
export default function PixelMark({ className = "" }: { className?: string }) {
  const letters: PixelChar[] = ["F", "A"];
  const cell = 10;
  const pad = 14;
  const letterW = 5 * cell;
  const gap = cell;
  const w = pad * 2 + letterW * 2 + gap;
  const h = w;
  const top = (h - 4 * cell) / 2;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} role="img" aria-label="Faizan monogram">
      <rect width={w} height={h} rx={16} fill="var(--site-canvas-fill)" />
      {letters.map((ch, li) =>
        Array.from({ length: 20 }, (_, i) => {
          const on = (CHAR_PIXELS[ch] as readonly number[]).includes(i);
          return (
            <rect
              key={`${ch}-${i}`}
              x={pad + li * (letterW + gap) + (i % 5) * cell + 1}
              y={top + Math.floor(i / 5) * cell + 1}
              width={cell - 2}
              height={cell - 2}
              rx={1.5}
              fill="var(--site-accent)"
              opacity={on ? 1 : 0.12}
            />
          );
        })
      )}
    </svg>
  );
}

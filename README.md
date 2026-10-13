# faizanahmed.in

Portfolio of Mohammed Faizan Ahmed: backend, systems and AI engineer.
Next.js 16 · React 19 · Tailwind 4 · framer-motion.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

## Where things live

- `src/app/data/profile.ts`: every personal fact (bio, experience, projects, metrics, diagrams). Edit content here; pages, search, the terminal and `curl` output all read from it.
- `public/resume/{general,swe,ai}.pdf`: the three resumes offered by the download button.
- `src/app/project/[id]`: one detail page per project, statically generated.
- `src/app/easter`: the hidden pixel-town game.

## Small extras

- `curl faizanahmed.in` returns a plain-text version of the site (`src/proxy.ts` → `src/app/plain`).
- The top pill and the About stats read the public GitHub API live; no token needed.

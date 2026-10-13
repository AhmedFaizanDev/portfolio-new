// Single source of truth for everything personal on the site.
// Facts come from the three resumes (general / swe / ai), the previous
// portfolio, and the public GitHub repos. Nothing here is estimated.

export const profile = {
  name: "Mohammed Faizan Ahmed",
  firstName: "Faizan",
  role: "Backend, Systems & AI Engineer",
  tagline:
    "I build backends, database engines and AI pipelines, then measure them, so every claim ships with a benchmark.",
  location: "Hyderabad, India",
  email: "info2faizanahmed@gmail.com",
  phone: "+91 93912 81076",
  phoneHref: "tel:+919391281076",
  site: "faizanahmed.in",
  githubUsername: "AhmedFaizanDev",
  openTo: "Open to backend, infrastructure and AI-systems roles.",
};

export const socials = [
  { name: "Email", href: `mailto:${profile.email}`, icon: "email" },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/mohdfaizanahmed/", icon: "linkedin" },
  { name: "GitHub", href: "https://github.com/AhmedFaizanDev", icon: "github" },
  { name: "Instagram", href: "https://www.instagram.com/faizanwav/", icon: "instagram" },
] as const;

export const resumes = [
  { slug: "general", label: "General", note: "Backend, full-stack & applied AI", href: "/resume/general.pdf", file: "Mohammed-Faizan-Ahmed-Resume.pdf" },
  { slug: "swe", label: "Software Engineering", note: "Backend & systems focus", href: "/resume/swe.pdf", file: "Mohammed-Faizan-Ahmed-Resume-SWE.pdf" },
  { slug: "ai", label: "AI / ML", note: "LLM systems & evaluation focus", href: "/resume/ai.pdf", file: "Mohammed-Faizan-Ahmed-Resume-AI.pdf" },
] as const;

export const education = {
  institution: "Mahindra University",
  campus: "Mahindra École Centrale",
  degree: "B.Tech, Computer Science and Engineering",
  period: "2023 – 2027",
  place: "Hyderabad, India",
};

export const experience: {
  role: string;
  company: string;
  period: string;
  /** Machine-readable [start, end] months, for the hero timeline. */
  span: [string, string];
  lane: "work" | "freelance" | "lead";
  blurb: string;
}[] = [
  {
    role: "Artificial Intelligence Intern",
    company: "AI Linc Technologies",
    period: "Jul 2026 – Aug 2026",
    span: ["2026-07", "2026-08"],
    lane: "work",
    blurb:
      "Shipped generative-AI features (video and long-form document pipelines) behind validated, retrying endpoints. Built a 200-prompt eval harness, then used it to cut inference cost 35% with no measured quality loss.",
  },
  {
    role: "Full Stack Engineer",
    company: "AI Linc Technologies",
    period: "Jan 2026 – Jun 2026",
    span: ["2026-01", "2026-06"],
    lane: "work",
    blurb:
      "Owned 20+ backend features end to end, from schema and migrations to API contracts. Put ML models behind versioned REST endpoints and raised test coverage on owned modules from 22% to 68%.",
  },
  {
    role: "Full Stack Developer (Freelance)",
    company: "Catalyst Connect",
    period: "Feb 2026 – Mar 2026",
    span: ["2026-02", "2026-03"],
    lane: "freelance",
    blurb:
      "Built the backend of a paid exhibition and stall-booking platform with JWT auth, RBAC and conflict-free concurrent booking. It ran 3 exhibitions covering 200+ stalls.",
  },
  {
    role: "Backend Developer",
    company: "YuVi Collab Technology",
    period: "Jun 2024 – Sep 2024",
    span: ["2024-06", "2024-09"],
    lane: "work",
    blurb:
      "Built 25+ Django REST endpoints over PostgreSQL. Cut p95 latency on the heaviest list endpoint from 1.4 s to 310 ms by removing N+1 queries and adding composite indexes.",
  },
  {
    role: "Head of Tech & Design",
    company: "Qubit Club, Mahindra University",
    period: "Jul 2025 – Jun 2026",
    span: ["2025-07", "2026-06"],
    lane: "lead",
    blurb:
      "Led a 6-person team that ran the club website and the technical side of 8 workshops and events for 400+ attendees.",
  },
];

export const achievements = [
  {
    title: "Winner · SUDHEE 2025",
    where: "CBIT, Hyderabad",
    when: "Mar 2025",
    blurb:
      "Real-time speech-to-Indian-Sign-Language translator, 1st of 60+ teams. Owned the streaming speech-to-text and gesture rendering, under 1.2 s end to end.",
  },
  {
    title: "3rd Place · AminoVerse",
    where: "Mahindra University",
    when: "Apr 2025",
    blurb:
      "Qdrant vector retrieval and data integration over PDB, UniProt, StringDB and DrugBank for a gene-disease assistant, built in 48 hours.",
  },
  {
    title: "Build · ET AI Hackathon",
    where: "Problem #2, energy resilience",
    when: "2026",
    blurb:
      "Trinetra: a crude-supply command center with a 4-agent glass-box pipeline, where code computes every number and the LLM only narrates.",
  },
  {
    title: "Build · Synchrony Hackathon",
    where: "Fraud detection in lending",
    when: "2026",
    blurb:
      "Cadence: behavioural fraud scoring that compares an applicant's typing on their own details vs document fields, validated on 150 real people.",
  },
];

export const certifications = [
  { name: "OCI 2025 Certified Generative AI Professional", issuer: "Oracle", when: "Oct 2025" },
  { name: "Red Hat Linux Administration III: Automation with Ansible", issuer: "Udemy", when: "Feb 2025" },
];

export const ventures = [
  { name: "Raunaqh", blurb: "A minimalist clothing label I founded and run." },
  { name: "CafeKulture", blurb: "A café-logging app I founded and run." },
];

export const skills = {
  Languages: ["Python", "TypeScript", "JavaScript", "SQL", "C/C++"],
  "Backend & APIs": ["Django", "DRF", "Express", "Node.js", "REST", "JWT", "OAuth 2.0 (PKCE)", "RBAC", "OpenAPI"],
  Data: ["PostgreSQL", "SQLite", "Redis", "Qdrant", "Indexing", "Query optimization", "CDC"],
  "AI & ML": ["PyTorch", "scikit-learn", "XGBoost", "OpenCV", "U-Net", "CMA-ES", "LLM agents", "RAG"],
  Infrastructure: ["Docker", "Compose", "AWS EC2", "Nginx", "GitHub Actions", "Linux", "Ansible", "pytest"],
};

export type Area = "backend" | "data" | "ai" | "ml" | "infra";

export const areaLabels: Record<Area, string> = {
  backend: "Backend & APIs",
  data: "Data & Databases",
  ai: "LLM & Agent Systems",
  ml: "ML & Evaluation",
  infra: "Infra & DevOps",
};

export type Project = {
  id: string;
  name: string;
  short: string;
  badge: string;
  description: string;
  year: string;
  domain: string;
  role: string;
  status: "Shipped" | "Active" | "Hackathon";
  areas: Area[];
  stack: string[];
  metrics: { label: string; value: string }[];
  highlights: string[];
  /** Diagram blocks each highlight describes, by index; drives the scroll-synced walkthrough. */
  steps: number[][];
  repoUrl?: string;
  // Architecture diagram: nodes in flow order; edges [from, to].
  // An edge pointing backwards (to < from) is drawn as a loop.
  diagram: { nodes: string[]; edges: [number, number][] };
};

const gh = (repo: string) => `https://github.com/AhmedFaizanDev/${repo}`;

export const projects: Project[] = [
  {
    id: "ivm",
    name: "ivm",
    short: "SQL views that stay correct by applying only what changed.",
    badge: "Database Engine",
    description:
      "An embeddable Incremental View Maintenance engine. Declare a SQL view once, mutate the base tables, and the view stays correct by applying only the deltas, never recomputing. It implements the DBSP model, where every row carries a signed weight (insert +1, delete −1), so what streaming databases run as a separate service becomes an importable library.",
    year: "2026",
    domain: "Databases",
    role: "Author",
    status: "Active",
    areas: ["data", "backend", "infra"],
    stack: ["Python", "SQL", "SQLite", "DBSP", "pytest", "GitHub Actions"],
    metrics: [
      { label: "Updates / sec", value: "37K" },
      { label: "p99 latency", value: "43 µs" },
      { label: "vs recompute", value: "≈3,600×" },
      { label: "Oracle tests", value: "570" },
    ],
    steps: [[2, 3], [1, 3], [5], [0, 4]],
    highlights: [
      "Incremental projection, filter, INNER/LEFT/RIGHT/FULL joins and GROUP BY with COUNT/SUM/AVG/MIN/MAX.",
      "Handles the retractions that break naive versions: recovering the next MIN/MAX after the current one is deleted, and flipping outer-join rows between matched and NULL-padded.",
      "A wrong aggregate still looks like a valid number, so an independent recompute oracle shares no code with the incremental path. 570 tests assert incremental == oracle after every delta.",
      "37,000 single-row updates/sec at p50 21 µs / p99 43 µs on a 50K-row base: ≈3,600× faster than recompute, still ≈33× when 2% of the base changes.",
    ],
    repoUrl: gh("ivm"),
    diagram: {
      nodes: ["base-table mutations", "Z-set deltas (±1)", "operator graph", "join / aggregate state", "view deltas", "oracle check"],
      edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]],
    },
  },
  {
    id: "tinyrouter",
    name: "TinyRouter",
    short: "A 10K-parameter head that picks which LLM answers, and in what role.",
    badge: "LLM Routing",
    description:
      "A from-scratch replication of the TRINITY coordinator. A frozen 0.6B encoder maps each question to a 1024-dim vector, and a ~10K-parameter head picks which of three open-source LLMs answers and whether it acts as Thinker, Worker or Verifier, over up to 5 turns. The choice is discrete, so the head is trained with separable CMA-ES, an evolution strategy, instead of gradients.",
    year: "2026",
    domain: "AI Systems",
    role: "Author",
    status: "Shipped",
    areas: ["ai", "ml"],
    stack: ["Python", "PyTorch", "sep-CMA-ES", "Fireworks", "NVIDIA H200"],
    metrics: [
      { label: "Avg accuracy", value: "0.858" },
      { label: "Best single LLM", value: "0.835" },
      { label: "MMLU vs random", value: "0.925 / 0.875" },
      { label: "API spend", value: "$62" },
    ],
    steps: [[3, 4], [2], [2], [3]],
    highlights: [
      "Evaluated on 120 held-out questions per task, with every single-model baseline averaged over 3 runs and random routing as a null model.",
      "An oracle-ceiling diagnostic with 95% CIs showed math had +0.049 [0.005, 0.085] of reachable gain the router missed. That pinned the flat result on the router, not the model pool.",
      "Supervised warm-start from per-(question, model) labels, with a shaped training fitness and a strictly binary eval metric.",
      "Every token of the $62 spend tracked from ledgers; training and grading harness covered by 54 offline tests.",
    ],
    repoUrl: gh("Tiny-router"),
    diagram: {
      nodes: ["question", "frozen 0.6B encoder → 1024-d", "10K-param head · CMA-ES", "LLM × role: thinker / worker / verifier", "verifier accepts → answer"],
      edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 2]],
    },
  },
  {
    id: "blackgrid",
    name: "Blackgrid",
    short: "Multi-tenant inventory SaaS with isolation enforced in middleware.",
    badge: "Multi-Tenant SaaS",
    description:
      "One deployment serving many independent businesses. Tenant isolation is enforced centrally rather than left to each view: tenant IDs are signed into the JWT and checked on every tenant-scoped route, and the X-Tenant-ID header is stripped on cross-origin requests to block forgery.",
    year: "2025",
    domain: "Backend",
    role: "Backend Engineer",
    status: "Shipped",
    areas: ["backend", "data", "infra"],
    stack: ["Django 5", "DRF", "PostgreSQL 15", "Redis 7", "Docker", "Nginx", "React"],
    metrics: [
      { label: "REST endpoints", value: "40+" },
      { label: "Backend tests", value: "84" },
      { label: "Roles", value: "3" },
      { label: "Verticals", value: "4" },
    ],
    steps: [[2], [1, 2], [2, 3], [0, 3, 4]],
    highlights: [
      "Owner / Admin / Viewer RBAC with drf-spectacular OpenAPI docs.",
      "84 backend tests, including cross-tenant access attempts that must return 403, so isolation is verified, not assumed.",
      "CSV bulk import with validation; four industry verticals supported through a configuration adapter.",
      "Full stack on Docker Compose: PostgreSQL, Redis and Nginx in front of the API.",
    ],
    repoUrl: gh("inventory-intelligence-saas"),
    diagram: {
      nodes: ["react + nginx", "tenant middleware (signed JWT)", "django rest api", "postgres", "redis"],
      edges: [[0, 1], [1, 2], [2, 3], [2, 4]],
    },
  },
  {
    id: "web-agent",
    name: "Web Agent",
    short: "An LLM agent that browses, fills forms and downloads over raw CDP.",
    badge: "Autonomous Agent",
    description:
      "An agent that navigates real websites, fills forms and downloads files. Each page becomes a semantic tree built from live Chrome DevTools Protocol DOM traversal instead of XPaths, which keeps real parent-child structure, ARIA roles, and text nested in inline elements that flat element lists lose.",
    year: "2026",
    domain: "AI Agents",
    role: "Author",
    status: "Shipped",
    areas: ["ai", "backend"],
    stack: ["Python", "Chrome DevTools Protocol", "OAuth 2.0 PKCE", "WebMCP", "Multi-provider LLMs"],
    metrics: [
      { label: "Task success", value: "64%" },
      { label: "Benchmark", value: "50 tasks" },
      { label: "Websites", value: "10" },
      { label: "LLM providers", value: "8" },
    ],
    steps: [[0, 4], [2, 3], [4]],
    highlights: [
      "OAuth 2.0 Authorization Code + PKCE end to end: local callback server, token exchange, bearer injection, and disk-persisted tokens with silent refresh.",
      "8 LLM providers behind one interface; WebMCP support for discovering tools a site exposes at runtime.",
      "Benchmarked on 50 self-defined tasks across 10 websites: 64% success.",
    ],
    repoUrl: gh("Stagehand"),
    diagram: {
      nodes: ["live page via CDP", "semantic DOM tree", "WebMCP site tools", "LLM planner · 8 providers", "click / fill / download"],
      edges: [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [4, 0]],
    },
  },
  {
    id: "content-pipeline",
    name: "LLM Content Pipeline",
    short: "One topic in, a ≈250-page structured document out, resumable.",
    badge: "Fault-Tolerant Pipeline",
    description:
      "A staged generation pipeline that turns one topic into a ≈250-page structured document through ≈186 sequenced LLM calls. It runs behind an Express API with a CSV-driven batch CLI. Long, expensive runs survive failures: a crash at call 150 resumes without regenerating finished work.",
    year: "2025",
    domain: "AI Systems",
    role: "Author",
    status: "Shipped",
    areas: ["ai", "backend", "infra"],
    stack: ["TypeScript", "Node.js", "Express", "OpenAI", "Docker", "AWS EC2"],
    metrics: [
      { label: "Pages / document", value: "≈250" },
      { label: "LLM calls", value: "≈186" },
      { label: "Cost / document", value: "≈$0.12" },
      { label: "Resume", value: "per unit" },
    ],
    steps: [[5], [3], [2, 4]],
    highlights: [
      "Checkpoint/resume at unit granularity plus retry rounds; object-store state doubles as the idempotency key, so re-running a batch skips finished outputs.",
      "Context chained through micro-summaries instead of full history, keeping coherence inside a bounded window.",
      "Marginal cost held to ≈$0.12 per document through model tiering. Deployed on AWS EC2 with Docker Compose.",
    ],
    diagram: {
      nodes: ["topic / CSV batch", "outline planner", "chapter generator", "context compressor", "assembler", "checkpoint store"],
      edges: [[0, 1], [1, 2], [2, 3], [3, 2], [2, 4], [2, 5]],
    },
  },
  {
    id: "pytor",
    name: "PyTor",
    short: "A BitTorrent client written from the protocol spec on raw TCP.",
    badge: "Networking",
    description:
      "A peer-to-peer file-sharing client implemented directly against the BitTorrent specification: bencode parsing, tracker announce, the peer handshake and length-prefixed message framing over raw TCP sockets, with no BitTorrent library.",
    year: "2024",
    domain: "Systems",
    role: "Author",
    status: "Shipped",
    areas: ["backend"],
    stack: ["Python", "TCP Sockets", "Multithreading", "SHA-1"],
    metrics: [
      { label: "Throughput", value: "4.2 MB/s" },
      { label: "Concurrent peers", value: "30" },
      { label: "Piece check", value: "SHA-1" },
      { label: "Torrent libs", value: "0" },
    ],
    steps: [[3, 4], [2, 3]],
    highlights: [
      "Every downloaded piece is verified against its SHA-1 hash before commit; corrupt pieces are re-requested from other peers.",
      "Thread-per-peer model with a shared piece-assignment queue.",
    ],
    repoUrl: gh("PyTor"),
    diagram: {
      nodes: [".torrent (bencode)", "tracker announce", "peer pool × 30", "piece scheduler", "SHA-1 verify → disk"],
      edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 3]],
    },
  },
  {
    id: "trinetra",
    name: "Trinetra",
    short: "An energy-resilience command center for India's crude supply chain.",
    badge: "ET AI Hackathon 2026",
    description:
      "Turns India's crude-supply crisis response from reactive to anticipatory: it scores risk per shipping corridor, models disruptions like a Hormuz closure, and ranks executable procurement reroutes. The four agents are glass-box: a deterministic, self-checked engine computes every number, and the LLM only classifies, narrates and explains.",
    year: "2026",
    domain: "AI Systems",
    role: "Author",
    status: "Hackathon",
    areas: ["ai", "data"],
    stack: ["Next.js 16", "React 19", "TypeScript", "three.js", "Zustand", "Anthropic SDK"],
    metrics: [
      { label: "Risk forecast", value: "72 h" },
      { label: "Agents", value: "4" },
      { label: "Test suites", value: "35 / 35" },
      { label: "Numbers from LLM", value: "0" },
    ],
    steps: [[0, 1], [2, 3], [5], [5]],
    highlights: [
      "Corridor Risk Index (0–100 per chokepoint) with a 72-hour forecast that turns a score into lead time.",
      "Scenario engine for supply-at-risk, price-shock band and days-of-cover; ranked, sanctions-screened alternative crude sources.",
      "3D globe digital twin with real IMF PortWatch transit counts; runs fully offline on committed fixtures.",
      "Executive copilot answers what-if questions grounded in the engine; it cannot invent a figure.",
    ],
    repoUrl: gh("trinetra-energy-intelligence"),
    diagram: {
      nodes: ["live signals (GDELT, PortWatch)", "signal classifier → risk index", "scenario engine", "procurement orchestrator", "reserve optimiser", "globe + copilot narration"],
      edges: [[0, 1], [1, 2], [2, 3], [2, 4], [3, 5], [4, 5]],
    },
  },
  {
    id: "glacier",
    name: "Glacier U-Net",
    short: "Glacier boundaries segmented from 5-band Sentinel-2 imagery.",
    badge: "Geospatial ML",
    description:
      "A U-Net for binary semantic segmentation of glacier boundaries on 5-band Sentinel-2 imagery, with a custom geospatial loader that tiles multispectral GeoTIFFs and normalizes each band against training-set statistics.",
    year: "2024",
    domain: "Machine Learning",
    role: "Author",
    status: "Shipped",
    areas: ["ml"],
    stack: ["Python", "PyTorch", "U-Net", "Sentinel-2", "GeoTIFF"],
    metrics: [
      { label: "Dice", value: "0.87" },
      { label: "IoU", value: "0.78" },
      { label: "Training patches", value: "1,200" },
      { label: "Spectral bands", value: "5" },
    ],
    steps: [[4], [2]],
    highlights: [
      "Reported Dice and IoU on spatially disjoint held-out regions. Pixel accuracy is uninformative at ≈12% glacier pixels.",
      "Compared BCE, Dice and combined weighted losses, and analysed operating points via ROC.",
    ],
    repoUrl: gh("Glacier-Segmentation-UNet"),
    diagram: {
      nodes: ["5-band GeoTIFFs", "tiling + band norm", "U-Net", "mask stitching", "Dice / IoU on held-out regions"],
      edges: [[0, 1], [1, 2], [2, 3], [3, 4]],
    },
  },
  {
    id: "cadence",
    name: "Cadence",
    short: "Behavioural fraud scoring: does the applicant know their own identity?",
    badge: "Synchrony Hackathon",
    description:
      "Real-time fraud scoring for digital lending. Your own name and date of birth are practised motor sequences; a stranger's are not. Cadence compares keystroke rhythm on identity fields with fields everyone reads off a document, inside one session, so each applicant is their own control. It never reads field contents.",
    year: "2026",
    domain: "Fraud Detection",
    role: "Hackathon build",
    status: "Hackathon",
    areas: ["ml", "backend"],
    stack: ["Python", "FastAPI", "scikit-learn", "pgvector", "React", "Vanilla JS SDK"],
    metrics: [
      { label: "Humans showing effect", value: "148 / 150" },
      { label: "Speed-group spread", value: "6.8% vs 87.6%" },
      { label: "Channels", value: "4" },
      { label: "Auto-declines", value: "0" },
    ],
    steps: [[1], [1], [2, 3, 4]],
    highlights: [
      "Validated on two public keystroke corpora (CMU, KeyRecs): 148 of 150 real people type practised strings faster and more evenly.",
      "A population baseline mostly detects slowness (87.6% spread across speed groups); the within-session ratio holds at 6.8%.",
      "Four independent channels (timing, physical, provenance, structural) cross-check each other; behavioural evidence never auto-declines, it routes to a human.",
    ],
    repoUrl: gh("behavioural-intent"),
    diagram: {
      nodes: ["keystroke SDK (no field contents)", "identity vs document rhythm", "4 independent channels", "corroborate + friction budget", "human review"],
      edges: [[0, 1], [1, 2], [2, 3], [3, 4]],
    },
  },
];

// Smaller builds, listed under the featured grid.
export const moreBuilds = [
  { name: "Speech → ISL Translator", note: "SUDHEE 2025 winner · live speech to Indian Sign Language", stack: "Streaming STT · Gesture rendering", href: gh("Speech-to-Sign-language-Translator") },
  { name: "GST Invoice Extractor", note: "Fully offline vision-LLM extraction of GST invoice fields", stack: "Python · Streamlit · Ollama", href: gh("invoice-parser") },
  { name: "Exhibition Hub", note: "Freelance stall-booking platform, ran 3 exhibitions", stack: "Node.js · Express · PostgreSQL", href: gh("exhibition-hub") },
  { name: "Flight Delay Risk", note: "Leak-free, time-validated delay risk model with SHAP", stack: "XGBoost · SHAP · scikit-learn", href: gh("flight-delay-risk-prediction") },
  { name: "Save Box", note: "Agent skill: X bookmarks → local markdown knowledge base", stack: "Python · Claude Code · Codex", href: gh("savebox") },
  { name: "AminoVerse Assistant", note: "3rd place · vector search over 4 bioinformatics DBs", stack: "Qdrant · Python", href: undefined },
];

export const getProject = (id: string) => projects.find((p) => p.id === id);

import { ArrowUpRight, Layers, Sparkles } from 'lucide-react';

const domains = [
  { name: 'Cloud concepts', value: 84 },
  { name: 'Architecture & services', value: 61 },
  { name: 'Management & governance', value: 73 },
];

function Gauge({ value }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-[132px] w-[132px] shrink-0">
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
        <circle cx="64" cy="64" r={r} fill="none" stroke="hsl(214 24% 91%)" strokeWidth="9" />
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${(value / 100) * c} ${c}`}
        />
        <defs>
          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(189 94% 43%)" />
            <stop offset="100%" stopColor="hsl(202 89% 38%)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-[30px] font-semibold leading-none tracking-tight text-brand-ink">{value}%</span>
        <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Ready</span>
      </div>
    </div>
  );
}

export default function HeroPreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-x-6 -top-6 bottom-10 rounded-[32px] bg-gradient-to-br from-brand-cyan/15 via-transparent to-brand-violet/15 blur-2xl" />
      <div className="aa-panel relative overflow-hidden p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Readiness</p>
            <p className="mt-1 font-heading text-[15px] font-medium text-brand-ink">Evidence: 148 questions</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-mist px-2.5 py-1 text-[11px] font-medium text-brand-azure">
            <Sparkles className="h-3 w-3" /> Illustrative
          </span>
        </div>

        <div className="mt-5 flex items-center gap-5">
          <Gauge value={78} />
          <div className="min-w-0 flex-1 space-y-3">
            {domains.map((d) => (
              <div key={d.name}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-[12px] font-medium text-brand-navy">{d.name}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">{d.value}</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-cyan to-brand-azure"
                    style={{ width: `${d.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-border bg-secondary/60 p-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Revise next</p>
          <p className="mt-1.5 text-[13px] leading-snug text-brand-navy">
            Availability zones vs. region pairs — 2 recent misses.
          </p>
          <div className="mt-2.5 inline-flex items-center gap-1 text-[12px] font-medium text-brand-azure">
            Start a 10-card session <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>

      <div className="aa-panel absolute -bottom-8 right-3 hidden w-[236px] p-4 sm:block">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <Layers className="h-3 w-3" /> Flashcard
          </span>
          <span className="text-[10px] text-muted-foreground">1 / 12</span>
        </div>
        <p className="mt-2.5 font-heading text-[13px] font-medium leading-snug text-brand-ink">
          What does the shared responsibility model divide?
        </p>
        <div className="mt-3 flex gap-1.5">
          {['Hard', 'Good', 'Easy'].map((r, i) => (
            <span
              key={r}
              className={`flex-1 rounded-md py-1 text-center text-[10px] font-medium ${
                i === 1 ? 'bg-brand-ink text-white' : 'bg-secondary text-muted-foreground'
              }`}
            >
              {r}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
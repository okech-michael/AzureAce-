import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Layers, ListChecks, Sparkles } from 'lucide-react';

export default function ReadinessGauge({ readiness, compact = false }) {
  const { score, band, confidence } = readiness;
  const r = 66;
  const c = 2 * Math.PI * r;
  const circumference = c;
  const dash = (Math.max(0, Math.min(100, score)) / 100) * circumference;

  const confidenceCopy = {
    strong: 'Strong evidence',
    moderate: 'Moderate evidence',
    limited: 'Limited evidence',
  }[confidence];

  return (
    <div className="aa-panel overflow-hidden">
      <div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:gap-8 sm:p-6">
        <div className="relative mx-auto h-[164px] w-[164px] shrink-0">
          <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90" role="img" aria-label={`Exam readiness estimate ${score} percent`}>
            <circle cx="80" cy="80" r={r} fill="none" stroke="hsl(214 24% 92%)" strokeWidth="11" />
            <circle
              cx="80"
              cy="80"
              r={r}
              fill="none"
              stroke="url(#readyGrad)"
              strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
            />
            <defs>
              <linearGradient id="readyGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="hsl(189 94% 43%)" />
                <stop offset="100%" stopColor="hsl(202 89% 38%)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-heading text-[38px] font-semibold leading-none tracking-tight text-brand-ink">{score}%</span>
            <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">readiness</span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-mist px-2.5 py-1 text-[11px] font-semibold text-brand-azure">{band}</span>
            <span className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground">{confidenceCopy}</span>
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
            A weighted summary of your practice evidence — recent accuracy, question coverage, domain balance and
            consistency. It is study guidance, not a Microsoft exam score.
          </p>
          {!compact && readiness.recommendations.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {readiness.recommendations.slice(0, 2).map((rec) => (
                <Link
                  key={rec.title}
                  to={rec.to}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-brand-navy transition hover:border-brand-azure/40 hover:text-brand-azure"
                >
                  {rec.action} <ArrowRight className="h-3 w-3" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-border border-t border-border sm:grid-cols-4">
        {readiness.components.map((component) => (
          <div key={component.key} className="px-4 py-3">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.1em] text-muted-foreground">{component.label}</p>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="font-heading text-[16px] font-semibold text-brand-ink">{component.value}%</span>
              <span className="text-[10px] text-muted-foreground">×{component.weight}</span>
            </div>
            <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-brand-azure/70" style={{ width: `${component.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const QUICK_LINKS = [
  { to: '/learn', label: 'Topic library', icon: BookOpen },
  { to: '/flashcards', label: 'Flashcards', icon: Layers },
  { to: '/practice', label: 'Practice', icon: ListChecks },
  { to: '/buddy', label: 'Study buddy', icon: Sparkles },
];
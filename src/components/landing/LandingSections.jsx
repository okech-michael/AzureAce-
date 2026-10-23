import { ArrowUpRight, BookOpen, CheckCircle2, MessageSquareQuote } from 'lucide-react';

export default function LandingSections({ features, loop, domains }) {
  return (
    <>
      <section id="how" className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-azure">The loop</p>
            <h2 className="mt-3 font-heading text-[28px] font-semibold leading-tight tracking-[-0.03em] text-brand-ink sm:text-[34px]">
              Five questions a study tool should answer.
            </h2>
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-muted-foreground">
              Most apps stop at “here is a quiz.” AzureAce keeps track of what you understand, what you keep missing, and
              what deserves the next thirty minutes.
            </p>
          </div>
          <ol className="divide-y divide-border">
            {loop.map(([n, title, body]) => (
              <li key={n} className="grid grid-cols-[44px_1fr] gap-4 py-5 first:pt-0 last:pb-0">
                <span className="font-mono text-[12px] text-brand-azure/70">{n}</span>
                <div>
                  <h3 className="font-heading text-[15px] font-medium text-brand-ink">{title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="features" className="border-y border-border bg-card">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-azure">Built for recall</p>
              <h2 className="mt-3 max-w-lg font-heading text-[28px] font-semibold leading-tight tracking-[-0.03em] text-brand-ink sm:text-[34px]">
                Every feature exists to close a specific gap.
              </h2>
            </div>
            <p className="max-w-xs text-[13px] leading-relaxed text-muted-foreground">
              No streaks for the sake of streaks. No badges for logging in. Just the parts that move a learner toward
              exam day.
            </p>
          </div>
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, body }) => (
              <div key={title} className="group bg-card p-6 transition hover:bg-brand-mist/40">
                <span className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-background text-brand-azure transition group-hover:border-brand-azure/30">
                  <Icon className="h-4 w-4" />
                </span>
                <h3 className="mt-4 font-heading text-[14px] font-semibold text-brand-ink">{title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="coverage" className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid gap-12 md:grid-cols-2 md:items-start">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-azure">Exam coverage</p>
            <h2 className="mt-3 font-heading text-[28px] font-semibold leading-tight tracking-[-0.03em] text-brand-ink sm:text-[34px]">
              Structured around the three published domains.
            </h2>
            <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground">
              Topic content is stored as structured data, so objectives and questions can be revised as Microsoft updates
              the outline — without touching the application.
            </p>
            <div className="mt-6 space-y-3">
              {domains.map((d) => (
                <div key={d.name} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
                  <span className="inline-flex items-center gap-2.5 text-[13px] font-medium text-brand-navy">
                    <BookOpen className="h-4 w-4 text-brand-azure" /> {d.name}
                  </span>
                  <span className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="hidden sm:inline">{d.topics}</span>
                    <span className="rounded-full bg-secondary px-2 py-0.5 font-mono">{d.weight}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="aa-panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <span className="inline-flex items-center gap-2 text-[12px] font-medium text-brand-navy">
                <MessageSquareQuote className="h-4 w-4 text-brand-violet" /> AI Study Buddy
              </span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">Sample</span>
            </div>
            <div className="space-y-4 px-5 py-5">
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-brand-ink px-4 py-2.5 text-[13px] leading-relaxed text-white">
                Explain availability zones like I run a mobile money agency.
              </div>
              <div className="max-w-[92%] space-y-2">
                <p className="rounded-2xl rounded-bl-md border border-border bg-secondary/60 px-4 py-3 text-[13px] leading-relaxed text-brand-navy">
                  Think of one region as a city. Availability zones are separate buildings across that city, each with its
                  own power and network. If one building loses electricity, your agents in the other buildings keep
                  serving customers.
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Illustration only — zone counts vary per region. Always confirm in the Azure documentation.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {['Compare with region pairs', 'Quiz me on this', 'Give an exam-style example'].map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-[11px] text-muted-foreground">
                    {s} <ArrowUpRight className="h-3 w-3" />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-3">
          {[
            ['Server-side grading', 'Correct answers never reach the browser before they should.'],
            ['Private by default', 'Your attempts, reviews and conversations belong to your account only.'],
            ['Useful offline of AI', 'Cards, quizzes and explanations keep working if the assistant is unavailable.'],
          ].map(([title, body]) => (
            <div key={title} className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-mint" />
              <div>
                <p className="text-[13px] font-medium text-brand-ink">{title}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
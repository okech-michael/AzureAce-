import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Layers, LineChart as LineChartIcon, ListChecks, RotateCcw, Target, TrendingUp } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/common/PageHeader';
import StatCard from '@/components/common/StatCard';
import EmptyState from '@/components/common/EmptyState';
import ActionButton from '@/components/common/ActionButton';
import Badge from '@/components/common/Badge';
import ReadinessGauge from '@/components/charts/ReadinessGauge';
import { LoadingBlock } from '@/components/common/Loading';
import { computeReadiness, DOMAIN_LABELS } from '@/lib/readiness';
import { DOMAINS, formatDate, pct, todayKey } from '@/lib/format';

const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: '1px solid hsl(214 24% 89%)',
  fontSize: 12,
  boxShadow: '0 12px 30px -18px rgba(15,23,42,.4)',
};

export default function Progress() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.all([
      base44.entities.QuizAttempt.filter({ status: 'completed' }, { sort: '-completed_at', limit: 30 }),
      base44.entities.TopicMastery.list({ limit: 50 }),
      base44.entities.AttemptAnswer.count({}),
      base44.entities.FlashcardReview.count({}),
      base44.entities.RevisionItem.count({ status: 'open' }),
      base44.entities.StudyTask.filter({ status: 'done' }, { limit: 200 }),
    ])
      .then(([attempts, mastery, answered, cards, revision, doneTasks]) => {
        if (!alive) return;
        setData({
          attempts: attempts.items || attempts,
          mastery: mastery.items || mastery,
          answered,
          cards,
          revision,
          doneTasks: doneTasks.items || doneTasks,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => { alive = false; };
  }, []);

  const readiness = useMemo(
    () => computeReadiness({ attempts: data?.attempts || [], mastery: data?.mastery || [], answeredCount: data?.answered || 0 }),
    [data]
  );

  const trend = useMemo(() => {
    if (!data) return [];
    return [...data.attempts]
      .reverse()
      .slice(-12)
      .map((attempt, i) => ({
        label: attempt.completed_at ? new Date(attempt.completed_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : `#${i + 1}`,
        score: Math.round(Number(attempt.score_percent) || 0),
      }));
  }, [data]);

  const domainData = useMemo(() => {
    if (!data) return [];
    return DOMAINS.map((domain) => {
      const rows = data.mastery.filter((m) => m.domain === domain.key && (m.questions_attempted || 0) > 0);
      const attempted = rows.reduce((sum, r) => sum + (r.questions_attempted || 0), 0);
      const correct = rows.reduce((sum, r) => sum + (r.questions_correct || 0), 0);
      return {
        key: domain.key,
        name: domain.label.replace('Azure ', '').replace(' and services', ''),
        accuracy: attempted ? Math.round((correct / attempted) * 100) : 0,
        attempted,
      };
    });
  }, [data]);

  if (loading) return <LoadingBlock rows={5} />;

  const attempts = data.attempts || [];
  const mastery = data.mastery || [];
  const sortedMastery = [...mastery].sort((a, b) => (a.accuracy || 0) - (b.accuracy || 0));
  const overall = mastery.reduce((sum, m) => sum + (m.questions_attempted || 0), 0) > 0
    ? Math.round(
        (mastery.reduce((sum, m) => sum + (m.questions_correct || 0), 0) /
          mastery.reduce((sum, m) => sum + (m.questions_attempted || 0), 0)) *
          100
      )
    : 0;

  const activityDays = [...new Set(attempts.map((a) => String(a.completed_at || '').slice(0, 10)).filter(Boolean))];
  const last14 = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(Date.now() - (13 - i) * 86400000);
    return { key: todayKey(d), label: d.toLocaleDateString(undefined, { weekday: 'narrow' }), active: activityDays.includes(todayKey(d)) };
  });

  return (
    <div>
      <PageHeader
        eyebrow="Progress"
        title="Where your evidence stands"
        description="One transparent estimate, the components behind it, and the topics that pull it down."
        actions={
          <ActionButton as={Link} to="/practice?mode=assessment" variant="outline">
            <ListChecks className="h-4 w-4" /> Run an assessment
          </ActionButton>
        }
      />

      {attempts.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No completed practice yet"
          body="Finish one practice set and this page fills with real accuracy, domain balance and a readiness estimate — not sample numbers."
          action={<ActionButton as={Link} to="/practice">Start a 10-question set</ActionButton>}
        />
      ) : (
        <>
          <ReadinessGauge readiness={readiness} />

          <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Overall accuracy" value={pct(overall)} hint="All graded answers" icon={Target} tone="mint" />
            <StatCard label="Questions answered" value={data.answered} hint={`${attempts.length} completed attempts`} icon={ListChecks} tone="azure" />
            <StatCard label="Cards reviewed" value={data.cards} hint="Cards with saved recall data" icon={Layers} tone="violet" />
            <StatCard label="Open revision items" value={data.revision} hint="Concepts still to clear" icon={RotateCcw} />
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_1fr]">
            <section className="aa-panel p-5">
              <div className="flex items-center justify-between">
                <h2 className="inline-flex items-center gap-2 font-heading text-[14px] font-semibold text-brand-ink">
                  <LineChartIcon className="h-4 w-4 text-brand-azure" /> Accuracy trend
                </h2>
                <span className="text-[11px] text-muted-foreground">Last {trend.length} attempts</span>
              </div>
              <div className="mt-4 h-[210px] w-full" role="img" aria-label={`Accuracy across the last ${trend.length} attempts`}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend} margin={{ top: 6, right: 8, left: -22, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 24% 92%)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(215 16% 43%)' }} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(215 16% 43%)' }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [`${value}%`, 'Score']} />
                    <Line type="monotone" dataKey="score" stroke="hsl(202 89% 40%)" strokeWidth={2.4} dot={{ r: 3, fill: 'hsl(202 89% 40%)' }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-[11.5px] leading-relaxed text-muted-foreground">
                A rising line with a stable spread is the pattern that moves readiness. One strong attempt is not evidence.
              </p>
            </section>

            <section className="aa-panel p-5">
              <div className="flex items-center justify-between">
                <h2 className="inline-flex items-center gap-2 font-heading text-[14px] font-semibold text-brand-ink">
                  <BarChart3 className="h-4 w-4 text-brand-violet" /> Domain balance
                </h2>
                <span className="text-[11px] text-muted-foreground">Exam weighting</span>
              </div>
              <div className="mt-4 h-[210px] w-full" role="img" aria-label="Accuracy by exam domain">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={domainData} margin={{ top: 6, right: 8, left: -22, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 24% 92%)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 9.5, fill: 'hsl(215 16% 43%)' }} tickLine={false} axisLine={false} interval={0} height={40} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(215 16% 43%)' }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value, _name, payload) => [`${value}% (${payload.payload.attempted} q)`, 'Accuracy']} />
                    <Bar dataKey="accuracy" radius={[6, 6, 0, 0]} maxBarSize={54}>
                      {domainData.map((entry) => (
                        <Cell
                          key={entry.key}
                          fill={entry.accuracy >= 75 ? 'hsl(168 60% 40%)' : entry.accuracy >= 50 ? 'hsl(33 92% 52%)' : 'hsl(0 72% 60%)'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 space-y-1">
                {domainData.map((domain) => (
                  <p key={domain.key} className="flex items-center justify-between text-[11.5px] text-muted-foreground">
                    <span>{DOMAIN_LABELS[domain.key]}</span>
                    <span className="font-mono">{domain.attempted ? pct(domain.accuracy) : '—'}</span>
                  </p>
                ))}
              </div>
            </section>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.4fr]">
            <section className="aa-panel p-5">
              <h2 className="inline-flex items-center gap-2 font-heading text-[14px] font-semibold text-brand-ink">
                <TrendingUp className="h-4 w-4 text-brand-mint" /> Study consistency
              </h2>
              <p className="mt-1 text-[11.5px] text-muted-foreground">Days with a completed attempt in the last two weeks.</p>
              <div className="mt-4 flex items-end gap-1.5">
                {last14.map((day) => (
                  <div key={day.key} className="flex flex-1 flex-col items-center gap-1.5">
                    <div
                      className={`h-14 w-full rounded-md ${day.active ? 'bg-brand-azure' : 'bg-secondary'}`}
                      title={`${day.key}: ${day.active ? 'practised' : 'no practice'}`}
                    />
                    <span className="text-[9.5px] text-muted-foreground">{day.label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2 border-t border-border pt-3 text-[12px]">
                <p className="flex items-center justify-between text-muted-foreground">
                  <span>Plan tasks completed</span><span className="font-mono text-brand-navy">{data.doneTasks.length}</span>
                </p>
                <p className="flex items-center justify-between text-muted-foreground">
                  <span>Attempts completed</span><span className="font-mono text-brand-navy">{attempts.length}</span>
                </p>
                <p className="flex items-center justify-between text-muted-foreground">
                  <span>Confidence in estimate</span>
                  <Badge tone={readiness.confidence === 'strong' ? 'mint' : readiness.confidence === 'moderate' ? 'amber' : 'neutral'}>
                    {readiness.confidence}
                  </Badge>
                </p>
              </div>
            </section>

            <section className="aa-panel p-5">
              <h2 className="font-heading text-[14px] font-semibold text-brand-ink">Topic mastery</h2>
              <p className="mt-1 text-[11.5px] text-muted-foreground">Sorted weakest first — tap any row to revise it.</p>
              <div className="mt-3 overflow-hidden rounded-xl border border-border">
                <table className="w-full text-left">
                  <thead className="bg-secondary/60">
                    <tr>
                      <th className="px-3 py-2 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Topic</th>
                      <th className="px-3 py-2 text-right text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Q</th>
                      <th className="px-3 py-2 text-right text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sortedMastery.map((row) => (
                      <tr key={row.id} className="transition hover:bg-brand-mist/40">
                        <td className="px-3 py-2">
                          <Link to={`/learn/${row.topic_slug}`} className="text-[12px] font-medium text-brand-navy hover:text-brand-azure">
                            {row.topic_title}
                          </Link>
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-[11px] text-muted-foreground">{row.questions_attempted}</td>
                        <td className="px-3 py-2 text-right">
                          <span className={`text-[11.5px] font-semibold ${row.accuracy >= 75 ? 'text-emerald-600' : row.accuracy >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                            {pct(row.accuracy)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Link to="/review" className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-brand-azure hover:text-brand-ink">
                Review open mistakes <ArrowRight className="h-3 w-3" />
              </Link>
            </section>
          </div>

          <section className="mt-5 aa-panel p-5">
            <h2 className="font-heading text-[14px] font-semibold text-brand-ink">How this estimate is calculated</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {readiness.components.map((component) => (
                <div key={component.key} className="rounded-xl border border-border p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[12.5px] font-medium text-brand-ink">{component.label}</p>
                    <span className="font-mono text-[11px] text-muted-foreground">{Math.round(component.weight * 100)}% weight</span>
                  </div>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">{component.detail}</p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-brand-azure/70" style={{ width: `${component.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              The estimate is study guidance built from your own practice activity. It is not a Microsoft examination
              score, and it cannot guarantee a pass. Confidence rises as coverage and attempts increase.
            </p>
            {readiness.recommendations.length > 0 && (
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {readiness.recommendations.map((rec) => (
                  <Link
                    key={rec.title}
                    to={rec.to}
                    className="group rounded-xl border border-border bg-secondary/40 p-3 transition hover:border-brand-azure/40"
                  >
                    <p className="text-[12.5px] font-medium text-brand-ink group-hover:text-brand-azure">{rec.title}</p>
                    <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">{rec.body}</p>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <p className="mt-4 text-[11px] text-muted-foreground">
            Latest attempt: {attempts[0]?.completed_at ? formatDate(attempts[0].completed_at) : '—'} · Scores shown are practice results, not exam scores.
          </p>
        </>
      )}
    </div>
  );
}
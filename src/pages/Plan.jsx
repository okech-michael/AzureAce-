import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, Check, Clock, RefreshCw, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/common/PageHeader';
import ActionButton from '@/components/common/ActionButton';
import Badge from '@/components/common/Badge';
import EmptyState from '@/components/common/EmptyState';
import { LoadingBlock } from '@/components/common/Loading';
import { buildSchedule, planSummary } from '@/lib/plan';
import { daysUntil } from '@/lib/srs';
import { formatDate, relativeDay, todayKey } from '@/lib/format';

const TYPE_META = {
  study: { label: 'Read', tone: 'azure', href: (task) => `/learn/${task.topic_slug}` },
  flashcards: { label: 'Cards', tone: 'violet', href: (task) => `/flashcards?topic=${task.topic_slug}` },
  practice: { label: 'Practice', tone: 'mint', href: (task) => `/practice?topic=${task.topic_slug}` },
  review: { label: 'Revision', tone: 'amber', href: () => '/review' },
  assessment: { label: 'Assessment', tone: 'rose', href: () => '/practice?mode=assessment' },
};

export default function Plan() {
  const [state, setState] = useState({ loading: true, profile: null, topics: [], mastery: [], plan: null, tasks: [], revision: 0 });
  const [generating, setGenerating] = useState(false);
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const [profilePage, topicPage, mastery, planPage, revision] = await Promise.all([
      base44.entities.LearnerProfile.list({ limit: 1 }),
      base44.entities.Topic.list({ sort: 'order', limit: 50 }),
      base44.entities.TopicMastery.list({ limit: 50 }),
      base44.entities.StudyPlan.filter({ is_active: true }, { sort: '-generated_at', limit: 1 }),
      base44.entities.RevisionItem.count({ status: 'open' }),
    ]);
    const plan = (planPage.items || planPage)[0] || null;
    let tasks = [];
    if (plan) {
      const taskPage = await base44.entities.StudyTask.filter({ plan_id: plan.id }, { limit: 300 });
      tasks = taskPage.items || taskPage;
    }
    setState({
      loading: false,
      profile: (profilePage.items || profilePage)[0] || null,
      topics: topicPage.items || topicPage,
      mastery: mastery.items || mastery,
      plan,
      tasks,
      revision,
    });
  };

  useEffect(() => {
    let alive = true;
    load().catch(() => { if (alive) setState((s) => ({ ...s, loading: false })); });
    return () => { alive = false; };
  }, []);

  const generate = async () => {
    setGenerating(true);
    setError('');
    try {
      const profile = state.profile || {};
      const schedule = buildSchedule({
        topics: state.topics,
        mastery: state.mastery,
        profile,
        revisionCount: state.revision,
      });
      if (!schedule.tasks.length) throw new Error('There is no content to plan yet.');

      if (state.plan) {
        await base44.entities.StudyPlan.update(state.plan.id, { is_active: false });
        await base44.entities.StudyTask.deleteMany({ plan_id: state.plan.id });
      }

      const created = await base44.entities.StudyPlan.create({
        exam_date: profile.exam_date || '',
        minutes_per_day: profile.minutes_per_day || 45,
        session_length: profile.session_length || 25,
        level: profile.level || 'new',
        focus_topic_slugs: (profile.weak_topic_slugs || []).slice(0, 12),
        summary: planSummary({ ...schedule, profile }),
        generated_at: new Date().toISOString(),
        is_active: true,
      });

      await base44.entities.StudyTask.bulkCreate(
        schedule.tasks.map((task) => ({ ...task, plan_id: created.id }))
      );

      await load();
    } catch (err) {
      setError(err.message || 'Could not generate the plan.');
    } finally {
      setGenerating(false);
    }
  };

  const toggleTask = async (task) => {
    setSavingId(task.id);
    const nextStatus = task.status === 'done' ? 'pending' : 'done';
    const updated = await base44.entities.StudyTask.update(task.id, { status: nextStatus });
    setState((prev) => ({ ...prev, tasks: prev.tasks.map((t) => (t.id === task.id ? { ...t, ...updated } : t)) }));
    setSavingId('');
  };

  const grouped = useMemo(() => {
    const map = new Map();
    state.tasks.forEach((task) => {
      if (!map.has(task.date)) map.set(task.date, []);
      map.get(task.date).push(task);
    });
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [state.tasks]);

  if (state.loading) return <LoadingBlock rows={5} />;

  const profile = state.profile;
  const countdown = daysUntil(profile?.exam_date);
  const doneCount = state.tasks.filter((t) => t.status === 'done').length;

  return (
    <div>
      <PageHeader
        eyebrow="Study plan"
        title="A week your schedule can hold"
        description="Sessions are built from your exam date, available time and the topics where your evidence is weakest."
        actions={
          <>
            <ActionButton as={Link} to="/settings" variant="outline">Preferences</ActionButton>
            <ActionButton onClick={generate} disabled={generating || !state.topics.length}>
              <RefreshCw className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
              {generating ? 'Building…' : state.plan ? 'Recalculate plan' : 'Generate plan'}
            </ActionButton>
          </>
        }
      />

      {error && (
        <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-[12.5px] text-destructive">{error}</div>
      )}

      {!profile?.onboarding_completed && (
        <div className="mb-5 rounded-2xl border border-brand-azure/25 bg-brand-mist p-5">
          <p className="font-heading text-[14px] font-semibold text-brand-ink">Set your preferences first</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-brand-navy/70">
            Without an exam date and daily study time, the plan falls back to a generic two-week schedule.
          </p>
          <ActionButton as={Link} to="/onboarding" size="sm" className="mt-3">Complete setup</ActionButton>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="aa-panel p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.13em] text-muted-foreground">Exam</p>
          <p className="mt-2 font-heading text-[19px] font-semibold text-brand-ink">
            {profile?.exam_date ? formatDate(profile.exam_date) : 'Not set'}
          </p>
          <p className="mt-1 text-[11.5px] text-muted-foreground">
            {countdown === null ? 'Add a date in Settings' : countdown >= 0 ? `${countdown} days remaining` : 'That date has passed'}
          </p>
        </div>
        <div className="aa-panel p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.13em] text-muted-foreground">Daily commitment</p>
          <p className="mt-2 font-heading text-[19px] font-semibold text-brand-ink">{profile?.minutes_per_day || 45} min</p>
          <p className="mt-1 text-[11.5px] text-muted-foreground">{profile?.session_length || 25} min sessions</p>
        </div>
        <div className="aa-panel p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.13em] text-muted-foreground">Plan progress</p>
          <p className="mt-2 font-heading text-[19px] font-semibold text-brand-ink">
            {state.tasks.length ? `${doneCount}/${state.tasks.length}` : '—'}
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-brand-azure"
              style={{ width: `${state.tasks.length ? (doneCount / state.tasks.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {!state.plan ? (
        <div className="mt-5">
          <EmptyState
            icon={CalendarClock}
            title="No study plan yet"
            body="Generate a plan and AzureAce will schedule reading, flashcards, practice and periodic assessments across the days you actually have."
            action={<ActionButton onClick={generate} disabled={generating}>{generating ? 'Building…' : 'Generate my plan'}</ActionButton>}
          />
        </div>
      ) : (
        <>
          <div className="mt-5 rounded-2xl bg-brand-ink p-5 text-white">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="ink" className="border-white/20 bg-white/10 text-brand-cyan">
                <Sparkles className="h-3 w-3" /> Guidance, not a guarantee
              </Badge>
              <span className="text-[11px] text-white/50">Generated {formatDate(state.plan.generated_at)}</span>
            </div>
            <p className="mt-2.5 text-[13px] leading-relaxed text-white/80">{state.plan.summary}</p>
          </div>

          <div className="mt-5 space-y-4">
            {grouped.map(([date, tasks]) => {
              const isToday = date === todayKey();
              return (
                <section key={date} className={`aa-panel p-4 ${isToday ? 'border-brand-azure/40 ring-1 ring-brand-azure/15' : ''}`}>
                  <div className="flex items-center justify-between">
                    <h2 className="inline-flex items-center gap-2 font-heading text-[13px] font-semibold text-brand-ink">
                      {relativeDay(`${date}T09:00:00`)}
                      {isToday && <Badge tone="azure">Today</Badge>}
                    </h2>
                    <span className="text-[11px] text-muted-foreground">
                      {tasks.reduce((sum, t) => sum + (t.duration_min || 0), 0)} min
                    </span>
                  </div>

                  <ul className="mt-2.5 space-y-1.5">
                    {tasks.map((task) => {
                      const meta = TYPE_META[task.type] || TYPE_META.study;
                      const done = task.status === 'done';
                      return (
                        <li key={task.id} className="flex items-center gap-2.5 rounded-xl border border-border px-2.5 py-2">
                          <button
                            type="button"
                            onClick={() => toggleTask(task)}
                            disabled={savingId === task.id}
                            aria-pressed={done}
                            aria-label={done ? `Mark ${task.title} as not done` : `Mark ${task.title} as done`}
                            className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border transition ${
                              done ? 'border-brand-mint bg-brand-mint text-white' : 'border-input text-transparent hover:border-brand-azure'
                            }`}
                          >
                            <Check className="h-3 w-3" />
                          </button>
                          <div className="min-w-0 flex-1">
                            <p className={`truncate text-[12.5px] font-medium ${done ? 'text-muted-foreground line-through' : 'text-brand-navy'}`}>
                              {task.title}
                            </p>
                            <p className="truncate text-[10.5px] text-muted-foreground">
                              {task.duration_min} min · {task.note}
                            </p>
                          </div>
                          <Badge tone={meta.tone}>{meta.label}</Badge>
                          <Link
                            to={meta.href(task)}
                            className="hidden shrink-0 text-[11px] font-medium text-brand-azure hover:text-brand-ink sm:inline"
                          >
                            Open
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <p className="inline-flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> Missed a day? Recalculate and the remaining days reshuffle around what is still weak.
            </p>
            <ActionButton size="sm" variant="outline" onClick={generate} disabled={generating}>
              <RefreshCw className={`h-3.5 w-3.5 ${generating ? 'animate-spin' : ''}`} /> Recalculate
            </ActionButton>
          </div>
        </>
      )}

      <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
        Plan sessions are study guidance built from your own practice data and the time you said you have. They are not a
        prediction of your exam result, and missing a day only changes the schedule — not your readiness.
      </p>
    </div>
  );
}
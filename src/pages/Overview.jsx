import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Flame,
  Layers,
  ListChecks,
  RotateCcw,
  Target,
  Timer,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/common/PageHeader';
import StatCard from '@/components/common/StatCard';
import EmptyState from '@/components/common/EmptyState';
import ActionButton from '@/components/common/ActionButton';
import Badge from '@/components/common/Badge';
import ReadinessGauge from '@/components/charts/ReadinessGauge';
import { LoadingBlock } from '@/components/common/Loading';
import { computeReadiness } from '@/lib/readiness';
import { formatDate, pct, streakFromDates, todayKey } from '@/lib/format';

export default function Overview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const [profilePage, attemptsPage, mastery, answered, cards, revision, tasks, topics] = await Promise.all([
        base44.entities.LearnerProfile.list({ limit: 1 }),
        base44.entities.QuizAttempt.filter({ status: 'completed' }, { sort: '-completed_at', limit: 6 }),
        base44.entities.TopicMastery.list({ limit: 50 }),
        base44.entities.AttemptAnswer.count({}),
        base44.entities.FlashcardReview.count({}),
        base44.entities.RevisionItem.count({ status: 'open' }),
        base44.entities.StudyTask.filter({ date: todayKey() }),
        base44.entities.Topic.list({ sort: 'order', limit: 20 }),
      ]);
      if (!alive) return;
      setData({
        profile: (profilePage.items || profilePage)[0] || null,
        attempts: attemptsPage.items || attemptsPage,
        mastery: mastery.items || mastery,
        answered,
        cards,
        revision,
        tasks,
        topics,
      });
      setLoading(false);
    };
    load().catch(() => setLoading(false));
    return () => { alive = false; };
  }, []);

  const readiness = useMemo(
    () => computeReadiness({ attempts: data?.attempts || [], mastery: data?.mastery || [], answeredCount: data?.answered || 0 }),
    [data]
  );

  if (loading) {
    return (
      <div>
        <div className="mb-6 h-10 w-56 animate-pulse rounded-lg bg-secondary" />
        <LoadingBlock rows={4} />
      </div>
    );
  }

  const profile = data?.profile;
  const attempts = data?.attempts || [];
  const mastery = data?.mastery || [];
  const weakTopics = [...mastery]
    .filter((m) => (m.questions_attempted || 0) > 0)
    .sort((a, b) => (a.accuracy || 0) - (b.accuracy || 0))
    .slice(0, 3);
  const streak = streakFromDates(attempts.map((a) => a.completed_at || a.created_date));
  const overallAccuracy = mastery.length
    ? Math.round(
        mastery.reduce((sum, m) => sum + (m.questions_correct || 0), 0) /
          Math.max(1, mastery.reduce((sum, m) => sum + (m.questions_attempted || 0), 0)) *
          100
      )
    : 0;
  const pendingToday = (data?.tasks || []).filter((t) => t.status !== 'done' && t.status !== 'skipped');
  const firstName = (profile?.display_name || '').split(' ')[0];

  return (
    <div>
      <PageHeader
        eyebrow="Overview"
        title={firstName ? `Good to see you, ${firstName}` : 'Your study overview'}
        description="Where you stand, what needs attention, and the next useful thing to do."
        actions={
          <>
            <ActionButton as={Link} to="/flashcards" variant="outline">
              <Layers className="h-4 w-4" /> Flashcards
            </ActionButton>
            <ActionButton as={Link} to="/practice" variant="azure">
              <ListChecks className="h-4 w-4" /> Practise
            </ActionButton>
          </>
        }
      />

      {!profile?.onboarding_completed && (
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-brand-azure/25 bg-brand-mist p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-brand-azure">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="font-heading text-[14px] font-semibold text-brand-ink">Finish setting up your study plan</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-brand-navy/70">
                Add your exam date, study time and weak topics so recommendations are built around your week.
              </p>
            </div>
          </div>
          <ActionButton as={Link} to="/onboarding" size="sm">
            Set preferences <ArrowRight className="h-3.5 w-3.5" />
          </ActionButton>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <ReadinessGauge readiness={readiness} />

        <div className="aa-panel flex flex-col p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Today</p>
            <Link to="/plan" className="text-[11.5px] font-medium text-brand-azure hover:text-brand-ink">Full plan</Link>
          </div>

          {pendingToday.length ? (
            <ul className="mt-3 flex-1 space-y-2.5">
              {pendingToday.slice(0, 3).map((task) => (
                <li key={task.id} className="flex items-start gap-2.5 rounded-xl border border-border bg-background/60 p-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-brand-mist text-brand-azure">
                    <Timer className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] font-medium text-brand-ink">{task.title}</p>
                    <p className="text-[11px] text-muted-foreground">{task.duration_min} min · {task.type}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
              <CalendarClock className="h-5 w-5 text-muted-foreground" />
              <p className="mt-2 text-[12.5px] text-muted-foreground">
                {data?.tasks?.length ? 'Everything scheduled for today is done.' : 'No sessions scheduled for today.'}
              </p>
              <ActionButton as={Link} to="/plan" variant="outline" size="sm" className="mt-3">
                Build a plan
              </ActionButton>
            </div>
          )}

          {readiness.recommendations[0] && (
            <div className="mt-4 rounded-xl bg-brand-ink p-3.5 text-white">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-cyan">Recommended next</p>
              <p className="mt-1.5 text-[12.5px] leading-snug text-white/85">{readiness.recommendations[0].title}</p>
              <Link
                to={readiness.recommendations[0].to}
                className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-brand-cyan hover:text-white"
              >
                {readiness.recommendations[0].action} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Questions answered" value={data.answered} hint="Across all practice attempts" icon={ListChecks} tone="azure" />
        <StatCard label="Overall accuracy" value={pct(overallAccuracy)} hint="All graded answers" icon={TrendingUp} tone="mint" />
        <StatCard label="Cards reviewed" value={data.cards} hint="Saved spaced-repetition states" icon={Layers} tone="violet" />
        <StatCard
          label="Study streak"
          value={streak ? `${streak} day${streak === 1 ? '' : 's'}` : '—'}
          hint={streak ? 'Consecutive days with practice' : 'Complete an attempt to start'}
          icon={Flame}
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="aa-panel p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-[14px] font-semibold text-brand-ink">Topics needing attention</h2>
            <Link to="/progress" className="text-[11.5px] font-medium text-brand-azure hover:text-brand-ink">All topics</Link>
          </div>

          {weakTopics.length ? (
            <ul className="mt-4 space-y-3">
              {weakTopics.map((topic) => (
                <li key={topic.id}>
                  <Link to={`/learn/${topic.topic_slug}`} className="group block">
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-[13px] font-medium text-brand-navy group-hover:text-brand-azure">
                        {topic.topic_title}
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground">{pct(topic.accuracy)}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className={`h-full rounded-full ${topic.accuracy >= 75 ? 'bg-brand-mint' : topic.accuracy >= 50 ? 'bg-brand-amber' : 'bg-rose-400'}`}
                        style={{ width: `${Math.max(3, topic.accuracy || 0)}%` }}
                      />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4">
              <EmptyState
                icon={Target}
                title="No topic data yet"
                body="Answer a few practice questions and your weakest topics will surface here."
                action={<ActionButton as={Link} to="/practice" size="sm" variant="outline">Start practice</ActionButton>}
                className="border-0 bg-transparent py-6"
              />
            </div>
          )}

          {data.revision > 0 && (
            <Link
              to="/review"
              className="mt-4 flex items-center justify-between rounded-xl border border-border bg-secondary/50 px-3.5 py-2.5 transition hover:border-brand-azure/40"
            >
              <span className="inline-flex items-center gap-2 text-[12.5px] font-medium text-brand-navy">
                <RotateCcw className="h-3.5 w-3.5 text-brand-azure" /> {data.revision} concept{data.revision === 1 ? '' : 's'} to revisit
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
          )}
        </section>

        <section className="aa-panel p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-[14px] font-semibold text-brand-ink">Recent practice</h2>
            <Link to="/practice" className="text-[11.5px] font-medium text-brand-azure hover:text-brand-ink">History</Link>
          </div>

          {attempts.length ? (
            <ul className="mt-3 divide-y divide-border">
              {attempts.slice(0, 4).map((attempt) => (
                <li key={attempt.id} className="py-2.5 first:pt-0 last:pb-0">
                  <Link to={`/practice/review/${attempt.id}`} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[12.5px] font-medium text-brand-navy">
                        {attempt.mode === 'topic' ? 'Topic practice' : attempt.mode === 'assessment' ? 'Mixed assessment' : attempt.mode === 'weak-areas' ? 'Weak areas' : 'Mixed practice'}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatDate(attempt.completed_at)} · {attempt.correct_count || 0}/{attempt.total_questions || 0} correct
                      </p>
                    </div>
                    <Badge tone={(attempt.score_percent || 0) >= 75 ? 'mint' : (attempt.score_percent || 0) >= 50 ? 'amber' : 'rose'}>
                      {pct(attempt.score_percent)}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4">
              <EmptyState
                icon={BookOpen}
                title="Your first attempt is waiting"
                body="Ten mixed questions is enough to start building real progress data."
                action={<ActionButton as={Link} to="/practice" size="sm">Start a practice set</ActionButton>}
                className="border-0 bg-transparent py-6"
              />
            </div>
          )}
        </section>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          { to: '/learn', icon: BookOpen, title: 'Topic library', body: 'Objectives, key terms and examples for all 12 topics.' },
          { to: '/review', icon: CheckCircle2, title: 'Learn from mistakes', body: 'Every wrong answer becomes a revision item.' },
          { to: '/buddy', icon: Sparkles, title: 'Ask the study buddy', body: 'Simpler explanations, comparisons and analogies.' },
        ].map(({ to, icon: Icon, title, body }) => (
          <Link key={to} to={to} className="aa-panel group flex items-start gap-3 p-4 transition hover:border-brand-azure/40">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-mist text-brand-azure">
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-brand-ink group-hover:text-brand-azure">{title}</p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">{body}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
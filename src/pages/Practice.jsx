import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowRight, Clock, History, ListChecks, RotateCcw, Timer, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/common/PageHeader';
import ActionButton from '@/components/common/ActionButton';
import Badge from '@/components/common/Badge';
import EmptyState from '@/components/common/EmptyState';
import { LoadingBlock } from '@/components/common/Loading';
import { formatDate, pct } from '@/lib/format';

const COUNTS = [10, 15, 20, 30];

export default function Practice() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  const [mode, setMode] = useState('mixed');
  const [topicId, setTopicId] = useState('');
  const [difficulty, setDifficulty] = useState('any');
  const [count, setCount] = useState(10);
  const [timed, setTimed] = useState(false);
  const [minutes, setMinutes] = useState(15);

  useEffect(() => {
    let alive = true;
    Promise.all([
      base44.entities.Topic.list({ sort: 'order', limit: 50 }),
      base44.entities.QuizAttempt.filter({}, { sort: '-created_date', limit: 12 }),
    ])
      .then(([topicPage, attemptRows]) => {
        if (!alive) return;
        const topicList = topicPage.items || topicPage;
        setTopics(topicList);
        setAttempts(attemptRows.items || attemptRows);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const slug = searchParams.get('topic');
    const requestedMode = searchParams.get('mode');
    if (requestedMode === 'assessment') {
      setMode('assessment');
      setCount(20);
      setTimed(true);
      setMinutes(25);
    }
    if (slug) {
      const match = topics.find((t) => t.slug === slug);
      if (match) {
        setMode('topic');
        setTopicId(match.id);
      }
    }
  }, [searchParams, topics]);

  const completed = useMemo(() => attempts.filter((a) => a.status === 'completed'), [attempts]);
  const inProgress = useMemo(() => attempts.filter((a) => a.status === 'in_progress'), [attempts]);

  const start = async () => {
    setError('');
    if (mode === 'topic' && !topicId) {
      setError('Choose a topic for topic-specific practice.');
      return;
    }
    setStarting(true);
    try {
      const payload = {
        mode: mode === 'topic' ? 'topic' : mode,
        topic_ids: mode === 'topic' && topicId ? [topicId] : [],
        difficulty,
        count: mode === 'assessment' ? Math.max(count, 15) : count,
        timed: mode === 'assessment' ? true : timed,
        time_limit_minutes: mode === 'assessment' ? Math.max(minutes, 20) : minutes,
      };
      const response = await base44.functions.invoke('startQuiz', payload);
      if (response.data?.error) throw new Error(response.data.error);
      navigate(`/practice/session/${response.data.attempt.id}`);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Could not start the practice set.');
      setStarting(false);
    }
  };

  if (loading) return <LoadingBlock rows={4} />;

  return (
    <div>
      <PageHeader
        eyebrow="Practice"
        title="Build exam evidence"
        description="Answers are graded on the server and every question is explained afterwards. Misses feed your revision queue automatically."
        actions={
          <ActionButton as={Link} to="/review" variant="outline">
            <RotateCcw className="h-4 w-4" /> Review mistakes
          </ActionButton>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <section className="aa-panel p-5 sm:p-6">
          <h2 className="font-heading text-[15px] font-semibold text-brand-ink">New practice set</h2>
          <p className="mt-1 text-[12.5px] text-muted-foreground">Question counts vary with what the bank holds for your filters.</p>

          <div className="mt-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">Mode</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {[
                { key: 'mixed', title: 'Mixed topics', body: 'Across all three exam domains', icon: ListChecks },
                { key: 'topic', title: 'Single topic', body: 'Drill one area properly', icon: Zap },
                { key: 'weak-areas', title: 'Weak areas', body: 'From your weakest practised topics', icon: RotateCcw },
                { key: 'assessment', title: 'Timed assessment', body: 'Mixed, timed, exam-style', icon: Timer },
              ].map(({ key, title, body, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setMode(key);
                    if (key === 'assessment') { setTimed(true); setCount(20); }
                  }}
                  aria-pressed={mode === key}
                  className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition ${
                    mode === key ? 'border-brand-azure bg-brand-mist/60' : 'border-border bg-card hover:border-brand-azure/40'
                  }`}
                >
                  <Icon className={`mt-0.5 h-4 w-4 ${mode === key ? 'text-brand-azure' : 'text-muted-foreground'}`} />
                  <span>
                    <span className="block text-[12.5px] font-medium text-brand-ink">{title}</span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">{body}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {mode === 'topic' && (
            <div className="mt-4">
              <label htmlFor="practice-topic" className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
                Topic
              </label>
              <select
                id="practice-topic"
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-xl border border-input bg-card px-3 text-[13px] text-brand-ink focus:border-brand-azure/50 focus:outline-none"
              >
                <option value="">Choose a topic</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>{topic.title}</option>
                ))}
              </select>
            </div>
          )}

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">Difficulty</p>
              <div className="mt-2 flex gap-1.5">
                {['any', 'easy', 'medium', 'hard'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    aria-pressed={difficulty === level}
                    className={`flex-1 rounded-lg border px-2 py-1.5 text-[11.5px] font-medium capitalize transition ${
                      difficulty === level ? 'border-brand-ink bg-brand-ink text-white' : 'border-border text-muted-foreground hover:text-brand-ink'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">Questions</p>
              <div className="mt-2 flex gap-1.5">
                {COUNTS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setCount(value)}
                    aria-pressed={count === value}
                    className={`flex-1 rounded-lg border px-2 py-1.5 text-[11.5px] font-medium transition ${
                      count === value ? 'border-brand-ink bg-brand-ink text-white' : 'border-border text-muted-foreground hover:text-brand-ink'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 rounded-xl border border-border bg-secondary/40 p-3.5 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2.5 text-[12.5px] font-medium text-brand-navy">
              <input
                type="checkbox"
                checked={timed || mode === 'assessment'}
                disabled={mode === 'assessment'}
                onChange={(e) => setTimed(e.target.checked)}
                className="h-4 w-4 rounded border-input accent-[hsl(202,89%,34%)]"
              />
              <Clock className="h-3.5 w-3.5 text-muted-foreground" /> Timed practice
            </label>
            {(timed || mode === 'assessment') && (
              <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
                Minutes
                <input
                  type="number"
                  min={5}
                  max={90}
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  className="h-8 w-16 rounded-lg border border-input bg-card px-2 text-[12px] text-brand-ink focus:border-brand-azure/50 focus:outline-none"
                />
              </label>
            )}
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-[12.5px] text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          <ActionButton onClick={start} disabled={starting} size="lg" className="mt-5 w-full">
            {starting ? 'Preparing your set…' : `Start ${count}-question set`}
            {!starting && <ArrowRight className="h-4 w-4" />}
          </ActionButton>
        </section>

        <div className="space-y-5">
          {inProgress.length > 0 && (
            <section className="aa-panel border-brand-azure/30 p-5">
              <h2 className="font-heading text-[14px] font-semibold text-brand-ink">Continue where you left off</h2>
              <ul className="mt-3 space-y-2">
                {inProgress.map((attempt) => (
                  <li key={attempt.id} className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-[12.5px] font-medium text-brand-navy">
                        {attempt.total_questions} questions · {attempt.answered_count || 0} answered
                      </p>
                      <p className="text-[11px] text-muted-foreground">Started {formatDate(attempt.started_at)}</p>
                    </div>
                    <ActionButton as={Link} to={`/practice/session/${attempt.id}`} size="sm" variant="outline">
                      Resume
                    </ActionButton>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="aa-panel p-5">
            <div className="flex items-center justify-between">
              <h2 className="inline-flex items-center gap-2 font-heading text-[14px] font-semibold text-brand-ink">
                <History className="h-4 w-4 text-muted-foreground" /> Attempt history
              </h2>
              <span className="text-[11px] text-muted-foreground">{completed.length} completed</span>
            </div>

            {completed.length === 0 ? (
              <div className="mt-3">
                <EmptyState
                  icon={ListChecks}
                  title="No completed attempts"
                  body="Your first set will appear here with a full breakdown of every answer."
                  className="border-0 bg-transparent py-8"
                />
              </div>
            ) : (
              <ul className="mt-3 divide-y divide-border">
                {completed.slice(0, 8).map((attempt) => (
                  <li key={attempt.id} className="py-2.5">
                    <Link to={`/practice/review/${attempt.id}`} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[12.5px] font-medium text-brand-navy">
                          {attempt.mode === 'assessment' ? 'Timed assessment' : attempt.mode === 'topic' ? 'Topic practice' : attempt.mode === 'weak-areas' ? 'Weak areas' : 'Mixed practice'}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatDate(attempt.completed_at)} · {attempt.total_questions} questions
                        </p>
                      </div>
                      <Badge tone={(attempt.score_percent || 0) >= 75 ? 'mint' : (attempt.score_percent || 0) >= 50 ? 'amber' : 'rose'}>
                        {pct(attempt.score_percent)}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
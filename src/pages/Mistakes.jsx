import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ListChecks, RotateCcw, XCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/common/PageHeader';
import ActionButton from '@/components/common/ActionButton';
import Badge from '@/components/common/Badge';
import EmptyState from '@/components/common/EmptyState';
import { LoadingBlock } from '@/components/common/Loading';
import { formatDate } from '@/lib/format';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function Mistakes() {
  const [revision, setRevision] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('queue');
  const [topicFilter, setTopicFilter] = useState('all');
  const [busyId, setBusyId] = useState('');

  const load = async () => {
    const [revisionPage, answerPage, topicPage] = await Promise.all([
      base44.entities.RevisionItem.list({ sort: '-last_missed_at', limit: 100 }),
      base44.entities.AttemptAnswer.filter({ is_correct: false }, { sort: '-answered_at', limit: 100 }),
      base44.entities.Topic.list({ sort: 'order', limit: 50 }),
    ]);
    setRevision(revisionPage.items || revisionPage);
    setAnswers(answerPage.items || answerPage);
    setTopics(topicPage.items || topicPage);
    setLoading(false);
  };

  useEffect(() => {
    let alive = true;
    load().catch(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const topicOptions = useMemo(() => {
    const map = new Map();
    [...revision, ...answers].forEach((item) => {
      if (item.topic_slug) map.set(item.topic_slug, item.topic_title || item.topic_slug);
    });
    return [...map.entries()];
  }, [revision, answers]);

  const openQueue = revision.filter((item) => item.status === 'open');
  const queue = topicFilter === 'all' ? openQueue : openQueue.filter((r) => r.topic_slug === topicFilter);
  const history = topicFilter === 'all' ? answers : answers.filter((a) => a.topic_slug === topicFilter);
  const resolvedCount = revision.filter((r) => r.status === 'resolved').length;

  const markResolved = async (item) => {
    setBusyId(item.id);
    const updated = await base44.entities.RevisionItem.update(item.id, { status: 'resolved' });
    setRevision((prev) => prev.map((r) => (r.id === item.id ? updated : r)));
    setBusyId('');
  };

  if (loading) return <LoadingBlock rows={4} />;

  return (
    <div>
      <PageHeader
        eyebrow="Learn from mistakes"
        title="Revision queue"
        description="Every incorrect answer is stored with the concept behind it. Clear them by topic, then test the same material again."
        actions={
          <ActionButton as={Link} to="/practice" variant="outline">
            <ListChecks className="h-4 w-4" /> New practice set
          </ActionButton>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-xl border border-border bg-card p-1">
          <button
            type="button"
            onClick={() => setTab('queue')}
            aria-pressed={tab === 'queue'}
            className={`rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition ${tab === 'queue' ? 'bg-brand-ink text-white' : 'text-muted-foreground'}`}
          >
            To revisit ({openQueue.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('history')}
            aria-pressed={tab === 'history'}
            className={`rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition ${tab === 'history' ? 'bg-brand-ink text-white' : 'text-muted-foreground'}`}
          >
            All misses ({answers.length})
          </button>
        </div>

        <select
          aria-label="Filter by topic"
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value)}
          className="h-9 rounded-lg border border-input bg-card px-2.5 text-[12.5px] text-brand-ink focus:border-brand-azure/50 focus:outline-none"
        >
          <option value="all">All topics</option>
          {topicOptions.map(([slug, label]) => (
            <option key={slug} value={slug}>{label}</option>
          ))}
        </select>
      </div>

      {tab === 'queue' ? (
        queue.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="Your revision queue is clear"
            body={
              openQueue.length === 0 && resolvedCount > 0
                ? `You have resolved ${resolvedCount} concept${resolvedCount === 1 ? '' : 's'}. Answer more questions to find the next gap.`
                : 'Answer practice questions and anything you miss will be queued here with an explanation.'
            }
            action={<ActionButton as={Link} to="/practice" size="sm">Start practising</ActionButton>}
          />
        ) : (
          <ol className="space-y-3">
            {queue.map((item) => (
              <li key={item.id} className="aa-panel p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="rose"><XCircle className="h-3 w-3" /> Missed {item.miss_count || 1}×</Badge>
                  <Badge tone="azure">{item.topic_title}</Badge>
                  <span className="text-[11px] text-muted-foreground">Last missed {formatDate(item.last_missed_at)}</span>
                </div>

                <p className="mt-3 font-heading text-[14px] font-medium leading-relaxed text-brand-ink">{item.question_text}</p>

                <div className="mt-3 space-y-1.5">
                  {(item.options || []).map((option, i) => {
                    const isCorrect = (item.correct_options || []).includes(i);
                    return (
                      <div
                        key={`${item.id}-${i}`}
                        className={`flex items-start gap-2.5 rounded-lg px-3 py-1.5 text-[12.5px] ${
                          isCorrect ? 'bg-emerald-50 text-emerald-900' : 'text-muted-foreground'
                        }`}
                      >
                        <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border border-current text-[9px] font-semibold">
                          {LETTERS[i]}
                        </span>
                        <span className="leading-relaxed">{option}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 rounded-xl bg-secondary/60 p-3">
                  <p className="text-[12.5px] leading-relaxed text-brand-navy">{item.explanation}</p>
                  {item.objective && <p className="mt-1.5 text-[11px] text-muted-foreground">Objective: {item.objective}</p>}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <ActionButton
                    size="sm"
                    variant="outline"
                    disabled={busyId === item.id}
                    onClick={() => markResolved(item)}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> {busyId === item.id ? 'Saving…' : 'I understand this now'}
                  </ActionButton>
                  {item.topic_slug && (
                    <ActionButton as={Link} to={`/flashcards?topic=${item.topic_slug}`} size="sm" variant="ghost">
                      Related flashcards
                    </ActionButton>
                  )}
                  {item.topic_slug && (
                    <ActionButton as={Link} to={`/practice?topic=${item.topic_slug}`} size="sm" variant="ghost">
                      Practise topic
                    </ActionButton>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )
      ) : history.length === 0 ? (
        <EmptyState
          icon={RotateCcw}
          title="No incorrect answers yet"
          body="Once you answer questions, every miss is recorded here with its explanation so you can compare your choice with the correct one."
          action={<ActionButton as={Link} to="/practice" size="sm">Start practising</ActionButton>}
        />
      ) : (
        <ol className="space-y-3">
          {history.map((answer) => (
            <li key={answer.id} className="aa-panel p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="rose"><XCircle className="h-3 w-3" /> Incorrect</Badge>
                <Badge tone="azure">{answer.topic_title}</Badge>
                <span className="text-[11px] text-muted-foreground">{formatDate(answer.answered_at)}</span>
                {answer.topic_slug && (
                  <Link to={`/practice/review/${answer.attempt_id}`} className="ml-auto text-[11.5px] font-medium text-brand-azure hover:text-brand-ink">
                    Full attempt
                  </Link>
                )}
              </div>
              <p className="mt-3 font-heading text-[13.5px] font-medium leading-relaxed text-brand-ink">{answer.question_text}</p>
              <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                <div className="rounded-lg border border-rose-200 bg-rose-50/60 p-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-rose-700">You chose</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-rose-900">
                    {(answer.selected_options || []).map((i) => LETTERS[i]).join(', ') || 'No answer'}
                  </p>
                </div>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">Correct</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-emerald-900">
                    {(answer.correct_options || []).map((i) => LETTERS[i]).join(', ')}
                  </p>
                </div>
              </div>
              <p className="mt-2.5 text-[12px] leading-relaxed text-muted-foreground">{answer.explanation}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
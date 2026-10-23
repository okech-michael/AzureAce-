import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Bookmark, Layers, ListChecks, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/common/PageHeader';
import ActionButton from '@/components/common/ActionButton';
import EmptyState from '@/components/common/EmptyState';
import Badge from '@/components/common/Badge';
import FlashcardView from '@/components/learn/FlashcardView';
import { LoadingBlock } from '@/components/common/Loading';
import { buildQueue, scheduleNext, RATINGS } from '@/lib/srs';

const RESUME_KEY = 'azureace:flash-session';

export default function Flashcards() {
  const [searchParams, setSearchParams] = useSearchParams();
  const topicFilter = searchParams.get('topic') || 'all';
  const [cards, setCards] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  const [difficulty, setDifficulty] = useState('all');
  const [dueOnly, setDueOnly] = useState(false);
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [stats, setStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 });
  const [rated, setRated] = useState(0);
  const [resumed, setResumed] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([
      base44.entities.Flashcard.list({ limit: 400 }),
      base44.entities.FlashcardReview.list({ limit: 400 }),
      base44.entities.Topic.list({ sort: 'order', limit: 50 }),
    ])
      .then(([cardPage, reviewRows, topicPage]) => {
        if (!alive) return;
        setCards(cardPage.items || cardPage);
        setReviews(reviewRows.items || reviewRows);
        setTopics(topicPage.items || topicPage);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => { alive = false; };
  }, []);

  const filterKey = `${topicFilter}|${difficulty}|${dueOnly}|${bookmarkedOnly}`;

  useEffect(() => {
    if (loading) return;
    const nextQueue = buildQueue(cards, reviews, {
      topicSlug: topicFilter,
      difficulty,
      dueOnly,
      bookmarkedOnly,
      limit: 80,
    });
    setQueue(nextQueue);
    setIndex(0);
    setFlipped(false);
    setStats({ again: 0, hard: 0, good: 0, easy: 0 });
    setRated(0);

    try {
      const saved = JSON.parse(window.localStorage.getItem(RESUME_KEY) || 'null');
      if (saved && saved.key === filterKey && saved.index > 0 && saved.index < nextQueue.length) {
        setIndex(saved.index);
        setResumed(true);
      }
    } catch (e) {
      // ignore malformed resume state
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, filterKey]);

  const current = queue[index];
  const card = current?.card;
  const review = useMemo(
    () => reviews.find((r) => r.flashcard_id === card?.id) || null,
    [reviews, card]
  );

  const persistReview = useCallback(async (targetCard, patch) => {
    const existing = reviews.find((r) => r.flashcard_id === targetCard.id);
    if (existing) {
      const updated = await base44.entities.FlashcardReview.update(existing.id, patch);
      setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      return updated;
    }
    const created = await base44.entities.FlashcardReview.create({
      flashcard_id: targetCard.id,
      topic_id: targetCard.topic_id,
      topic_slug: targetCard.topic_slug,
      front: targetCard.front,
      repetitions: 0,
      interval_days: 0,
      ease: 2.5,
      times_seen: 0,
      lapses: 0,
      ...patch,
    });
    setReviews((prev) => [...prev, created]);
    return created;
  }, [reviews]);

  const rate = useCallback(async (rating) => {
    if (!card || saving) return;
    setSaving(true);
    const next = scheduleNext(review || {}, rating);
    await persistReview(card, {
      ...next,
      times_seen: (review?.times_seen || 0) + 1,
      is_difficult: rating === 'again' || rating === 'hard' ? true : rating === 'easy' ? false : review?.is_difficult || false,
      is_bookmarked: review?.is_bookmarked || false,
    });
    setStats((prev) => ({ ...prev, [rating]: prev[rating] + 1 }));
    setRated((prev) => prev + 1);
    const nextIndex = index + 1;
    setFlipped(false);
    setShowHint(false);
    setIndex(nextIndex);
    setSaving(false);
    try {
      window.localStorage.setItem(RESUME_KEY, JSON.stringify({ key: filterKey, index: nextIndex }));
    } catch (e) {
      // storage unavailable
    }
  }, [card, saving, review, persistReview, index, filterKey]);

  const toggleBookmark = useCallback(async () => {
    if (!card) return;
    await persistReview(card, {
      is_bookmarked: !(review?.is_bookmarked),
      times_seen: review?.times_seen || 0,
      ease: review?.ease || 2.5,
      repetitions: review?.repetitions || 0,
      interval_days: review?.interval_days || 0,
    });
  }, [card, review, persistReview]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.code === 'Space') {
        event.preventDefault();
        setFlipped((f) => !f);
      }
      const map = { '1': 'again', '2': 'hard', '3': 'good', '4': 'easy' };
      if (map[event.key] && flipped) rate(map[event.key]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flipped, rate]);

  const restart = () => {
    setIndex(0);
    setFlipped(false);
    setStats({ again: 0, hard: 0, good: 0, easy: 0 });
    setRated(0);
    setResumed(false);
    try { window.localStorage.removeItem(RESUME_KEY); } catch (e) { /* noop */ }
  };

  const dueCount = useMemo(
    () => buildQueue(cards, reviews, { topicSlug: topicFilter, difficulty, dueOnly: true, bookmarkedOnly, limit: 200 }).length,
    [cards, reviews, topicFilter, difficulty, bookmarkedOnly]
  );

  if (loading) return <LoadingBlock rows={4} />;

  const finished = queue.length > 0 && index >= queue.length;
  const recallRate = rated ? Math.round(((stats.good + stats.easy) / rated) * 100) : 0;

  return (
    <div>
      <PageHeader
        eyebrow="Learn"
        title="Flashcards"
        description="Cards are scheduled by recall, not at random. Rate honestly and the difficult ones come back sooner."
        actions={
          <ActionButton as={Link} to="/practice" variant="outline">
            <ListChecks className="h-4 w-4" /> Practice instead
          </ActionButton>
        }
      />

      <div className="mb-5 grid gap-3 rounded-2xl border border-border bg-card p-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center">
        <div>
          <label htmlFor="topic-filter" className="sr-only">Topic</label>
          <select
            id="topic-filter"
            value={topicFilter}
            onChange={(e) => {
              const value = e.target.value;
              setSearchParams(value === 'all' ? {} : { topic: value });
            }}
            className="h-9 w-full rounded-lg border border-input bg-card px-2.5 text-[12.5px] text-brand-ink focus:border-brand-azure/50 focus:outline-none"
          >
            <option value="all">All topics</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.slug}>{topic.title}</option>
            ))}
          </select>
        </div>

        <select
          aria-label="Difficulty"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="h-9 rounded-lg border border-input bg-card px-2.5 text-[12.5px] text-brand-ink focus:border-brand-azure/50 focus:outline-none"
        >
          <option value="all">All difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <button
          type="button"
          onClick={() => setDueOnly((v) => !v)}
          aria-pressed={dueOnly}
          className={`h-9 rounded-lg border px-3 text-[12px] font-medium transition ${
            dueOnly ? 'border-brand-ink bg-brand-ink text-white' : 'border-border bg-card text-muted-foreground'
          }`}
        >
          Due only · {dueCount}
        </button>

        <button
          type="button"
          onClick={() => setBookmarkedOnly((v) => !v)}
          aria-pressed={bookmarkedOnly}
          className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border px-3 text-[12px] font-medium transition ${
            bookmarkedOnly ? 'border-brand-ink bg-brand-ink text-white' : 'border-border bg-card text-muted-foreground'
          }`}
        >
          <Bookmark className="h-3.5 w-3.5" /> Saved
        </button>
      </div>

      {resumed && !finished && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-brand-azure/25 bg-brand-mist px-3.5 py-2.5">
          <p className="text-[12px] text-brand-navy">Session resumed at card {index + 1}.</p>
          <button type="button" onClick={restart} className="text-[11.5px] font-medium text-brand-azure">Start over</button>
        </div>
      )}

      {queue.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No cards match these filters"
          body="Try clearing the difficulty or saved filter, or pick a different topic."
          action={
            <ActionButton
              size="sm"
              variant="outline"
              onClick={() => {
                setDifficulty('all');
                setDueOnly(false);
                setBookmarkedOnly(false);
                setSearchParams({});
              }}
            >
              Clear filters
            </ActionButton>
          }
        />
      ) : finished ? (
        <div className="aa-panel p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-mist text-brand-azure"><Trophy className="h-5 w-5" /></span>
            <div>
              <h2 className="font-heading text-[18px] font-semibold text-brand-ink">Session complete</h2>
              <p className="text-[12.5px] text-muted-foreground">{rated} cards reviewed · {recallRate}% recalled without struggling</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {RATINGS.map((rating) => (
              <div key={rating.key} className="rounded-xl border border-border px-3 py-2.5">
                <p className="text-[10.5px] font-medium uppercase tracking-[0.1em] text-muted-foreground">{rating.label}</p>
                <p className="mt-1 font-heading text-[18px] font-semibold text-brand-ink">{stats[rating.key]}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl bg-brand-mist/70 p-4 text-[12.5px] leading-relaxed text-brand-navy">
            Cards rated Again or Hard are scheduled sooner and flagged as difficult. Come back tomorrow and the queue
            will already be ordered by what you are most likely to forget.
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <ActionButton onClick={restart}>
              <RotateCcw className="h-4 w-4" /> Study again
            </ActionButton>
            <ActionButton as={Link} to="/practice" variant="outline">
              <ListChecks className="h-4 w-4" /> Test this material
            </ActionButton>
            <ActionButton as={Link} to="/progress" variant="ghost">
              See progress <ArrowRight className="h-3.5 w-3.5" />
            </ActionButton>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-3xl">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11.5px] text-muted-foreground">{index + 1} / {queue.length}</span>
              {current?.due && <Badge tone="azure">Due</Badge>}
              {review?.is_difficult && <Badge tone="amber">Difficult</Badge>}
            </div>
            <button type="button" onClick={restart} className="text-[11.5px] text-muted-foreground transition hover:text-brand-azure">
              Restart
            </button>
          </div>

          <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-cyan to-brand-azure transition-all"
              style={{ width: `${(index / queue.length) * 100}%` }}
            />
          </div>

          <FlashcardView
            card={{ ...card, topic_title: topics.find((t) => t.slug === card.topic_slug)?.title || card.topic_slug }}
            flipped={flipped}
            onFlip={() => setFlipped((f) => !f)}
            onBookmark={toggleBookmark}
            bookmarked={!!review?.is_bookmarked}
            showHint={showHint}
            onToggleHint={() => setShowHint((h) => !h)}
          />

          <div className="mt-4">
            {flipped ? (
              <>
                <p className="mb-2 text-center text-[11.5px] text-muted-foreground">How well did you recall that?</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {RATINGS.map((rating, i) => (
                    <button
                      key={rating.key}
                      type="button"
                      disabled={saving}
                      onClick={() => rate(rating.key)}
                      className={`rounded-xl border px-3 py-2.5 text-center transition disabled:opacity-50 ${
                        rating.key === 'again'
                          ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                          : rating.key === 'hard'
                            ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                            : rating.key === 'good'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'border-brand-azure/25 bg-brand-mist text-brand-azure hover:bg-brand-azure hover:text-white'
                      }`}
                    >
                      <span className="block text-[12.5px] font-semibold">{rating.label}</span>
                      <span className="block text-[10px] opacity-70">{rating.hint} · {i + 1}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setFlipped(true)}
                className="w-full rounded-xl border border-border bg-card py-3 text-[13px] font-medium text-brand-navy transition hover:border-brand-azure/40 hover:text-brand-azure"
              >
                Show the answer
              </button>
            )}
          </div>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <Sparkles className="h-3 w-3" /> Space flips · 1–4 rate · bookmarks are saved to your account
          </p>
        </div>
      )}
    </div>
  );
}
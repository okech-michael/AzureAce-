// SM-2 style spaced repetition scheduler.
// Ratings map to an SM-2 quality score; the ease factor and interval are adjusted
// and persisted per card so the revision queue is driven by real review history.

export const RATINGS = [
  { key: 'again', label: 'Again', hint: 'No recall' },
  { key: 'hard', label: 'Hard', hint: 'Struggled' },
  { key: 'good', label: 'Good', hint: 'Recalled' },
  { key: 'easy', label: 'Easy', hint: 'Instant' },
];

const QUALITY = { again: 0, hard: 3, good: 4, easy: 5 };
const DAY_MS = 24 * 60 * 60 * 1000;

export function scheduleNext(state, rating, now = new Date()) {
  const ease = Number(state?.ease) || 2.5;
  let repetitions = Number(state?.repetitions) || 0;
  let interval = Number(state?.interval_days) || 0;
  let lapses = Number(state?.lapses) || 0;
  const quality = QUALITY[rating] ?? 4;

  let nextEase = ease;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
    lapses += 1;
    nextEase = Math.max(1.3, ease - 0.2);
  } else {
    repetitions += 1;
    nextEase = Math.max(
      1.3,
      Math.min(2.9, ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))
    );
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 3;
    else interval = Math.max(4, Math.round(interval * nextEase));
  }

  return {
    repetitions,
    interval_days: interval,
    ease: Number(nextEase.toFixed(2)),
    lapses,
    due_date: new Date(now.getTime() + interval * DAY_MS).toISOString(),
    last_reviewed_at: now.toISOString(),
    rating,
  };
}

export function isDue(review, now = new Date()) {
  if (!review || !review.due_date) return true;
  return new Date(review.due_date).getTime() <= now.getTime();
}

export function daysUntil(dateString, now = new Date()) {
  if (!dateString) return null;
  const target = new Date(dateString);
  if (Number.isNaN(target.getTime())) return null;
  return Math.ceil((target.getTime() - now.getTime()) / DAY_MS);
}

/**
 * Builds a study queue from the full card list and the learner's review records.
 * Priority: overdue/difficult cards first, then unseen cards, then bookmarked.
 */
export function buildQueue(cards, reviews, options = {}) {
  const { topicSlug = 'all', difficulty = 'all', dueOnly = false, bookmarkedOnly = false, limit = 60 } = options;
  const reviewMap = new Map(reviews.map((r) => [r.flashcard_id, r]));

  let pool = cards.filter((card) => {
    if (topicSlug !== 'all' && card.topic_slug !== topicSlug) return false;
    if (difficulty !== 'all' && card.difficulty !== difficulty) return false;
    const review = reviewMap.get(card.id);
    if (bookmarkedOnly && !(review && review.is_bookmarked)) return false;
    if (dueOnly && review && !isDue(review)) return false;
    return true;
  });

  const scored = pool.map((card) => {
    const review = reviewMap.get(card.id);
    let weight = 50;
    if (!review) weight = 80; // unseen cards first
    else if (isDue(review)) weight = 100 - Math.min(30, review.times_seen || 0);
    else weight = 20;
    if (review && review.is_difficult) weight += 25;
    if (review && (review.lapses || 0) > 0) weight += 10;
    return { card, review, weight, due: !review || isDue(review) };
  });

  scored.sort((a, b) => b.weight - a.weight);
  return scored.slice(0, limit);
}
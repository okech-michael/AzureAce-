// Study plan generation.
// Turns preferences plus measured topic performance into a schedule the learner's
// available time can actually hold. Guidance, never a guarantee of passing.

const DAY_MS = 24 * 60 * 60 * 1000;

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  return new Date(date.getTime() + days * DAY_MS);
}

export function topicsByNeed(topics, mastery, weakSlugs = []) {
  const masteryMap = new Map(mastery.map((m) => [m.topic_slug, m]));
  return [...topics]
    .map((topic) => {
      const record = masteryMap.get(topic.slug);
      const accuracy = record ? Number(record.accuracy) || 0 : null;
      const attempted = record ? Number(record.questions_attempted) || 0 : 0;
      let need = 50;
      if (accuracy === null) need = 70;
      else need = 100 - accuracy;
      if (weakSlugs.includes(topic.slug)) need += 30;
      if (attempted >= 12 && accuracy >= 85) need -= 35;
      return { topic, accuracy, attempted, need };
    })
    .sort((a, b) => b.need - a.need);
}

/**
 * @returns {{ days: number, blocksPerDay: number, tasks: Array }}
 */
export function buildSchedule({
  topics = [],
  mastery = [],
  profile = {},
  revisionCount = 0,
  startDate = new Date(),
  maxDays = 28,
} = {}) {
  if (!topics.length) return { days: 0, blocksPerDay: 0, tasks: [] };

  const minutesPerDay = Math.min(240, Math.max(15, Number(profile.minutes_per_day) || 45));
  const sessionLength = Math.min(90, Math.max(10, Number(profile.session_length) || 25));
  const blocksPerDay = Math.min(3, Math.max(1, Math.floor(minutesPerDay / sessionLength)));

  let horizon = 14;
  if (profile.exam_date) {
    const exam = new Date(profile.exam_date);
    if (!Number.isNaN(exam.getTime())) {
      const remaining = Math.ceil((exam.getTime() - startDate.getTime()) / DAY_MS);
      horizon = Math.min(maxDays, Math.max(3, remaining));
    }
  }

  const ranked = topicsByNeed(topics, mastery, profile.weak_topic_slugs || []);
  const focus = ranked.slice(0, Math.max(4, Math.ceil(ranked.length * 0.6)));
  const tasks = [];
  let focusIndex = 0;

  for (let day = 0; day < horizon; day += 1) {
    const date = addDays(startDate, day);
    const dateKey = toDateKey(date);
    const isAssessmentDay = (day + 1) % 7 === 0;
    const isReviewDay = (day + 1) % 4 === 0 && !isAssessmentDay;

    for (let block = 0; block < blocksPerDay; block += 1) {
      const entry = focus[focusIndex % focus.length];
      const topic = entry ? entry.topic : topics[0];

      if (isAssessmentDay && block === 0) {
        tasks.push({
          date: dateKey,
          type: 'assessment',
          title: 'Mixed assessment (20 questions)',
          topic_id: '',
          topic_slug: '',
          duration_min: Math.max(20, sessionLength),
          status: 'pending',
          order: block,
          note: 'Timed, mixed domains. Review every miss afterwards.',
        });
        continue;
      }

      if (isReviewDay && block === 0 && revisionCount > 0) {
        tasks.push({
          date: dateKey,
          type: 'review',
          title: `Clear ${Math.min(revisionCount, 8)} revision item${revisionCount === 1 ? '' : 's'}`,
          topic_id: '',
          topic_slug: '',
          duration_min: sessionLength,
          status: 'pending',
          order: block,
          note: 'Concepts you previously answered incorrectly.',
        });
        continue;
      }

      if (block === 0) {
        tasks.push({
          date: dateKey,
          type: 'study',
          title: `Read: ${topic.title}`,
          topic_id: topic.id,
          topic_slug: topic.slug,
          duration_min: sessionLength,
          status: 'pending',
          order: block,
          note: 'Objectives and key concepts, then note one thing you did not know.',
        });
      } else if (block === 1) {
        tasks.push({
          date: dateKey,
          type: 'flashcards',
          title: `Flashcards: ${topic.title}`,
          topic_id: topic.id,
          topic_slug: topic.slug,
          duration_min: Math.min(sessionLength, 20),
          status: 'pending',
          order: block,
          note: 'Rate recall honestly so the scheduling stays useful.',
        });
      } else {
        tasks.push({
          date: dateKey,
          type: 'practice',
          title: `Practice: ${topic.title}`,
          topic_id: topic.id,
          topic_slug: topic.slug,
          duration_min: sessionLength,
          status: 'pending',
          order: block,
          note: 'Ten questions, then fix every miss before moving on.',
        });
      }
    }

    if (!isAssessmentDay) focusIndex += blocksPerDay;
  }

  return { days: horizon, blocksPerDay, tasks };
}

export function planSummary({ days, blocksPerDay, tasks, profile }) {
  const total = tasks.reduce((sum, t) => sum + (t.duration_min || 0), 0);
  const hours = Math.round((total / 60) * 10) / 10;
  const examNote = profile?.exam_date
    ? `Exam on ${new Date(profile.exam_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}`
    : 'No exam date set, so this is a rolling two-week plan';
  return `${examNote}. ${blocksPerDay} block${blocksPerDay === 1 ? '' : 's'} a day over ${days} days, about ${hours} hours total.`;
}
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const MODES = ['mixed', 'topic', 'weak-areas', 'assessment'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await req.json().catch(() => ({}));
    const count = Math.min(Math.max(Number(payload.count) || 10, 4), 40);
    const topicIds = Array.isArray(payload.topic_ids) ? payload.topic_ids.filter((t) => typeof t === 'string').slice(0, 12) : [];
    const difficulty = DIFFICULTIES.includes(payload.difficulty) ? payload.difficulty : 'any';
    const timed = payload.timed === true;
    const timeLimitMinutes = Math.min(Math.max(Number(payload.time_limit_minutes) || 20, 3), 90);
    const mode = MODES.includes(payload.mode) ? payload.mode : 'mixed';

    let effectiveTopicIds = topicIds;
    if (!effectiveTopicIds.length && mode === 'weak-areas') {
      const masteryPage = await base44.entities.TopicMastery.list({ limit: 50 });
      effectiveTopicIds = (masteryPage.items || masteryPage)
        .filter((row) => (row.questions_attempted || 0) > 0 && row.topic_id)
        .sort((a, b) => (Number(a.accuracy) || 0) - (Number(b.accuracy) || 0))
        .slice(0, 4)
        .map((row) => row.topic_id);
    }

    const query = {};
    if (effectiveTopicIds.length) query.topic_id = { $in: effectiveTopicIds };
    if (difficulty !== 'any') query.difficulty = difficulty;

    let page = await base44.entities.Question.filter(query, { limit: 200 });
    let pool = page.items || page;

    if (!pool.length && (topicIds.length || difficulty !== 'any')) {
      page = await base44.entities.Question.filter({}, { limit: 200 });
      pool = page.items || page;
    }

    if (!pool.length) {
      return Response.json(
        { error: 'The question bank is empty. Learning content has not been loaded yet.' },
        { status: 409 }
      );
    }

    const selected = shuffle(pool).slice(0, Math.min(count, pool.length));
    const startedAt = new Date().toISOString();

    const attempt = await base44.entities.QuizAttempt.create({
      mode,
      topic_filter: effectiveTopicIds,
      difficulty,
      question_ids: selected.map((q) => q.id),
      total_questions: selected.length,
      answered_count: 0,
      correct_count: 0,
      score_percent: 0,
      timed,
      time_limit_seconds: timed ? timeLimitMinutes * 60 : 0,
      started_at: startedAt,
      status: 'in_progress',
    });

    return Response.json({
      attempt,
      questions: selected.map((q) => ({
        id: q.id,
        text: q.text,
        options: q.options,
        type: q.type,
        topic_id: q.topic_id,
        topic_title: q.topic_title,
        domain: q.domain,
        difficulty: q.difficulty,
        objective: q.objective,
        source: q.source,
      })),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
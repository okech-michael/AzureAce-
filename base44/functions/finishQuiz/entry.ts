import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await req.json().catch(() => ({}));
    const attemptId = payload.attempt_id;
    if (!attemptId) return Response.json({ error: 'attempt_id is required' }, { status: 400 });

    const attemptMatches = await base44.entities.QuizAttempt.filter({ id: attemptId });
    const attempt = attemptMatches[0];
    if (!attempt) return Response.json({ error: 'Attempt not found' }, { status: 404 });

    const answers = await base44.entities.AttemptAnswer.filter({ attempt_id: attemptId });
    const questionIds = Array.isArray(attempt.question_ids) ? attempt.question_ids : [];
    const total = questionIds.length || answers.length;
    const correctCount = answers.filter((a) => a.is_correct).length;
    const score = total ? Math.round((correctCount / total) * 100) : 0;

    const startedAt = attempt.started_at ? new Date(attempt.started_at).getTime() : Date.now();
    const duration = Math.max(0, Math.round((Date.now() - startedAt) / 1000));
    const now = new Date().toISOString();

    await base44.entities.QuizAttempt.update(attemptId, {
      status: 'completed',
      answered_count: answers.length,
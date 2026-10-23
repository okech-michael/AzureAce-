import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Grades one answer server-side. The correct answer never reaches the browser
// before this call, which is what keeps practice honest.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await req.json().catch(() => ({}));
    const attemptId = payload.attempt_id;
    const questionId = payload.question_id;
    if (!attemptId || !questionId) {
      return Response.json({ error: 'attempt_id and question_id are required' }, { status: 400 });
    }

    const attemptMatches = await base44.entities.QuizAttempt.filter({ id: attemptId });
    const attempt = attemptMatches[0];
    if (!attempt) return Response.json({ error: 'Attempt not found' }, { status: 404 });
    if (attempt.status === 'completed') {
      return Response.json({ error: 'This attempt is already completed' }, { status: 400 });
    }
    if (!Array.isArray(attempt.question_ids) || !attempt.question_ids.includes(questionId)) {
      return Response.json({ error: 'That question is not part of this attempt' }, { status: 400 });
    }

    const questionMatches = await base44.entities.Question.filter({ id: questionId });
    const question = questionMatches[0];
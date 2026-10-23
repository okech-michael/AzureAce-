import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const MAX_MESSAGE_LENGTH = 2000;
const HOURLY_LIMIT = 40;

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await req.json().catch(() => ({}));
    const message = typeof payload.message === 'string' ? payload.message.trim() : '';
    const conversationId = payload.conversation_id;

    if (!conversationId) return Response.json({ error: 'conversation_id is required' }, { status: 400 });
    if (!message) return Response.json({ error: 'Write a question for the study buddy first.' }, { status: 400 });
    if (message.length > MAX_MESSAGE_LENGTH) {
      return Response.json({ error: 'That message is too long. Keep it under 2000 characters.' }, { status: 400 });
    }

    const recentPage = await base44.entities.ChatMessage.filter({ role: 'user' }, { sort: '-created_date', limit: 61 });
    const recent = recentPage.items || recentPage;
    const hourAgo = Date.now() - 60 * 60 * 1000;
    const sentThisHour = recent.filter((m) => new Date(m.created_date).getTime() > hourAgo).length;
    if (sentThisHour >= HOURLY_LIMIT) {
      return Response.json(
        { error: 'You have reached the Study Buddy limit for this hour. Flashcards and practice still work while you wait.' },
        { status: 429 }
      );
    }

    const conversationMatches = await base44.entities.Conversation.filter({ id: conversationId });
    const conversation = conversationMatches[0];
    if (!conversation) return Response.json({ error: 'Conversation not found' }, { status: 404 });

    const topicsPage = await base44.entities.Topic.list({ sort: 'order', limit: 40 });
    const topics = topicsPage.items || topicsPage;
    const syllabus = topics
      .map((t) => `- ${t.title} [${t.domain_label}]: ${(t.objectives || []).join('; ')}`)
      .join('\n');

    const revisionPage = await base44.entities.RevisionItem.filter({ status: 'open' }, { limit: 5 });
    const revisionItems = revisionPage.items || revisionPage;
    const weakAreas = revisionItems.map((r) => r.topic_title).filter(Boolean);

    const historyPage = await base44.entities.ChatMessage.filter(
      { conversation_id: conversationId },
      { sort: 'created_date', limit: 20 }
    );
    const history = (historyPage.items || historyPage).slice(-8);
    const transcript = history
      .map((m) => `${m.role === 'user' ? 'Learner' : 'Study buddy'}: ${String(m.content).slice(0, 700)}`)
      .join('\n');

    const prompt = `You are the AzureAce Study Buddy, a patient tutor for the Microsoft AZ-900 (Azure Fundamentals) certification.

RULES
1. Use simple, precise language for a beginner. Prefer one concrete analogy, then the accurate technical definition.
2. Stay inside the AZ-900 skills outline listed below. Never invent Azure features, exam objectives, prices or Microsoft policies. If a question is outside AZ-900 scope, say so and steer back.
3. You do not have access to real exam questions and must never claim to. Never present content as an official Microsoft exam question.
4. Distinguish clearly between verified exam concepts and illustrative analogies. If you use an analogy (for example mobile money agents, university registration, a market stall, a bus company), mark it as an illustration.
5. When explaining a mistake, state why the correct option is right and why the plausible wrong option is wrong.
6. Keep replies under 220 words unless the learner asks for a comparison table. Use short paragraphs or a compact list. No emojis.
7. If asked for practice questions, write original questions in AZ-900 style with the answer and a one-line explanation.

EXAM OUTLINE (grounding)
${syllabus || '- Cloud concepts, Azure architecture and services, Azure management and governance.'}

${weakAreas.length ? `LEARNER WEAK AREAS FROM PRACTICE: ${[...new Set(weakAreas)].join(', ')}` : 'LEARNER WEAK AREAS: not enough practice data yet.'}

CONVERSATION SO FAR
${transcript || '(new conversation)'}

LEARNER MESSAGE
${message}

Return JSON with:
- reply: your answer in markdown-lite (paragraphs, "-" bullets, **bold** for key terms). No headings.
- followups: 3 short follow-up prompts the learner might ask next.
- grounded: true if the answer maps to the outline above, false if it is general/illustrative.
- disclaimer: one short sentence when the answer leans on an analogy or is outside the syllabus; otherwise an empty string.`;

    let result;
    try {
      result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            reply: { type: 'string' },
            followups: { type: 'array', items: { type: 'string' } },
            grounded: { type: 'boolean' },
            disclaimer: { type: 'string' },
          },
          required: ['reply', 'followups', 'grounded'],
        },
      });
    } catch (aiError) {
      return Response.json(
        {
          error: 'The AI study buddy is unavailable right now. Your flashcards, practice questions and explanations still work.',
          code: 'ai_unavailable',
        },
        { status: 503 }
      );
    }

    const data = typeof result === 'string'
      ? { reply: result, followups: [], grounded: false, disclaimer: '' }
      : result || {};

    const reply = typeof data.reply === 'string' && data.reply.trim()
      ? data.reply.trim()
      : 'I could not produce an answer for that. Try rephrasing the question, or open the related topic in Learn.';
    const followups = Array.isArray(data.followups)
      ? data.followups.filter((f) => typeof f === 'string' && f.trim()).slice(0, 3)
      : [];
    const grounded = data.grounded === true;
    const disclaimer = typeof data.disclaimer === 'string' ? data.disclaimer : '';

    await base44.entities.ChatMessage.create({
      conversation_id: conversationId,
      role: 'user',
      content: message,
    });

    const assistantMessage = await base44.entities.ChatMessage.create({
      conversation_id: conversationId,
      role: 'assistant',
      content: reply,
      followups,
      grounded,
      disclaimer,
    });

    const now = new Date().toISOString();
    const patch = { last_message_at: now, message_count: (conversation.message_count || 0) + 1 };
    if (!conversation.title || conversation.title === 'New conversation') {
      patch.title = message.slice(0, 60);
    }
    await base44.entities.Conversation.update(conversationId, patch);

    return Response.json({ message: assistantMessage, reply, followups, grounded, disclaimer });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
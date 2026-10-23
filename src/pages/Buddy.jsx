import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  AlertCircle,
  ArrowUp,
  Check,
  Copy,
  MessageSquarePlus,
  RotateCcw,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/common/PageHeader';
import ActionButton from '@/components/common/ActionButton';
import Badge from '@/components/common/Badge';
import EmptyState from '@/components/common/EmptyState';
import { formatDate } from '@/lib/format';

const STARTERS = [
  'Explain availability zones using a mobile money agency example',
  'Compare Azure Policy and RBAC in simple terms',
  'Why is ExpressRoute different from a VPN?',
  'Quiz me on the shared responsibility model',
  'Explain IaaS, PaaS and SaaS with one example each',
  'What should I revise if I keep confusing storage redundancy options?',
];

function Markdown({ content }) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="mb-2 text-[13px] leading-relaxed last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-4 text-[13px] leading-relaxed">{children}</ul>,
        ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-4 text-[13px] leading-relaxed">{children}</ol>,
        li: ({ children }) => <li>{children}</li>,
        strong: ({ children }) => <strong className="font-semibold text-brand-ink">{children}</strong>,
        code: ({ children }) => <code className="rounded bg-secondary px-1 py-0.5 font-mono text-[12px]">{children}</code>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export default function Buddy() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState('');
  const endRef = useRef(null);

  const loadConversations = async () => {
    const page = await base44.entities.Conversation.list({ sort: '-last_message_at', limit: 30 });
    const rows = page.items || page;
    setConversations(rows);
    return rows;
  };

  useEffect(() => {
    let alive = true;
    loadConversations()
      .then((rows) => {
        if (!alive) return;
        if (rows.length) setActiveId(rows[0].id);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!activeId) { setMessages([]); return undefined; }
    let alive = true;
    setLoadingMessages(true);
    base44.entities.ChatMessage.filter({ conversation_id: activeId }, { sort: 'created_date', limit: 100 })
      .then((page) => {
        if (!alive) return;
        setMessages(page.items || page);
        setLoadingMessages(false);
      })
      .catch(() => setLoadingMessages(false));
    return () => { alive = false; };
  }, [activeId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, sending]);

  const newConversation = async () => {
    const created = await base44.entities.Conversation.create({
      title: 'New conversation',
      last_message_at: new Date().toISOString(),
      message_count: 0,
    });
    setConversations((prev) => [created, ...prev]);
    setActiveId(created.id);
    setMessages([]);
    setError('');
    return created;
  };

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || sending) return;
    setError('');
    setSending(true);
    setInput('');

    let conversationId = activeId;
    if (!conversationId) {
      const created = await newConversation();
      conversationId = created.id;
    }

    const optimistic = { id: `local-${Date.now()}`, role: 'user', content };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const response = await base44.functions.invoke('studyBuddy', {
        message: content,
        conversation_id: conversationId,
      });
      const data = response.data || {};
      if (data.error) throw new Error(data.error);
      setMessages((prev) => [...prev, data.message]);
      const rows = await loadConversations();
      if (!rows.some((c) => c.id === conversationId)) setActiveId(conversationId);
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setInput(content);
      setError(
        err?.response?.data?.error ||
        err.message ||
        'The study buddy is unavailable right now. Flashcards and practice still work.'
      );
    } finally {
      setSending(false);
    }
  };

  const copy = async (message) => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedId(message.id);
      setTimeout(() => setCopiedId(''), 1800);
    } catch (e) {
      setError('Copying is blocked in this browser. Select the text manually instead.');
    }
  };

  if (loading) {
    return <div className="h-64 animate-pulse rounded-2xl border border-border bg-card" />;
  }

  const lastFollowups = [...messages].reverse().find((m) => m.role === 'assistant')?.followups || [];

  return (
    <div>
      <PageHeader
        eyebrow="AI Study Buddy"
        title="Ask, compare, understand"
        description="A tutor grounded in the AZ-900 outline. It marks analogies as illustrations and never pretends to have real exam questions."
        actions={
          <ActionButton onClick={newConversation} variant="outline">
            <MessageSquarePlus className="h-4 w-4" /> New conversation
          </ActionButton>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <aside className="aa-panel hidden max-h-[620px] flex-col overflow-hidden lg:flex">
          <div className="border-b border-border px-3 py-2.5">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">Conversations</p>
          </div>
          <ul className="flex-1 overflow-y-auto p-1.5">
            {conversations.length === 0 && (
              <li className="px-2 py-3 text-[11.5px] text-muted-foreground">No conversations yet.</li>
            )}
            {conversations.map((conversation) => (
              <li key={conversation.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(conversation.id)}
                  className={`w-full rounded-lg px-2.5 py-2 text-left transition ${
                    activeId === conversation.id ? 'bg-brand-mist text-brand-ink' : 'text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  <span className="block truncate text-[12px] font-medium">{conversation.title || 'New conversation'}</span>
                  <span className="mt-0.5 block text-[10.5px] opacity-70">{formatDate(conversation.last_message_at)}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="aa-panel flex h-[640px] flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-ink text-brand-cyan"><Sparkles className="h-3.5 w-3.5" /></span>
              <div>
                <p className="text-[12.5px] font-semibold text-brand-ink">Study buddy</p>
                <p className="text-[10.5px] text-muted-foreground">Grounded in the AZ-900 outline · English</p>
              </div>
            </div>
            <Badge tone="neutral">Not official Microsoft material</Badge>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {loadingMessages && <p className="text-[12px] text-muted-foreground">Loading conversation…</p>}

            {!loadingMessages && messages.length === 0 && (
              <div className="py-4">
                <EmptyState
                  icon={Sparkles}
                  title="What would you like to understand?"
                  body="Ask for a simpler explanation, a comparison, an analogy, or an original practice question. Replies stay tied to the syllabus."
                  className="border-0 bg-transparent py-2"
                />
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {STARTERS.map((starter) => (
                    <button
                      key={starter}
                      type="button"
                      onClick={() => send(starter)}
                      className="rounded-xl border border-border bg-card px-3 py-2 text-left text-[12px] leading-snug text-brand-navy transition hover:border-brand-azure/40 hover:text-brand-azure"
                    >
                      {starter}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => {
              const isUser = message.role === 'user';
              return (
                <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[88%] ${isUser ? 'order-2' : ''}`}>
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        isUser
                          ? 'rounded-br-md bg-brand-ink text-white'
                          : 'rounded-bl-md border border-border bg-secondary/50 text-brand-navy'
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap text-[13px] leading-relaxed">{message.content}</p>
                      ) : (
                        <Markdown content={message.content} />
                      )}
                    </div>

                    {!isUser && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                          {message.grounded ? 'Grounded in syllabus' : 'Illustrative explanation'}
                        </span>
                        <button
                          type="button"
                          onClick={() => copy(message)}
                          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10.5px] text-muted-foreground transition hover:text-brand-azure"
                        >
                          {copiedId === message.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          {copiedId === message.id ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    )}

                    {!isUser && message.disclaimer && (
                      <p className="mt-1 max-w-md text-[10.5px] italic leading-snug text-muted-foreground">{message.disclaimer}</p>
                    )}
                  </div>
                </div>
              );
            })}

            {sending && (
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-azure [animation-delay:-0.2s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-azure [animation-delay:-0.1s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-azure" />
                </span>
                Thinking through the syllabus…
              </div>
            )}

            <div ref={endRef} />
          </div>

          {error && (
            <div className="mx-4 mb-2 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[12px] text-amber-900">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p>{error}</p>
                <p className="mt-1 text-[11px] text-amber-800/80">
                  Flashcards, practice and explanations do not depend on the assistant, so you can keep studying.
                </p>
              </div>
            </div>
          )}

          {lastFollowups.length > 0 && !sending && (
            <div className="flex flex-wrap gap-1.5 px-4 pb-2">
              {lastFollowups.map((followup) => (
                <button
                  key={followup}
                  type="button"
                  onClick={() => send(followup)}
                  className="max-w-full truncate rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition hover:border-brand-azure/40 hover:text-brand-azure"
                >
                  {followup}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="border-t border-border p-3"
          >
            <div className="flex items-end gap-2">
              <label htmlFor="buddy-input" className="sr-only">Message the study buddy</label>
              <textarea
                id="buddy-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={2}
                maxLength={2000}
                placeholder="Ask about any AZ-900 concept…"
                className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-[13px] text-brand-ink placeholder:text-muted-foreground focus:border-brand-azure/50 focus:outline-none"
              />
              <ActionButton type="submit" variant="azure" size="icon" disabled={sending || !input.trim()} aria-label="Send message">
                <ArrowUp className="h-4 w-4" />
              </ActionButton>
            </div>
            <p className="mt-1.5 px-1 text-[10.5px] text-muted-foreground">
              {input.length}/2000 · Up to 40 questions an hour. Not affiliated with Microsoft.
            </p>
          </form>
        </section>
      </div>

      {conversations.length > 0 && (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2 lg:hidden">
          <span className="truncate text-[11.5px] text-muted-foreground">
            {conversations.length} saved conversation{conversations.length === 1 ? '' : 's'}
          </span>
          <button
            type="button"
            onClick={() => {
              const next = conversations.find((c) => c.id !== activeId);
              if (next) setActiveId(next.id);
            }}
            className="inline-flex items-center gap-1 text-[11.5px] font-medium text-brand-azure"
          >
            <RotateCcw className="h-3 w-3" /> Switch
          </button>
        </div>
      )}
    </div>
  );
}
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Layers, Search, Target } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/common/PageHeader';
import Badge from '@/components/common/Badge';
import EmptyState from '@/components/common/EmptyState';
import ActionButton from '@/components/common/ActionButton';
import { LoadingBlock } from '@/components/common/Loading';
import { DOMAINS, pct } from '@/lib/format';

export default function Learn() {
  const [topics, setTopics] = useState([]);
  const [cards, setCards] = useState([]);
  const [mastery, setMastery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState('all');

  useEffect(() => {
    let alive = true;
    Promise.all([
      base44.entities.Topic.list({ sort: 'order', limit: 50 }),
      base44.entities.Flashcard.list({ limit: 400 }),
      base44.entities.TopicMastery.list({ limit: 50 }),
    ])
      .then(([topicPage, cardPage, masteryRows]) => {
        if (!alive) return;
        setTopics(topicPage.items || topicPage);
        setCards(cardPage.items || cardPage);
        setMastery(masteryRows.items || masteryRows);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => { alive = false; };
  }, []);

  const cardCounts = useMemo(() => {
    const counts = {};
    cards.forEach((card) => { counts[card.topic_slug] = (counts[card.topic_slug] || 0) + 1; });
    return counts;
  }, [cards]);

  const masteryMap = useMemo(() => new Map(mastery.map((m) => [m.topic_slug, m])), [mastery]);

  const filtered = topics.filter((topic) => {
    if (domain !== 'all' && topic.domain !== domain) return false;
    if (!query.trim()) return true;
    const haystack = [topic.title, topic.summary, ...(topic.key_concepts || []), ...(topic.objectives || [])]
      .join(' ')
      .toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  return (
    <div>
      <PageHeader
        eyebrow="Learn"
        title="Topic library"
        description="Twelve topics built from the published AZ-900 skills outline. Read the objectives, then test yourself on the same material."
        actions={
          <ActionButton as={Link} to="/flashcards" variant="outline">
            <Layers className="h-4 w-4" /> Flashcard session
          </ActionButton>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topics, terms, concepts"
            aria-label="Search topics"
            className="h-10 w-full rounded-xl border border-input bg-card pl-9 pr-3 text-[13px] text-brand-ink placeholder:text-muted-foreground focus:border-brand-azure/50 focus:outline-none"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {[{ key: 'all', label: 'All domains' }, ...DOMAINS].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setDomain(item.key)}
              aria-pressed={domain === item.key}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-medium transition ${
                domain === item.key
                  ? 'border-brand-ink bg-brand-ink text-white'
                  : 'border-border bg-card text-muted-foreground hover:text-brand-ink'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingBlock rows={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No topics match that search"
          body="Try a broader term, or clear the domain filter."
          action={<ActionButton variant="outline" size="sm" onClick={() => { setQuery(''); setDomain('all'); }}>Clear filters</ActionButton>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((topic) => {
            const record = masteryMap.get(topic.slug);
            const accuracy = record ? Number(record.accuracy) || 0 : null;
            return (
              <Link
                key={topic.id}
                to={`/learn/${topic.slug}`}
                className="aa-panel group flex flex-col p-5 transition hover:border-brand-azure/40 hover:shadow-[0_18px_40px_-30px_hsl(222_44%_12%/0.5)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <Badge tone="azure">{topic.domain_label}</Badge>
                  <span className="font-mono text-[10.5px] text-muted-foreground">{topic.exam_weight}</span>
                </div>
                <h2 className="mt-3 font-heading text-[15.5px] font-semibold leading-snug tracking-[-0.02em] text-brand-ink group-hover:text-brand-azure">
                  {topic.title}
                </h2>
                <p className="mt-1.5 flex-1 text-[12.5px] leading-relaxed text-muted-foreground">{topic.summary}</p>

                <div className="mt-4 flex items-center gap-4 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {topic.duration_min} min</span>
                  <span className="inline-flex items-center gap-1"><Layers className="h-3 w-3" /> {cardCounts[topic.slug] || 0} cards</span>
                  <span className="inline-flex items-center gap-1"><Target className="h-3 w-3" /> {(topic.objectives || []).length} objectives</span>
                </div>

                <div className="mt-3.5 flex items-center justify-between gap-3 border-t border-border pt-3">
                  {accuracy === null ? (
                    <span className="text-[11.5px] text-muted-foreground">Not practised yet</span>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-[11.5px] text-muted-foreground">
                      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                        <span
                          className={`block h-full rounded-full ${accuracy >= 75 ? 'bg-brand-mint' : accuracy >= 50 ? 'bg-brand-amber' : 'bg-rose-400'}`}
                          style={{ width: `${Math.max(4, accuracy)}%` }}
                        />
                      </span>
                      {pct(accuracy)} accuracy
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-[12px] font-medium text-brand-azure">
                    Open <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
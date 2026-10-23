import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Clock, ExternalLink, Layers, ListChecks, Target } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/common/PageHeader';
import Badge from '@/components/common/Badge';
import ActionButton from '@/components/common/ActionButton';
import EmptyState from '@/components/common/EmptyState';
import { LoadingBlock } from '@/components/common/Loading';
import { pct } from '@/lib/format';

export default function TopicDetail() {
  const { slug } = useParams();
  const [state, setState] = useState({ topic: null, cards: [], mastery: null, loading: true });

  useEffect(() => {
    let alive = true;
    Promise.all([
      base44.entities.Topic.filter({ slug }),
      base44.entities.Flashcard.filter({ topic_slug: slug }, { limit: 60 }),
      base44.entities.TopicMastery.filter({ topic_slug: slug }),
    ])
      .then(([topics, cardPage, masteryRows]) => {
        if (!alive) return;
        setState({
          topic: topics[0] || null,
          cards: cardPage.items || cardPage,
          mastery: masteryRows[0] || null,
          loading: false,
        });
      })
      .catch(() => setState((s) => ({ ...s, loading: false })));
    return () => { alive = false; };
  }, [slug]);

  if (state.loading) return <LoadingBlock rows={5} />;

  if (!state.topic) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Topic not found"
        body="This topic may have been renamed. Browse the library to find it."
        action={<ActionButton as={Link} to="/learn" size="sm">Back to library</ActionButton>}
      />
    );
  }

  const { topic, cards, mastery } = state;
  const accuracy = mastery ? Number(mastery.accuracy) || 0 : null;

  return (
    <div>
      <Link to="/learn" className="mb-5 inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground transition hover:text-brand-azure">
        <ArrowLeft className="h-3.5 w-3.5" /> Topic library
      </Link>

      <PageHeader
        eyebrow={topic.domain_label}
        title={topic.title}
        description={topic.summary}
        actions={
          <>
            <ActionButton as={Link} to={`/flashcards?topic=${topic.slug}`} variant="outline">
              <Layers className="h-4 w-4" /> Study flashcards
            </ActionButton>
            <ActionButton as={Link} to={`/practice?topic=${topic.slug}`} variant="azure">
              <ListChecks className="h-4 w-4" /> Practise this topic
            </ActionButton>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
        <div className="space-y-5">
          <section className="aa-panel p-5 sm:p-6">
            <p className="text-[13.5px] leading-relaxed text-brand-navy/80">{topic.intro}</p>

            <h2 className="mt-6 font-heading text-[13px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Learning objectives
            </h2>
            <ul className="mt-3 space-y-2">
              {(topic.objectives || []).map((objective) => (
                <li key={objective} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-brand-navy">
                  <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-azure" /> {objective}
                </li>
              ))}
            </ul>

            <h2 className="mt-6 font-heading text-[13px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Key concepts
            </h2>
            <div className="mt-3 divide-y divide-border rounded-xl border border-border">
              {(topic.key_concepts || []).map((concept) => {
                const [term, ...rest] = concept.split('—');
                return (
                  <div key={concept} className="px-4 py-3">
                    <p className="text-[13px] font-medium text-brand-ink">{term.trim()}</p>
                    {rest.length > 0 && (
                      <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">{rest.join('—').trim()}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {(topic.examples || []).length > 0 && (
              <>
                <h2 className="mt-6 font-heading text-[13px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Worked examples
                </h2>
                <ul className="mt-3 space-y-2">
                  {(topic.examples || []).map((example) => (
                    <li key={example} className="rounded-xl bg-brand-mist/70 px-4 py-3 text-[12.5px] leading-relaxed text-brand-navy">
                      {example}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {topic.source_url && (
              <a
                href={topic.source_url}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-6 inline-flex items-center gap-1.5 text-[11.5px] text-muted-foreground transition hover:text-brand-azure"
              >
                Reference: Microsoft Learn path for this domain <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </section>

          <section className="aa-panel p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-[14px] font-semibold text-brand-ink">Cards in this topic</h2>
              <span className="text-[11.5px] text-muted-foreground">{cards.length} cards</span>
            </div>
            <ul className="mt-3 divide-y divide-border">
              {cards.slice(0, 6).map((card) => (
                <li key={card.id} className="py-2.5">
                  <p className="text-[12.5px] font-medium leading-snug text-brand-navy">{card.front}</p>
                  <p className="mt-0.5 line-clamp-1 text-[11.5px] text-muted-foreground">{card.back}</p>
                </li>
              ))}
            </ul>
            <ActionButton as={Link} to={`/flashcards?topic=${topic.slug}`} variant="subtle" size="sm" className="mt-3 w-full">
              Start a {cards.length}-card session <ArrowRight className="h-3.5 w-3.5" />
            </ActionButton>
          </section>
        </div>

        <div className="space-y-5">
          <div className="aa-panel p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Your performance</p>
            {accuracy === null ? (
              <>
                <p className="mt-2 font-heading text-[22px] font-semibold text-brand-ink">Not attempted</p>
                <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                  Answer a few questions on this topic to start measuring mastery.
                </p>
              </>
            ) : (
              <>
                <div className="mt-2 flex items-end gap-2">
                  <span className="font-heading text-[32px] font-semibold leading-none text-brand-ink">{pct(accuracy)}</span>
                  <span className="pb-1 text-[11.5px] text-muted-foreground">
                    {mastery.questions_correct}/{mastery.questions_attempted} correct
                  </span>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full rounded-full ${accuracy >= 75 ? 'bg-brand-mint' : accuracy >= 50 ? 'bg-brand-amber' : 'bg-rose-400'}`}
                    style={{ width: `${Math.max(4, accuracy)}%` }}
                  />
                </div>
                <p className="mt-3 text-[11.5px] text-muted-foreground">
                  Last practised {mastery.last_practised_at ? new Date(mastery.last_practised_at).toLocaleDateString() : 'recently'}.
                  {accuracy < 70 ? ' Revisit the key concepts before your next attempt.' : ' Keep it warm with a short review.'}
                </p>
              </>
            )}
          </div>

          <div className="rounded-2xl bg-brand-ink p-5 text-white">
            <Badge tone="ink" className="border-white/20 bg-white/10 text-brand-cyan">Study tip</Badge>
            <p className="mt-3 text-[12.5px] leading-relaxed text-white/75">
              Read the objectives first, then answer questions on the same topic. Recall attempts beat re-reading, and
              every miss is stored as a revision item you can revisit.
            </p>
            <div className="mt-4 flex items-center gap-3 text-[11px] text-white/50">
              <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {topic.duration_min} min read</span>
              <span>·</span>
              <span>{topic.exam_weight} of the exam</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
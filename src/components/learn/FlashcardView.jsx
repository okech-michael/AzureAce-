import { Bookmark, Lightbulb, RotateCcw } from 'lucide-react';
import Badge from '@/components/common/Badge';

export default function FlashcardView({ card, flipped, onFlip, onBookmark, bookmarked, showHint, onToggleHint }) {
  if (!card) return null;

  return (
    <div className="flip-scene">
      <div className="flip-inner min-h-[300px] sm:min-h-[340px]" data-flipped={flipped ? 'true' : 'false'}>
        {/* front */}
        <div className="flip-face aa-panel flex min-h-[300px] w-full flex-col justify-between p-6 sm:min-h-[340px] sm:p-8">
          <div className="flex items-start justify-between gap-3">
            <Badge tone="azure">{card.topic_title || 'Concept'}</Badge>
            <div className="flex items-center gap-2">
              <Badge tone={card.difficulty === 'hard' ? 'rose' : card.difficulty === 'medium' ? 'amber' : 'mint'}>
                {card.difficulty}
              </Badge>
              {onBookmark && (
                <button
                  type="button"
                  onClick={onBookmark}
                  aria-pressed={bookmarked}
                  aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this card'}
                  className={`rounded-lg p-1.5 transition ${bookmarked ? 'text-brand-azure' : 'text-muted-foreground hover:text-brand-azure'}`}
                >
                  <Bookmark className="h-4 w-4" fill={bookmarked ? 'currentColor' : 'none'} />
                </button>
              )}
            </div>
          </div>

          <div className="py-6">
            <p className="font-heading text-[20px] font-medium leading-snug tracking-[-0.02em] text-brand-ink sm:text-[24px]">
              {card.front}
            </p>
            {showHint && card.hint && (
              <p className="mt-4 inline-flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-[12.5px] leading-relaxed text-amber-800">
                <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {card.hint}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {card.hint && (
                <button
                  type="button"
                  onClick={onToggleHint}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[12px] font-medium text-muted-foreground transition hover:text-brand-azure"
                >
                  <Lightbulb className="h-3.5 w-3.5" /> {showHint ? 'Hide hint' : 'Hint'}
                </button>
              )}
              <button
                type="button"
                onClick={onFlip}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[12px] font-medium text-brand-azure transition hover:text-brand-ink"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reveal answer
              </button>
            </div>
            <span className="text-[11px] text-muted-foreground">Press Space to flip</span>
          </div>
        </div>

        {/* back */}
        <div className="flip-face flip-back aa-panel flex min-h-[300px] w-full flex-col justify-between bg-brand-ink p-6 text-white sm:min-h-[340px] sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-cyan">{card.topic_title || 'Answer'}</span>
            <button
              type="button"
              onClick={onFlip}
              className="rounded-lg border border-white/20 px-2 py-1 text-[11px] text-white/70 transition hover:text-white"
            >
              Flip back
            </button>
          </div>

          <div className="py-5">
            <p className="text-[15px] leading-relaxed text-white/95 sm:text-[16px]">{card.back}</p>
            {card.example && (
              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">In practice</p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-white/80">{card.example}</p>
              </div>
            )}
          </div>

          <p className="text-[11px] text-white/45">{card.objective}</p>
        </div>
      </div>
    </div>
  );
}
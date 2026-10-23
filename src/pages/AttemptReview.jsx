import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, ListChecks, RotateCcw, XCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/common/PageHeader';
import ActionButton from '@/components/common/ActionButton';
import Badge from '@/components/common/Badge';
import EmptyState from '@/components/common/EmptyState';
import { LoadingBlock } from '@/components/common/Loading';
import { formatDate, formatDuration, pct } from '@/lib/format';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function AttemptReview() {
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onlyIncorrect, setOnlyIncorrect] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([
      base44.entities.QuizAttempt.filter({ id: attemptId }),
      base44.entities.AttemptAnswer.filter({ attempt_id: attemptId }, { sort: 'answered_at', limit: 100 }),
    ])
      .then(([attemptRows, answerRows]) => {
        if (!alive) return;
        setAttempt(attemptRows[0] || null);
        setAnswers(answerRows.items || answerRows);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => { alive = false; };
  }, [attemptId]);

  const visible = useMemo(
    () => (onlyIncorrect ? answers.filter((a) => !a.is_correct) : answers),
    [answers, onlyIncorrect]
  );

  if (loading) return <LoadingBlock rows={4} />;

  if (!attempt) {
    return (
      <EmptyState
        icon={ListChecks}
        title="Attempt not found"
        body="This attempt may have been deleted. Start a new practice set."
        action={<ActionButton as={Link} to="/practice" size="sm">Back to practice</ActionButton>}
      />
    );
  }

  const score = attempt.score_percent || 0;
  const incorrect = answers.filter((a) => !a.is_correct).length;

  return (
    <div>
      <Link to="/practice" className="mb-5 inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground transition hover:text-brand-azure">
        <ArrowLeft className="h-3.5 w-3.5" /> Practice
      </Link>

      <PageHeader
        eyebrow="Attempt review"
        title={attempt.mode === 'assessment' ? 'Timed assessment results' : 'Practice results'}
        description={`Completed ${formatDate(attempt.completed_at)} · ${formatDuration(attempt.duration_seconds)} · ${attempt.total_questions} questions`}
        actions={
          <>
            <ActionButton as={Link} to="/review" variant="outline">
              <RotateCcw className="h-4 w-4" /> Revision queue
            </ActionButton>
            <ActionButton as={Link} to="/practice">
              Practise again
            </ActionButton>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="aa-panel p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">Score</p>
          <div className="mt-2 flex items-end gap-2">
            <span className={`font-heading text-[36px] font-semibold leading-none ${score >= 75 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
              {pct(score)}
            </span>
            <span className="pb-1 text-[11.5px] text-muted-foreground">{attempt.correct_count || 0}/{attempt.total_questions}</span>
          </div>
        </div>
        <div className="aa-panel p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">Correct</p>
          <div className="mt-2 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span className="font-heading text-[28px] font-semibold leading-none text-brand-ink">{attempt.correct_count || 0}</span>
          </div>
        </div>
        <div className="aa-panel p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">Needs work</p>
          <div className="mt-2 flex items-center gap-2">
            <XCircle className="h-5 w-5 text-rose-500" />
            <span className="font-heading text-[28px] font-semibold leading-none text-brand-ink">{incorrect}</span>
          </div>
        </div>
      </div>

      {attempt.answered_count < attempt.total_questions && (
        <p className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] text-amber-700">
          <Clock className="h-3.5 w-3.5" /> {attempt.total_questions - (attempt.answered_count || 0)} question(s) were left unanswered and counted as incorrect.
        </p>
      )}

      <div className="mb-4 mt-7 flex items-center justify-between">
        <h2 className="font-heading text-[15px] font-semibold text-brand-ink">Question breakdown</h2>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setOnlyIncorrect(false)}
            aria-pressed={!onlyIncorrect}
            className={`rounded-full border px-3 py-1 text-[11.5px] font-medium transition ${!onlyIncorrect ? 'border-brand-ink bg-brand-ink text-white' : 'border-border text-muted-foreground'}`}
          >
            All ({answers.length})
          </button>
          <button
            type="button"
            onClick={() => setOnlyIncorrect(true)}
            aria-pressed={onlyIncorrect}
            className={`rounded-full border px-3 py-1 text-[11.5px] font-medium transition ${onlyIncorrect ? 'border-brand-ink bg-brand-ink text-white' : 'border-border text-muted-foreground'}`}
          >
            Incorrect ({incorrect})
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="Nothing incorrect here"
          body="Every answered question in this attempt was correct. Raise the difficulty or move to a timed assessment."
          action={<ActionButton as={Link} to="/practice?mode=assessment" size="sm">Try an assessment</ActionButton>}
        />
      ) : (
        <ol className="space-y-3">
          {visible.map((answer, i) => (
            <li key={answer.id} className="aa-panel p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-medium ${answer.is_correct ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
                  {answer.is_correct ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  {answer.is_correct ? 'Correct' : 'Incorrect'}
                </span>
                <Badge tone="azure">{answer.topic_title}</Badge>
                <span className="text-[11px] text-muted-foreground">Question {i + 1}</span>
              </div>

              <p className="mt-3 font-heading text-[14px] font-medium leading-relaxed text-brand-ink">{answer.question_text}</p>

              <div className="mt-3 space-y-1.5">
                {(answer.options || []).map((option, optionIndex) => {
                  const isCorrect = (answer.correct_options || []).includes(optionIndex);
                  const wasSelected = (answer.selected_options || []).includes(optionIndex);
                  return (
                    <div
                      key={`${answer.id}-${optionIndex}`}
                      className={`flex items-start gap-2.5 rounded-lg border px-3 py-2 text-[12.5px] ${
                        isCorrect
                          ? 'border-emerald-200 bg-emerald-50/60 text-emerald-900'
                          : wasSelected
                            ? 'border-rose-200 bg-rose-50/60 text-rose-900'
                            : 'border-transparent text-muted-foreground'
                      }`}
                    >
                      <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border border-current text-[9px] font-semibold">
                        {LETTERS[optionIndex]}
                      </span>
                      <span className="leading-relaxed">
                        {option}
                        {isCorrect && <span className="ml-1.5 text-[10.5px] font-medium uppercase tracking-wide">correct</span>}
                        {wasSelected && !isCorrect && <span className="ml-1.5 text-[10.5px] font-medium uppercase tracking-wide">your answer</span>}
                      </span>
                    </div>
                  );
                })}
                {(answer.selected_options || []).length === 0 && (
                  <p className="text-[11.5px] italic text-muted-foreground">You did not answer this question.</p>
                )}
              </div>

              <div className="mt-3 rounded-xl bg-secondary/60 p-3">
                <p className="text-[12.5px] leading-relaxed text-brand-navy">{answer.explanation}</p>
                {answer.distractors && (
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">{answer.distractors}</p>
                )}
                {answer.topic_slug && (
                  <Link to={`/learn/${answer.topic_slug}`} className="mt-2 inline-flex items-center gap-1 text-[11.5px] font-medium text-brand-azure hover:text-brand-ink">
                    Open {answer.topic_title} <ArrowLeft className="h-3 w-3 rotate-180" />
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
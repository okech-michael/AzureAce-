import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  RotateCcw,
  X,
  XCircle,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ActionButton from '@/components/common/ActionButton';
import Badge from '@/components/common/Badge';
import { LoadingBlock } from '@/components/common/Loading';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

function formatClock(seconds) {
  const safe = Math.max(0, seconds || 0);
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function QuizSession() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [index, setIndex] = useState(0);
  const [selections, setSelections] = useState({});
  const [results, setResults] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [remaining, setRemaining] = useState(null);
  const finishingRef = useRef(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const attemptRows = await base44.entities.QuizAttempt.filter({ id: attemptId });
      const record = attemptRows[0];
      if (!alive) return;
      if (!record) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setAttempt(record);
      const ids = record.question_ids || [];
      if (ids.length) {
        const page = await base44.entities.Question.filter({ id: { $in: ids } }, { limit: 50 });
        const byId = new Map((page.items || page).map((q) => [q.id, q]));
        if (!alive) return;
        setQuestions(ids.map((id) => byId.get(id)).filter(Boolean));
      }
      setLoading(false);
    };
    load().catch(() => { if (alive) { setNotFound(true); setLoading(false); } });
    return () => { alive = false; };
  }, [attemptId]);

  const question = questions[index];
  const result = question ? results[question.id] : null;
  const selected = question ? selections[question.id] || [] : [];
  const answeredCount = Object.keys(results).length;
  const remainingUnanswered = questions.length - answeredCount;

  useEffect(() => {
    if (!attempt?.timed || !attempt.time_limit_seconds || !attempt.started_at) return undefined;
    const end = new Date(attempt.started_at).getTime() + attempt.time_limit_seconds * 1000;
    const tick = () => setRemaining(Math.max(0, Math.round((end - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [attempt]);

  const finish = async () => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    setBusy(true);
    setError('');
    try {
      const response = await base44.functions.invoke('finishQuiz', { attempt_id: attemptId });
      if (response.data?.error) throw new Error(response.data.error);
      navigate(`/practice/review/${attemptId}`, { replace: true });
    } catch (err) {
      finishingRef.current = false;
      setBusy(false);
      setError(err?.response?.data?.error || err.message || 'Could not finish the attempt.');
    }
  };

  useEffect(() => {
    if (remaining === 0 && attempt && attempt.status === 'in_progress' && !finishingRef.current) {
      finish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  const toggleOption = (optionIndex) => {
    if (!question || result || busy) return;
    setSelections((prev) => {
      const current = prev[question.id] || [];
      if (question.type === 'multiple') {
        return {
          ...prev,
          [question.id]: current.includes(optionIndex)
            ? current.filter((i) => i !== optionIndex)
            : [...current, optionIndex].sort((a, b) => a - b),
        };
      }
      return { ...prev, [question.id]: [optionIndex] };
    });
  };

  const checkAnswer = async () => {
    if (!question || !selected.length || busy) return;
    setBusy(true);
    setError('');
    try {
      const response = await base44.functions.invoke('gradeAnswer', {
        attempt_id: attemptId,
        question_id: question.id,
        selected_options: selected,
      });
      if (response.data?.error) throw new Error(response.data.error);
      setResults((prev) => ({ ...prev, [question.id]: response.data }));
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Could not grade that answer.');
    } finally {
      setBusy(false);
    }
  };

  const advance = () => {
    if (index + 1 >= questions.length) {
      if (remainingUnanswered > 0) {
        setConfirmFinish(true);
        return;
      }
      finish();
      return;
    }
    setIndex((i) => i + 1);
  };

  const progress = useMemo(
    () => (questions.length ? Math.round((answeredCount / questions.length) * 100) : 0),
    [answeredCount, questions.length]
  );

  if (loading) return <LoadingBlock rows={3} />;

  if (notFound) {
    return (
      <div className="aa-panel p-6 text-center">
        <p className="font-heading text-[16px] font-semibold text-brand-ink">This attempt no longer exists</p>
        <p className="mt-1 text-[12.5px] text-muted-foreground">Start a fresh practice set to continue.</p>
        <ActionButton as={Link} to="/practice" className="mt-4">Back to practice</ActionButton>
      </div>
    );
  }

  if (attempt?.status === 'completed') {
    return <Navigate to={`/practice/review/${attemptId}`} replace />;
  }

  if (!question) {
    return (
      <div className="aa-panel p-6 text-center">
        <p className="font-heading text-[16px] font-semibold text-brand-ink">No questions found for this attempt</p>
        <ActionButton as={Link} to="/practice" className="mt-4" variant="outline">Start a new set</ActionButton>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex items-center justify-between gap-3">
        <Link to="/practice" className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-brand-azure">
          <ArrowLeft className="h-3.5 w-3.5" /> Save and exit
        </Link>
        <div className="flex items-center gap-2">
          {attempt?.timed && remaining !== null && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-[12px] ${
                remaining < 60 ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-border text-muted-foreground'
              }`}
            >
              <Clock className="h-3.5 w-3.5" /> {formatClock(remaining)}
            </span>
          )}
          <span className="rounded-lg border border-border px-2.5 py-1 text-[12px] text-muted-foreground">
            {index + 1} of {questions.length}
          </span>
        </div>
      </div>

      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-gradient-to-r from-brand-cyan to-brand-azure transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="aa-panel p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="azure">{question.topic_title}</Badge>
          <Badge tone={question.difficulty === 'hard' ? 'rose' : question.difficulty === 'medium' ? 'amber' : 'mint'}>
            {question.difficulty}
          </Badge>
          {question.type === 'multiple' && <Badge tone="violet">Select all that apply</Badge>}
        </div>

        <h1 className="mt-4 font-heading text-[17px] font-medium leading-relaxed tracking-[-0.01em] text-brand-ink sm:text-[19px]">
          {question.text}
        </h1>

        <div className="mt-5 space-y-2" role={question.type === 'multiple' ? 'group' : 'radiogroup'} aria-label="Answer options">
          {(question.options || []).map((option, optionIndex) => {
            const isSelected = selected.includes(optionIndex);
            const isCorrect = result ? (result.correct_options || []).includes(optionIndex) : false;
            const isWrongPick = result && isSelected && !isCorrect;

            let stateClass = 'border-border bg-card hover:border-brand-azure/40';
            if (result) {
              if (isCorrect) stateClass = 'border-emerald-300 bg-emerald-50/70';
              else if (isWrongPick) stateClass = 'border-rose-300 bg-rose-50/70';
              else stateClass = 'border-border bg-card opacity-70';
            } else if (isSelected) {
              stateClass = 'border-brand-azure bg-brand-mist/60';
            }

            return (
              <button
                key={`${question.id}-${optionIndex}`}
                type="button"
                onClick={() => toggleOption(optionIndex)}
                disabled={!!result || busy}
                aria-pressed={isSelected}
                className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition disabled:cursor-default ${stateClass}`}
              >
                <span
                  className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center border text-[10.5px] font-semibold ${
                    question.type === 'multiple' ? 'rounded-[5px]' : 'rounded-full'
                  } ${
                    result && isCorrect
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : isWrongPick
                        ? 'border-rose-500 bg-rose-500 text-white'
                        : isSelected
                          ? 'border-brand-azure bg-brand-azure text-white'
                          : 'border-input text-muted-foreground'
                  }`}
                >
                  {result && isCorrect ? <Check className="h-3 w-3" /> : isWrongPick ? <X className="h-3 w-3" /> : LETTERS[optionIndex]}
                </span>
                <span className="text-[13px] leading-relaxed text-brand-navy">{option}</span>
              </button>
            );
          })}
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-[12.5px] text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {result && (
          <div
            className={`mt-5 rounded-xl border p-4 ${
              result.is_correct ? 'border-emerald-200 bg-emerald-50/60' : 'border-rose-200 bg-rose-50/60'
            }`}
          >
            <div className="flex items-center gap-2">
              {result.is_correct ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <XCircle className="h-4 w-4 text-rose-600" />
              )}
              <p className={`text-[13px] font-semibold ${result.is_correct ? 'text-emerald-800' : 'text-rose-800'}`}>
                {result.is_correct ? 'Correct' : 'Not quite'}
              </p>
            </div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-brand-navy">{result.explanation}</p>
            {result.distractors && (
              <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                <span className="font-medium text-brand-navy">Why the others are wrong: </span>
                {result.distractors}
              </p>
            )}
            {!result.is_correct && (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Link to={`/learn/${question.topic_slug || ''}`} className="text-[12px] font-medium text-brand-azure hover:text-brand-ink">
                  Revise {question.topic_title}
                </Link>
                <span className="text-[11.5px] text-muted-foreground">Added to your revision queue</span>
              </div>
            )}
          </div>
        )}

        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="text-[11.5px] text-muted-foreground">{answeredCount} of {questions.length} answered</span>
          {!result ? (
            <ActionButton onClick={checkAnswer} disabled={!selected.length || busy} variant="azure">
              {busy ? 'Checking…' : 'Check answer'}
            </ActionButton>
          ) : (
            <ActionButton onClick={advance} disabled={busy}>
              {index + 1 >= questions.length ? 'Finish and see results' : 'Next question'}
              <ArrowRight className="h-4 w-4" />
            </ActionButton>
          )}
        </div>
      </div>

      {confirmFinish && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-[12.5px] font-medium text-amber-900">
            {remainingUnanswered} question{remainingUnanswered === 1 ? '' : 's'} unanswered will be marked incorrect.
          </p>
          <div className="mt-3 flex gap-2">
            <ActionButton size="sm" onClick={finish} disabled={busy}>
              {busy ? 'Finishing…' : 'Finish anyway'}
            </ActionButton>
            <ActionButton size="sm" variant="ghost" onClick={() => setConfirmFinish(false)}>
              Keep answering
            </ActionButton>
          </div>
        </div>
      )}

      {!confirmFinish && remainingUnanswered === 0 && (
        <ActionButton variant="subtle" onClick={finish} disabled={busy} className="mt-4 w-full">
          <RotateCcw className="h-4 w-4" /> Finish attempt
        </ActionButton>
      )}
    </div>
  );
}
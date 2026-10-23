import { useEffect, useState } from 'react';
import ActionButton from '@/components/common/ActionButton';

const LEVELS = [
  { key: 'new', label: 'New to cloud', body: 'Little or no hands-on Azure experience' },
  { key: 'some-exposure', label: 'Some exposure', body: 'Used Azure a little, or adjacent cloud platforms' },
  { key: 'retaking', label: 'Retaking AZ-900', body: 'Already sat the exam and want a sharper second attempt' },
];

export default function PreferencesForm({ profile, topics = [], onSubmit, submitting, submitLabel = 'Save preferences' }) {
  const [form, setForm] = useState({
    display_name: '',
    exam_date: '',
    minutes_per_day: 45,
    session_length: 25,
    level: 'new',
    weak_topic_slugs: [],
  });

  useEffect(() => {
    setForm({
      display_name: profile?.display_name || '',
      exam_date: profile?.exam_date ? String(profile.exam_date).slice(0, 10) : '',
      minutes_per_day: profile?.minutes_per_day || 45,
      session_length: profile?.session_length || 25,
      level: profile?.level || 'new',
      weak_topic_slugs: profile?.weak_topic_slugs || [],
    });
  }, [profile]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const toggleWeak = (slug) =>
    setForm((prev) => ({
      ...prev,
      weak_topic_slugs: prev.weak_topic_slugs.includes(slug)
        ? prev.weak_topic_slugs.filter((s) => s !== slug)
        : [...prev.weak_topic_slugs, slug],
    }));

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
      className="space-y-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="display-name" className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
            Display name
          </label>
          <input
            id="display-name"
            value={form.display_name}
            onChange={(e) => set('display_name', e.target.value)}
            placeholder="What should we call you?"
            className="mt-1.5 h-10 w-full rounded-xl border border-input bg-card px-3 text-[13px] text-brand-ink placeholder:text-muted-foreground focus:border-brand-azure/50 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="exam-date" className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
            Exam date (optional)
          </label>
          <input
            id="exam-date"
            type="date"
            value={form.exam_date}
            onChange={(e) => set('exam_date', e.target.value)}
            className="mt-1.5 h-10 w-full rounded-xl border border-input bg-card px-3 text-[13px] text-brand-ink focus:border-brand-azure/50 focus:outline-none"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">Leave empty for a rolling two-week plan.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="minutes" className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
            Study time available per day
          </label>
          <select
            id="minutes"
            value={form.minutes_per_day}
            onChange={(e) => set('minutes_per_day', Number(e.target.value))}
            className="mt-1.5 h-10 w-full rounded-xl border border-input bg-card px-3 text-[13px] text-brand-ink focus:border-brand-azure/50 focus:outline-none"
          >
            {[20, 30, 45, 60, 90, 120].map((m) => (
              <option key={m} value={m}>{m} minutes</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="session" className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
            Preferred session length
          </label>
          <select
            id="session"
            value={form.session_length}
            onChange={(e) => set('session_length', Number(e.target.value))}
            className="mt-1.5 h-10 w-full rounded-xl border border-input bg-card px-3 text-[13px] text-brand-ink focus:border-brand-azure/50 focus:outline-none"
          >
            {[10, 15, 25, 30, 45].map((m) => (
              <option key={m} value={m}>{m} minutes</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">Where are you starting from?</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {LEVELS.map((level) => (
            <button
              key={level.key}
              type="button"
              onClick={() => set('level', level.key)}
              aria-pressed={form.level === level.key}
              className={`rounded-xl border p-3 text-left transition ${
                form.level === level.key ? 'border-brand-azure bg-brand-mist/60' : 'border-border bg-card hover:border-brand-azure/40'
              }`}
            >
              <span className="block text-[12.5px] font-medium text-brand-ink">{level.label}</span>
              <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">{level.body}</span>
            </button>
          ))}
        </div>
      </div>

      {topics.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
            Topics you find difficult (optional)
          </p>
          <p className="mt-1 text-[11.5px] text-muted-foreground">These get scheduled earlier in your plan.</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {topics.map((topic) => {
              const active = form.weak_topic_slugs.includes(topic.slug);
              return (
                <button
                  key={topic.slug}
                  type="button"
                  onClick={() => toggleWeak(topic.slug)}
                  aria-pressed={active}
                  className={`rounded-full border px-3 py-1.5 text-[11.5px] font-medium transition ${
                    active ? 'border-brand-ink bg-brand-ink text-white' : 'border-border bg-card text-muted-foreground hover:text-brand-ink'
                  }`}
                >
                  {topic.title}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <ActionButton type="submit" disabled={submitting} size="lg">
          {submitting ? 'Saving…' : submitLabel}
        </ActionButton>
        <p className="text-[11.5px] text-muted-foreground">You can change all of this later in Settings.</p>
      </div>
    </form>
  );
}
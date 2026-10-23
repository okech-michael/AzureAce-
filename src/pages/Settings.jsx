import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Info, LogOut, Mail, ShieldCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/common/PageHeader';
import ActionButton from '@/components/common/ActionButton';
import PreferencesForm from '@/components/settings/PreferencesForm';
import { LoadingBlock } from '@/components/common/Loading';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    Promise.all([
      base44.auth.me(),
      base44.entities.LearnerProfile.list({ limit: 1 }),
      base44.entities.Topic.list({ sort: 'order', limit: 50 }),
    ])
      .then(([me, profilePage, topicPage]) => {
        if (!alive) return;
        setUser(me);
        setProfile((profilePage.items || profilePage)[0] || null);
        setTopics(topicPage.items || topicPage);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => { alive = false; };
  }, []);

  const save = async (values) => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const payload = {
        ...values,
        exam_date: values.exam_date || '',
        onboarding_completed: true,
      };
      if (profile?.id) {
        const updated = await base44.entities.LearnerProfile.update(profile.id, payload);
        setProfile(updated);
      } else {
        const created = await base44.entities.LearnerProfile.create(payload);
        setProfile(created);
      }
      setSaved(true);
    } catch (err) {
      setError(err.message || 'Could not save your preferences.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingBlock rows={4} />;

  return (
    <div className="max-w-3xl">
      <PageHeader
        eyebrow="Settings"
        title="Your account and preferences"
        description="Preferences shape your study plan and recommendations. Nothing here is shared with other learners."
        actions={
          <ActionButton as={Link} to="/plan" variant="outline">Study plan</ActionButton>
        }
      />

      <section className="aa-panel p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-mist text-brand-azure">
            <Mail className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-medium text-brand-ink">{user?.full_name || user?.email}</p>
            <p className="truncate text-[11.5px] text-muted-foreground">{user?.email}</p>
          </div>
          <ActionButton variant="ghost" size="sm" className="ml-auto" onClick={() => base44.auth.logout('/login')}>
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </ActionButton>
        </div>
        <p className="mt-3 text-[11.5px] leading-relaxed text-muted-foreground">
          Sign-in, password reset and session handling are managed by your account provider. To change your password,
          sign out and use “Forgot password” on the sign-in screen.
        </p>
      </section>

      <section className="aa-panel mt-5 p-5 sm:p-6">
        <h2 className="font-heading text-[15px] font-semibold text-brand-ink">Study preferences</h2>
        <p className="mt-1 text-[12px] text-muted-foreground">Used by the planner and the readiness recommendations.</p>

        <div className="mt-5">
          <PreferencesForm
            profile={profile}
            topics={topics}
            onSubmit={save}
            submitting={saving}
            submitLabel="Save preferences"
          />
        </div>

        {saved && (
          <p className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-[12px] text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" /> Preferences saved. Recalculate your plan to apply them.
          </p>
        )}
        {error && (
          <p className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-destructive/5 px-3 py-2 text-[12px] text-destructive">
            <AlertCircle className="h-3.5 w-3.5" /> {error}
          </p>
        )}
      </section>

      <section id="help" className="aa-panel mt-5 p-5 sm:p-6">
        <h2 className="inline-flex items-center gap-2 font-heading text-[15px] font-semibold text-brand-ink">
          <Info className="h-4 w-4 text-brand-azure" /> How the estimates work
        </h2>
        <dl className="mt-3 space-y-3 text-[12.5px] leading-relaxed">
          <div>
            <dt className="font-medium text-brand-navy">Readiness</dt>
            <dd className="text-muted-foreground">
              A weighted summary of recent accuracy (40%), question coverage (25%), domain balance (20%) and consistency
              (15%). It is practice guidance, not a Microsoft exam score and not a guarantee of passing.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-brand-navy">Spaced repetition</dt>
            <dd className="text-muted-foreground">
              Each card keeps an SM-2 style ease value and interval. “Again” resets the card and lowers its ease; “Easy”
              pushes the due date further out.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-brand-navy">AI Study Buddy</dt>
            <dd className="text-muted-foreground">
              Answers are grounded in the stored topic outline, marked as illustrative when they rely on an analogy, and
              rate-limited per hour. Conversations are private to your account.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-brand-navy">Content accuracy</dt>
            <dd className="text-muted-foreground">
              Objectives are based on publicly available Microsoft Learn material and rewritten as original practice
              content. AzureAce is independent and not affiliated with, endorsed by, or sponsored by Microsoft.
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
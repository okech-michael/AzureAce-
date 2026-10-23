import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, Brain, CheckCircle2, Layers, LineChart, ShieldCheck, Sparkles, Target, MessageSquareQuote } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import Brand from '@/components/Brand';
import HeroPreview from '@/components/landing/HeroPreview';
import LandingSections from '@/components/landing/LandingSections';

const domains = [
  { name: 'Cloud concepts', weight: '25–30%', topics: '4 topics' },
  { name: 'Azure architecture & services', weight: '35–40%', topics: '5 topics' },
  { name: 'Azure management & governance', weight: '30–35%', topics: '3 topics' },
];

const features = [
  {
    icon: Layers,
    title: 'Flashcards with real scheduling',
    body: 'An SM-2 style scheduler decides what you see today, so cards you forget return sooner than cards you know.',
  },
  {
    icon: Target,
    title: 'Practice that explains itself',
    body: 'Every question is graded on the server, then answered with why the right option is right and why the others are not.',
  },
  {
    icon: Brain,
    title: 'Learn from mistakes',
    body: 'Missed concepts land in a persistent revision queue with the related flashcard and objective attached.',
  },
  {
    icon: ShieldCheck,
    title: 'Readiness you can question',
    body: 'A transparent estimate built from accuracy, coverage, consistency and recency — plus a confidence indicator.',
  },
  {
    icon: LineChart,
    title: 'Progress per exam domain',
    body: 'See mastery by topic and drill straight from a weak bar into the session that fixes it.',
  },
  {
    icon: MessageSquareQuote,
    title: 'A study buddy that stays grounded',
    body: 'Ask for a simpler explanation, a comparison or an analogy — with suggested follow-ups, not endless chat.',
  },
];

const loop = [
  ['01', 'Map the exam', 'Twelve topics built from the published AZ-900 skills outline, each with objectives and key terms.'],
  ['02', 'Study short', 'Flip focused cards, rate your recall honestly, and let the scheduler space your reviews.'],
  ['03', 'Practise honestly', 'Timed and untimed sets across single and multi-select questions, graded server-side.'],
  ['04', 'Fix what breaks', 'Missed answers become revision items tied to the exact objective you need to revisit.'],
  ['05', 'Check readiness', 'See whether your evidence is strong enough — and what to do next if it is not.'],
];

export default function Landing() {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-border border-t-brand-azure" />
      </div>
    );
  }

  if (isAuthenticated) return <Navigate to="/overview" replace />;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link to="/" aria-label="AzureAce home">
            <Brand />
          </Link>
          <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
            <a href="#how" className="text-[13px] font-medium text-muted-foreground transition hover:text-brand-ink">How it works</a>
            <a href="#features" className="text-[13px] font-medium text-muted-foreground transition hover:text-brand-ink">Features</a>
            <a href="#coverage" className="text-[13px] font-medium text-muted-foreground transition hover:text-brand-ink">Exam coverage</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-full px-3.5 py-2 text-[13px] font-medium text-brand-navy transition hover:bg-secondary"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-ink px-4 py-2 text-[13px] font-medium text-white transition hover:bg-brand-navy"
            >
              Start free <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="aa-hero-grid border-b border-border/60">
          <div className="mx-auto grid max-w-6xl gap-14 px-5 py-16 md:grid-cols-[1.05fr_0.95fr] md:items-center md:py-24">
            <div className="animate-rise">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-medium text-brand-navy">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-mint" />
                Unofficial AZ-900 study companion
              </span>
              <h1 className="mt-6 font-heading text-[38px] font-semibold leading-[1.05] tracking-[-0.035em] text-brand-ink sm:text-[52px]">
                Understand Azure.
                <br />
                Remember more.
                <br />
                Pass with <span className="font-serif font-normal italic tracking-[-0.01em] text-brand-azure">confidence.</span>
              </h1>
              <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                AzureAce turns the AZ-900 skills outline into short, deliberate study sessions — cards that adapt to what
                you forget, practice that explains every mistake, and a readiness view built from evidence rather than
                vibes.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-azure px-6 py-3 text-[14px] font-semibold text-white shadow-[0_10px_30px_-12px_hsl(202_89%_40%/0.9)] transition hover:bg-brand-ink"
                >
                  Start studying free <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-[14px] font-medium text-brand-navy transition hover:border-brand-azure/40 hover:text-brand-azure"
                >
                  I already have an account
                </Link>
              </div>
              <ul className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-muted-foreground">
                {['Built on the published AZ-900 outline', 'Original practice questions', 'No exam dumps, ever'].map((item) => (
                  <li key={item} className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-brand-mint" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="animate-fade pb-10 md:pb-0">
              <HeroPreview />
            </div>
          </div>
        </section>

        <LandingSections features={features} loop={loop} domains={domains} />

        <section className="mx-auto max-w-6xl px-5 pb-20">
          <div className="aa-ink-grid overflow-hidden rounded-[28px] px-7 py-12 text-center sm:px-14 sm:py-16">
            <Sparkles className="mx-auto h-5 w-5 text-brand-cyan" />
            <h2 className="mx-auto mt-5 max-w-2xl font-heading text-[30px] font-semibold leading-tight tracking-[-0.03em] text-white sm:text-[38px]">
              Study the exam objectives, not a pile of random questions.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[14px] leading-relaxed text-white/65">
              Create an account, tell AzureAce when you plan to sit the exam, and get a plan your week can actually hold.
            </p>
            <Link
              to="/register"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-semibold text-brand-ink transition hover:bg-brand-cyan hover:text-brand-ink"
            >
              Create your study plan <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-5 py-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-md">
              <Brand />
              <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
                AzureAce is an independent, unofficial learning tool for the Microsoft Azure Fundamentals (AZ-900)
                certification. It is not affiliated with, endorsed by, or sponsored by Microsoft. Practice results are
                study guidance, not a guarantee of passing.
              </p>
            </div>
            <div className="flex gap-10 text-[12px]">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Study</p>
                <Link to="/learn" className="block text-brand-navy hover:text-brand-azure">Topic library</Link>
                <Link to="/practice" className="block text-brand-navy hover:text-brand-azure">Practice</Link>
                <Link to="/progress" className="block text-brand-navy hover:text-brand-azure">Progress</Link>
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Account</p>
                <Link to="/login" className="block text-brand-navy hover:text-brand-azure">Log in</Link>
                <Link to="/register" className="block text-brand-navy hover:text-brand-azure">Create account</Link>
              </div>
            </div>
          </div>
          <p className="mt-8 border-t border-border pt-5 text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} AzureAce. Educational content written for this platform.
          </p>
        </div>
      </footer>
    </div>
  );
}
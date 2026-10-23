# AzureAce

**Understand Azure. Remember more. Pass with confidence.**

AzureAce is an independent, unofficial study platform for the **Microsoft Azure Fundamentals (AZ-900)** certification. It combines adaptive flashcards, server-graded practice questions, a mistake-driven revision queue, a study planner, an AI tutor and a transparent readiness estimate.

> AzureAce is not affiliated with, endorsed by, or sponsored by Microsoft. Practice results are study guidance, not a guarantee of passing, and no real exam questions are used anywhere in this project.

---

## 1. What is implemented

| Area | What it does |
| --- | --- |
| Topic library | 12 topics across the three published AZ-900 domains, with objectives, key concepts, worked examples, source links and per-topic mastery. |
| Flashcards | 48 original cards, SM-2 style scheduling (ease, interval, lapses, due date), again/hard/good/easy ratings, bookmarks, topic + difficulty + due filters, resume of an interrupted session, keyboard shortcuts. |
| Practice engine | Server-side question selection and grading, single and multiple-select, topic / mixed / weak-areas / timed assessment modes, configurable counts, per-question check with explanation and distractor notes, attempt history and full review. |
| Learn from mistakes | Every incorrect answer writes a `RevisionItem` with the question, correct options, explanation and objective. Items are de-duplicated, counted, resolved when answered correctly later, and shown in a filterable queue. |
| Study planner | Turns exam date, daily minutes, session length, self-declared weak topics and measured mastery into a day-by-day schedule of study / flashcards / practice / revision / assessment blocks. Regenerating reshuffles the remaining days. |
| AI Study Buddy | Grounded in the stored topic outline, conversation history persisted per user, suggested follow-ups, copy, retry, 40-message hourly limit, graceful 503 fallback so the rest of the app keeps working. |
| Progress & readiness | Readiness score from recent accuracy (40%), coverage (25%), domain balance (20%) and consistency (15%), with an evidence-confidence label, component breakdown, accuracy trend, domain bars, consistency strip, topic mastery table. |
| Onboarding & settings | Display name, exam date, study time, session length, experience level, weak topics; editable later. |
| Auth | Base44-managed auth (register, login, OTP verification, password reset) with all app routes behind `ProtectedRoute`. |

## 2. Architecture

- **Frontend:** React 18, Vite, Tailwind CSS with a token-based design system, shadcn/ui primitives, lucide icons, React Router, Recharts, react-markdown.
- **Backend:** Base44 entities (data + row-level security) and backend functions for privileged work.
- **Design:** navy/azure identity, Sora + Inter + Instrument Serif, light-first with dark ink surfaces.

### Project structure

```
src/
  pages/            Landing, Overview, Learn, TopicDetail, Flashcards, Practice,
                    QuizSession, AttemptReview, Mistakes, Buddy, Progress, Plan,
                    Settings, Onboarding, auth pages
  components/
    layout/         AppLayout (sidebar + mobile bottom nav + profile menu)
    common/         PageHeader, ActionButton, StatCard, Badge, EmptyState, Loading
    charts/         ReadinessGauge
    learn/          FlashcardView (3D flip, reduced-motion aware)
    settings/       PreferencesForm (shared by onboarding and settings)
  lib/
    srs.js          SM-2 style scheduler + queue builder
    readiness.js    Documented readiness heuristic
    plan.js         Study-plan generation
    format.js       Formatting, domain constants, streaks
base44/
  entities/         14 entity schemas with row-level security
  functions/
    seedContent/    Idempotent content seeding (admin only)
    startQuiz/      Question selection, creates an attempt
    gradeAnswer/    Server-side grading (answer key never sent to client)
    finishQuiz/     Scoring + topic-mastery aggregation
    studyBuddy/     Grounded AI call, rate limit, persistence
  shared/
    az900-content.ts     Domains, topics, flashcards
    az900-questions.ts   Original practice questions + answer keys
```

## 3. Data model and security

Entities: `Topic`, `Flashcard`, `Question`, `AnswerKey`, `QuizAttempt`, `AttemptAnswer`, `FlashcardReview`, `TopicMastery`, `RevisionItem`, `LearnerProfile`, `StudyPlan`, `StudyTask`, `Conversation`, `ChatMessage`.

- Learning content (`Topic`, `Flashcard`, `Question`) is readable by signed-in users and writable only by admins.
- `AnswerKey` has **read disabled entirely** — only the service role inside `gradeAnswer` can read correct answers.
- Every learner-owned entity is scoped with `created_by_id == {{user.id}}` on read/update/delete, so one learner can never read another learner's attempts, reviews, plan or conversations.
- Inputs to every function are validated and bounded (question counts, difficulty values, option indices, message length, conversation ownership).

## 4. Content

Content lives in `base44/shared/az900-content.ts` and `az900-questions.ts` as structured seed data. To revise content, edit the seed files and call the `seedContent` function with `{ "force": true }` as an admin — it replaces topics, cards, questions and answer keys in one pass. Question provenance is stored on each `Question.source` field (Microsoft Learn learning paths).

Content rules: original questions only, no dumps, one unambiguous correct answer per question, and an explanation plus distractor note on every item.

## 5. AI configuration

The Study Buddy uses the platform `InvokeLLM` integration through the `studyBuddy` backend function, so **no AI API key is stored in browser code** and no secret is required to run it. Prompts are bounded to the stored syllabus, the current conversation and the learner's weak areas. If the model is unavailable the function returns `503 ai_unavailable` and the UI explains that flashcards, practice and explanations still work.

## 6. Local development

```bash
npm install
npm run dev      # Vite dev server
npm run build    # production build
```

Environment: Base44 provides the app id, auth and integration credentials at runtime; no `.env` secrets are required for the current feature set. Any future external key belongs in the app's Secrets page, read inside a backend function only.

## 7. Verification performed

- Production flows exercised in the running app: every route renders (`/overview`, `/learn`, `/learn/:slug`, `/flashcards`, `/practice`, `/review`, `/buddy`, `/progress`, `/plan`, `/settings`), quiz start → answer selection → server grading → explanation → finish → attempt review, flashcard flip → rating → persisted `FlashcardReview` row, revision item created from a wrong answer, mobile overview at phone width with no horizontal overflow.
- Backend functions tested directly: `seedContent` (12 topics / 48 cards / 48 questions / 48 keys), `startQuiz`, `gradeAnswer`, `finishQuiz`, `studyBuddy` (real grounded answer with follow-ups and disclaimer).
- **Not automatically verified:** the onboarding and plan-generation UI flow, the AI chat UI inside the browser, and signed-out/cross-user isolation (the preview runs as the signed-in owner). Test these by hand, and use the Testing Agent for full journeys.

## 8. Known limitations

- Readiness is a heuristic over practice data, not a psychometric model.
- Topic content follows the published outline at build time; verify against Microsoft Learn before each exam season.
- The planner is deterministic guidance; it does not reschedule automatically after a missed day — use “Recalculate”.
- Only English is implemented, although the AI prompt layer is easy to extend.
- No automated unit/integration test suite is included; domain logic lives in pure modules (`srs.js`, `readiness.js`, `plan.js`) so it can be tested without the UI.

## 9. Deployment

Base44 hosts the app. Use **Publish** in the editor to release it; database, auth and functions deploy with the app. No separate Vercel/Supabase setup applies to this project.
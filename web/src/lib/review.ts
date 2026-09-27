/**
 * Glossary review: spaced repetition over the glossary, Leitner-style. Each term sits in a box;
 * answering "Good" moves it up a box and "Easy" two, and the box picks how many days until it
 * comes back. "Again" drops it to box 0 and it returns later in the same session.
 *
 * The schedule lives in progress.reviews (lib/progress.ts), so it is exported, imported and
 * reset with the rest of the learner's progress.
 */
import { GLOSSARY, moduleOf, type GlossaryEntry } from './glossary';
import { read, saveReview, today, type Progress, type ReviewCard } from './progress';

export type Grade = 'again' | 'good' | 'easy';

/** Days until a term is due again, by box. Box 3 and up counts as learned. */
export const INTERVALS = [0, 1, 3, 7, 16, 35, 90];
const TOP_BOX = INTERVALS.length - 1;
export const LEARNED_BOX = 3;
export const SESSION_SIZE = 20;
export const NEW_PER_DAY = 10;

/** 'studied' = terms from lessons the learner has opened; 'all'; or 'm<n>' for one module. */
export type Scope = 'studied' | 'all' | `m${number}`;

function addDays(day: string, n: number): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

const byCourseOrder = (a: GlossaryEntry, b: GlossaryEntry) =>
  (a.lessons[0] ?? '').localeCompare(b.lessons[0] ?? '', undefined, { numeric: true }) || a.term.localeCompare(b.term);

export function termsInScope(scope: Scope, progress: Progress): GlossaryEntry[] {
  if (scope === 'all') return [...GLOSSARY].sort(byCourseOrder);
  if (scope === 'studied') {
    const opened = new Set(Object.entries(progress.lessons).filter(([, s]) => s !== 'not-started').map(([id]) => id));
    return GLOSSARY.filter((e) => e.lessons.some((id) => opened.has(id))).sort(byCourseOrder);
  }
  const module = Number(scope.slice(1));
  return GLOSSARY.filter((e) => moduleOf(e) === module).sort(byCourseOrder);
}

export interface DeckStats {
  total: number;
  due: number;
  /** New terms that may still be introduced today, within the daily cap. */
  newToday: number;
  learned: number;
}

function newAllowance(progress: Progress): number {
  const d = today();
  const introduced = Object.values(progress.reviews).filter((c) => c.added === d).length;
  return Math.max(0, NEW_PER_DAY - introduced);
}

export function deckStats(entries: GlossaryEntry[], progress: Progress): DeckStats {
  const d = today();
  let due = 0;
  let unseen = 0;
  let learned = 0;
  for (const e of entries) {
    const card = progress.reviews[e.slug];
    if (!card) unseen++;
    else {
      if (card.due <= d) due++;
      if (card.box >= LEARNED_BOX) learned++;
    }
  }
  return { total: entries.length, due, newToday: Math.min(unseen, newAllowance(progress)), learned };
}

/** Due terms first (most overdue, then weakest), topped up with new terms in course order. */
export function buildSession(entries: GlossaryEntry[], progress: Progress): GlossaryEntry[] {
  const d = today();
  const due = entries
    .filter((e) => progress.reviews[e.slug] && progress.reviews[e.slug].due <= d)
    .sort((a, b) => {
      const ca = progress.reviews[a.slug];
      const cb = progress.reviews[b.slug];
      return ca.due.localeCompare(cb.due) || ca.box - cb.box;
    })
    .slice(0, SESSION_SIZE);
  const room = Math.min(SESSION_SIZE - due.length, newAllowance(progress));
  const fresh = entries.filter((e) => !progress.reviews[e.slug]).slice(0, Math.max(0, room));
  return [...due, ...fresh];
}

export function nextCard(card: ReviewCard | undefined, grade: Grade): ReviewCard {
  const d = today();
  const current = card ?? { box: 0, due: d, added: d, reps: 0, lapses: 0 };
  const box = grade === 'again' ? 0 : Math.min(TOP_BOX, current.box + (grade === 'easy' ? 2 : 1));
  return {
    box,
    due: addDays(d, INTERVALS[box]),
    added: current.added,
    reps: current.reps + 1,
    lapses: current.lapses + (grade === 'again' && card ? 1 : 0),
  };
}

/** Days until the term would come back for each grade - shown on the buttons. */
export function previewDays(card: ReviewCard | undefined): Record<Grade, number> {
  const box = card?.box ?? 0;
  return { again: 0, good: INTERVALS[Math.min(TOP_BOX, box + 1)], easy: INTERVALS[Math.min(TOP_BOX, box + 2)] };
}

export function recordGrade(slug: string, grade: Grade): ReviewCard {
  const next = nextCard(read().reviews[slug], grade);
  saveReview(slug, next);
  return next;
}

export function formatDays(n: number): string {
  if (n === 0) return 'this session';
  if (n === 1) return 'tomorrow';
  if (n < 30) return `in ${n} days`;
  const months = Math.round(n / 30);
  return months === 1 ? 'in a month' : `in ${months} months`;
}

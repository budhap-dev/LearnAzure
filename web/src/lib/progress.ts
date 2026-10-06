/**
 * Progress lives in localStorage only - no accounts, no backend, nothing leaves the device.
 * Versioned so the shape can change later without throwing away history. Every write
 * dispatches a `progress-changed` event so any mounted page can refresh.
 */
const KEY = 'learnazure.progress.v1';

export type LessonState = 'not-started' | 'in-progress' | 'needs-review' | 'done';

export interface QuizAttempt {
  score: number;
  outOf: number;
  at: string;
}

export interface TestAttempt {
  /** Module number, or 0 for the final learning test. */
  module: number;
  score: number;
  outOf: number;
  percent: number;
  grade: string;
  passed: boolean;
  at: string;
  minutesTaken: number;
}

/** Where one glossary term sits in the review schedule (see lib/review.ts). */
export interface ReviewCard {
  /** 0 = relearning, higher = known for longer; picks the next interval. */
  box: number;
  /** yyyy-mm-dd the term is next due. */
  due: string;
  /** yyyy-mm-dd it was first reviewed - caps new terms per day. */
  added: string;
  reps: number;
  lapses: number;
}

/** What happened on one day - powers the daily plan and the weekly goal (see lib/goals.ts). */
export interface DayLog {
  /** Active time on learning pages, counted by lib/studyTimer.ts. */
  seconds: number;
  /** Lessons that became learned that day. */
  lessons: string[];
  quizzes: number;
  tests: number;
  reviews: number;
}

export const GOAL_CHOICES = [60, 90, 120, 180, 240] as const;
export const DEFAULT_WEEKLY_GOAL = 120;

export interface Progress {
  version: 1;
  lessons: Record<string, LessonState>;
  quizzes: Record<string, QuizAttempt[]>;
  tests: TestAttempt[];
  lastLesson?: string;
  /** ISO dates (yyyy-mm-dd) on which something was learned - powers the streak. */
  days: string[];
  /** Glossary review schedule, keyed by term slug. */
  reviews: Record<string, ReviewCard>;
  /** Activity per day (yyyy-mm-dd), kept for the last 120 days. */
  log: Record<string, DayLog>;
  /** Minutes of study the learner aims for each week. */
  weeklyGoal: number;
}

export const empty = (): Progress => ({ version: 1, lessons: {}, quizzes: {}, tests: [], days: [], reviews: {}, log: {}, weeklyGoal: DEFAULT_WEEKLY_GOAL });

export function read(): Progress {
  try {
    const stored = localStorage.getItem(KEY);
    if (!stored) return empty();
    const parsed = JSON.parse(stored) as Progress;
    if (parsed.version !== 1) return empty();
    return { ...empty(), ...parsed };
  } catch {
    return empty();
  }
}

function write(progress: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    /* storage unavailable - the site still works, it just cannot remember */
  }
  window.dispatchEvent(new Event('progress-changed'));
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function touchDay(progress: Progress): void {
  const d = today();
  if (!progress.days.includes(d)) progress.days = [...progress.days, d].slice(-400);
}

/** Today's activity record, created if needed; old days beyond 120 are dropped. */
function todayLog(progress: Progress): DayLog {
  const d = today();
  if (!progress.log[d]) {
    const keep = Object.keys(progress.log).sort().slice(-119);
    progress.log = { ...Object.fromEntries(keep.map((k) => [k, progress.log[k]])), [d]: { seconds: 0, lessons: [], quizzes: 0, tests: 0, reviews: 0 } };
  }
  return progress.log[d];
}

function markLearnedToday(progress: Progress, id: string): void {
  const log = todayLog(progress);
  if (!log.lessons.includes(id)) log.lessons = [...log.lessons, id];
}

/** Adds active study time to today (called by the study timer about once a minute). */
export function addStudySeconds(seconds: number): void {
  if (seconds <= 0) return;
  const progress = read();
  todayLog(progress).seconds += seconds;
  write(progress);
}

export function setWeeklyGoal(minutes: number): void {
  const progress = read();
  progress.weeklyGoal = minutes;
  write(progress);
}

export function lessonState(id: string): LessonState {
  return read().lessons[id] ?? 'not-started';
}

export function setLessonState(id: string, state: LessonState): void {
  const progress = read();
  const wasDone = progress.lessons[id] === 'done';
  progress.lessons[id] = state;
  if (state === 'done') {
    touchDay(progress);
    if (!wasDone) markLearnedToday(progress, id);
  }
  write(progress);
}

/** Called when a lesson is opened: remembers it and marks it started (never downgrades). */
export function visitLesson(id: string): void {
  const progress = read();
  progress.lastLesson = id;
  if (!progress.lessons[id] || progress.lessons[id] === 'not-started') progress.lessons[id] = 'in-progress';
  write(progress);
}

export const PASS_MARK = 0.8;

export function recordQuiz(id: string, score: number, outOf: number): void {
  const progress = read();
  const attempts = progress.quizzes[id] ?? [];
  attempts.push({ score, outOf, at: new Date().toISOString() });
  progress.quizzes[id] = attempts;
  const wasDone = progress.lessons[id] === 'done';
  // 80% or better counts as learned; below that it is flagged for another look.
  progress.lessons[id] = score / outOf >= PASS_MARK ? 'done' : 'needs-review';
  touchDay(progress);
  todayLog(progress).quizzes += 1;
  if (!wasDone && progress.lessons[id] === 'done') markLearnedToday(progress, id);
  write(progress);
}

export function bestScore(id: string): QuizAttempt | null {
  const attempts = read().quizzes[id] ?? [];
  if (attempts.length === 0) return null;
  return attempts.reduce((best, a) => (a.score / a.outOf > best.score / best.outOf ? a : best));
}

export function recordTest(attempt: TestAttempt): void {
  const progress = read();
  progress.tests = [...progress.tests, attempt];
  touchDay(progress);
  todayLog(progress).tests += 1;
  write(progress);
}

export function testHistory(module: number): TestAttempt[] {
  return read().tests.filter((t) => t.module === module);
}

export function bestTest(module: number): TestAttempt | null {
  const history = testHistory(module);
  if (history.length === 0) return null;
  return history.reduce((best, t) => (t.percent > best.percent ? t : best));
}

/** Consecutive days, ending today or yesterday, with learning activity. */
export function streak(): number {
  const days = new Set(read().days);
  let count = 0;
  const cursor = new Date();
  // Allow the streak to survive if the learner has not done anything yet today.
  if (!days.has(cursor.toISOString().slice(0, 10))) cursor.setDate(cursor.getDate() - 1);
  while (days.has(cursor.toISOString().slice(0, 10))) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

export function saveReview(slug: string, card: ReviewCard): void {
  const progress = read();
  progress.reviews = { ...progress.reviews, [slug]: card };
  touchDay(progress);
  todayLog(progress).reviews += 1;
  write(progress);
}

export function reset(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing to do */
  }
  window.dispatchEvent(new Event('progress-changed'));
}

/** Replaces the whole record - used by import and sync (see lib/sync.ts). */
export function replace(progress: Progress): void {
  write(progress);
}

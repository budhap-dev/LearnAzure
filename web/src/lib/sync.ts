/**
 * Moving progress between devices without a backend. Progress travels as a file, pasted JSON
 * or a sync link whose data sits after the # (browsers never send that part to a server).
 * Importing merges by default, so whatever this device already holds is never lost, and
 * merging the same data twice changes nothing - safe to sync back and forth.
 */
import { empty, read, type DayLog, type LessonState, type Progress, type QuizAttempt, type ReviewCard, type TestAttempt, DEFAULT_WEEKLY_GOAL } from './progress';

const RANK: Record<LessonState, number> = { 'not-started': 0, 'in-progress': 1, 'needs-review': 2, done: 3 };
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const LOG_DAYS = 120;
const MAX_DAYS = 400;

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isStr = (v: unknown): v is string => typeof v === 'string';
const isDay = (v: unknown): v is string => isStr(v) && DAY.test(v);
const count = (v: unknown): number => (isNum(v) && v > 0 ? Math.floor(v) : 0);

function quizAttempt(v: unknown): QuizAttempt | null {
  if (!isObj(v) || !isNum(v.score) || !isNum(v.outOf) || v.outOf <= 0 || !isStr(v.at)) return null;
  return { score: v.score, outOf: v.outOf, at: v.at };
}

function testAttempt(v: unknown): TestAttempt | null {
  if (!isObj(v) || !isNum(v.module) || !isNum(v.score) || !isNum(v.outOf) || !isNum(v.percent) || !isStr(v.grade) || typeof v.passed !== 'boolean' || !isStr(v.at)) return null;
  return { module: v.module, score: v.score, outOf: v.outOf, percent: v.percent, grade: v.grade, passed: v.passed, at: v.at, minutesTaken: count(v.minutesTaken) };
}

function reviewCard(v: unknown): ReviewCard | null {
  if (!isObj(v) || !isNum(v.box) || !isDay(v.due) || !isDay(v.added)) return null;
  return { box: Math.max(0, Math.floor(v.box)), due: v.due, added: v.added, reps: count(v.reps), lapses: count(v.lapses) };
}

function dayLog(v: unknown): DayLog | null {
  if (!isObj(v)) return null;
  const lessons = Array.isArray(v.lessons) ? v.lessons.filter(isStr) : [];
  return { seconds: count(v.seconds), lessons, quizzes: count(v.quizzes), tests: count(v.tests), reviews: count(v.reviews) };
}

/** Rebuilds a progress record from untrusted input, keeping only well-formed entries. */
export function sanitize(raw: unknown): Progress | null {
  if (!isObj(raw) || raw.version !== 1 || !isObj(raw.lessons)) return null;
  const p = empty();
  for (const [id, state] of Object.entries(raw.lessons)) if (isStr(state) && state in RANK) p.lessons[id] = state as LessonState;
  if (isObj(raw.quizzes)) {
    for (const [id, list] of Object.entries(raw.quizzes)) {
      const attempts = Array.isArray(list) ? list.map(quizAttempt).filter((a) => a !== null) : [];
      if (attempts.length) p.quizzes[id] = attempts;
    }
  }
  if (Array.isArray(raw.tests)) p.tests = raw.tests.map(testAttempt).filter((t) => t !== null);
  if (isStr(raw.lastLesson)) p.lastLesson = raw.lastLesson;
  if (Array.isArray(raw.days)) p.days = [...new Set(raw.days.filter(isDay))].sort().slice(-MAX_DAYS);
  if (isObj(raw.reviews)) {
    for (const [slug, v] of Object.entries(raw.reviews)) {
      const card = reviewCard(v);
      if (card) p.reviews[slug] = card;
    }
  }
  if (isObj(raw.log)) {
    for (const [day, v] of Object.entries(raw.log)) {
      const log = dayLog(v);
      if (isDay(day) && log) p.log[day] = log;
    }
  }
  if (isNum(raw.weeklyGoal) && raw.weeklyGoal > 0) p.weeklyGoal = Math.round(raw.weeklyGoal);
  return p;
}

const byAt = (a: { at: string }, b: { at: string }) => a.at.localeCompare(b.at);

function unionBy<T>(a: T[], b: T[], key: (item: T) => string): T[] {
  const seen = new Map<string, T>();
  for (const item of [...a, ...b]) if (!seen.has(key(item))) seen.set(key(item), item);
  return [...seen.values()];
}

/** The card with more review history wins; both devices count every answer in reps. */
function newerCard(a: ReviewCard, b: ReviewCard): ReviewCard {
  if (a.reps !== b.reps) return a.reps > b.reps ? a : b;
  if (a.lapses !== b.lapses) return a.lapses > b.lapses ? a : b;
  return b.due > a.due ? b : a;
}

/**
 * Combines this device's progress with another's. A lesson takes the further state, attempts
 * and tests are joined, and each day's activity takes the larger figure rather than the sum -
 * so merging the same data again never double-counts.
 */
export function merge(local: Progress, incoming: Progress): Progress {
  const out: Progress = { ...empty(), ...local };

  out.lessons = { ...local.lessons };
  for (const [id, state] of Object.entries(incoming.lessons)) {
    const mine = out.lessons[id];
    if (!mine || RANK[state] > RANK[mine]) out.lessons[id] = state;
  }

  out.quizzes = { ...local.quizzes };
  for (const [id, attempts] of Object.entries(incoming.quizzes)) {
    out.quizzes[id] = unionBy(out.quizzes[id] ?? [], attempts, (a) => `${a.at}|${a.score}|${a.outOf}`).sort(byAt);
  }

  out.tests = unionBy(local.tests, incoming.tests, (t) => `${t.module}|${t.at}`).sort(byAt);
  out.days = [...new Set([...local.days, ...incoming.days])].sort().slice(-MAX_DAYS);

  out.reviews = { ...local.reviews };
  for (const [slug, card] of Object.entries(incoming.reviews)) {
    const mine = out.reviews[slug];
    out.reviews[slug] = mine ? newerCard(mine, card) : card;
  }

  const log: Record<string, DayLog> = { ...local.log };
  for (const [day, theirs] of Object.entries(incoming.log)) {
    const mine = log[day];
    log[day] = mine
      ? {
          seconds: Math.max(mine.seconds, theirs.seconds),
          lessons: [...new Set([...mine.lessons, ...theirs.lessons])],
          quizzes: Math.max(mine.quizzes, theirs.quizzes),
          tests: Math.max(mine.tests, theirs.tests),
          reviews: Math.max(mine.reviews, theirs.reviews),
        }
      : theirs;
  }
  out.log = Object.fromEntries(Object.keys(log).sort().slice(-LOG_DAYS).map((d) => [d, log[d]]));

  const lastLesson = local.lastLesson ?? incoming.lastLesson;
  if (lastLesson) out.lastLesson = lastLesson;
  out.weeklyGoal = local.weeklyGoal !== DEFAULT_WEEKLY_GOAL ? local.weeklyGoal : incoming.weeklyGoal;
  return out;
}

export interface SyncSummary {
  lessons: number;
  quizzes: number;
  tests: number;
  terms: number;
  minutes: number;
}

const attempts = (p: Progress) => Object.values(p.quizzes).reduce((n, a) => n + a.length, 0);
const seconds = (p: Progress) => Object.values(p.log).reduce((n, d) => n + d.seconds, 0);

/** What a merge would add to this device: lessons moved on, attempts, tests, terms, study time. */
export function summarise(before: Progress, after: Progress): SyncSummary {
  return {
    lessons: Object.entries(after.lessons).filter(([id, s]) => RANK[s] > RANK[before.lessons[id] ?? 'not-started']).length,
    quizzes: attempts(after) - attempts(before),
    tests: after.tests.length - before.tests.length,
    terms: Object.entries(after.reviews).filter(([slug, c]) => JSON.stringify(c) !== JSON.stringify(before.reviews[slug])).length,
    minutes: Math.max(0, Math.round((seconds(after) - seconds(before)) / 60)),
  };
}

export const isEmptySummary = (s: SyncSummary) => Object.values(s).every((n) => n === 0);

/** A one-line description of a progress record, so you can tell which device it came from. */
export function describe(p: Progress): { learned: number; attempts: number; tests: number; terms: number; lastActive?: string } {
  return {
    learned: Object.values(p.lessons).filter((s) => s === 'done').length,
    attempts: attempts(p),
    tests: p.tests.length,
    terms: Object.keys(p.reviews).length,
    lastActive: p.days[p.days.length - 1],
  };
}

export function exportJson(): string {
  return JSON.stringify(read(), null, 2);
}

export function parseJson(text: string): Progress | null {
  try {
    return sanitize(JSON.parse(text));
  } catch {
    return null;
  }
}

/* ---------- Sync links: deflate the JSON, then base64url it into the hash ---------- */

const LINK_VERSION = '1.';
/** Refuse anything that inflates beyond this - real progress is well under 1 MB. */
const MAX_INFLATED = 5_000_000;

export const linksSupported = typeof CompressionStream !== 'undefined' && typeof DecompressionStream !== 'undefined';

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(text: string): Uint8Array<ArrayBuffer> {
  const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function readAll(stream: ReadableStream<Uint8Array>, limit: number): Promise<Uint8Array> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > limit) {
      await reader.cancel();
      throw new Error('too large');
    }
    chunks.push(value);
  }
  const out = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}

/** The code that goes after #/progress/sync/ in a sync link. */
export async function encodeSyncCode(progress: Progress): Promise<string> {
  const input = new Blob([JSON.stringify(progress)]).stream().pipeThrough(new CompressionStream('deflate-raw'));
  return LINK_VERSION + toBase64Url(await readAll(input, Infinity));
}

export async function decodeSyncCode(code: string): Promise<Progress | null> {
  if (!linksSupported || !code.startsWith(LINK_VERSION)) return null;
  try {
    const bytes = fromBase64Url(code.slice(LINK_VERSION.length));
    const output = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return parseJson(new TextDecoder().decode(await readAll(output, MAX_INFLATED)));
  } catch {
    return null;
  }
}

/** A full link to this site that opens the merge preview on another device. */
export async function syncLink(progress: Progress = read()): Promise<string> {
  const { origin, pathname } = window.location;
  return `${origin}${pathname}#/progress/sync/${await encodeSyncCode(progress)}`;
}

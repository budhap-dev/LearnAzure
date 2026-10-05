/**
 * The weekly study goal and today's plan, worked out from the per-day activity log in progress.
 * Weeks run Monday to Sunday. Dates use the same yyyy-mm-dd day as the rest of progress.
 */
import { today, type DayLog, type Progress } from './progress';
import { LESSONS, type LessonMeta } from './syllabus';
import { deckStats, termsInScope } from './review';

/** Study days assumed per week when turning the weekly goal into a daily target. */
const STUDY_DAYS = 5;
/** A day counts as active with at least a minute of study or anything recorded. */
const ACTIVE_SECONDS = 60;
/** Glossary cards that make a review session worth ticking off. */
const REVIEW_TARGET = 10;

const DAY_MS = 86_400_000;
const parse = (d: string) => Date.parse(`${d}T00:00:00Z`);
const format = (ms: number) => new Date(ms).toISOString().slice(0, 10);

export const minutesOf = (log: DayLog | undefined) => Math.floor((log?.seconds ?? 0) / 60);
const isActive = (log: DayLog | undefined) =>
  !!log && (log.seconds >= ACTIVE_SECONDS || log.lessons.length + log.quizzes + log.tests + log.reviews > 0);

/** The daily target in minutes: the weekly goal over five days, rounded up to 5. */
export function dailyTarget(weeklyGoal: number): number {
  return Math.ceil(weeklyGoal / STUDY_DAYS / 5) * 5;
}

export type WeekStatus = 'met' | 'on-track' | 'behind' | 'fresh';

export interface WeekDay {
  date: string;
  label: string;
  minutes: number;
  active: boolean;
  isToday: boolean;
  future: boolean;
}

export interface WeekSummary {
  days: WeekDay[];
  minutes: number;
  goal: number;
  lessons: number;
  activeDays: number;
  /** Days left including today. */
  daysLeft: number;
  status: WeekStatus;
  message: string;
}

export function weekSummary(progress: Progress): WeekSummary {
  const now = today();
  const offset = (new Date(parse(now)).getUTCDay() + 6) % 7; // Monday = 0
  const monday = parse(now) - offset * DAY_MS;
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const days: WeekDay[] = labels.map((label, i) => {
    const date = format(monday + i * DAY_MS);
    const log = progress.log[date];
    return { date, label, minutes: minutesOf(log), active: isActive(log), isToday: date === now, future: date > now };
  });
  const minutes = days.reduce((n, d) => n + d.minutes, 0);
  const lessons = days.reduce((n, d) => n + (progress.log[d.date]?.lessons.length ?? 0), 0);
  const goal = progress.weeklyGoal;
  const daysLeft = 7 - offset;
  const left = Math.max(0, goal - minutes);
  // Expected by the end of yesterday, so a quiet morning does not count as falling behind.
  const expected = (goal * offset) / 7;

  let status: WeekStatus;
  let message: string;
  if (minutes >= goal) {
    status = 'met';
    message = `Goal met: ${minutes} minutes this week. Anything more is a bonus.`;
  } else if (minutes === 0 && offset === 0) {
    status = 'fresh';
    message = `A fresh week. ${dailyTarget(goal)} minutes today gets it off to a good start.`;
  } else if (minutes >= expected * 0.9) {
    status = 'on-track';
    message = `On track: ${left} minutes to go, ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left.`;
  } else {
    status = 'behind';
    const perDay = Math.ceil(left / daysLeft / 5) * 5;
    message = `${left} minutes to go with ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left. About ${perDay} minutes a day catches up.`;
  }
  return { days, minutes, goal, lessons, activeDays: days.filter((d) => d.active).length, daysLeft, status, message };
}

export interface TodayTask {
  id: string;
  label: string;
  detail: string;
  done: boolean;
  /** Where to go to do it. */
  to?: string;
}

/** The next lesson to learn: the last one opened if it is unfinished, else the first unfinished in course order. */
export function nextLesson(progress: Progress): LessonMeta | undefined {
  const last = progress.lastLesson ? LESSONS.find((l) => l.id === progress.lastLesson) : undefined;
  if (last && progress.lessons[last.id] !== 'done') return last;
  return LESSONS.find((l) => progress.lessons[l.id] !== 'done');
}

export function todayPlan(progress: Progress): TodayTask[] {
  const log = progress.log[today()];
  const minutes = minutesOf(log);
  const target = dailyTarget(progress.weeklyGoal);
  const learned = log?.lessons ?? [];
  const next = nextLesson(progress);
  const tasks: TodayTask[] = [
    {
      id: 'minutes',
      label: `Study for ${target} minutes`,
      detail: minutes >= target ? `${minutes} minutes today` : `${minutes} of ${target} minutes so far`,
      done: minutes >= target,
    },
  ];
  if (learned.length > 0) {
    const n = learned.length;
    tasks.push({ id: 'lesson', label: 'Learn a lesson', detail: `${n} ${n === 1 ? 'lesson' : 'lessons'} learned today: ${learned.join(', ')}`, done: true });
  } else if (next) {
    tasks.push({ id: 'lesson', label: `Learn lesson ${next.id}`, detail: `${next.title} - pass its quiz to tick this off`, done: false, to: `/lesson/${next.id}` });
  }
  const studied = termsInScope('studied', progress);
  if (studied.length > 0) {
    const { due, newToday } = deckStats(studied, progress);
    const reviewed = log?.reviews ?? 0;
    // Done after a real session, or once nothing is left to review today.
    const done = reviewed >= REVIEW_TARGET || (due === 0 && (reviewed > 0 || newToday === 0));
    tasks.push({
      id: 'review',
      label: 'Review glossary cards',
      detail: done ? `${reviewed} cards reviewed today` : due > 0 ? `${due} due · ${reviewed} reviewed today` : 'Nothing due - a few new terms keeps them fresh',
      done,
      to: '/glossary/review',
    });
  }
  return tasks;
}

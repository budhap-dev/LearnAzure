/**
 * The course structure: modules and lessons, from src/data/syllabus.json (shared with the
 * Node verify script). Only modules marked `ready` have content; the others are the roadmap.
 */
import raw from '../data/syllabus.json';
import type { AzureIconId } from '../data/icons';

export interface LessonMeta {
  id: string;
  title: string;
  summary: string;
  minutes: number;
  objectives: string[];
  /** Icons that represent the lesson on cards. */
  icons: AzureIconId[];
}

export interface ModuleMeta {
  number: number;
  title: string;
  tagline: string;
  description: string;
  icon: AzureIconId;
  /** CSS colour token name (see index.css --m1..--m9). */
  status: 'ready' | 'planned';
  lessons: LessonMeta[];
}

export const MODULES: ModuleMeta[] = raw.modules as ModuleMeta[];

export const READY_MODULES = MODULES.filter((m) => m.status === 'ready');

export const LESSONS: LessonMeta[] = READY_MODULES.flatMap((m) => m.lessons);

const byId = new Map(LESSONS.map((l) => [l.id, l]));

export function lessonById(id: string): LessonMeta | undefined {
  return byId.get(id);
}

export function moduleOfLesson(id: string): ModuleMeta | undefined {
  return MODULES.find((m) => m.number === Number(id.split('.')[0]));
}

export function moduleByNumber(n: number): ModuleMeta | undefined {
  return MODULES.find((m) => m.number === n);
}

/** The lesson before and after `id` across the whole course (ready modules only). */
export function neighbours(id: string): { prev?: LessonMeta; next?: LessonMeta } {
  const i = LESSONS.findIndex((l) => l.id === id);
  if (i === -1) return {};
  return { prev: LESSONS[i - 1], next: LESSONS[i + 1] };
}

export function totalMinutes(module: ModuleMeta): number {
  return module.lessons.reduce((sum, l) => sum + l.minutes, 0);
}

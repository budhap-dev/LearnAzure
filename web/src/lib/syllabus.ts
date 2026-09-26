/**
 * The course structure: modules and lessons, from src/data/syllabus.json (shared with the
 * Node verify script). A `ready` module is complete, module test included. An `in-progress`
 * module is released one lesson at a time: only its lessons marked `ready` have content. The
 * `planned` modules are the roadmap.
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
  /** Only read in an `in-progress` module: `ready` means this lesson has shipped. */
  status?: 'ready' | 'planned';
}

export interface ModuleMeta {
  number: number;
  title: string;
  tagline: string;
  description: string;
  icon: AzureIconId;
  /** CSS colour token name (see index.css --m1..--m9). */
  status: 'ready' | 'in-progress' | 'planned';
  lessons: LessonMeta[];
}

export const MODULES: ModuleMeta[] = raw.modules as ModuleMeta[];

/** Complete modules: every lesson plus the module test. */
export const READY_MODULES = MODULES.filter((m) => m.status === 'ready');

/** Modules with at least one lesson to read: complete ones and those being released. */
export const OPEN_MODULES = MODULES.filter((m) => m.status !== 'planned');

export function isLessonReady(module: ModuleMeta, lesson: LessonMeta): boolean {
  return module.status === 'ready' || (module.status === 'in-progress' && lesson.status === 'ready');
}

/** The lessons of a module that can be read today. */
export function readyLessons(module: ModuleMeta): LessonMeta[] {
  return module.lessons.filter((l) => isLessonReady(module, l));
}

export const LESSONS: LessonMeta[] = OPEN_MODULES.flatMap(readyLessons);

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

/** The lesson before and after `id` across every lesson that has shipped. */
export function neighbours(id: string): { prev?: LessonMeta; next?: LessonMeta } {
  const i = LESSONS.findIndex((l) => l.id === id);
  if (i === -1) return {};
  return { prev: LESSONS[i - 1], next: LESSONS[i + 1] };
}

export function totalMinutes(module: ModuleMeta): number {
  return module.lessons.reduce((sum, l) => sum + l.minutes, 0);
}

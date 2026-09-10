/**
 * Quiz and test data. Lesson quizzes live in src/data/quizzes/<id>.json; module tests add
 * scenario questions from src/data/exams/module-<n>.json and draw the rest from the
 * module's lesson quizzes. The final learning test draws from everything.
 */
export interface Question {
  id: string;
  topic: string;
  /** A short situation the question sits in - shown above the stem when present. */
  scenario?: string;
  stem: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface ModuleExam {
  module: number;
  minutes: number;
  /** Extra questions drawn at random from the module's lesson quizzes. */
  poolFromLessons: number;
  questions: Question[];
}

const quizFiles = import.meta.glob('../data/quizzes/*.json', { import: 'default' }) as Record<
  string,
  () => Promise<Question[]>
>;
const examFiles = import.meta.glob('../data/exams/module-*.json', { import: 'default' }) as Record<
  string,
  () => Promise<ModuleExam>
>;

export function hasQuiz(id: string): boolean {
  return `../data/quizzes/${id}.json` in quizFiles;
}

export async function loadQuiz(id: string): Promise<Question[]> {
  const loader = quizFiles[`../data/quizzes/${id}.json`];
  return loader ? loader() : [];
}

export function hasModuleExam(module: number): boolean {
  return `../data/exams/module-${module}.json` in examFiles;
}

export async function loadModuleExam(module: number): Promise<ModuleExam | null> {
  const loader = examFiles[`../data/exams/module-${module}.json`];
  return loader ? loader() : null;
}

export function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Shuffles the options of a question, keeping `answer` pointing at the right one. */
export function shuffleOptions(q: Question): Question {
  const order = shuffle(q.options.map((_, i) => i));
  return { ...q, options: order.map((i) => q.options[i]), answer: order.indexOf(q.answer) };
}

/** Assembles a module test: every scenario question plus a random draw from the lessons. */
export async function buildModuleTest(module: number, lessonIds: string[]): Promise<{ exam: ModuleExam; questions: Question[] } | null> {
  const exam = await loadModuleExam(module);
  if (!exam) return null;
  const pools = await Promise.all(lessonIds.map(loadQuiz));
  const drawn = shuffle(pools.flat()).slice(0, exam.poolFromLessons);
  const questions = shuffle([...exam.questions, ...drawn]).map(shuffleOptions);
  return { exam, questions };
}

export const FINAL_TEST = { minutes: 45, questions: 40 };

/** The final learning test: an even draw across every ready module. */
export async function buildFinalTest(modules: { number: number; lessonIds: string[] }[]): Promise<Question[]> {
  const perModule = Math.max(1, Math.ceil(FINAL_TEST.questions / Math.max(1, modules.length)));
  const picked: Question[] = [];
  for (const m of modules) {
    const exam = await loadModuleExam(m.number);
    const pools = await Promise.all(m.lessonIds.map(loadQuiz));
    const scenario = shuffle(exam?.questions ?? []).slice(0, Math.ceil(perModule / 2));
    const rest = shuffle(pools.flat()).slice(0, perModule - scenario.length);
    picked.push(...scenario, ...rest);
  }
  return shuffle(picked).slice(0, FINAL_TEST.questions).map(shuffleOptions);
}

export interface Grade {
  letter: string;
  label: string;
  passed: boolean;
}

export const TEST_PASS_PERCENT = 70;

export function gradeFor(percent: number): Grade {
  if (percent >= 90) return { letter: 'A', label: 'Outstanding - you could teach this', passed: true };
  if (percent >= 80) return { letter: 'B', label: 'Strong - ready to guide the team', passed: true };
  if (percent >= TEST_PASS_PERCENT) return { letter: 'C', label: 'Passed - solid working knowledge', passed: true };
  if (percent >= 50) return { letter: 'D', label: 'Nearly there - review the flagged topics', passed: false };
  return { letter: 'E', label: 'Not yet - re-read the module and try again', passed: false };
}

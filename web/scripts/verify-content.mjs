/**
 * Content checks that run before every build. Fails (exit 1) if anything is broken:
 *
 *  - every "ready" lesson in the syllabus has a Markdown file, and its frontmatter agrees
 *  - every lesson file has the expected sections and a real-life scenario
 *  - every Azure icon referenced (az:slug, diagram nodes, syllabus, glossary) exists
 *  - every ```diagram block is valid JSON with resolvable edges and groups
 *  - every gl:/lesson: link resolves
 *  - every ready lesson has a quiz with 6-10 well-formed questions and unique ids
 *  - every ready module has a module test with well-formed scenario questions
 *  - glossary entries are unique, point at real lessons, and "related" names resolve
 *
 * Then rebuilds the search index.
 */
import { readFile, readdir, access } from 'node:fs/promises';
import { join } from 'node:path';
import { buildSearchIndex, parseFrontmatter } from './build-search.mjs';

const ROOT = new URL('../', import.meta.url).pathname;
const read = (p) => readFile(join(ROOT, p), 'utf8');
const exists = (p) => access(join(ROOT, p)).then(() => true, () => false);

const errors = [];
const warnings = [];
const fail = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);

const syllabus = JSON.parse(await read('src/data/syllabus.json'));
const iconsTs = await read('src/data/icons.ts');
const iconIds = new Set([...iconsTs.matchAll(/^\s+'([a-z0-9-]+)':/gm)].map((m) => m[1]));
const iconFiles = new Set((await readdir(join(ROOT, 'public/azure-icons'))).filter((f) => f.endsWith('.svg')).map((f) => f.replace(/\.svg$/, '')));
for (const id of iconIds) if (!iconFiles.has(id)) fail(`icons.ts lists "${id}" but public/azure-icons/${id}.svg is missing`);

const allLessonIds = new Set(syllabus.modules.flatMap((m) => m.lessons.map((l) => l.id)));
const readyModules = syllabus.modules.filter((m) => m.status === 'ready');
const readyLessons = readyModules.flatMap((m) => m.lessons);

const glossaryFiles = (await readdir(join(ROOT, 'src/data/glossary'))).filter((f) => f.endsWith('.json')).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
const glossary = [];
for (const f of glossaryFiles) {
  try {
    const entries = JSON.parse(await read(`src/data/glossary/${f}`));
    if (!Array.isArray(entries)) fail(`glossary/${f}: must be a JSON array`);
    else glossary.push(...entries.map((e) => ({ ...e, _file: f })));
  } catch (e) {
    fail(`glossary/${f}: invalid JSON - ${e.message}`);
  }
}
const slugOf = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const glossarySlugs = new Set(glossary.map((e) => slugOf(e.term)));

const checkIcon = (id, where) => {
  if (!iconIds.has(id)) fail(`${where}: unknown Azure icon "${id}"`);
};

// Syllabus icons
for (const m of syllabus.modules) {
  checkIcon(m.icon, `syllabus module ${m.number}`);
  for (const l of m.lessons) {
    if (!/^\d+\.\d+$/.test(l.id)) fail(`syllabus: bad lesson id "${l.id}"`);
    if (Number(l.id.split('.')[0]) !== m.number) fail(`syllabus: lesson ${l.id} is under module ${m.number}`);
    for (const i of l.icons ?? []) checkIcon(i, `syllabus lesson ${l.id}`);
    if (m.status === 'ready') {
      if (!l.summary) fail(`syllabus: ready lesson ${l.id} has no summary`);
      if (!(l.objectives?.length >= 2)) fail(`syllabus: ready lesson ${l.id} needs at least two objectives`);
    }
  }
}

// Lessons
const REQUIRED_SECTIONS = ['Why this matters', 'Key takeaways'];
for (const l of readyLessons) {
  const path = `src/content/lessons/${l.id}.md`;
  if (!(await exists(path))) {
    fail(`${path} is missing`);
    continue;
  }
  const raw = await read(path);
  const { meta, body } = parseFrontmatter(raw);
  if (meta.id !== l.id) fail(`${path}: frontmatter id "${meta.id}" != "${l.id}"`);
  if (meta.title !== l.title) fail(`${path}: frontmatter title differs from the syllabus`);
  const headings = [...body.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
  for (const s of REQUIRED_SECTIONS) if (!headings.some((h) => h.toLowerCase().startsWith(s.toLowerCase()))) fail(`${path}: missing "## ${s}" section`);
  if (!/\[!SCENARIO\]/.test(body)) fail(`${path}: no [!SCENARIO] callout - every lesson starts from a real situation`);
  if (!/\[!TEAM\]/.test(body) && !headings.some((h) => /guiding your team/i.test(h))) fail(`${path}: no "Guiding your team" section or [!TEAM] callout`);
  if (!/```diagram/.test(body) && !/!\[[^\]]*\]\(az:/.test(body)) warn(`${path}: no diagram and no Azure icon used`);
  const words = body.split(/\s+/).length;
  if (words < 600) fail(`${path}: only ${words} words - lessons should be at least 600`);

  for (const m of body.matchAll(/!\[[^\]]*\]\(az:([a-z0-9-]+)\)/g)) checkIcon(m[1], path);
  for (const m of body.matchAll(/\]\(gl:([a-z0-9-]+)\)/g)) if (!glossarySlugs.has(m[1])) fail(`${path}: glossary link "gl:${m[1]}" has no entry`);
  for (const m of body.matchAll(/\]\(lesson:([0-9.]+)\)/g)) if (!allLessonIds.has(m[1])) fail(`${path}: lesson link "lesson:${m[1]}" does not exist`);
  for (const m of body.matchAll(/> \[!([A-Z]+)\]/g)) if (!['NOTE', 'TIP', 'WARNING', 'SCENARIO', 'TEAM', 'EXAMPLE', 'IMPORTANT'].includes(m[1])) fail(`${path}: unknown callout [!${m[1]}]`);

  for (const m of body.matchAll(/```diagram\n([\s\S]*?)```/g)) {
    let spec;
    try {
      spec = JSON.parse(m[1]);
    } catch (e) {
      fail(`${path}: diagram JSON invalid - ${e.message}`);
      continue;
    }
    const ids = new Set();
    for (const n of spec.nodes ?? []) {
      if (ids.has(n.id)) fail(`${path}: diagram has duplicate node id "${n.id}"`);
      ids.add(n.id);
      if (!['user', 'internet', 'onprem'].includes(n.icon)) checkIcon(n.icon, `${path} diagram node ${n.id}`);
      if (typeof n.x !== 'number' || typeof n.y !== 'number') fail(`${path}: diagram node ${n.id} needs numeric x and y`);
      if (!n.label) fail(`${path}: diagram node ${n.id} has no label`);
    }
    const seen = new Set();
    for (const n of spec.nodes ?? []) {
      const key = `${n.x},${n.y}`;
      if (seen.has(key)) fail(`${path}: diagram nodes overlap at (${key})`);
      seen.add(key);
    }
    for (const e of spec.edges ?? []) {
      if (!ids.has(e.from) || !ids.has(e.to)) fail(`${path}: diagram edge ${e.from} -> ${e.to} references an unknown node`);
    }
    for (const g of spec.groups ?? []) for (const id of g.nodes ?? []) if (!ids.has(id)) fail(`${path}: diagram group "${g.label}" references unknown node "${id}"`);
  }
}

// Quizzes
const questionIds = new Set();
function checkQuestion(q, where, requireScenario = false) {
  if (!q.id) fail(`${where}: question without id`);
  if (questionIds.has(q.id)) fail(`${where}: duplicate question id "${q.id}"`);
  questionIds.add(q.id);
  if (!q.stem || q.stem.length < 15) fail(`${where}: question ${q.id} stem too short`);
  if (!Array.isArray(q.options) || q.options.length < 3 || q.options.length > 5) fail(`${where}: question ${q.id} needs 3-5 options`);
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= (q.options?.length ?? 0)) fail(`${where}: question ${q.id} answer index out of range`);
  if (!q.explanation || q.explanation.length < 30) fail(`${where}: question ${q.id} needs a real explanation`);
  if (!q.topic) fail(`${where}: question ${q.id} has no topic`);
  if (requireScenario && !q.scenario) fail(`${where}: question ${q.id} needs a scenario`);
  if (new Set(q.options).size !== q.options?.length) fail(`${where}: question ${q.id} has duplicate options`);
}
for (const l of readyLessons) {
  const path = `src/data/quizzes/${l.id}.json`;
  if (!(await exists(path))) {
    fail(`${path} is missing`);
    continue;
  }
  let quiz;
  try {
    quiz = JSON.parse(await read(path));
  } catch (e) {
    fail(`${path}: invalid JSON - ${e.message}`);
    continue;
  }
  if (!Array.isArray(quiz) || quiz.length < 6 || quiz.length > 10) fail(`${path}: needs 6-10 questions (has ${quiz?.length})`);
  for (const q of quiz ?? []) {
    checkQuestion(q, path);
    if (q.id && !q.id.startsWith(`${l.id}-`)) fail(`${path}: question id "${q.id}" should start with "${l.id}-"`);
  }
}

// Module tests
for (const m of readyModules) {
  const path = `src/data/exams/module-${m.number}.json`;
  if (!(await exists(path))) {
    fail(`${path} is missing`);
    continue;
  }
  let exam;
  try {
    exam = JSON.parse(await read(path));
  } catch (e) {
    fail(`${path}: invalid JSON - ${e.message}`);
    continue;
  }
  if (exam.module !== m.number) fail(`${path}: module number mismatch`);
  if (!(exam.minutes >= 10)) fail(`${path}: minutes should be at least 10`);
  if (!(exam.poolFromLessons >= 5)) fail(`${path}: poolFromLessons should be at least 5`);
  if (!Array.isArray(exam.questions) || exam.questions.length < 8) fail(`${path}: needs at least 8 scenario questions`);
  for (const q of exam.questions ?? []) checkQuestion(q, path, true);
}

// Glossary
const terms = new Set();
for (const e of glossary) {
  if (terms.has(e.term.toLowerCase())) fail(`glossary/${e._file}: duplicate term "${e.term}"`);
  if (e._file !== 'shared.json' && !(e.lessons ?? []).includes(e._file.replace(/\.json$/, ''))) fail(`glossary/${e._file}: "${e.term}" must list lesson ${e._file.replace(/\.json$/, '')} in its lessons`);
  terms.add(e.term.toLowerCase());
  if (!e.definition || e.definition.length < 40) fail(`glossary: "${e.term}" needs a fuller definition`);
  if (!Array.isArray(e.lessons) || e.lessons.length === 0) fail(`glossary: "${e.term}" must list at least one lesson`);
  for (const id of e.lessons ?? []) if (!allLessonIds.has(id)) fail(`glossary: "${e.term}" points at unknown lesson ${id}`);
  for (const r of e.related ?? []) if (!glossarySlugs.has(slugOf(r))) fail(`glossary: "${e.term}" relates to unknown term "${r}"`);
  if (e.icon) checkIcon(e.icon, `glossary "${e.term}"`);
}
for (const l of readyLessons) {
  if (!glossary.some((e) => e.lessons.includes(l.id))) warn(`glossary: no term is taught in lesson ${l.id}`);
}

const indexed = await buildSearchIndex();

for (const w of warnings) console.log(`warning: ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`error: ${e}`);
  console.error(`\n${errors.length} content error(s).`);
  process.exit(1);
}
console.log(`Content OK: ${readyLessons.length} lesson(s), ${readyModules.length} module test(s), ${glossary.length} glossary term(s), ${iconIds.size} icons, search index of ${indexed}.`);

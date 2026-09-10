/**
 * Builds public/data/search-index.json from the lesson Markdown and the syllabus. Run before
 * dev and build (and by verify-content.mjs). One record per lesson that has content.
 */
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = new URL('../', import.meta.url).pathname;
const LESSONS = join(ROOT, 'src/content/lessons');
const OUT_DIR = join(ROOT, 'public/data');

export function toPlainText(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^> \[!\w+\]/gm, ' ')
    .replace(/[#>*_|=-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { meta: {}, body: raw };
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    let value = line.slice(idx + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = JSON.parse(value);
    meta[line.slice(0, idx).trim()] = value;
  }
  return { meta, body: raw.slice(match[0].length) };
}

export async function buildSearchIndex() {
  const syllabus = JSON.parse(await readFile(join(ROOT, 'src/data/syllabus.json'), 'utf8'));
  const lessons = new Map(syllabus.modules.flatMap((m) => m.lessons.map((l) => [l.id, { ...l, module: m.number }])));
  const index = [];
  let files = [];
  try {
    files = (await readdir(LESSONS)).filter((f) => f.endsWith('.md'));
  } catch {
    files = [];
  }
  for (const file of files) {
    const id = file.replace(/\.md$/, '');
    const entry = lessons.get(id);
    if (!entry) continue;
    const { body } = parseFrontmatter(await readFile(join(LESSONS, file), 'utf8'));
    const sections = [...body.matchAll(/^##+ (.+)$/gm)].map((m) => m[1].replace(/[*_`]/g, ''));
    index.push({
      id,
      title: entry.title,
      module: entry.module,
      summary: entry.summary,
      objectives: entry.objectives ?? [],
      sections,
      text: toPlainText(body).slice(0, 5000),
    });
  }
  index.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(join(OUT_DIR, 'search-index.json'), JSON.stringify(index));
  return index.length;
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  const n = await buildSearchIndex();
  console.log(`Search: index of ${n} lesson(s) -> public/data/search-index.json`);
}

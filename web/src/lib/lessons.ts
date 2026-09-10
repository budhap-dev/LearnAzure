/**
 * Lesson content: one Markdown file per lesson in src/content/lessons/<id>.md, loaded lazily
 * so the main bundle stays small. The file has a small frontmatter block (id, title) which
 * verify-content.mjs checks against the syllabus.
 */
const files = import.meta.glob('../content/lessons/*.md', { query: '?raw', import: 'default' }) as Record<
  string,
  () => Promise<string>
>;

export interface LessonDoc {
  id: string;
  title: string;
  body: string;
}

export function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { meta: {}, body: raw };
  const meta: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = JSON.parse(value);
    meta[key] = value;
  }
  return { meta, body: raw.slice(match[0].length) };
}

export function hasLesson(id: string): boolean {
  return `../content/lessons/${id}.md` in files;
}

export async function loadLesson(id: string): Promise<LessonDoc | null> {
  const loader = files[`../content/lessons/${id}.md`];
  if (!loader) return null;
  const raw = await loader();
  const { meta, body } = parseFrontmatter(raw);
  return { id: meta.id ?? id, title: meta.title ?? id, body };
}

/** Headings (## only) of a lesson body, for the in-page table of contents. */
export function headingsOf(body: string): { id: string; text: string }[] {
  const out: { id: string; text: string }[] = [];
  let inFence = false;
  for (const line of body.split('\n')) {
    if (line.startsWith('```')) inFence = !inFence;
    if (inFence) continue;
    const m = line.match(/^## (.+)$/);
    if (m) out.push({ id: slugify(m[1]), text: m[1].replace(/[*_`]/g, '') });
  }
  return out;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[*_`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

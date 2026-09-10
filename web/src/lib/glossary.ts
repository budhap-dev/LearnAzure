/**
 * The glossary: hand-written Azure and cloud terms in src/data/glossary/<lesson>.json, one
 * file per lesson that introduces terms. Each entry links to the lesson(s) that teach it and
 * to related terms. It ships in the main bundle (small text) so the page and the header
 * search can use it without a fetch.
 */
import type { AzureIconId } from '../data/icons';

const fragments = import.meta.glob('../data/glossary/*.json', { eager: true, import: 'default' }) as Record<string, RawEntry[]>;
const raw: RawEntry[] = Object.keys(fragments)
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  .flatMap((k) => fragments[k]);

export interface GlossaryEntry {
  term: string;
  slug: string;
  aliases: string[];
  definition: string;
  example?: string;
  icon?: AzureIconId;
  lessons: string[];
  related: string[];
}

interface RawEntry {
  term: string;
  aliases?: string[];
  definition: string;
  example?: string;
  icon?: string;
  lessons: string[];
  related?: string[];
}

export function slugOf(term: string): string {
  return term
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const GLOSSARY: GlossaryEntry[] = (raw as RawEntry[])
  .map((e) => ({
    term: e.term,
    slug: slugOf(e.term),
    aliases: e.aliases ?? [],
    definition: e.definition,
    example: e.example,
    icon: e.icon as AzureIconId | undefined,
    lessons: e.lessons,
    related: e.related ?? [],
  }))
  .sort((a, b) => a.term.localeCompare(b.term, 'en', { sensitivity: 'base' }));

const bySlug = new Map(GLOSSARY.map((e) => [e.slug, e]));

export function entryBySlug(slug: string): GlossaryEntry | undefined {
  return bySlug.get(slug);
}

export function letterOf(entry: GlossaryEntry): string {
  const first = entry.term[0].toUpperCase();
  return /[A-Z]/.test(first) ? first : '#';
}

export function moduleOf(entry: GlossaryEntry): number {
  return Number(entry.lessons[0]?.split('.')[0] ?? 0);
}

export interface GlossaryHit {
  entry: GlossaryEntry;
  score: number;
}

export function searchGlossary(query: string, entries: GlossaryEntry[] = GLOSSARY): GlossaryHit[] {
  const q = query.trim().toLowerCase();
  const words = q.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const hits: GlossaryHit[] = [];

  for (const entry of entries) {
    const name = entry.term.toLowerCase();
    const aliases = entry.aliases.map((a) => a.toLowerCase());
    const definition = entry.definition.toLowerCase();
    const example = entry.example?.toLowerCase() ?? '';

    let score = 0;
    if (name === q || aliases.includes(q)) score += 100;
    else if (name.startsWith(q) || aliases.some((a) => a.startsWith(q))) score += 40;

    let matchedAll = true;
    for (const w of words) {
      let s = 0;
      if (name.includes(w)) s += 20;
      if (aliases.some((a) => a.includes(w))) s += 12;
      if (definition.includes(w)) s += 3;
      if (example.includes(w)) s += 2;
      if (s === 0) matchedAll = false;
      score += s;
    }
    if (matchedAll) hits.push({ entry, score });
  }
  return hits.sort((a, b) => b.score - a.score || a.entry.term.localeCompare(b.entry.term));
}

/** Terms taught by a lesson, primary ones (listed first in `lessons`) before secondary. */
export function termsForLesson(lessonId: string): GlossaryEntry[] {
  return GLOSSARY.filter((e) => e.lessons.includes(lessonId)).sort((a, b) => {
    const pa = a.lessons.indexOf(lessonId);
    const pb = b.lessons.indexOf(lessonId);
    return pa - pb || a.term.localeCompare(b.term);
  });
}

/**
 * Client-side full-text search over a build-time index (public/data/search-index.json,
 * written by scripts/build-search.mjs). No server, no dependency: a small weighted scorer.
 */
const base = import.meta.env.BASE_URL;

export interface SearchRecord {
  id: string;
  title: string;
  module: number;
  summary: string;
  objectives: string[];
  sections: string[];
  text: string;
}

export interface SearchHit {
  record: SearchRecord;
  score: number;
  snippet: string;
}

let indexPromise: Promise<SearchRecord[]> | null = null;

export function loadIndex(): Promise<SearchRecord[]> {
  indexPromise ??= fetch(`${base}data/search-index.json`)
    .then((r) => (r.ok ? r.json() : []))
    .catch(() => []);
  return indexPromise;
}

export function termsOf(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1);
}

function makeSnippet(text: string, terms: string[]): string {
  const lower = text.toLowerCase();
  let at = -1;
  for (const term of terms) {
    const found = lower.indexOf(term);
    if (found !== -1 && (at === -1 || found < at)) at = found;
  }
  if (at === -1) return text.slice(0, 160) + (text.length > 160 ? '…' : '');
  const start = Math.max(0, at - 60);
  const end = Math.min(text.length, at + 120);
  return (start > 0 ? '…' : '') + text.slice(start, end).trim() + (end < text.length ? '…' : '');
}

export function search(records: SearchRecord[], query: string): SearchHit[] {
  const terms = termsOf(query);
  if (terms.length === 0) return [];
  const hits: SearchHit[] = [];

  for (const record of records) {
    const title = record.title.toLowerCase();
    const summary = record.summary.toLowerCase();
    const objectives = record.objectives.join(' ').toLowerCase();
    const sections = record.sections.join(' ').toLowerCase();
    const body = record.text.toLowerCase();

    let score = 0;
    let matchedAll = true;
    for (const term of terms) {
      let s = 0;
      if (title.includes(term)) s += 10;
      if (title.split(/\s+/).includes(term)) s += 6;
      if (summary.includes(term)) s += 5;
      if (objectives.includes(term)) s += 3;
      if (sections.includes(term)) s += 3;
      if (body.includes(term)) s += 1;
      if (s === 0) matchedAll = false;
      score += s;
    }
    if (matchedAll && score > 0) hits.push({ record, score, snippet: makeSnippet(record.text, terms) });
  }

  return hits.sort(
    (a, b) => b.score - a.score || a.record.id.localeCompare(b.record.id, undefined, { numeric: true }),
  );
}

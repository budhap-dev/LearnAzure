/**
 * A light index of the glossary - each term's name, slug and lessons, without definitions -
 * built into the bundle by vite.config.ts. Pages that only count, list or schedule terms use
 * this; the full glossary (lib/glossary.ts) loads with the pages that show definitions.
 */
export interface TermRef {
  term: string;
  slug: string;
  lessons: string[];
}

/** Every glossary term, sorted alphabetically like the glossary page. */
export const TERMS: TermRef[] = __GLOSSARY_INDEX__;

export function moduleOf(entry: { lessons: string[] }): number {
  return Number(entry.lessons[0]?.split('.')[0] ?? 0);
}

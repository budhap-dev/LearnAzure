/** The URL slug for a glossary term. No imports, so vite.config.ts can use it at build time. */
export function slugOf(term: string): string {
  return term
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

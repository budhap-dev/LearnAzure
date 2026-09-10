import type { ReactNode } from 'react';
import { termsOf } from '../lib/search';

/** Wraps every occurrence of a search term in <mark>. */
export function highlight(text: string, query: string): ReactNode {
  const terms = termsOf(query);
  if (terms.length === 0) return text;
  const pattern = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  return text.split(pattern).map((part, i) => (terms.includes(part.toLowerCase()) ? <mark key={i}>{part}</mark> : part));
}

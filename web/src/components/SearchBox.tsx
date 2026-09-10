import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadIndex, search, type SearchRecord } from '../lib/search';
import { searchGlossary } from '../lib/glossary';
import { highlight } from './Highlight';

interface Suggestion {
  kind: 'lesson' | 'term';
  id: string;
  title: string;
  hint: string;
}

/**
 * Header search with an autocomplete dropdown over lessons and glossary terms. Loads the
 * lesson index on first focus; fully keyboard-driven (up/down/enter/escape).
 */
export function SearchBox({ onNavigate, shortcut = false }: { onNavigate?: () => void; shortcut?: boolean }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [records, setRecords] = useState<SearchRecord[] | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function ensureIndex() {
    if (records === null) loadIndex().then(setRecords);
  }

  useEffect(() => {
    function onAway(e: MouseEvent) {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onAway);
    return () => document.removeEventListener('mousedown', onAway);
  }, []);

  // "/" focuses search from anywhere, the way most documentation sites work. Ignored while
  // typing in a field, so it never swallows a real slash.
  useEffect(() => {
    if (!shortcut) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement;
      const tag = el?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (el as HTMLElement)?.isContentEditable) return;
      e.preventDefault();
      inputRef.current?.focus();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [shortcut]);

  const q = query.trim();
  const suggestions: Suggestion[] = [];
  if (q.length > 1) {
    for (const hit of searchGlossary(q).slice(0, 3)) {
      suggestions.push({ kind: 'term', id: hit.entry.slug, title: hit.entry.term, hint: 'glossary' });
    }
    if (records) {
      for (const hit of search(records, q).slice(0, 6)) {
        suggestions.push({ kind: 'lesson', id: hit.record.id, title: hit.record.title, hint: hit.record.id });
      }
    }
  }

  function go(s: Suggestion) {
    setOpen(false);
    setQuery('');
    setActive(-1);
    onNavigate?.();
    navigate(s.kind === 'term' ? `/glossary?term=${s.id}` : `/lesson/${s.id}`);
  }

  function seeAll() {
    setOpen(false);
    onNavigate?.();
    navigate(`/search?q=${encodeURIComponent(q)}`);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, suggestions.length - 1));
      setOpen(true);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (active >= 0 && suggestions[active]) go(suggestions[active]);
      else if (q.length > 1) seeAll();
    }
  }

  return (
    <div className="header-search" ref={boxRef} role="search">
      <input
        ref={inputRef}
        type="search"
        placeholder="Search lessons and terms…"
        value={query}
        aria-label="Search lessons and terms"
        aria-expanded={open && suggestions.length > 0}
        aria-autocomplete="list"
        role="combobox"
        aria-controls="search-suggestions"
        onFocus={ensureIndex}
        onChange={(e) => {
          ensureIndex();
          setQuery(e.target.value);
          setActive(-1);
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
      />
      {shortcut && <span className="kbd-hint" aria-hidden="true">/</span>}
      {open && q.length > 1 && (
        <ul className="search-suggest" id="search-suggestions" role="listbox">
          {suggestions.length === 0 && <li className="ss-empty">No matches</li>}
          {suggestions.map((s, i) => (
            <li key={`${s.kind}-${s.id}`} role="option" aria-selected={i === active}>
              <button
                type="button"
                className={i === active ? 'active' : ''}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  go(s);
                }}
              >
                <span className={`ss-id ss-${s.kind}`}>{s.hint}</span>
                <span className="ss-title">{highlight(s.title, q)}</span>
              </button>
            </li>
          ))}
          {suggestions.length > 0 && (
            <li role="option" aria-selected={false} className="ss-all">
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  seeAll();
                }}
              >
                See all results for “{q}”
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

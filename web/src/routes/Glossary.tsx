import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { GLOSSARY, entryBySlug, letterOf, moduleOf, searchGlossary, slugOf, type GlossaryEntry } from '../lib/glossary';
import { MODULES, lessonById } from '../lib/syllabus';
import { highlight } from '../components/Highlight';
import { AzureIcon } from '../components/AzureIcon';
import { deckStats, termsInScope } from '../lib/review';
import { useProgress } from '../lib/useProgress';

const LETTERS = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];

/** Scrolls an element to just below the sticky site header and A-Z bar, which would otherwise cover it. */
function scrollBelowBars(el: HTMLElement | null): void {
  if (!el) return;
  const header = document.querySelector('.site-header')?.getBoundingClientRect().height ?? 0;
  const letters = document.querySelector('.letter-bar')?.getBoundingClientRect().height ?? 0;
  // 'instant' overrides the page's smooth scroll-behavior: animating across the whole glossary is slow and lands late.
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - header - letters - 12, behavior: 'instant' });
}

/**
 * A searchable A-Z of every term the course uses. Each entry links to the lesson that
 * teaches it and to related terms. `?q=` searches; `?term=slug` deep-links to one entry.
 */
export function Glossary() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [module, setModule] = useState(0);
  const focusSlug = params.get('term');
  const inputRef = useRef<HTMLInputElement>(null);
  const progress = useProgress();
  const studied = termsInScope('studied', progress);
  const review = studied.length ? deckStats(studied, progress) : null;

  useEffect(() => {
    if (!focusSlug) inputRef.current?.focus();
  }, [focusSlug]);

  useEffect(() => {
    const trimmed = query.trim();
    const next: Record<string, string> = {};
    if (trimmed) next.q = trimmed;
    else if (focusSlug) next.term = focusSlug;
    setParams(next, { replace: true });
  }, [query, focusSlug, setParams]);

  useEffect(() => {
    if (!focusSlug || query) return;
    const el = document.getElementById(`term-${focusSlug}`);
    if (!el) return;
    // Wait a frame: Layout's scroll-to-top on navigation runs after this effect and would undo it.
    // Jump rather than animate - the full glossary is far too tall for a smooth scroll.
    const frame = requestAnimationFrame(() => scrollBelowBars(el));
    el.classList.add('flash');
    const t = setTimeout(() => el.classList.remove('flash'), 1800);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(t);
    };
  }, [focusSlug, query]);

  const filtered = useMemo(() => (module ? GLOSSARY.filter((e) => moduleOf(e) === module) : GLOSSARY), [module]);
  const searching = query.trim().length > 0;
  const results = useMemo(() => (searching ? searchGlossary(query, filtered).map((h) => h.entry) : filtered), [searching, query, filtered]);
  const present = useMemo(() => new Set(results.map(letterOf)), [results]);
  const modules = useMemo(() => [...new Set(GLOSSARY.map(moduleOf))].filter(Boolean).sort((a, b) => a - b), []);

  function focusTerm(entry: GlossaryEntry) {
    setQuery('');
    setModule(0);
    setParams({ term: entry.slug });
  }

  return (
    <div className="glossary">
      <h1>Glossary</h1>
      <p className="lede">
        Every term the course uses, in plain words, with the lesson that teaches it. {GLOSSARY.length} entries -
        search by name, alias or meaning.
      </p>
      <p className="row wrap">
        <Link to="/glossary/review" className="btn primary">Review terms</Link>
        <span className="small muted">
          {review ? `Flashcards for the terms in lessons you have opened: ${review.due} due, ${review.newToday} new today.` : 'Flashcards with spaced repetition, by module or for everything you have studied.'}
        </span>
      </p>
      <div className="glossary-controls">
        <input
          ref={inputRef}
          className="search-input-big"
          type="search"
          placeholder="e.g. resource group, SLA, PaaS, availability zone…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search the glossary"
        />
        <select value={module} onChange={(e) => setModule(Number(e.target.value))} aria-label="Filter by module">
          <option value={0}>All modules</option>
          {modules.map((m) => (
            <option key={m} value={m}>Module {m} · {MODULES.find((x) => x.number === m)?.title}</option>
          ))}
        </select>
      </div>

      {!searching && (
        <nav className="letter-bar" aria-label="Jump to letter">
          {LETTERS.map((l) => (
            <button key={l} type="button" disabled={!present.has(l)} onClick={() => scrollBelowBars(document.getElementById(`letter-${l}`))}>
              {l}
            </button>
          ))}
        </nav>
      )}

      {searching && <p className="muted">{results.length} {results.length === 1 ? 'term matches' : 'terms match'} “{query.trim()}”.</p>}

      {GLOSSARY.length === 0 && <p className="callout callout-note">The glossary fills up as modules are written.</p>}

      {searching ? (
        <dl className="glossary-list">
          {results.map((e) => <Entry key={e.slug} entry={e} query={query} onRelated={focusTerm} />)}
        </dl>
      ) : (
        LETTERS.filter((l) => present.has(l)).map((letter) => (
          <section key={letter} className="glossary-letter" id={`letter-${letter}`}>
            <h2>{letter}</h2>
            <dl className="glossary-list">
              {results.filter((e) => letterOf(e) === letter).map((e) => <Entry key={e.slug} entry={e} query="" onRelated={focusTerm} />)}
            </dl>
          </section>
        ))
      )}

      {searching && results.length === 0 && (
        <p className="callout callout-note">
          No term matches. Try a shorter word, or <Link to={`/search?q=${encodeURIComponent(query.trim())}`}>search the lessons</Link> instead.
        </p>
      )}
    </div>
  );
}

function Entry({ entry, query, onRelated }: { entry: GlossaryEntry; query: string; onRelated: (e: GlossaryEntry) => void }) {
  return (
    <div className="glossary-entry" id={`term-${entry.slug}`}>
      <dt>
        {entry.icon && <AzureIcon id={entry.icon} size={22} />}
        <Link to={`/glossary?term=${entry.slug}`} className="term-anchor" onClick={() => onRelated(entry)}>
          {highlight(entry.term, query)}
        </Link>
        {entry.aliases.length > 0 && (
          <span className="aliases">also: {entry.aliases.map((a, i) => <span key={a}>{i > 0 && ', '}<code>{highlight(a, query)}</code></span>)}</span>
        )}
      </dt>
      <dd>
        <p>{highlight(entry.definition, query)}</p>
        {entry.example && <p className="glossary-example">{highlight(entry.example, query)}</p>}
        <p className="entry-meta">
          <span className="taught">
            Taught in{' '}
            {entry.lessons.map((id, i) => (
              <span key={id}>{i > 0 && ', '}<Link to={`/lesson/${id}`}><span className="lid">{id}</span> {lessonById(id)?.title ?? ''}</Link></span>
            ))}
          </span>
          {entry.related.length > 0 && (
            <span className="see-also">
              See also{' '}
              {entry.related.map((r) => {
                const target = entryBySlug(slugOf(r));
                return target ? <button key={r} type="button" className="term-chip" onClick={() => onRelated(target)}>{r}</button> : null;
              })}
            </span>
          )}
        </p>
      </dd>
    </div>
  );
}

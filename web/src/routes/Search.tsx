import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { loadIndex, search, type SearchHit, type SearchRecord } from '../lib/search';
import { searchGlossary } from '../lib/glossary';
import { highlight } from '../components/Highlight';
import { MODULES } from '../lib/syllabus';

export function Search() {
  const [params, setParams] = useSearchParams();
  const initial = params.get('q') ?? '';
  const [query, setQuery] = useState(initial);
  const [records, setRecords] = useState<SearchRecord[] | null>(null);

  useEffect(() => {
    loadIndex().then(setRecords);
  }, []);

  useEffect(() => {
    setQuery(initial);
  }, [initial]);

  const q = query.trim();
  const hits: SearchHit[] = records && q.length > 1 ? search(records, q) : [];
  const terms = q.length > 1 ? searchGlossary(q).slice(0, 6) : [];

  return (
    <div className="search-page">
      <h1>Search</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setParams(q ? { q } : {});
        }}
      >
        <input
          className="search-input-big"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search every lesson and term…"
          aria-label="Search"
          autoFocus
        />
      </form>

      {q.length > 1 && terms.length > 0 && (
        <section>
          <h2>Glossary</h2>
          <p className="term-cloud">
            {terms.map((t) => (
              <Link key={t.entry.slug} className="term-chip" to={`/glossary?term=${t.entry.slug}`}>{t.entry.term}</Link>
            ))}
          </p>
        </section>
      )}

      {q.length > 1 && (
        <section>
          <h2>Lessons</h2>
          {records === null && <p className="muted">Loading the index…</p>}
          {records && hits.length === 0 && <p className="muted">No lessons match “{q}”.</p>}
          <ul className="search-results">
            {hits.map((h) => (
              <li key={h.record.id} className="card lift">
                <Link to={`/lesson/${h.record.id}`}>
                  <span className="lesson-id">{h.record.id}</span> {highlight(h.record.title, q)}
                </Link>
                <p className="small muted">Module {h.record.module} · {MODULES.find((m) => m.number === h.record.module)?.title}</p>
                <p>{highlight(h.snippet, q)}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

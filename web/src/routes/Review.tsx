import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AzureIcon } from '../components/AzureIcon';
import { moduleOf, type GlossaryEntry } from '../lib/glossary';
import { today } from '../lib/progress';
import {
  LEARNED_BOX,
  buildSession,
  deckStats,
  formatDays,
  previewDays,
  recordGrade,
  termsInScope,
  type Grade,
  type Scope,
} from '../lib/review';
import { MODULES, lessonById } from '../lib/syllabus';
import { useProgress } from '../lib/useProgress';

const GRADES: { grade: Grade; label: string; key: string }[] = [
  { grade: 'again', label: 'Again', key: '1' },
  { grade: 'good', label: 'Good', key: '2' },
  { grade: 'easy', label: 'Easy', key: '3' },
];

const isScope = (s: string | null): s is Scope => s === 'studied' || s === 'all' || /^m[1-9]\d*$/.test(s ?? '');

/**
 * Glossary review: flashcards over the glossary with spaced repetition (lib/review.ts). Pick a
 * set, recall each term's meaning, reveal, and grade yourself; the grade decides when it returns.
 */
export function Review() {
  const progress = useProgress();
  const [params, setParams] = useSearchParams();
  const studied = useMemo(() => termsInScope('studied', progress), [progress]);
  const param = params.get('scope');
  const scope: Scope = isScope(param) ? param : studied.length > 0 ? 'studied' : 'm1';
  const entries = useMemo(() => termsInScope(scope, progress), [scope, progress]);
  const stats = deckStats(entries, progress);

  const [queue, setQueue] = useState<GlossaryEntry[] | null>(null);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [tally, setTally] = useState({ reviewed: 0, again: 0 });

  function start() {
    setQueue(buildSession(entries, progress));
    setIndex(0);
    setRevealed(false);
    setTally({ reviewed: 0, again: 0 });
  }

  const current = queue?.[index];
  const grade = useCallback(
    (g: Grade) => {
      if (!queue || !current) return;
      recordGrade(current.slug, g);
      // "Again" comes back at the end of this session.
      if (g === 'again') setQueue([...queue, current]);
      setTally((t) => ({ reviewed: t.reviewed + 1, again: t.again + (g === 'again' ? 1 : 0) }));
      setIndex((i) => i + 1);
      setRevealed(false);
    },
    [queue, current],
  );

  useEffect(() => {
    if (!current) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest('input, select, textarea')) return;
      if (!revealed && e.key === ' ') {
        e.preventDefault();
        setRevealed(true);
      } else if (revealed) {
        const match = GRADES.find((g) => g.key === e.key);
        if (match) grade(match.grade);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, revealed, grade]);

  if (queue && current) {
    const card = progress.reviews[current.slug];
    const days = previewDays(card);
    const module = MODULES.find((m) => m.number === moduleOf(current));
    return (
      <div className="review">
        <div className="quiz-progress">
          <span className="small muted">Card {index + 1} of {queue.length}</span>
          <div className="bar" aria-hidden="true"><span style={{ width: `${(index / queue.length) * 100}%` }} /></div>
          <button type="button" className="btn small ghost" onClick={() => setQueue(null)}>End session</button>
        </div>

        <article className="card review-card" key={`${current.slug}-${index}`}>
          <p className="row small muted">
            {!card ? <span className="pill state in-progress">New</span> : card.box >= LEARNED_BOX ? <span className="pill state done">Learned</span> : <span className="pill state needs-review">Learning</span>}
            {module && <span>Module {module.number} · {module.title}</span>}
          </p>
          <div className="review-front">
            {current.icon && <AzureIcon id={current.icon} size={44} />}
            <h2>{current.term}</h2>
            {current.aliases.length > 0 && <p className="small muted">also: {current.aliases.join(', ')}</p>}
          </div>

          {!revealed ? (
            <div className="review-prompt">
              <p className="muted">Say what it means, and when you would use it, before you look.</p>
              <button type="button" className="btn primary big" onClick={() => setRevealed(true)}>
                Show answer <kbd>Space</kbd>
              </button>
            </div>
          ) : (
            <div className="review-back">
              <p>{current.definition}</p>
              {current.example && <p className="glossary-example">{current.example}</p>}
              <p className="entry-meta">
                <span>
                  Taught in{' '}
                  {current.lessons.map((id, i) => (
                    <span key={id}>{i > 0 && ', '}<Link to={`/lesson/${id}`} target="_blank" rel="noopener"><span className="lid">{id}</span> {lessonById(id)?.title ?? ''}</Link></span>
                  ))}
                </span>
              </p>
              <div className="review-grades" role="group" aria-label="How well did you know it?">
                {GRADES.map((g) => (
                  <button key={g.grade} type="button" className={`btn review-grade ${g.grade}`} onClick={() => grade(g.grade)}>
                    <span>{g.label} <kbd>{g.key}</kbd></span>
                    <small>{g.grade === 'again' ? 'see it again' : `back ${formatDays(days[g.grade])}`}</small>
                  </button>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    );
  }

  if (queue) {
    const upcoming = entries.map((e) => progress.reviews[e.slug]?.due).filter((d): d is string => !!d && d > today()).sort()[0];
    const more = buildSession(entries, progress).length;
    return (
      <div className="review">
        <div className="quiz-result">
          <div className="quiz-score"><span className="big">{tally.reviewed}</span><span>cards reviewed</span></div>
          <p>
            {tally.again === 0 ? 'Every term recalled first time.' : `${tally.again} ${tally.again === 1 ? 'term needed' : 'terms needed'} another look.`}{' '}
            {stats.learned} of {stats.total} terms in this set are learned.
          </p>
          {upcoming && <p className="muted small">Next review due {upcoming === today() ? 'today' : new Date(`${upcoming}T00:00:00Z`).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}.</p>}
          <div className="row">
            {more > 0 && <button type="button" className="btn primary" onClick={start}>Keep going ({more} more)</button>}
            <button type="button" className="btn" onClick={() => setQueue(null)}>Change set</button>
            <Link to="/glossary" className="btn ghost">Back to the glossary</Link>
          </div>
        </div>
      </div>
    );
  }

  const session = buildSession(entries, progress).length;
  return (
    <div className="review">
      <h1>Review terms</h1>
      <p className="lede">
        Flashcards for the glossary. Recall each term, reveal the answer, and say how well you knew it. Terms you know
        come back less often; the ones you miss come back sooner.
      </p>

      <div className="glossary-controls">
        <select value={scope} onChange={(e) => setParams({ scope: e.target.value }, { replace: true })} aria-label="Which terms to review">
          <option value="studied">Terms from lessons you have opened ({studied.length})</option>
          {MODULES.filter((m) => m.status !== 'planned').map((m) => (
            <option key={m.number} value={`m${m.number}`}>Module {m.number} · {m.title}</option>
          ))}
          <option value="all">All terms</option>
        </select>
      </div>

      <div className="stat-grid review-stats">
        <div className="card stat"><strong className="big">{stats.due}</strong><span>due now</span></div>
        <div className="card stat"><strong className="big">{stats.newToday}</strong><span>new today</span></div>
        <div className="card stat"><strong className="big">{stats.learned}</strong><span>of {stats.total} learned</span></div>
      </div>

      {scope === 'studied' && studied.length === 0 ? (
        <p className="callout callout-note">Open a lesson first, or pick a module above.</p>
      ) : session === 0 ? (
        <p className="callout callout-note">Nothing to review in this set today. Come back tomorrow, or pick another set.</p>
      ) : (
        <button type="button" className="btn primary big" onClick={start}>Start: {session} {session === 1 ? 'card' : 'cards'}</button>
      )}
      <p className="small muted">
        Up to 20 cards a session and 10 new terms a day. Keys: <kbd>Space</kbd> shows the answer, <kbd>1</kbd>
        <kbd>2</kbd> <kbd>3</kbd> grade it. Your schedule is saved with the rest of your progress.
      </p>
    </div>
  );
}

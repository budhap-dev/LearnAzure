import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Markdown } from '../components/Markdown';
import { AzureIcon } from '../components/AzureIcon';
import { STATE_LABEL } from '../components/Cards';
import { headingsOf, loadLesson, type LessonDoc } from '../lib/lessons';
import { lessonById, moduleOfLesson, neighbours } from '../lib/syllabus';
import { bestScore, setLessonState, visitLesson } from '../lib/progress';
import { useProgress } from '../lib/useProgress';
import { hasQuiz } from '../lib/quiz';
import { termsForLesson } from '../lib/glossary';
import { NotFound } from './NotFound';

export function Lesson() {
  const { id = '' } = useParams();
  const meta = lessonById(id);
  const module = moduleOfLesson(id);
  const [doc, setDoc] = useState<LessonDoc | null | undefined>(undefined);
  const progress = useProgress();

  useEffect(() => {
    if (!meta) return;
    setDoc(undefined);
    visitLesson(id);
    loadLesson(id).then(setDoc);
    document.title = `${id} ${meta.title} · Learn Azure`;
    return () => {
      document.title = 'Learn Azure';
    };
  }, [id, meta]);

  if (!meta || !module) return <NotFound />;

  const { prev, next } = neighbours(id);
  const state = progress.lessons[id] ?? 'not-started';
  const best = bestScore(id);
  const terms = termsForLesson(id);
  const headings = doc ? headingsOf(doc.body) : [];
  const quiz = hasQuiz(id);

  return (
    <article className={`lesson m${module.number}`}>
      <p className="crumbs">
        <Link to="/course">Course</Link> / <Link to={`/module/${module.number}`}>Module {module.number}</Link> / {id}
      </p>
      <header className="lesson-header">
        <div className="lesson-header-text">
          <p className="eyebrow">Lesson {id} · {meta.minutes} min read</p>
          <h1>{meta.title}</h1>
          <p className="lede">{meta.summary}</p>
        </div>
        <div className="lesson-header-icons" aria-hidden="true">
          {meta.icons.map((i, k) => (
            <span key={i} className="float" style={{ animationDelay: `${k * 0.4}s` }}><AzureIcon id={i} size={44} /></span>
          ))}
        </div>
      </header>

      <div className="lesson-meta card">
        <div>
          <strong>You will be able to</strong>
          <ul className="objectives">
            {meta.objectives.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </div>
        <div className="lesson-status">
          <span className={`pill state ${state}`}>{STATE_LABEL[state]}</span>
          {best && <span className="small muted">Best quiz: {best.score}/{best.outOf}</span>}
        </div>
      </div>

      {headings.length > 2 && (
        <nav className="toc" aria-label="On this page">
          <strong>On this page</strong>
          <ol>
            {headings.map((h) => (
              <li key={h.id}><a href={`#${h.id}`}>{h.text}</a></li>
            ))}
          </ol>
        </nav>
      )}

      {doc === undefined && <p className="muted">Loading lesson…</p>}
      {doc === null && <p className="callout callout-warning">This lesson is still being written.</p>}
      {doc && <Markdown source={doc.body} />}

      {doc && (
        <section className="lesson-end card">
          <h2>Check yourself</h2>
          {quiz ? (
            <p>
              A short quiz on this lesson. Score {`${80}%`} or better and the lesson is marked as learned.
            </p>
          ) : (
            <p className="muted">The quiz for this lesson is coming.</p>
          )}
          <div className="row wrap">
            {quiz && <Link className="btn primary" to={`/quiz/${id}`}>Take the quiz →</Link>}
            {state !== 'done' && (
              <button type="button" className="btn ghost" onClick={() => setLessonState(id, 'done')}>
                Mark as learned without the quiz
              </button>
            )}
            {state === 'done' && (
              <button type="button" className="btn ghost" onClick={() => setLessonState(id, 'needs-review')}>
                Flag for review
              </button>
            )}
          </div>
          {terms.length > 0 && (
            <p className="term-cloud">
              <span className="muted small">Terms from this lesson:</span>{' '}
              {terms.map((t) => (
                <Link key={t.slug} className="term-chip" to={`/glossary?term=${t.slug}`}>{t.term}</Link>
              ))}
            </p>
          )}
        </section>
      )}

      <nav className="pager" aria-label="Lesson navigation">
        {prev ? <Link to={`/lesson/${prev.id}`} className="pager-link prev"><span className="small muted">Previous</span>{prev.id} {prev.title}</Link> : <span />}
        {next ? <Link to={`/lesson/${next.id}`} className="pager-link next"><span className="small muted">Next</span>{next.id} {next.title}</Link> : <Link to={`/module/${module.number}/test`} className="pager-link next"><span className="small muted">Finished the module?</span>Take the module test</Link>}
      </nav>
    </article>
  );
}

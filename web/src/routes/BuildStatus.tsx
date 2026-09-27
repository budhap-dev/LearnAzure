import { Link } from 'react-router-dom';
import { MODULES, isLessonReady, totalMinutes, type ModuleMeta } from '../lib/syllabus';
import { VERSION } from '../lib/version';

const STATS = __CONTENT_STATS__;

interface ModuleStatus {
  module: ModuleMeta;
  shipped: Set<string>;
  minutesShipped: number;
  terms: number;
  quizQuestions: number;
  testQuestions: number;
}

function statusOf(m: ModuleMeta): ModuleStatus {
  const shipped = m.lessons.filter((l) => isLessonReady(m, l));
  const sum = (counts: Record<string, number>) => shipped.reduce((n, l) => n + (counts[l.id] ?? 0), 0);
  return {
    module: m,
    shipped: new Set(shipped.map((l) => l.id)),
    minutesShipped: shipped.reduce((n, l) => n + l.minutes, 0),
    terms: sum(STATS.glossary),
    quizQuestions: sum(STATS.quizzes),
    testQuestions: m.status === 'ready' ? (STATS.exams[`module-${m.number}`] ?? 0) : 0,
  };
}

const ROWS = MODULES.map(statusOf);

const STATE = {
  ready: <span className="pill state done">Shipped</span>,
  'in-progress': <span className="pill soon">In progress</span>,
  planned: <span className="pill">Planned</span>,
};

function LessonCells({ row }: { row: ModuleStatus }) {
  return (
    <>
      {row.module.lessons.map((l) => (
        <i key={l.id} className={row.shipped.has(l.id) ? 'on' : undefined} title={`${l.id} ${l.title}`} />
      ))}
    </>
  );
}

/** What has shipped and what is left to build, worked out from the syllabus and content at build time. */
export function BuildStatus() {
  const lessons = MODULES.reduce((n, m) => n + m.lessons.length, 0);
  const shipped = ROWS.reduce((n, r) => n + r.shipped.size, 0);
  const minutes = MODULES.reduce((n, m) => n + totalMinutes(m), 0);
  const minutesShipped = ROWS.reduce((n, r) => n + r.minutesShipped, 0);
  const complete = ROWS.filter((r) => r.module.status === 'ready');
  const unfinished = ROWS.filter((r) => r.module.status !== 'ready');
  const terms = Object.values(STATS.glossary).reduce((a, b) => a + b, 0);
  const sharedTerms = terms - ROWS.reduce((n, r) => n + r.terms, 0);
  const left = lessons - shipped;

  return (
    <div className="build-status">
      <p className="eyebrow">As of v{VERSION.app} · built {VERSION.date}</p>
      <h1>Build status</h1>
      <p className="lede">
        What has shipped and what is left. The course is planned as {MODULES.length} modules and {lessons} lessons. Each
        lesson ships on its own, and a module's test ships with its last lesson.
      </p>

      <div className="status-summary">
        <div><span className="eyebrow">Lessons shipped</span><strong>{shipped} <small>of {lessons} · {Math.round((100 * shipped) / lessons)}%</small></strong></div>
        <div><span className="eyebrow">Modules complete</span><strong>{complete.length} <small>of {MODULES.length}</small></strong></div>
        <div><span className="eyebrow">Left to build</span><strong>{left} <small>lessons + {unfinished.length} {unfinished.length === 1 ? 'test' : 'tests'}</small></strong></div>
        <div><span className="eyebrow">Reading time left</span><strong>{minutes - minutesShipped} <small>of {minutes} min</small></strong></div>
      </div>

      <div className="status-track" role="img" aria-label={`${shipped} of ${lessons} lessons shipped`}>
        {ROWS.map((r) => (
          <span key={r.module.number} className={`m${r.module.number}`} style={{ flexGrow: r.module.lessons.length }}>
            <LessonCells row={r} />
          </span>
        ))}
      </div>
      <p className="small muted">One cell per lesson, 1.1 to {MODULES.at(-1)?.lessons.at(-1)?.id}, coloured by module once shipped.</p>

      <h2>By module</h2>
      <div className="table-wrap">
        <table className="status-table">
          <thead>
            <tr><th>#</th><th>Module</th><th>Lessons</th><th>Minutes</th><th>Glossary terms</th><th>Quiz questions</th><th>Module test</th><th>Status</th></tr>
          </thead>
          <tbody>
            {ROWS.map((r) => {
              const m = r.module;
              return (
                <tr key={m.number} className={m.status === 'ready' ? undefined : 'pending'}>
                  <td><span className={`module-num m${m.number}`}>{m.number}</span></td>
                  <td className="status-module">{m.status === 'planned' ? m.title : <Link to={`/module/${m.number}`}>{m.title}</Link>}</td>
                  <td className="num nowrap"><span className={`status-cells m${m.number}`} aria-hidden="true"><LessonCells row={r} /></span>{r.shipped.size} / {m.lessons.length}</td>
                  <td className="num">{r.minutesShipped} / {totalMinutes(m)}</td>
                  <td className="num">{r.terms || <span className="muted">–</span>}</td>
                  <td className="num">{r.quizQuestions || <span className="muted">–</span>}</td>
                  <td className="num">{r.testQuestions ? `${r.testQuestions} questions` : <span className="muted">to build</span>}</td>
                  <td>{STATE[m.status]}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td /><td>Total</td>
              <td className="num">{shipped} / {lessons}</td>
              <td className="num">{minutesShipped} / {minutes}</td>
              <td className="num">{terms}</td>
              <td className="num">{ROWS.reduce((n, r) => n + r.quizQuestions, 0)}</td>
              <td className="num">{complete.length} of {MODULES.length}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="small muted">
        Minutes are estimated reading time, shipped / planned.
        {sharedTerms > 0 && ` The glossary total includes ${sharedTerms} shared terms that belong to no single lesson.`}
      </p>

      {left > 0 && (
        <>
          <h2>Left to build</h2>
          <div className="table-wrap">
            <table className="status-table">
              <thead><tr><th>Id</th><th>Lesson</th><th>Time</th></tr></thead>
              <tbody>
                {unfinished.flatMap((r) => [
                  ...r.module.lessons
                    .filter((l) => !r.shipped.has(l.id))
                    .map((l) => (
                      <tr key={l.id}>
                        <td className="lid">{l.id}</td><td>{l.title}</td>
                        <td className="num">{l.minutes} min</td>
                      </tr>
                    )),
                  <tr key={`test-${r.module.number}`} className="muted">
                    <td className="lid">M{r.module.number}</td>
                    <td>Module {r.module.number} test, which ships with the last lesson and completes the module</td>
                    <td />
                  </tr>,
                ])}
              </tbody>
            </table>
          </div>
          <p className="small muted">The final learning test needs no separate work: it draws from every module once that module is complete.</p>
        </>
      )}

      <h2>Lesson by lesson</h2>
      {ROWS.map((r) => {
        const m = r.module;
        return (
          <details key={m.number} className="status-module-list" open={m.status !== 'ready'}>
            <summary>
              <span className={`module-num m${m.number}`}>{m.number}</span>
              <strong>{m.title}</strong>
              <span className="muted small">{r.shipped.size} of {m.lessons.length} lessons</span>
            </summary>
            <ul>
              {m.lessons.map((l) => (
                <li key={l.id} className={r.shipped.has(l.id) ? 'on' : undefined}>
                  <span className="lid">{l.id}</span>
                  {r.shipped.has(l.id) ? <Link to={`/lesson/${l.id}`}>{l.title}</Link> : <span>{l.title}</span>}
                  <span className="small muted">{r.shipped.has(l.id) ? '✓ ' : ''}{l.minutes} min</span>
                </li>
              ))}
            </ul>
          </details>
        );
      })}
    </div>
  );
}

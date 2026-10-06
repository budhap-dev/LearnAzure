import { Link, useParams } from 'react-router-dom';
import { LessonRow } from '../components/Cards';
import { AzureIcon } from '../components/AzureIcon';
import { ProgressRing } from '../components/ProgressRing';
import { isLessonReady, moduleByNumber, readyLessons, totalMinutes } from '../lib/syllabus';
import { useProgress } from '../lib/useProgress';
import { testHistory } from '../lib/progress';
import { TERMS, moduleOf } from '../lib/terms';
import { NotFound } from './NotFound';

export function ModulePage() {
  const { n } = useParams();
  const module = moduleByNumber(Number(n));
  const progress = useProgress();
  if (!module || module.status === 'planned') return <NotFound />;

  const complete = module.status === 'ready';
  const released = readyLessons(module);
  const done = module.lessons.filter((l) => progress.lessons[l.id] === 'done').length;
  const history = testHistory(module.number);
  const terms = TERMS.filter((e) => moduleOf(e) === module.number);
  const firstUnfinished = released.find((l) => progress.lessons[l.id] !== 'done') ?? released[0];

  return (
    <div className={`module-page m${module.number}`}>
      <p className="crumbs"><Link to="/course">Course</Link> / Module {module.number}</p>
      <div className="module-head big">
        <span className={`module-num m${module.number}`}>{module.number}</span>
        <AzureIcon id={module.icon} size={56} />
        <div className="module-head-text">
          <h1>{module.title}</h1>
          <p className="lede">{module.tagline}</p>
        </div>
        <ProgressRing value={done / module.lessons.length} size={72} stroke={8} />
      </div>
      <p>{module.description}</p>
      <div className="row wrap">
        <Link className="btn primary" to={`/lesson/${firstUnfinished.id}`}>
          {done === 0 ? 'Start the module →' : done === released.length ? 'Revisit from the start' : `Continue with ${firstUnfinished.id} →`}
        </Link>
        {complete && <Link className="btn" to={`/module/${module.number}/test`}>Module test</Link>}
        <span className="muted small">
          {complete
            ? `${module.lessons.length} lessons · about ${totalMinutes(module)} min`
            : `${released.length} of ${module.lessons.length} lessons out · more coming`}
        </span>
      </div>

      <h2>Lessons</h2>
      <div className="lesson-list">
        {module.lessons.map((l) => (
          <LessonRow key={l.id} lesson={l} state={progress.lessons[l.id] ?? 'not-started'} ready={isLessonReady(module, l)} />
        ))}
      </div>

      <div className="two-col">
        <section className="card">
          <h2>Module test</h2>
          {!complete ? (
            <p className="muted">The module test opens once every lesson in this module is out.</p>
          ) : history.length === 0 ? (
            <p className="muted">Not attempted yet. Finish the lessons first, then test yourself against timed scenario questions.</p>
          ) : (
            <ul className="history">
              {history.slice(-5).reverse().map((t) => (
                <li key={t.at}>
                  <span className={`grade ${t.passed ? 'pass' : 'fail'}`}>{t.grade}</span>
                  {t.percent}% · {t.score}/{t.outOf} · {new Date(t.at).toLocaleDateString()}
                </li>
              ))}
            </ul>
          )}
          {complete && <Link className="btn" to={`/module/${module.number}/test`}>{history.length ? 'Take it again' : 'Take the test'}</Link>}
        </section>
        <section className="card">
          <h2>Terms in this module</h2>
          {terms.length === 0 ? (
            <p className="muted">Glossary terms appear here as the module is written.</p>
          ) : (
            <p className="term-cloud">
              {terms.map((t) => (
                <Link key={t.slug} className="term-chip" to={`/glossary?term=${t.slug}`}>{t.term}</Link>
              ))}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

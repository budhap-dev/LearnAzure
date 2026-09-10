import { Link } from 'react-router-dom';
import { LessonRow } from '../components/Cards';
import { AzureIcon } from '../components/AzureIcon';
import { ProgressRing } from '../components/ProgressRing';
import { MODULES, READY_MODULES, totalMinutes } from '../lib/syllabus';
import { useProgress } from '../lib/useProgress';
import { bestTest } from '../lib/progress';

export function Course() {
  const progress = useProgress();
  return (
    <div className="course">
      <h1>The course</h1>
      <p className="lede">
        Nine modules, {MODULES.reduce((n, m) => n + m.lessons.length, 0)} lessons. Work through them in
        order, or jump to what you need today. Each ready module ends with a timed test.
      </p>
      {READY_MODULES.length > 0 && (
        <p>
          <Link className="btn" to="/final-test">Take the final learning test</Link>
        </p>
      )}
      {MODULES.map((m) => {
        const ready = m.status === 'ready';
        const done = m.lessons.filter((l) => progress.lessons[l.id] === 'done').length;
        const best = bestTest(m.number);
        return (
          <section key={m.number} className={`module-section m${m.number} ${ready ? '' : 'planned'}`} id={`module-${m.number}`}>
            <div className="module-head">
              <span className={`module-num m${m.number}`}>{m.number}</span>
              <AzureIcon id={m.icon} size={40} />
              <div className="module-head-text">
                <h2>{ready ? <Link to={`/module/${m.number}`}>{m.title}</Link> : m.title}</h2>
                <p className="muted">{m.tagline}</p>
                <p className="small muted">
                  {m.lessons.length} lessons{ready ? ` · about ${totalMinutes(m)} min` : ' · coming soon'}
                  {best && ` · best test ${best.percent}% (${best.grade})`}
                </p>
              </div>
              {ready && <ProgressRing value={done / m.lessons.length} size={52} stroke={6} />}
            </div>
            <div className="lesson-list">
              {m.lessons.map((l) => (
                <LessonRow key={l.id} lesson={l} state={progress.lessons[l.id] ?? 'not-started'} ready={ready} />
              ))}
            </div>
            {ready && (
              <p className="module-test-link">
                <Link className="btn small" to={`/module/${m.number}/test`}>Module {m.number} test →</Link>
              </p>
            )}
          </section>
        );
      })}
    </div>
  );
}

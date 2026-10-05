import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LessonRow } from '../components/Cards';
import { AzureIcon } from '../components/AzureIcon';
import { ProgressRing } from '../components/ProgressRing';
import { MODULES, OPEN_MODULES, READY_MODULES, isLessonReady, readyLessons, totalMinutes } from '../lib/syllabus';
import { useProgress } from '../lib/useProgress';
import { bestTest, type Progress } from '../lib/progress';

/** Which modules are expanded is a per-device convenience, so it lives in localStorage. */
const OPEN_KEY = 'learnazure.course.open';

/** The module to show expanded on a first visit: the first one with a ready lesson not yet done. */
function currentModule(progress: Progress): number {
  const next = OPEN_MODULES.find((m) => readyLessons(m).some((l) => progress.lessons[l.id] !== 'done'));
  return (next ?? OPEN_MODULES[OPEN_MODULES.length - 1] ?? MODULES[0]).number;
}

function readOpen(): number[] | null {
  try {
    const stored = localStorage.getItem(OPEN_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : null;
    return Array.isArray(parsed) ? parsed.filter((n): n is number => typeof n === 'number') : null;
  } catch {
    return null;
  }
}

function saveOpen(open: Set<number>): void {
  try {
    localStorage.setItem(OPEN_KEY, JSON.stringify([...open]));
  } catch {
    // Storage blocked: the page still works, it just forgets.
  }
}

export function Course() {
  const progress = useProgress();
  const [open, setOpen] = useState<Set<number>>(() => new Set(readOpen() ?? [currentModule(progress)]));

  const update = (next: Set<number>) => {
    setOpen(next);
    saveOpen(next);
  };
  const toggle = (n: number, isOpen: boolean) => {
    if (open.has(n) === isOpen) return;
    const next = new Set(open);
    if (isOpen) next.add(n);
    else next.delete(n);
    update(next);
  };

  return (
    <div className="course">
      <h1>The course</h1>
      <p className="lede">
        {MODULES.length} modules, {MODULES.reduce((n, m) => n + m.lessons.length, 0)} lessons. Work through them in
        order, or jump to what you need today. Each ready module ends with a timed test.
      </p>
      <div className="course-actions">
        {READY_MODULES.length > 0 && <Link className="btn" to="/final-test">Take the final learning test</Link>}
        <span className="course-toggles">
          <button type="button" className="btn ghost small" onClick={() => update(new Set(MODULES.map((m) => m.number)))}>
            Expand all
          </button>
          <button type="button" className="btn ghost small" onClick={() => update(new Set())}>
            Collapse all
          </button>
        </span>
      </div>
      {MODULES.map((m) => {
        const ready = m.status === 'ready';
        const available = m.status !== 'planned';
        const done = m.lessons.filter((l) => progress.lessons[l.id] === 'done').length;
        const best = bestTest(m.number);
        return (
          <details
            key={m.number}
            className={`module-section m${m.number} ${available ? '' : 'planned'}`}
            id={`module-${m.number}`}
            open={open.has(m.number)}
            onToggle={(e) => toggle(m.number, e.currentTarget.open)}
          >
            <summary className="module-head">
              <span className={`module-num m${m.number}`}>{m.number}</span>
              <AzureIcon id={m.icon} size={40} />
              <div className="module-head-text">
                <h2>{available ? <Link to={`/module/${m.number}`}>{m.title}</Link> : m.title}</h2>
                <p className="muted">{m.tagline}</p>
                <p className="small muted">
                  {ready
                    ? `${m.lessons.length} lessons · about ${totalMinutes(m)} min`
                    : available
                      ? `${readyLessons(m).length} of ${m.lessons.length} lessons out · more coming`
                      : `${m.lessons.length} lessons · coming soon`}
                  {best && ` · best test ${best.percent}% (${best.grade})`}
                </p>
              </div>
              {available && <ProgressRing value={done / m.lessons.length} size={52} stroke={6} />}
              <span className="chevron" aria-hidden="true" />
            </summary>
            <div className="lesson-list">
              {m.lessons.map((l) => (
                <LessonRow key={l.id} lesson={l} state={progress.lessons[l.id] ?? 'not-started'} ready={isLessonReady(m, l)} />
              ))}
            </div>
            {ready && (
              <p className="module-test-link">
                <Link className="btn small" to={`/module/${m.number}/test`}>Module {m.number} test →</Link>
              </p>
            )}
          </details>
        );
      })}
    </div>
  );
}

import { Link } from 'react-router-dom';
import { AzureIcon } from './AzureIcon';
import { ProgressRing } from './ProgressRing';
import { readyLessons, type LessonMeta, type ModuleMeta } from '../lib/syllabus';
import type { LessonState } from '../lib/progress';

export const STATE_LABEL: Record<LessonState, string> = {
  'not-started': 'Not started',
  'in-progress': 'In progress',
  'needs-review': 'Needs review',
  done: 'Learned',
};

export function ModuleCard({ module, lessonStates }: { module: ModuleMeta; lessonStates: Record<string, LessonState> }) {
  const open = module.status !== 'planned';
  const released = readyLessons(module).length;
  const done = module.lessons.filter((l) => lessonStates[l.id] === 'done').length;
  const inner = (
    <>
      <div className="module-card-head">
        <span className={`module-num m${module.number}`}>{module.number}</span>
        <AzureIcon id={module.icon} size={40} />
        {open ? (
          <ProgressRing value={done / module.lessons.length} size={48} stroke={5} label={`${done} of ${module.lessons.length} lessons learned`} />
        ) : (
          <span className="pill soon">Coming soon</span>
        )}
      </div>
      <h3>{module.title}</h3>
      <p className="muted">{module.tagline}</p>
      <p className="small muted">
        {module.status === 'in-progress' ? `${released} of ${module.lessons.length} lessons out` : `${module.lessons.length} lessons`}
        {open ? ` · ${done} learned` : ''}
      </p>
    </>
  );
  return open ? (
    <Link to={`/module/${module.number}`} className={`card module-card lift m${module.number}`}>
      {inner}
    </Link>
  ) : (
    <div className={`card module-card planned m${module.number}`}>{inner}</div>
  );
}

export function LessonRow({ lesson, state, ready = true }: { lesson: LessonMeta; state: LessonState; ready?: boolean }) {
  const body = (
    <>
      <span className={`state-dot ${state}`} title={STATE_LABEL[state]} />
      <span className="lesson-id">{lesson.id}</span>
      <span className="lesson-title">
        {lesson.title}
        {lesson.summary && <span className="lesson-summary">{lesson.summary}</span>}
      </span>
      <span className="lesson-icons">
        {lesson.icons.slice(0, 3).map((i) => (
          <AzureIcon key={i} id={i} size={22} />
        ))}
      </span>
      <span className="lesson-minutes">{lesson.minutes} min</span>
    </>
  );
  return ready ? (
    <Link to={`/lesson/${lesson.id}`} className="lesson-row lift">
      {body}
    </Link>
  ) : (
    <div className="lesson-row planned">{body}</div>
  );
}

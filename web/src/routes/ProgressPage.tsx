import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ProgressRing } from '../components/ProgressRing';
import { LessonRow } from '../components/Cards';
import { LESSONS, MODULES, READY_MODULES } from '../lib/syllabus';
import { useProgress } from '../lib/useProgress';
import { exportJson, importJson, reset, streak } from '../lib/progress';

export function ProgressPage() {
  const progress = useProgress();
  const [message, setMessage] = useState('');
  const done = LESSONS.filter((l) => progress.lessons[l.id] === 'done');
  const review = LESSONS.filter((l) => progress.lessons[l.id] === 'needs-review');
  const started = LESSONS.filter((l) => progress.lessons[l.id] === 'in-progress');
  const quizzes = Object.values(progress.quizzes).reduce((n, a) => n + a.length, 0);
  const days = streak();

  async function copyExport() {
    try {
      await navigator.clipboard.writeText(exportJson());
      setMessage('Progress copied to the clipboard as JSON. Paste it on another device to import.');
    } catch {
      setMessage('Could not access the clipboard.');
    }
  }

  function doImport() {
    const json = window.prompt('Paste the progress JSON you exported:');
    if (!json) return;
    setMessage(importJson(json) ? 'Progress imported.' : 'That did not look like exported progress.');
  }

  function doReset() {
    if (window.confirm('Clear all progress on this device? This cannot be undone.')) {
      reset();
      setMessage('Progress cleared.');
    }
  }

  return (
    <div className="progress-page">
      <h1>Your progress</h1>
      <p className="lede">Everything here stays on this device. Export it to carry it to another one.</p>

      <div className="stat-grid">
        <div className="card stat"><ProgressRing value={LESSONS.length ? done.length / LESSONS.length : 0} size={72} stroke={8} /><span>{done.length} of {LESSONS.length} lessons learned</span></div>
        <div className="card stat"><strong className="big">{quizzes}</strong><span>quiz attempts</span></div>
        <div className="card stat"><strong className="big">{progress.tests.length}</strong><span>tests taken</span></div>
        <div className="card stat"><strong className="big">🔥 {days}</strong><span>day streak</span></div>
      </div>

      <h2>By module</h2>
      <div className="module-progress">
        {READY_MODULES.map((m) => {
          const d = m.lessons.filter((l) => progress.lessons[l.id] === 'done').length;
          const best = progress.tests.filter((t) => t.module === m.number).sort((a, b) => b.percent - a.percent)[0];
          return (
            <Link key={m.number} to={`/module/${m.number}`} className={`card lift module-progress-row m${m.number}`}>
              <span className={`module-num m${m.number}`}>{m.number}</span>
              <span className="grow"><strong>{m.title}</strong><br /><span className="small muted">{d}/{m.lessons.length} lessons{best ? ` · best test ${best.percent}% (${best.grade})` : ''}</span></span>
              <ProgressRing value={d / m.lessons.length} size={48} stroke={5} />
            </Link>
          );
        })}
        {MODULES.length > READY_MODULES.length && <p className="muted small">{MODULES.length - READY_MODULES.length} more modules are on the way.</p>}
      </div>

      {review.length > 0 && (
        <>
          <h2>Flagged for review</h2>
          <div className="lesson-list">{review.map((l) => <LessonRow key={l.id} lesson={l} state="needs-review" />)}</div>
        </>
      )}
      {started.length > 0 && (
        <>
          <h2>In progress</h2>
          <div className="lesson-list">{started.map((l) => <LessonRow key={l.id} lesson={l} state="in-progress" />)}</div>
        </>
      )}

      {progress.tests.length > 0 && (
        <>
          <h2>Test history</h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th>When</th><th>Test</th><th>Score</th><th>Grade</th><th>Time</th></tr></thead>
              <tbody>
                {[...progress.tests].reverse().map((t) => (
                  <tr key={t.at}>
                    <td>{new Date(t.at).toLocaleString()}</td>
                    <td>{t.module === 0 ? 'Final learning test' : `Module ${t.module}`}</td>
                    <td>{t.score}/{t.outOf} ({t.percent}%)</td>
                    <td><span className={`grade ${t.passed ? 'pass' : 'fail'}`}>{t.grade}</span></td>
                    <td>{t.minutesTaken} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <h2>Manage</h2>
      <div className="row wrap">
        <button type="button" className="btn" onClick={copyExport}>Export (copy JSON)</button>
        <button type="button" className="btn" onClick={doImport}>Import</button>
        <button type="button" className="btn danger" onClick={doReset}>Reset all progress</button>
      </div>
      {message && <p className="callout callout-note">{message}</p>}
    </div>
  );
}

import { Link } from 'react-router-dom';
import { GOAL_CHOICES, setWeeklyGoal, type Progress } from '../lib/progress';
import { todayPlan, weekSummary } from '../lib/goals';

/** Today's checklist and this week's goal, side by side. Every tick comes from what was actually done. */
export function StudyGoals({ progress }: { progress: Progress }) {
  const week = weekSummary(progress);
  const tasks = todayPlan(progress);
  const doneCount = tasks.filter((t) => t.done).length;
  const percent = Math.min(100, Math.round((week.minutes / Math.max(1, week.goal)) * 100));

  return (
    <div className="goals">
      <section className="card goal-card" aria-labelledby="today-heading">
        <div className="goal-head">
          <h2 id="today-heading">Today</h2>
          <span className={`goal-badge ${doneCount === tasks.length ? 'good' : ''}`}>
            {doneCount === tasks.length ? 'All done' : `${doneCount} of ${tasks.length} done`}
          </span>
        </div>
        <ul className="task-list">
          {tasks.map((t) => (
            <li key={t.id} className={t.done ? 'done' : ''}>
              <span className="task-check" aria-hidden="true">{t.done ? '✓' : ''}</span>
              <span className="task-text">
                {t.to && !t.done ? <Link to={t.to}>{t.label}</Link> : <span className="task-label">{t.label}</span>}
                <span className="small muted">{t.detail}</span>
              </span>
              <span className="visually-hidden">{t.done ? 'done' : 'not done yet'}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card goal-card" aria-labelledby="week-heading">
        <div className="goal-head">
          <h2 id="week-heading">This week</h2>
          <span className={`goal-badge ${week.status === 'met' ? 'good' : week.status === 'behind' ? 'warn' : ''}`}>
            {week.status === 'met' ? 'Goal met' : week.status === 'behind' ? 'Behind' : week.status === 'fresh' ? 'New week' : 'On track'}
          </span>
        </div>
        <p className="week-minutes">
          <strong>{week.minutes}</strong> of {week.goal} minutes
        </p>
        <div className="week-bar" role="progressbar" aria-valuemin={0} aria-valuemax={week.goal} aria-valuenow={week.minutes} aria-label="Minutes studied this week">
          <span style={{ width: `${percent}%` }} />
        </div>
        <ol className="week-days" aria-label="Days studied this week">
          {week.days.map((d) => (
            <li
              key={d.date}
              className={`${d.active ? 'active' : ''} ${d.isToday ? 'today' : ''} ${d.future ? 'future' : ''}`}
              title={d.active ? `${d.label}: ${d.minutes} min` : d.label}
            >
              <span className="dot" aria-hidden="true">{d.active ? '✓' : ''}</span>
              <span className="small">{d.label}</span>
              <span className="visually-hidden">{d.active ? `studied ${d.minutes} minutes` : d.future ? 'still to come' : 'no study'}</span>
            </li>
          ))}
        </ol>
        <p className="small">{week.message}</p>
        <p className="small muted goal-meta">
          {week.lessons > 0 && `${week.lessons} ${week.lessons === 1 ? 'lesson' : 'lessons'} learned this week · `}
          <label>
            Weekly goal{' '}
            <select value={week.goal} onChange={(e) => setWeeklyGoal(Number(e.target.value))}>
              {GOAL_CHOICES.map((m) => (
                <option key={m} value={m}>{m} min</option>
              ))}
            </select>
          </label>
        </p>
      </section>
    </div>
  );
}

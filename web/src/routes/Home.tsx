import { Link } from 'react-router-dom';
import { ModuleCard } from '../components/Cards';
import { AzureIcon } from '../components/AzureIcon';
import { LESSONS, MODULES, READY_MODULES, lessonById } from '../lib/syllabus';
import { useProgress } from '../lib/useProgress';
import { streak } from '../lib/progress';

const HERO_ICONS = ['app-service', 'azure-sql', 'function-apps', 'aks', 'key-vault', 'azure-openai', 'azure-devops', 'monitor', 'cosmos-db', 'virtual-network', 'static-web-apps', 'service-bus'];

export function Home() {
  const progress = useProgress();
  const done = Object.values(progress.lessons).filter((s) => s === 'done').length;
  const last = progress.lastLesson ? lessonById(progress.lastLesson) : undefined;
  const nextUp = last ?? LESSONS[0];
  const days = streak();
  const totalReady = LESSONS.length;

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-text">
          <p className="eyebrow">A scenario-driven course</p>
          <h1>
            Learn <span className="grad">Azure</span> the way a lead needs it.
          </h1>
          <p className="lede">
            From cloud foundations to DevOps and Azure AI - explained with real situations, real Azure
            icons and real trade-offs, not code walkthroughs. Built for an experienced engineer who wants
            to design, decide and guide a team.
          </p>
          <div className="row wrap">
            {nextUp && (
              <Link className="btn primary big" to={`/lesson/${nextUp.id}`}>
                {last ? `Continue ${last.id} →` : 'Start lesson 1.1 →'}
              </Link>
            )}
            <Link className="btn ghost big" to="/course">Browse the course</Link>
          </div>
          <div className="hero-stats">
            <div><strong>{MODULES.length}</strong><span>modules</span></div>
            <div><strong>{MODULES.reduce((n, m) => n + m.lessons.length, 0)}</strong><span>lessons planned</span></div>
            <div><strong>{done}/{totalReady}</strong><span>learned so far</span></div>
            {days > 0 && <div><strong>🔥 {days}</strong><span>day streak</span></div>}
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          {HERO_ICONS.map((id, i) => (
            <span key={id} className="float" style={{ animationDelay: `${i * 0.35}s` }}>
              <AzureIcon id={id} size={44} />
            </span>
          ))}
        </div>
      </section>

      <section className="how">
        <h2>How every lesson works</h2>
        <div className="how-grid">
          <div className="card"><span className="how-icon">🎬</span><h3>Starts with a scenario</h3><p>A real situation - a launch, an outage, a bill - that the lesson resolves.</p></div>
          <div className="card"><span className="how-icon">🗺️</span><h3>Explains with diagrams</h3><p>Architecture diagrams built from the official Azure icons, so you recognise them in the portal.</p></div>
          <div className="card"><span className="how-icon">🔁</span><h3>Maps to what you know</h3><p>React, Node, SQL Server and on-prem experience are the bridge - not a blank slate.</p></div>
          <div className="card"><span className="how-icon">🧭</span><h3>Ends with guidance</h3><p>What to tell your team and which questions to ask in a design review.</p></div>
          <div className="card"><span className="how-icon">✅</span><h3>Checks itself</h3><p>Lesson quizzes, timed module tests and a final learning test - all explained afterwards.</p></div>
          <div className="card"><span className="how-icon">📱</span><h3>Works anywhere</h3><p>Phone or laptop. Progress stays on the device; nothing is uploaded.</p></div>
        </div>
      </section>

      <section>
        <div className="row space wrap">
          <h2>The modules</h2>
          <Link to="/course" className="link">Full syllabus →</Link>
        </div>
        <div className="module-grid">
          {MODULES.map((m) => (
            <ModuleCard key={m.number} module={m} lessonStates={progress.lessons} />
          ))}
        </div>
        {READY_MODULES.length < MODULES.length && (
          <p className="muted small">Lessons are released one at a time, each verified before it ships; a module's test opens once all its lessons are out.</p>
        )}
      </section>
    </div>
  );
}

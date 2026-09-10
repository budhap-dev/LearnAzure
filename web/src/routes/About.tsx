import { VERSION } from '../lib/version';
import { AzureIcon } from '../components/AzureIcon';
import { AZURE_ICONS } from '../data/icons';

export function About() {
  return (
    <div className="about">
      <h1>About Learn Azure</h1>
      <p className="lede">
        A self-paced course on Microsoft Azure for an experienced engineer who wants high-to-mid-level command of the
        platform - to design, decide and guide a team - rather than another code tutorial.
      </p>

      <section className="card">
        <h2>Version</h2>
        <div className="table-wrap">
          <table>
            <tbody>
              <tr><th>App version</th><td>{VERSION.app}</td></tr>
              <tr><th>Build number</th><td>{VERSION.build}</td></tr>
              <tr><th>Commit</th><td><code>{VERSION.sha}</code></td></tr>
              <tr><th>Built on</th><td>{VERSION.date}</td></tr>
            </tbody>
          </table>
        </div>
        <p className="small muted">The version is bumped in every pull request; the build number and commit are stamped by the deployment.</p>
      </section>

      <section>
        <h2>How to use it</h2>
        <ol>
          <li>Work through a module in order. Each lesson is 10-16 minutes and starts with a real scenario.</li>
          <li>Take the lesson quiz. 80% marks it as learned; less flags it for review.</li>
          <li>After the last lesson, take the timed module test. 70% passes.</li>
          <li>Use the glossary and search whenever a term comes up at work. Everything links back to the lesson that teaches it.</li>
          <li>Pick a theme you like from the header. Progress and theme are stored on the device only.</li>
        </ol>
      </section>

      <section>
        <h2>Icons</h2>
        <p>
          The {Object.keys(AZURE_ICONS).length} service icons are Microsoft's official Azure architecture icons, used unmodified
          under Microsoft's terms, which permit their use in training material. See the{' '}
          <a href="https://learn.microsoft.com/azure/architecture/icons/" target="_blank" rel="noreferrer noopener">icon terms of use</a>.
        </p>
        <p className="icon-wall" aria-hidden="true">
          {Object.keys(AZURE_ICONS).slice(0, 60).map((id) => <AzureIcon key={id} id={id} size={28} />)}
        </p>
      </section>

      <section>
        <h2>Source</h2>
        <p>
          The app is open source at{' '}
          <a href="https://github.com/budhap-dev/LearnAzure" target="_blank" rel="noreferrer noopener">github.com/budhap-dev/LearnAzure</a>.
          Lessons are Markdown; quizzes and the glossary are JSON; a verification script checks every link, icon and diagram on every build.
        </p>
      </section>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Exam } from '../components/Exam';
import { buildModuleTest, type ModuleExam, type Question } from '../lib/quiz';
import { moduleByNumber } from '../lib/syllabus';
import { NotFound } from './NotFound';

export function ModuleTest() {
  const { n } = useParams();
  const module = moduleByNumber(Number(n));
  const [round, setRound] = useState(0);
  const [test, setTest] = useState<{ exam: ModuleExam; questions: Question[] } | null | undefined>(undefined);

  useEffect(() => {
    if (!module) return;
    setTest(undefined);
    buildModuleTest(module.number, module.lessons.map((l) => l.id)).then(setTest);
  }, [module, round]);

  if (!module || module.status !== 'ready') return <NotFound />;

  return (
    <div className={`test-page m${module.number}`}>
      <p className="crumbs"><Link to={`/module/${module.number}`}>Module {module.number}</Link> / Test</p>
      <h1>Module {module.number} test</h1>
      <p className="lede">{module.title}</p>
      {test === undefined && <p className="muted">Preparing your questions…</p>}
      {test === null && <p className="callout callout-warning">The test for this module is still being written.</p>}
      {test && (
        <Exam
          key={round}
          module={module.number}
          title={`Module ${module.number}: ${module.title}`}
          questions={test.questions}
          minutes={test.exam.minutes}
          backTo={`/module/${module.number}`}
          backLabel="Back to the module"
          onRetry={() => setRound((r) => r + 1)}
        />
      )}
    </div>
  );
}

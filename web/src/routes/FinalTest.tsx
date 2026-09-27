import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Exam } from '../components/Exam';
import { FINAL_TEST, buildFinalTest, type Question } from '../lib/quiz';
import { MODULES, READY_MODULES } from '../lib/syllabus';

export function FinalTest() {
  const [round, setRound] = useState(0);
  const [questions, setQuestions] = useState<Question[] | null>(null);

  useEffect(() => {
    setQuestions(null);
    buildFinalTest(READY_MODULES.map((m) => ({ number: m.number, lessonIds: m.lessons.map((l) => l.id) }))).then(setQuestions);
  }, [round]);

  return (
    <div className="test-page">
      <p className="crumbs"><Link to="/course">Course</Link> / Final learning test</p>
      <h1>Final learning test</h1>
      <p className="lede">
        {READY_MODULES.length === MODULES.length ? (
          <>Up to {FINAL_TEST.questions} questions drawn evenly across all {MODULES.length} modules, {FINAL_TEST.minutes} minutes on the clock.</>
        ) : (
          <>
            Up to {FINAL_TEST.questions} questions drawn evenly across every released module ({READY_MODULES.length} so far),
            {' '}{FINAL_TEST.minutes} minutes on the clock. It grows as modules are released.
          </>
        )}
      </p>
      {questions === null ? (
        <p className="muted">Preparing your questions…</p>
      ) : (
        <Exam
          key={round}
          module={0}
          title="Final learning test"
          questions={questions}
          minutes={FINAL_TEST.minutes}
          backTo="/course"
          backLabel="Back to the course"
          onRetry={() => setRound((r) => r + 1)}
        />
      )}
    </div>
  );
}

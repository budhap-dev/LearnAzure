import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PASS_MARK, recordQuiz } from '../lib/progress';
import { shuffleOptions, type Question } from '../lib/quiz';
import { celebrate } from '../lib/celebrate';

interface Props {
  lessonId: string;
  questions: Question[];
  nextLessonId?: string;
}

/**
 * The lesson quiz: one question at a time, instant feedback with an explanation, and a
 * summary at the end. 80% marks the lesson as learned; anything less flags it for review.
 */
export function Quiz({ lessonId, questions: source, nextLessonId }: Props) {
  const [round, setRound] = useState(0);
  const questions = useMemo(() => source.map(shuffleOptions), [source, round]); // eslint-disable-line react-hooks/exhaustive-deps
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const finished = index >= questions.length;
  const score = answers.filter(Boolean).length;
  const passed = finished && score / questions.length >= PASS_MARK;

  useEffect(() => {
    if (finished) {
      recordQuiz(lessonId, score, questions.length);
      if (passed) celebrate();
    }
    // Record once, when the quiz finishes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  function choose(i: number) {
    if (chosen !== null) return;
    setChosen(i);
    setAnswers((a) => [...a, i === questions[index].answer]);
  }

  function next() {
    setChosen(null);
    setIndex((i) => i + 1);
  }

  function retry() {
    setRound((r) => r + 1);
    setIndex(0);
    setChosen(null);
    setAnswers([]);
  }

  if (questions.length === 0) return <p className="muted">This quiz is still being written.</p>;

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className={`quiz-result ${passed ? 'pass' : 'fail'} pop-in`}>
        <div className="quiz-score">
          <span className="big">{pct}%</span>
          <span>{score} of {questions.length} correct</span>
        </div>
        <h3>{passed ? 'Lesson learned - nicely done.' : 'Not quite yet.'}</h3>
        <p>
          {passed
            ? 'This lesson is marked as done. Keep the momentum going.'
            : `You need ${Math.round(PASS_MARK * 100)}% to mark this lesson as learned. Re-read the sections behind the questions you missed and try again.`}
        </p>
        <div className="row wrap">
          <button type="button" className="btn" onClick={retry}>Try again</button>
          <Link className="btn ghost" to={`/lesson/${lessonId}`}>Back to the lesson</Link>
          {passed && nextLessonId && <Link className="btn primary" to={`/lesson/${nextLessonId}`}>Next lesson →</Link>}
        </div>
      </div>
    );
  }

  const q = questions[index];
  const correct = chosen !== null && chosen === q.answer;

  return (
    <div className="quiz" key={`${round}-${index}`}>
      <div className="quiz-progress" aria-label={`Question ${index + 1} of ${questions.length}`}>
        <div className="bar"><span style={{ width: `${(index / questions.length) * 100}%` }} /></div>
        <span className="muted small">{index + 1} / {questions.length} · {q.topic}</span>
      </div>
      {q.scenario && <p className="quiz-scenario">🎬 {q.scenario}</p>}
      <h3 className="quiz-stem">{q.stem}</h3>
      <ul className="options">
        {q.options.map((opt, i) => {
          let cls = '';
          if (chosen !== null) {
            if (i === q.answer) cls = 'correct';
            else if (i === chosen) cls = 'wrong';
            else cls = 'dim';
          }
          return (
            <li key={i}>
              <button type="button" className={`option ${cls}`} onClick={() => choose(i)} disabled={chosen !== null}>
                <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                <span>{opt}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {chosen !== null && (
        <div className={`feedback ${correct ? 'good' : 'bad'} slide-up`}>
          <strong>{correct ? '✅ Correct.' : '❌ Not this one.'}</strong> {q.explanation}
          <div className="row" style={{ marginTop: '0.8rem' }}>
            <button type="button" className="btn primary" onClick={next} autoFocus>
              {index + 1 < questions.length ? 'Next question →' : 'See my score'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { recordTest } from '../lib/progress';
import { gradeFor, type Question } from '../lib/quiz';
import { celebrate } from '../lib/celebrate';
import { formatClock, useCountdown } from '../lib/useCountdown';
import { useUnsavedWarning } from '../lib/useUnsavedWarning';

interface Props {
  /** 0 for the final learning test. */
  module: number;
  title: string;
  questions: Question[];
  minutes: number;
  backTo: string;
  backLabel: string;
  onRetry: () => void;
}

/**
 * A timed test. All questions can be visited in any order; submitting (or the clock running
 * out) grades it, records the attempt and shows a full review with explanations.
 */
export function Exam({ module, title, questions, minutes, backTo, backLabel, onRetry }: Props) {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [submitted, setSubmitted] = useState(false);
  const [startedAt, setStartedAt] = useState(0);

  const running = started && !submitted;
  const left = useCountdown(minutes * 60, running, () => setSubmitted(true));
  useUnsavedWarning(running);

  const score = useMemo(
    () => answers.reduce<number>((n, a, i) => n + (a === questions[i].answer ? 1 : 0), 0),
    [answers, questions],
  );
  const percent = Math.round((score / questions.length) * 100);
  const grade = gradeFor(percent);
  const answered = answers.filter((a) => a !== null).length;

  useEffect(() => {
    if (!submitted) return;
    recordTest({
      module,
      score,
      outOf: questions.length,
      percent,
      grade: grade.letter,
      passed: grade.passed,
      at: new Date().toISOString(),
      minutesTaken: Math.max(1, Math.round((Date.now() - startedAt) / 60000)),
    });
    if (grade.passed) celebrate();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Record exactly once, on submission.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted]);

  if (!started) {
    return (
      <div className="exam-intro card pop-in">
        <h2>{title}</h2>
        <ul className="exam-rules">
          <li><strong>{questions.length} questions</strong> - scenario questions plus a random draw from the lesson quizzes.</li>
          <li><strong>{minutes} minutes</strong> on the clock. It auto-submits when time is up.</li>
          <li>Move between questions freely; nothing is marked until you submit.</li>
          <li><strong>70% passes.</strong> 80% and above means you are ready to guide others on this.</li>
          <li>Every question is explained afterwards, so a failed attempt is still a good revision session.</li>
        </ul>
        <div className="row wrap">
          <button
            type="button"
            className="btn primary"
            onClick={() => {
              setStarted(true);
              setStartedAt(Date.now());
            }}
          >
            Start the test
          </button>
          <Link className="btn ghost" to={backTo}>{backLabel}</Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="exam-review">
        <div className={`exam-result card pop-in ${grade.passed ? 'pass' : 'fail'}`}>
          <div className="grade-badge">{grade.letter}</div>
          <div>
            <h2>{percent}% - {grade.label}</h2>
            <p className="muted">{score} of {questions.length} correct{left === 0 ? ' · time ran out' : ''}.</p>
            <div className="row wrap">
              <button type="button" className="btn" onClick={onRetry}>Take it again</button>
              <Link className="btn ghost" to={backTo}>{backLabel}</Link>
            </div>
          </div>
        </div>
        <h3>Review every question</h3>
        <ol className="review-list">
          {questions.map((q, i) => {
            const a = answers[i];
            const ok = a === q.answer;
            return (
              <li key={q.id} className={`review-item ${ok ? 'ok' : 'miss'}`}>
                {q.scenario && <p className="quiz-scenario">🎬 {q.scenario}</p>}
                <p className="review-stem"><strong>{q.stem}</strong></p>
                <ul className="review-options">
                  {q.options.map((opt, j) => (
                    <li key={j} className={j === q.answer ? 'correct' : j === a ? 'wrong' : ''}>
                      {j === q.answer ? '✅' : j === a ? '❌' : '·'} {opt}
                    </li>
                  ))}
                </ul>
                <p className="review-explain">{a === null && <em>Not answered. </em>}{q.explanation}</p>
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

  const q = questions[index];
  return (
    <div className="exam">
      <div className="exam-bar">
        <span className={`clock ${left < 120 ? 'urgent' : ''}`} aria-live="polite">⏱ {formatClock(left)}</span>
        <span className="muted small">{answered} / {questions.length} answered</span>
        <button type="button" className="btn primary small" onClick={() => setSubmitted(true)}>
          Submit
        </button>
      </div>
      <div className="exam-nav" aria-label="Questions">
        {questions.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`qdot ${i === index ? 'current' : ''} ${answers[i] !== null ? 'answered' : ''}`}
            onClick={() => setIndex(i)}
            aria-label={`Question ${i + 1}${answers[i] !== null ? ', answered' : ''}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <div className="quiz" key={index}>
        <p className="muted small">Question {index + 1} of {questions.length} · {q.topic}</p>
        {q.scenario && <p className="quiz-scenario">🎬 {q.scenario}</p>}
        <h3 className="quiz-stem">{q.stem}</h3>
        <ul className="options">
          {q.options.map((opt, i) => (
            <li key={i}>
              <button
                type="button"
                className={`option ${answers[index] === i ? 'selected' : ''}`}
                onClick={() => setAnswers((a) => a.map((v, j) => (j === index ? i : v)))}
              >
                <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                <span>{opt}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="row space">
          <button type="button" className="btn ghost" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>← Previous</button>
          {index + 1 < questions.length ? (
            <button type="button" className="btn" onClick={() => setIndex((i) => i + 1)}>Next →</button>
          ) : (
            <button type="button" className="btn primary" onClick={() => setSubmitted(true)}>Submit test</button>
          )}
        </div>
      </div>
    </div>
  );
}

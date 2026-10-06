import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Quiz } from '../components/Quiz';
import { loadQuiz, type Question } from '../lib/quiz';
import { lessonById, moduleOfLesson, neighbours } from '../lib/syllabus';
import { NotFound } from './NotFound';

export function QuizPage() {
  const { id = '' } = useParams();
  const meta = lessonById(id);
  const module = moduleOfLesson(id);
  // Each result remembers which quiz it is for, so a stale one never shows while the next loads.
  const [loaded, setLoaded] = useState<{ id: string; questions: Question[] } | null>(null);
  const questions = loaded?.id === id ? loaded.questions : null;

  useEffect(() => {
    let live = true;
    loadQuiz(id).then((q) => live && setLoaded({ id, questions: q }));
    return () => {
      live = false;
    };
  }, [id]);

  if (!meta || !module) return <NotFound />;
  const { next } = neighbours(id);

  return (
    <div className={`quiz-page m${module.number}`}>
      <p className="crumbs">
        <Link to={`/module/${module.number}`}>Module {module.number}</Link> / <Link to={`/lesson/${id}`}>{id}</Link> / Quiz
      </p>
      <h1>Quiz: {meta.title}</h1>
      {questions === null ? <p className="muted">Loading…</p> : <Quiz lessonId={id} questions={questions} nextLessonId={next?.id} />}
    </div>
  );
}

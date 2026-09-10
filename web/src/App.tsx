import { Suspense, lazy } from 'react';
import { RouterProvider, createHashRouter } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './routes/Home';
import { Course } from './routes/Course';
import { ModulePage } from './routes/ModulePage';
import { Glossary } from './routes/Glossary';
import { Search } from './routes/Search';
import { ProgressPage } from './routes/ProgressPage';
import { About } from './routes/About';
import { NotFound } from './routes/NotFound';

// The lesson and test pages pull in the Markdown renderer and the quiz engine; loading them
// lazily keeps the home and course pages small.
const Lesson = lazy(() => import('./routes/Lesson').then((m) => ({ default: m.Lesson })));
const QuizPage = lazy(() => import('./routes/QuizPage').then((m) => ({ default: m.QuizPage })));
const ModuleTest = lazy(() => import('./routes/ModuleTest').then((m) => ({ default: m.ModuleTest })));
const FinalTest = lazy(() => import('./routes/FinalTest').then((m) => ({ default: m.FinalTest })));

const lazyRoute = (node: React.ReactNode, label: string) => (
  <Suspense fallback={<p className="muted">Loading {label}…</p>}>{node}</Suspense>
);

/**
 * A data router (createHashRouter) so useBlocker works (a test in progress warns before you
 * leave). Hash routing keeps deep links working on any static host with no rewrite rules.
 */
const router = createHashRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'course', element: <Course /> },
      { path: 'module/:n', element: <ModulePage /> },
      { path: 'module/:n/test', element: lazyRoute(<ModuleTest />, 'test') },
      { path: 'lesson/:id', element: lazyRoute(<Lesson />, 'lesson') },
      { path: 'quiz/:id', element: lazyRoute(<QuizPage />, 'quiz') },
      { path: 'final-test', element: lazyRoute(<FinalTest />, 'test') },
      { path: 'glossary', element: <Glossary /> },
      { path: 'search', element: <Search /> },
      { path: 'progress', element: <ProgressPage /> },
      { path: 'about', element: <About /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}

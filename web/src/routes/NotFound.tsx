import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="not-found">
      <h1>Not here yet</h1>
      <p className="muted">That page does not exist, or the module it belongs to has not been released.</p>
      <Link className="btn primary" to="/course">Go to the course</Link>
    </div>
  );
}

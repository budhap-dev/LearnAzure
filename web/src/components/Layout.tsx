import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ThemePicker } from './ThemePicker';
import { SearchBox } from './SearchBox';
import { UpdateBanner } from './UpdateBanner';
import { VERSION_LABEL } from '../lib/version';
import { useProgress } from '../lib/useProgress';
import { streak } from '../lib/progress';
import { useStudyTimer } from '../lib/studyTimer';

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/course', label: 'Course' },
  { to: '/glossary', label: 'Glossary' },
  { to: '/progress', label: 'Progress' },
  { to: '/status', label: 'Status' },
  { to: '/about', label: 'About' },
];

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const progress = useProgress();
  const days = streak();
  useStudyTimer();
  const done = Object.values(progress.lessons).filter((s) => s === 'done').length;

  // Close the drawer on every navigation (adjusted during render, React's pattern for state
  // that follows a changing value), and scroll to top.
  const navKey = `${location.pathname}${location.search}${location.hash}`;
  const [seenNav, setSeenNav] = useState(navKey);
  if (seenNav !== navKey) {
    setSeenNav(navKey);
    setMenuOpen(false);
  }
  useEffect(() => {
    if (!location.hash || location.hash === '#') window.scrollTo({ top: 0 });
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen);
    return () => document.body.classList.remove('menu-open');
  }, [menuOpen]);

  return (
    <div className="shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <div className="header-inner">
          <button
            type="button"
            className="menu-btn"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className={`burger ${menuOpen ? 'open' : ''}`} aria-hidden="true">
              <i /><i /><i />
            </span>
          </button>
          <Link to="/" className="brand" aria-label="Learn Azure home">
            <span className="brand-mark" aria-hidden="true">A</span>
            <span className="brand-text">Learn<span>Azure</span></span>
          </Link>
          <nav className="main-nav" aria-label="Main">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="header-right">
            <SearchBox shortcut />
            {days > 0 && (
              <span className="streak" title={`${days}-day learning streak`}>
                🔥 {days}
              </span>
            )}
            <ThemePicker />
          </div>
        </div>
      </header>

      <div className={`drawer ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
        <nav aria-label="Mobile">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} onClick={() => setMenuOpen(false)}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="drawer-search">
          <SearchBox onNavigate={() => setMenuOpen(false)} />
        </div>
        <p className="drawer-stat">{done} lessons learned{days > 0 ? ` · 🔥 ${days}-day streak` : ''}</p>
      </div>
      {menuOpen && <div className="drawer-backdrop" onClick={() => setMenuOpen(false)} />}

      <main id="main" key={location.pathname}>
        <Outlet />
      </main>

      <footer className="site-footer">
        <p>
          Learn Azure — a scenario-driven course from cloud foundations to DevOps and Azure AI.{' '}
          <a href="https://github.com/budhap-dev/LearnAzure" target="_blank" rel="noreferrer noopener">Source on GitHub</a>
        </p>
        <p className="version" title="App version · CI build number · commit · build date">
          <Link to="/about">{VERSION_LABEL}</Link>
        </p>
      </footer>
      <UpdateBanner />
    </div>
  );
}

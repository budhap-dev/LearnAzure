import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { addStudySeconds } from './progress';

/** Pages where time counts as study. */
const STUDY_PATHS = ['/lesson/', '/quiz/', '/module/', '/final-test', '/glossary'];
/** Time stops counting after this long without a scroll, tap or key press. */
const IDLE_MS = 3 * 60_000;
const TICK_MS = 15_000;
/** Saved in batches, so progress is written about once a minute rather than every tick. */
const FLUSH_SECONDS = 60;

/**
 * Counts active study time: the tab is visible, the learner is on a learning page, and they have
 * interacted recently. Mounted once, in Layout. Nothing leaves the device.
 */
export function useStudyTimer(): void {
  const location = useLocation();
  const studying = STUDY_PATHS.some((p) => location.pathname.startsWith(p));
  const studyingRef = useRef(studying);
  useEffect(() => {
    studyingRef.current = studying;
  }, [studying]);

  useEffect(() => {
    let lastActive = Date.now();
    let pending = 0;
    const flush = () => {
      if (pending > 0) addStudySeconds(pending);
      pending = 0;
    };
    const active = () => {
      lastActive = Date.now();
    };
    const tick = () => {
      if (document.visibilityState === 'visible' && studyingRef.current && Date.now() - lastActive < IDLE_MS) {
        pending += TICK_MS / 1000;
        if (pending >= FLUSH_SECONDS) flush();
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush();
      else active();
    };
    const events = ['pointerdown', 'keydown', 'scroll', 'wheel', 'touchstart'] as const;
    events.forEach((e) => window.addEventListener(e, active, { passive: true }));
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', flush);
    const timer = window.setInterval(tick, TICK_MS);
    return () => {
      flush();
      window.clearInterval(timer);
      events.forEach((e) => window.removeEventListener(e, active));
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', flush);
    };
  }, []);
}

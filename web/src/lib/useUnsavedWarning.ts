import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';

/** Warns before leaving the page (in-app navigation or tab close) while `active` is true. */
export function useUnsavedWarning(active: boolean, message = 'You have a test in progress. Leave and lose your answers?') {
  const blocker = useBlocker(active);

  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    if (window.confirm(message)) blocker.proceed();
    else blocker.reset();
  }, [blocker, message]);

  useEffect(() => {
    if (!active) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [active]);
}

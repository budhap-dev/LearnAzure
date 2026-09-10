import { useEffect, useState } from 'react';
import { read, type Progress } from './progress';

/** The current progress, re-read whenever any part of the app records something. */
export function useProgress(): Progress {
  const [progress, setProgress] = useState<Progress>(() => read());
  useEffect(() => {
    const refresh = () => setProgress(read());
    window.addEventListener('progress-changed', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('progress-changed', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);
  return progress;
}

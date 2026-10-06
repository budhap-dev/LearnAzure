import { applyUpdate, useUpdateReady } from '../lib/serviceWorker';

/** Offers a reload when a new deploy has been downloaded for offline use. */
export function UpdateBanner() {
  const ready = useUpdateReady();
  if (!ready) return null;
  return (
    <div className="update-banner" role="status">
      <span>A new version of Learn Azure is ready.</span>
      <button type="button" className="btn small primary" onClick={applyUpdate}>
        Reload
      </button>
    </div>
  );
}

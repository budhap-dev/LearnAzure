import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { read, replace, today, type Progress } from '../lib/progress';
import { decodeSyncCode, describe, exportJson, isEmptySummary, linksSupported, merge, parseJson, summarise, syncLink } from '../lib/sync';

const LINK_MARK = '#/progress/sync/';
const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

function dayLabel(day: string): string {
  return new Date(`${day}T00:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Accepts exported JSON, a whole sync link or just its code. */
async function parseAnything(text: string): Promise<Progress | null> {
  const trimmed = text.trim();
  if (trimmed.startsWith('{')) return parseJson(trimmed);
  const at = trimmed.indexOf(LINK_MARK);
  return decodeSyncCode(at >= 0 ? trimmed.slice(at + LINK_MARK.length) : trimmed);
}

/**
 * Send and receive progress between devices. `code` is the data from a sync link the learner
 * just opened; it is previewed and only written when they choose to merge or replace.
 */
export function SyncPanel({ progress, code }: { progress: Progress; code?: string }) {
  const navigate = useNavigate();
  const [incoming, setIncoming] = useState<Progress | null>(null);
  const [message, setMessage] = useState('');
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasted, setPasted] = useState('');
  const preview = useRef<HTMLDivElement>(null);

  // The layout remounts the page when the path changes, so a sync link first moves its code into
  // history state on plain #/progress (keeping it out of the address bar), and is decoded there.
  const location = useLocation();
  const stateCode = (location.state as { syncCode?: string } | null)?.syncCode;
  useEffect(() => {
    if (code) {
      navigate('/progress', { replace: true, state: { syncCode: code } });
      return;
    }
    if (!stateCode) return;
    let live = true;
    decodeSyncCode(stateCode).then((p) => {
      if (!live) return;
      if (p) setIncoming(p);
      else setMessage('That sync link is incomplete or damaged. Copy the whole link again, or send a file instead.');
      navigate('/progress', { replace: true, state: null });
    });
    return () => {
      live = false;
    };
  }, [code, stateCode, navigate]);

  useEffect(() => {
    if (incoming) preview.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [incoming]);

  const merged = useMemo(() => (incoming ? merge(progress, incoming) : null), [progress, incoming]);
  const adds = incoming && merged ? summarise(progress, merged) : null;
  const theirs = incoming ? describe(incoming) : null;

  function receive(p: Progress | null) {
    if (p) {
      setIncoming(p);
      setMessage('');
    } else {
      setMessage('That did not look like LearnAzure progress or a sync link.');
    }
  }

  async function shareLink() {
    try {
      const url = await syncLink();
      if (canShare) {
        await navigator.share({ title: 'LearnAzure progress', text: 'Open this on your other device to merge your LearnAzure progress.', url });
      } else {
        await navigator.clipboard.writeText(url);
        setMessage('Sync link copied. Open it on your other device to merge.');
      }
    } catch (e) {
      if (!(e instanceof DOMException && e.name === 'AbortError')) setMessage('Could not share the link. Try Download file instead.');
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(await syncLink());
      setMessage('Sync link copied. Open it on your other device to merge.');
    } catch {
      setMessage('Could not access the clipboard.');
    }
  }

  function download() {
    const url = URL.createObjectURL(new Blob([exportJson()], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `learnazure-progress-${today()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function importFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) receive(parseJson(await file.text()));
  }

  async function previewPasted() {
    receive(await parseAnything(pasted));
    setPasted('');
    setPasteOpen(false);
  }

  function doMerge() {
    if (!merged) return;
    replace(merged);
    setIncoming(null);
    const learned = describe(read()).learned;
    setMessage(`Merged. This device now has ${plural(learned, 'lesson')} learned. To match the other device, send this one's progress back to it.`);
  }

  function doReplace() {
    if (!incoming) return;
    if (!window.confirm("Replace everything on this device with the other device's progress? Anything only on this device is lost.")) return;
    replace(incoming);
    setIncoming(null);
    setMessage("Replaced. This device now has the other device's progress.");
  }

  const items = adds
    ? [
        adds.lessons && `${plural(adds.lessons, 'lesson')} moved on`,
        adds.quizzes && plural(adds.quizzes, 'quiz attempt'),
        adds.tests && plural(adds.tests, 'test'),
        adds.terms && `${plural(adds.terms, 'glossary term')} reviewed`,
        adds.minutes && `${plural(adds.minutes, 'minute')} of study time`,
      ].filter(Boolean)
    : [];

  return (
    <>
      <div className="card sync-card">
        <p>
          Progress lives on each device. Send it from one to another and it merges with what is already there, so
          nothing is lost. Send it both ways to end up the same on both.
        </p>
        <div className="row wrap">
          {linksSupported && (
            <button type="button" className="btn primary" onClick={shareLink}>{canShare ? 'Share sync link' : 'Copy sync link'}</button>
          )}
          {linksSupported && canShare && <button type="button" className="btn" onClick={copyLink}>Copy link</button>}
          <button type="button" className="btn" onClick={download}>Download file</button>
          <label className="btn file-btn">
            Import file
            <input type="file" accept="application/json,.json" className="visually-hidden" onChange={importFile} />
          </label>
          <button type="button" className="btn ghost" aria-expanded={pasteOpen} onClick={() => setPasteOpen((o) => !o)}>Paste</button>
        </div>
        {pasteOpen && (
          <div className="sync-paste">
            <label htmlFor="sync-paste" className="small muted">Paste a sync link or exported JSON</label>
            <textarea id="sync-paste" rows={4} value={pasted} onChange={(e) => setPasted(e.target.value)} spellCheck={false} />
            <button type="button" className="btn" disabled={!pasted.trim()} onClick={previewPasted}>Preview</button>
          </div>
        )}
      </div>

      {incoming && theirs && (
        <div className="card sync-preview" ref={preview} role="region" aria-label="Progress from another device">
          <h3>Progress from another device</h3>
          <p className="small muted">
            {[
              `${plural(theirs.learned, 'lesson')} learned`,
              theirs.attempts && plural(theirs.attempts, 'quiz attempt'),
              theirs.tests && plural(theirs.tests, 'test'),
              theirs.terms && `${plural(theirs.terms, 'term')} reviewed`,
              theirs.lastActive && `last active ${dayLabel(theirs.lastActive)}`,
            ].filter(Boolean).join(' · ')}
          </p>
          {adds && isEmptySummary(adds) ? (
            <p>This device already has all of it, so there is nothing to merge.</p>
          ) : (
            <>
              <p>Merging adds to this device:</p>
              <ul>{items.map((item) => <li key={String(item)}>{item}</li>)}</ul>
            </>
          )}
          <div className="row wrap">
            <button type="button" className="btn primary" disabled={!adds || isEmptySummary(adds)} onClick={doMerge}>Merge into this device</button>
            <button type="button" className="btn danger" onClick={doReplace}>Replace instead</button>
            <button type="button" className="btn ghost" onClick={() => setIncoming(null)}>Cancel</button>
          </div>
        </div>
      )}

      {message && <p className="callout callout-note" role="status">{message}</p>}
    </>
  );
}

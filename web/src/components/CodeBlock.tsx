import { useState } from 'react';

interface Props {
  code: string;
  language?: string;
}

/** A code block with a language tag and a copy button. No syntax highlighter on purpose:
 *  this course is about judgement, not code, so snippets are short and rare. */
export function CodeBlock({ code, language }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="code-block">
      <div className="code-head">
        <span className="code-lang">{language ?? 'text'}</span>
        <button type="button" className="copy-btn" onClick={copy} aria-live="polite">
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

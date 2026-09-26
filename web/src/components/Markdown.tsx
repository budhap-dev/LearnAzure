import { useMemo, type ReactNode } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';
import { AzureIcon } from './AzureIcon';
import { CodeBlock } from './CodeBlock';
import { Diagram, parseDiagram } from './Diagram';
import { remarkLessonSyntax } from '../lib/remarkLessonSyntax';
import { slugify } from '../lib/lessons';
import { lessonById, moduleByNumber } from '../lib/syllabus';

/** Text content of a hast node, for heading ids. */
function textOf(node: unknown): string {
  const n = node as { type?: string; value?: string; children?: unknown[] };
  if (!n) return '';
  if (n.type === 'text') return n.value ?? '';
  return (n.children ?? []).map(textOf).join('');
}

const CALLOUT_ICON: Record<string, string> = {
  note: '📝',
  tip: '💡',
  warning: '⚠️',
  scenario: '🎬',
  team: '🧭',
  example: '🔍',
  important: '📌',
};

const CALLOUT_TITLE: Record<string, string> = {
  note: 'Note',
  tip: 'Tip',
  warning: 'Watch out',
  scenario: 'Real-life scenario',
  team: 'Guiding your team',
  example: 'Example',
  important: 'Important',
};

const components: Components = {
  img({ src, alt }) {
    const source = typeof src === 'string' ? src : '';
    if (source.startsWith('az:')) return <AzureIcon id={source.slice(3)} label={alt || true} size={22} />;
    return <img src={source} alt={alt ?? ''} loading="lazy" />;
  },
  a({ href, children }) {
    const h = href ?? '';
    if (h === 'hl:' || h.startsWith('hl:')) return <mark>{children}</mark>;
    if (h.startsWith('gl:')) return <Link className="term-link" to={`/glossary?term=${h.slice(3)}`}>{children}</Link>;
    // A link to a lesson or module that has not shipped yet reads as text, not a dead link.
    if (h.startsWith('lesson:')) {
      if (!lessonById(h.slice(7))) return <span className="lesson-link soon" title="Coming soon">{children}</span>;
      return <Link className="lesson-link" to={`/lesson/${h.slice(7)}`}>{children}</Link>;
    }
    if (h.startsWith('module:')) {
      if ((moduleByNumber(Number(h.slice(7)))?.status ?? 'planned') === 'planned') return <span className="lesson-link soon" title="Coming soon">{children}</span>;
      return <Link className="lesson-link" to={`/module/${h.slice(7)}`}>{children}</Link>;
    }
    if (h.startsWith('#')) return <a href={h}>{children}</a>;
    return (
      <a href={h} target="_blank" rel="noreferrer noopener">
        {children}
      </a>
    );
  },
  blockquote(props) {
    const p = props as Record<string, unknown> & { children?: ReactNode };
    const type = p['data-callout'] as string | undefined;
    if (!type) return <blockquote>{p.children}</blockquote>;
    const title = (p['data-title'] as string) || CALLOUT_TITLE[type] || type;
    return (
      <aside className={`callout callout-${type}`}>
        <div className="callout-head">
          <span className="callout-icon" aria-hidden="true">{CALLOUT_ICON[type]}</span>
          <span>{title}</span>
        </div>
        <div className="callout-body">{p.children}</div>
      </aside>
    );
  },
  pre({ node, children }) {
    const codeNode = (node as { children?: { properties?: { className?: string[] }; children?: unknown[] }[] })?.children?.[0];
    const classes = (codeNode?.properties?.className ?? []) as string[];
    const lang = classes.find((c) => c.startsWith('language-'))?.slice(9);
    const code = textOf(codeNode).replace(/\n$/, '');
    if (lang === 'diagram') {
      const spec = parseDiagram(code);
      if ('error' in spec) return <p className="callout callout-warning">{spec.error}</p>;
      return <Diagram spec={spec} />;
    }
    if (codeNode) return <CodeBlock code={code} language={lang} />;
    return <pre>{children}</pre>;
  },
  table({ children }) {
    return (
      <div className="table-wrap">
        <table>{children}</table>
      </div>
    );
  },
  h2({ node, children }) {
    const id = slugify(textOf(node));
    return (
      <h2 id={id}>
        <a href={`#${id}`} className="heading-anchor" aria-hidden="true">#</a>
        {children}
      </h2>
    );
  },
  h3({ node, children }) {
    return <h3 id={slugify(textOf(node))}>{children}</h3>;
  },
};

const plugins = [remarkGfm, remarkLessonSyntax];

/** The default transform strips unknown schemes; ours (az:, gl:, lesson:, module:, hl:) are handled by the renderers above. */
const keepUrl = (url: string) => url;

export function Markdown({ source }: { source: string }) {
  const rendered = useMemo(
    () => (
      <ReactMarkdown remarkPlugins={plugins} components={components} urlTransform={keepUrl}>
        {source}
      </ReactMarkdown>
    ),
    [source],
  );
  return <div className="prose">{rendered}</div>;
}

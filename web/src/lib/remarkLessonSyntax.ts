/**
 * A tiny remark plugin (no dependencies) for the two bits of lesson syntax Markdown lacks:
 *
 *   > [!TIP] Optional title      -> a callout; also NOTE, WARNING, SCENARIO, TEAM, EXAMPLE
 *   ==important words==          -> <mark>highlighted</mark>
 *
 * It walks the mdast tree, tags callout blockquotes with data-callout / data-title, and
 * splits text nodes around ==...==.
 */
interface Node {
  type: string;
  value?: string;
  children?: Node[];
  data?: { hName?: string; hProperties?: Record<string, string> };
}

export const CALLOUT_TYPES = ['NOTE', 'TIP', 'WARNING', 'SCENARIO', 'TEAM', 'EXAMPLE', 'IMPORTANT'] as const;

const MARKER = /^\[!(NOTE|TIP|WARNING|SCENARIO|TEAM|EXAMPLE|IMPORTANT)\]\s*([^\n]*)\n?/;

function tagCallout(quote: Node) {
  const first = quote.children?.[0];
  const text = first?.type === 'paragraph' ? first.children?.[0] : undefined;
  if (!text || text.type !== 'text' || !text.value) return;
  const m = text.value.match(MARKER);
  if (!m) return;
  quote.data = { hProperties: { 'data-callout': m[1].toLowerCase(), 'data-title': m[2].trim() } };
  text.value = text.value.slice(m[0].length);
  // Drop the paragraph entirely if the marker was all it held.
  if (text.value.trim() === '' && first?.children?.length === 1) quote.children!.shift();
}

function splitHighlights(parent: Node) {
  if (!parent.children) return;
  const out: Node[] = [];
  for (const child of parent.children) {
    if (child.type === 'text' && child.value && child.value.includes('==')) {
      const parts = child.value.split(/==([^=\n]+)==/);
      parts.forEach((part, i) => {
        if (part === '') return;
        if (i % 2 === 1) out.push({ type: 'strong', children: [{ type: 'text', value: part }], data: { hName: 'mark' } });
        else out.push({ type: 'text', value: part });
      });
    } else out.push(child);
  }
  parent.children = out;
}

function walk(node: Node) {
  if (node.type === 'code' || node.type === 'inlineCode') return;
  if (node.type === 'blockquote') tagCallout(node);
  if (node.children) {
    splitHighlights(node);
    for (const child of node.children) walk(child);
  }
}

export function remarkLessonSyntax() {
  return (tree: Node) => {
    walk(tree);
  };
}

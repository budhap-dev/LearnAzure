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

/**
 * Wraps ==...== in a mark. A highlight may span sibling nodes - `inline code`, links, bold -
 * because only the == markers themselves have to sit in plain text. An unclosed == is left
 * as literal text.
 */
function splitHighlights(parent: Node) {
  if (!parent.children) return;
  const out: Node[] = [];
  let mark: Node | null = null;
  const push = (node: Node) => (mark ? mark.children! : out).push(node);
  for (const child of parent.children) {
    if (child.type !== 'text' || !child.value?.includes('==')) {
      push(child);
      continue;
    }
    child.value.split('==').forEach((part, i) => {
      if (i > 0) {
        if (mark) mark = null;
        else {
          mark = { type: 'strong', children: [], data: { hName: 'mark' } };
          out.push(mark);
        }
      }
      if (part !== '') push({ type: 'text', value: part });
    });
  }
  if (mark) {
    const open: Node = mark;
    out.splice(out.indexOf(open), 1, { type: 'text', value: '==' }, ...open.children!);
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

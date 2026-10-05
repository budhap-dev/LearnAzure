import type { Element, ElementContent, Root, RootContent } from 'hast';

/** Tables with at least this many columns become stacked cards on phones. */
export const STACK_FROM_COLUMNS = 4;

function textOf(node: ElementContent | RootContent): string {
  if (node.type === 'text') return node.value;
  if (node.type === 'element') return node.children.map(textOf).join('');
  return '';
}

function childElements(node: Element, tag: string): Element[] {
  return node.children.filter((c): c is Element => c.type === 'element' && c.tagName === tag);
}

function labelTable(table: Element): void {
  const head = childElements(table, 'thead')[0];
  const headRow = head && childElements(head, 'tr')[0];
  if (!headRow) return;
  const labels = childElements(headRow, 'th').map((th) => textOf(th).trim());
  if (labels.length >= STACK_FROM_COLUMNS) table.properties = { ...table.properties, dataStack: 'true' };
  for (const body of childElements(table, 'tbody')) {
    for (const row of childElements(body, 'tr')) {
      childElements(row, 'td').forEach((td, i) => {
        if (labels[i]) td.properties = { ...td.properties, dataLabel: labels[i] };
      });
    }
  }
}

function walk(node: Root | Element): void {
  for (const child of node.children) {
    if (child.type !== 'element') continue;
    if (child.tagName === 'table') labelTable(child);
    else walk(child);
  }
}

/**
 * Gives every body cell a data-label with its column header, and marks wide tables with
 * data-stack, so phones can show each row as a card instead of a table that scrolls sideways.
 */
export function rehypeTableLabels() {
  return (tree: Root) => walk(tree);
}

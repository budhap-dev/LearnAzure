import { AZURE_ICONS } from '../data/icons';
import { iconUrl } from './AzureIcon';

/**
 * An architecture diagram described as JSON inside a ```diagram fence. Nodes sit on a grid
 * (x = column, y = row); groups draw a labelled box around nodes; edges draw arrows with
 * animated dashes. Built from the official Azure icons so it looks like a real design doc.
 */
export interface DiagramNode {
  id: string;
  /** An Azure icon slug, or "user" for a person, or "internet" / "onprem" for generic shapes. */
  icon: string;
  label: string;
  sub?: string;
  x: number;
  y: number;
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
  both?: boolean;
}

export interface DiagramGroup {
  label: string;
  nodes: string[];
  tone?: 'blue' | 'green' | 'amber' | 'purple' | 'grey';
}

export interface DiagramSpec {
  title?: string;
  caption?: string;
  nodes: DiagramNode[];
  edges?: DiagramEdge[];
  groups?: DiagramGroup[];
}

const CELL_W = 182;
const CELL_H = 152;
const BOX_W = 124;
const BOX_H = 104;
const PAD = 24;

export function parseDiagram(source: string): DiagramSpec | { error: string } {
  try {
    const spec = JSON.parse(source) as DiagramSpec;
    if (!Array.isArray(spec.nodes) || spec.nodes.length === 0) return { error: 'A diagram needs at least one node.' };
    return spec;
  } catch (e) {
    return { error: `Diagram JSON is invalid: ${(e as Error).message}` };
  }
}

function center(n: DiagramNode) {
  return { cx: PAD + n.x * CELL_W + CELL_W / 2, cy: PAD + n.y * CELL_H + CELL_H / 2 };
}

/** Point on the border of node `n`'s box, in the direction of (tx, ty). */
function anchor(n: DiagramNode, tx: number, ty: number) {
  const { cx, cy } = center(n);
  const dx = tx - cx;
  const dy = ty - cy;
  if (dx === 0 && dy === 0) return { x: cx, y: cy };
  const hw = BOX_W / 2 + 4;
  const hh = BOX_H / 2 + 4;
  const scale = Math.min(hw / Math.abs(dx || 1e-6), hh / Math.abs(dy || 1e-6));
  return { x: cx + dx * scale, y: cy + dy * scale };
}

function GenericGlyph({ kind }: { kind: string }) {
  if (kind === 'user') {
    return (
      <g className="dg-glyph">
        <circle cx="0" cy="-10" r="10" />
        <path d="M-18 20 a18 18 0 0 1 36 0 z" />
      </g>
    );
  }
  if (kind === 'onprem') {
    return (
      <g className="dg-glyph">
        <rect x="-20" y="-16" width="40" height="32" rx="4" />
        <path d="M-12 -6 h24 M-12 2 h24 M-12 10 h14" />
      </g>
    );
  }
  // internet / unknown
  return (
    <g className="dg-glyph">
      <circle cx="0" cy="0" r="18" />
      <path d="M-18 0 h36 M0 -18 v36 M-12 -12 q12 8 24 0 M-12 12 q12 -8 24 0" />
    </g>
  );
}

/** True when a label pill centred at (x, y) would cover any node box. */
function overlapsAnyNode(x: number, y: number, w: number, nodes: DiagramNode[]): boolean {
  const half = w / 2 + 3;
  return nodes.some((n) => {
    const { cx, cy } = center(n);
    return Math.abs(x - cx) < BOX_W / 2 + half && Math.abs(y - cy) < BOX_H / 2 + 13;
  });
}

/** True when a label pill centred at (x, y) would cover a label already placed. */
function overlapsAnyLabel(x: number, y: number, w: number, placed: { x: number; y: number; w: number }[]): boolean {
  return placed.some((p) => Math.abs(x - p.x) < (w + p.w) / 2 + 4 && Math.abs(y - p.y) < 24);
}

/** Rough width of a label in the group font (11.5px, bold) - good enough to size a box. */
function labelWidth(text: string): number {
  return text.length * 6.4 + 24;
}

export function Diagram({ spec }: { spec: DiagramSpec }) {
  const nodes = spec.nodes;
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const cols = Math.max(...nodes.map((n) => n.x)) + 1;
  const rows = Math.max(...nodes.map((n) => n.y)) + 1;

  // Group boxes are measured first: a box is widened when its label is longer than the
  // nodes it surrounds, and the canvas then grows to fit any box that sticks out.
  const boxes = (spec.groups ?? [])
    .map((g) => {
      const members = g.nodes.map((id) => byId.get(id)).filter(Boolean) as DiagramNode[];
      if (members.length === 0) return null;
      const minX = Math.min(...members.map((n) => center(n).cx)) - BOX_W / 2 - 14;
      const minY = Math.min(...members.map((n) => center(n).cy)) - BOX_H / 2 - 12;
      const maxY = Math.max(...members.map((n) => center(n).cy)) + BOX_H / 2 + 26;
      const maxX = Math.max(
        Math.max(...members.map((n) => center(n).cx)) + BOX_W / 2 + 14,
        minX + labelWidth(g.label),
      );
      return { group: g, minX, minY, maxX, maxY };
    })
    .filter(Boolean) as { group: DiagramGroup; minX: number; minY: number; maxX: number; maxY: number }[];

  // Edge labels placed so far, so a later label never lands on (and hides) an earlier one.
  const placedLabels: { x: number; y: number; w: number }[] = [];

  const width = Math.max(cols * CELL_W + PAD * 2, ...boxes.map((b) => b.maxX + PAD));
  const height = Math.max(rows * CELL_H + PAD * 2, ...boxes.map((b) => b.maxY + PAD));

  return (
    <figure className="diagram">
      {spec.title && <figcaption className="diagram-title">{spec.title}</figcaption>}
      <p className="diagram-hint" aria-hidden="true">Scroll sideways to see the whole diagram</p>
      <div className="diagram-scroll">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          role="img"
          aria-label={spec.title ?? 'Architecture diagram'}
        >
          <defs>
            <marker id="dg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" className="dg-arrowhead" />
            </marker>
          </defs>

          {boxes.map((b, i) => (
            <g key={i} className={`dg-group tone-${b.group.tone ?? 'blue'}`}>
              <rect x={b.minX} y={b.minY} width={b.maxX - b.minX} height={b.maxY - b.minY} rx="12" />
            </g>
          ))}

          {(spec.edges ?? []).map((e, i) => {
            const a = byId.get(e.from);
            const b = byId.get(e.to);
            if (!a || !b) return null;
            const ca = center(a);
            const cb = center(b);
            const p1 = anchor(a, cb.cx, cb.cy);
            const p2 = anchor(b, ca.cx, ca.cy);
            const w = e.label ? e.label.length * 6.4 + 14 : 0;
            let mx = (p1.x + p2.x) / 2;
            let my = (p1.y + p2.y) / 2;
            // Keep the label off every node box and every earlier label. Try the midpoint, then
            // progressively larger offsets perpendicular to the edge, and take the first position
            // that is clear of both; failing that, the first clear of the boxes.
            if (e.label) {
              const dx = p2.x - p1.x;
              const dy = p2.y - p1.y;
              const horizontal = Math.abs(dx) >= Math.abs(dy);
              const candidates: [number, number][] = [[mx, my]];
              for (const d of [22, 40, 58, 76]) {
                if (horizontal) candidates.push([mx, my - d], [mx, my + d]);
                else candidates.push([mx + d + w / 2 - 20, my], [mx - d - w / 2 + 20, my]);
              }
              const offBoxes = candidates.filter(([cx, cy]) => !overlapsAnyNode(cx, cy, w, nodes));
              const clear = offBoxes.find(([cx, cy]) => !overlapsAnyLabel(cx, cy, w, placedLabels));
              [mx, my] = clear ?? offBoxes[0] ?? candidates[candidates.length - 1];
              placedLabels.push({ x: mx, y: my, w });
            }
            return (
              <g key={i} className={`dg-edge ${e.dashed ? 'dashed' : ''}`} style={{ animationDelay: `${i * 0.15}s` }}>
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  markerEnd="url(#dg-arrow)"
                  markerStart={e.both ? 'url(#dg-arrow)' : undefined}
                />
                {e.label && (
                  <g>
                    <rect x={mx - w / 2} y={my - 10} width={w} height="20" rx="10" className="dg-edge-label-bg" />
                    <text x={mx} y={my + 4} textAnchor="middle" className="dg-edge-label">{e.label}</text>
                  </g>
                )}
              </g>
            );
          })}

          {nodes.map((n, i) => {
            const { cx, cy } = center(n);
            const isAzure = n.icon in AZURE_ICONS;
            return (
              <g key={n.id} transform={`translate(${cx} ${cy})`}>
              <g className={`dg-node ${isAzure ? '' : 'generic'}`} style={{ animationDelay: `${i * 0.08}s` }}>
                <rect x={-BOX_W / 2} y={-BOX_H / 2} width={BOX_W} height={BOX_H} rx="12" />
                {isAzure ? (
                  <image href={iconUrl(n.icon)} x="-22" y={-BOX_H / 2 + 10} width="44" height="44" />
                ) : (
                  <g transform={`translate(0 ${-BOX_H / 2 + 32})`}>
                    <GenericGlyph kind={n.icon} />
                  </g>
                )}
                <text x="0" y={BOX_H / 2 - (n.sub ? 26 : 16)} textAnchor="middle" className="dg-label">{n.label}</text>
                {n.sub && (
                  <text x="0" y={BOX_H / 2 - 11} textAnchor="middle" className="dg-sub">{n.sub}</text>
                )}
              </g>
              </g>
            );
          })}

          {boxes.map((b, i) => (
            <g key={`label-${i}`} className={`dg-group-label tone-${b.group.tone ?? 'blue'}`}>
              <rect x={b.minX + 6} y={b.maxY - 22} width={labelWidth(b.group.label) - 12} height="18" rx="6" />
              <text x={b.minX + 12} y={b.maxY - 9}>{b.group.label}</text>
            </g>
          ))}
        </svg>
      </div>
      {spec.caption && <p className="diagram-caption">{spec.caption}</p>}
    </figure>
  );
}

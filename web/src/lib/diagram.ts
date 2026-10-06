import type { DiagramSpec } from '../components/Diagram';

/** Parses a ```diagram block, or says what is wrong with it. */
export function parseDiagram(source: string): DiagramSpec | { error: string } {
  try {
    const spec = JSON.parse(source) as DiagramSpec;
    if (!Array.isArray(spec.nodes) || spec.nodes.length === 0) return { error: 'A diagram needs at least one node.' };
    return spec;
  } catch (e) {
    return { error: `Diagram JSON is invalid: ${(e as Error).message}` };
  }
}

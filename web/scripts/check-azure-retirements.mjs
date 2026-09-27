/**
 * Weekly content-freshness check against Microsoft's Azure Updates feed.
 *
 * Reads the retirement announcements published in the last N days and flags the ones that touch
 * the course: a service name from the glossary, or a runtime version (".NET 8", "Node 20") that
 * appears in a lesson. Every retirement in the window is listed; matches come first with the
 * lessons to review.
 *
 * Writes a Markdown report to stdout. Exit code 0 always; the workflow opens an issue when the
 * report's first line says there are matches.
 *
 *   node scripts/check-azure-retirements.mjs [--days 7] [--feed path/to/feed.xml]
 */
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const FEED_URL = 'https://www.microsoft.com/releasecommunications/api/v2/azure/rss';
const ROOT = new URL('../', import.meta.url).pathname;

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const days = Number(arg('days', '7'));
const feedPath = arg('feed');

// Glossary names are matched only when they are multi-word ("Azure Load Balancer") or one of
// these single-word products; single words like "Node", "Region" or "retire" match too much.
const SINGLE_WORD_PRODUCTS = [
  'AKS', 'ACR', 'ACI', 'APIM', 'VMSS', 'ExpressRoute', 'Bastion', 'Bicep', 'Sentinel', 'Kubernetes',
  'Hyperscale', 'Dapr', 'KEDA', 'Kudu', 'WebJobs', 'Advisor', 'Arc', 'Functions', 'Cosmos', 'Entra',
  'Foundry', 'Blueprints', 'Synapse', 'Purview', 'Fabric',
];
// "Support for .NET 8 ends..." - matched against lessons with the exact version.
const RUNTIME = /(\.NET|Node(?:\.js)?|Python|PowerShell|Java|PHP|Kubernetes|TLS)[ -]?(\d+(?:\.\d+)?)/gi;

const decode = (s) =>
  s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')
    .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const tag = (block, name) => decode((block.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`)) || [])[1] || '');
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const word = (s) => new RegExp(`(^|[^\\w])${escape(s)}($|[^\\w])`, 'i');

const xml = feedPath ? await readFile(feedPath, 'utf8') : await (await fetch(FEED_URL)).text();
const since = Date.now() - days * 86_400_000;
const retirements = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
  .map(([, b]) => ({
    title: tag(b, 'title'),
    link: tag(b, 'link'),
    date: new Date(tag(b, 'pubDate')),
    categories: [...b.matchAll(/<category>([\s\S]*?)<\/category>/g)].map((m) => decode(m[1])),
  }))
  .filter((i) => i.categories.includes('Retirements') || /\brenam/i.test(i.title))
  .filter((i) => i.date.getTime() >= since)
  .sort((a, b) => b.date - a.date);

const glossaryDir = join(ROOT, 'src/data/glossary');
const glossary = (await Promise.all((await readdir(glossaryDir)).map(async (f) => JSON.parse(await readFile(join(glossaryDir, f), 'utf8'))))).flat();
const names = new Set([
  ...glossary.filter((t) => t.icon).flatMap((t) => [t.term, ...(t.aliases || [])]).filter((n) => /\s/.test(n)),
  ...SINGLE_WORD_PRODUCTS,
]);
const lessonDir = join(ROOT, 'src/content/lessons');
const lessons = Object.fromEntries(
  await Promise.all((await readdir(lessonDir)).filter((f) => f.endsWith('.md')).map(async (f) => [f.replace(/\.md$/, ''), await readFile(join(lessonDir, f), 'utf8')])),
);
const lessonsMatching = (re) => Object.keys(lessons).filter((id) => re.test(lessons[id])).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

for (const item of retirements) {
  item.hits = new Map();
  for (const name of names) {
    if (!word(name).test(item.title)) continue;
    const ids = lessonsMatching(word(name));
    if (ids.length) item.hits.set(name, ids);
  }
  for (const [, runtime, version] of item.title.matchAll(RUNTIME)) {
    const ids = lessonsMatching(new RegExp(`${escape(runtime.replace(/\.js$/i, ''))}(\\.js)?[ -]?${escape(version)}(?!\\d)`, 'i'));
    if (ids.length) item.hits.set(`${runtime} ${version}`, ids);
  }
  // "Cosmos" inside "Cosmos DB": report the longer name once, with both names' lessons.
  for (const short of [...item.hits.keys()]) {
    const long = [...item.hits.keys()].find((n) => n !== short && word(short).test(n));
    if (!long) continue;
    item.hits.set(long, [...new Set([...item.hits.get(long), ...item.hits.get(short)])].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })));
    item.hits.delete(short);
  }
}

const matched = retirements.filter((i) => i.hits.size);
const other = retirements.filter((i) => !i.hits.size);
const day = (d) => d.toISOString().slice(0, 10);
const lines = [
  `<!-- matches: ${matched.length} -->`,
  `Azure retirement announcements from the last ${days} days, checked against the course. Source: [Azure Updates](${FEED_URL}).`,
  '',
];
if (matched.length) {
  lines.push('## Touches the course', '');
  for (const i of matched) {
    lines.push(`- [ ] **[${i.title}](${i.link})** (${day(i.date)})`);
    for (const [name, ids] of i.hits) lines.push(`  - "${name}" appears in ${ids.map((id) => `\`${id}\``).join(', ')}`);
  }
  lines.push('');
}
if (other.length) {
  lines.push('## No match in the course', '', 'Listed so nothing is missed; the matcher only knows glossary service names and runtime versions.', '');
  for (const i of other) lines.push(`- [${i.title}](${i.link}) (${day(i.date)})`);
  lines.push('');
}
if (!retirements.length) lines.push('No retirement announcements in this window.');
console.log(lines.join('\n'));

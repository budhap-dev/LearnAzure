import { execSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * The version shown in the footer is assembled at build time:
 *   package.json version (bumped in every pull request)
 *   + build number   (CI run number, or Vercel deployment id) - "dev" locally
 *   + short git sha  (CI, Vercel, or the local checkout)
 *   + build date
 */
function gitSha(): string {
  const fromEnv = process.env.VITE_BUILD_SHA || process.env.GITHUB_SHA || process.env.VERCEL_GIT_COMMIT_SHA;
  if (fromEnv) return fromEnv.slice(0, 7);
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return 'local';
  }
}

/**
 * Question and term counts for the build status page, read from the content files at build
 * time so the page does not have to bundle every quiz. In dev they refresh on server restart.
 */
function contentStats() {
  const count = (dir: string, pick: (data: unknown) => unknown[]) =>
    Object.fromEntries(
      readdirSync(new URL(dir, import.meta.url))
        .filter((f) => f.endsWith('.json'))
        .map((f) => [f.replace(/\.json$/, ''), pick(JSON.parse(readFileSync(new URL(dir + f, import.meta.url), 'utf8'))).length]),
    );
  return {
    quizzes: count('./src/data/quizzes/', (d) => d as unknown[]),
    exams: count('./src/data/exams/', (d) => (d as { questions: unknown[] }).questions),
    glossary: count('./src/data/glossary/', (d) => d as unknown[]),
  };
}

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string };
const buildNumber = process.env.VITE_BUILD_NUMBER || process.env.GITHUB_RUN_NUMBER || (process.env.VERCEL ? 'vercel' : 'dev');

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_NUMBER__: JSON.stringify(buildNumber),
    __BUILD_SHA__: JSON.stringify(gitSha()),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
    __CONTENT_STATS__: JSON.stringify(contentStats()),
  },
});

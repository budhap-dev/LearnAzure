/** Build-time version info, injected by vite.config.ts. Shown in the footer and on About. */
export const VERSION = {
  app: __APP_VERSION__,
  build: __BUILD_NUMBER__,
  sha: __BUILD_SHA__,
  date: __BUILD_DATE__,
};

export const VERSION_LABEL = `v${VERSION.app} · build ${VERSION.build} · ${VERSION.sha} · ${VERSION.date}`;

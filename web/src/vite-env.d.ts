/// <reference types="vite/client" />

declare const __APP_VERSION__: string;
declare const __BUILD_NUMBER__: string;
declare const __BUILD_SHA__: string;
declare const __BUILD_DATE__: string;
/** Counts per content file, keyed by file name without .json: quizzes "1.1", exams "module-1", glossary "1.1". */
declare const __CONTENT_STATS__: {
  quizzes: Record<string, number>;
  exams: Record<string, number>;
  glossary: Record<string, number>;
};

declare module '*.md?raw' {
  const content: string;
  export default content;
}

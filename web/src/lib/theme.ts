/**
 * Theme handling. The chosen theme is a data-theme attribute on <html>, which the
 * stylesheet keys off; "system" removes the attribute and lets prefers-color-scheme decide.
 * "azure" is the default for a first visit. The choice persists in localStorage and is
 * applied before first paint by the inline script in index.html (which must agree with
 * DEFAULT_THEME), so there is no flash of the wrong theme.
 */
export const THEMES = [
  { id: 'azure', label: 'Azure', hint: 'signature blue', dark: false },
  { id: 'light', label: 'Light', hint: 'clean and bright', dark: false },
  { id: 'dark', label: 'Dark', hint: 'easy on the eyes', dark: true },
  { id: 'midnight', label: 'Midnight', hint: 'deep navy', dark: true },
  { id: 'ocean', label: 'Ocean', hint: 'teal and aqua', dark: true },
  { id: 'sunset', label: 'Sunset', hint: 'warm orange and pink', dark: false },
  { id: 'forest', label: 'Forest', hint: 'calm greens', dark: true },
  { id: 'paper', label: 'Paper', hint: 'warm, printed notes', dark: false },
  { id: 'contrast', label: 'High contrast', hint: 'maximum legibility', dark: true },
  { id: 'system', label: 'System', hint: 'follow the OS', dark: false },
] as const;

export type ThemeId = (typeof THEMES)[number]['id'];

/** Used when the visitor has never picked a theme. Keep in sync with index.html. */
export const DEFAULT_THEME: ThemeId = 'azure';

const KEY = 'learnazure.theme';

export function currentTheme(): ThemeId {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored && THEMES.some((t) => t.id === stored)) return stored as ThemeId;
  } catch {
    /* storage unavailable */
  }
  return DEFAULT_THEME;
}

export function applyTheme(theme: ThemeId): void {
  if (theme === 'system') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* the theme still applies for this visit */
  }
}

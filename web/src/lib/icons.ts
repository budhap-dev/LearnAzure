import { AZURE_ICONS } from '../data/icons';

const base = import.meta.env.BASE_URL;

/** The service name for an icon slug, or the slug itself if it is not in the set. */
export function iconLabel(id: string): string {
  return (AZURE_ICONS as Record<string, string>)[id] ?? id;
}

export function iconUrl(id: string): string {
  return `${base}azure-icons/${id}.svg`;
}

import { AZURE_ICONS, type AzureIconId } from '../data/icons';

const base = import.meta.env.BASE_URL;

interface Props {
  id: AzureIconId | string;
  size?: number;
  /** Show the service name next to the icon as a chip. */
  label?: string | boolean;
  className?: string;
}

export function iconLabel(id: string): string {
  return (AZURE_ICONS as Record<string, string>)[id] ?? id;
}

export function iconUrl(id: string): string {
  return `${base}azure-icons/${id}.svg`;
}

/** One of Microsoft's official Azure icons, by slug (see src/data/icons.ts). */
export function AzureIcon({ id, size = 28, label, className }: Props) {
  const name = iconLabel(id);
  const img = (
    <img
      src={iconUrl(id)}
      width={size}
      height={size}
      alt={label ? '' : name}
      title={name}
      loading="lazy"
      className={`az-icon ${className ?? ''}`}
      draggable={false}
    />
  );
  if (!label) return img;
  return (
    <span className="az-chip">
      {img}
      <span>{typeof label === 'string' ? label : name}</span>
    </span>
  );
}

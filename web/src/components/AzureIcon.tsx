import type { AzureIconId } from '../data/icons';
import { iconLabel, iconUrl } from '../lib/icons';

interface Props {
  id: AzureIconId | string;
  size?: number;
  /** Show the service name next to the icon as a chip. */
  label?: string | boolean;
  className?: string;
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

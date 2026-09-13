// src/components/brand/StyleCard.tsx
// A curtain style as a glass card: the whole photo, uncropped, on a blurred fill of itself.
import React from 'react';
import { ArrowRight, Layers } from 'lucide-react';
import { CurtainTemplate } from '../../types/curtain';

interface StyleCardProps {
  template: CurtainTemplate;
  badge: 'Your photo' | 'Built-in';
  actionLabel: string;
  onSelect: (t: CurtainTemplate) => void;
  compact?: boolean;
}

export const StyleCard: React.FC<StyleCardProps> = ({ template, badge, actionLabel, onSelect, compact = false }) => {
  const src = template.real_photo_url || template.original_image_url;
  const zoneNames = template.regions.map((r) => r.display_name).slice(0, 3).join(' · ');
  return (
    <button type="button" onClick={() => onSelect(template)} className="glass-card group flex w-full flex-col" aria-label={`${template.name}: ${actionLabel}`}>
      <div className="glass-card-frame" style={{ aspectRatio: compact ? '3 / 4' : '4 / 5' }}>
        <img src={src} alt="" aria-hidden="true" className="glass-card-fill" loading="lazy" />
        <img src={src} alt={template.name} className="glass-card-image" loading="lazy" />
        <span className={`glass-chip absolute top-3 left-3 ${badge === 'Your photo' ? 'is-accent' : ''}`}>{badge}</span>
        <span className="glass-chip absolute top-3 right-3"><Layers className="h-3 w-3" />{template.regions.length} areas</span>
        <span className="glass-chip is-accent glass-card-action">{actionLabel} <ArrowRight className="h-3 w-3" /></span>
      </div>
      <div className="glass-label flex w-full min-w-0 flex-col gap-0.5 px-4 py-3">
        <span className="block truncate font-display text-[15px] font-semibold text-[var(--color-text-primary)]" title={template.name}>{template.name}</span>
        {!compact && template.description && <span className="line-clamp-2 text-[12px] leading-relaxed text-[var(--color-text-secondary)]">{template.description}</span>}
        <span className="truncate text-[11px] text-[var(--color-text-tertiary)]">{zoneNames}</span>
      </div>
    </button>
  );
};

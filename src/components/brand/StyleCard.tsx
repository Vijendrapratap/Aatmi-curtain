// src/components/brand/StyleCard.tsx
import React from 'react';
import { CurtainTemplate } from '../../types/curtain';

interface StyleCardProps {
  template: CurtainTemplate;
  badge: 'Your photo' | 'Built-in';
  actionLabel: string;
  onSelect: (t: CurtainTemplate) => void;
  compact?: boolean;
}

export const StyleCard: React.FC<StyleCardProps> = ({ template, badge, actionLabel, onSelect, compact = false }) => {
  const zoneNames = template.regions.map((r) => r.display_name).slice(0, 3).join(', ');
  return (
    <button
      type="button"
      onClick={() => onSelect(template)}
      className="brand-card brand-card-interactive flex flex-col overflow-hidden text-left"
    >
      <div className={`media-frame ${compact ? 'aspect-[4/4]' : 'aspect-[4/5]'}`}>
        <img
          src={template.real_photo_url || template.original_image_url}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <span className={badge === 'Your photo' ? 'badge badge-accent' : 'badge badge-muted'}>{badge}</span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="badge badge-muted">{template.regions.length} zones</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="truncate font-display text-[15px] font-semibold">{template.name}</h3>
        {!compact && (
          <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
            {template.description}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-[var(--color-border-subtle)] pt-3 text-[12px]">
          <span className="truncate text-[var(--color-text-tertiary)]">{zoneNames}</span>
          <span className="shrink-0 font-semibold text-[var(--color-accent)]">{actionLabel}</span>
        </div>
      </div>
    </button>
  );
};

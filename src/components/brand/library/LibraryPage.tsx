// src/components/brand/library/LibraryPage.tsx
import React from 'react';
import { useBrandStore } from '../../../lib/brandStore';
import { StylesTab } from './StylesTab';
import { FabricsTab } from './FabricsTab';

interface LibraryPageProps {
  tab: 'styles' | 'fabrics';
  onOpenNewStyle: () => void;
}

export const LibraryPage: React.FC<LibraryPageProps> = ({ tab, onOpenNewStyle }) => {
  const { setActiveView } = useBrandStore();
  return (
    <div className="page-shell space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow-label">Library</p>
          <h1 className="page-title">{tab === 'styles' ? 'Curtain styles' : 'Fabrics'}</h1>
          <p className="page-lede">
            {tab === 'styles'
              ? 'A curtain style is a photo with zones you can dress. Pick one to start a design.'
              : 'Inspect a fabric up close, then apply it to a zone of the style open in the studio.'}
          </p>
        </div>
        <div className="segmented self-start">
          <button type="button" aria-pressed={tab === 'styles'} onClick={() => setActiveView('library_styles')} className={`segmented-item ${tab === 'styles' ? 'is-active' : ''}`}>Curtain styles</button>
          <button type="button" aria-pressed={tab === 'fabrics'} onClick={() => setActiveView('library_fabrics')} className={`segmented-item ${tab === 'fabrics' ? 'is-active' : ''}`}>Fabrics</button>
        </div>
      </div>
      {tab === 'styles' ? <StylesTab onOpenNewStyle={onOpenNewStyle} /> : <FabricsTab />}
    </div>
  );
};

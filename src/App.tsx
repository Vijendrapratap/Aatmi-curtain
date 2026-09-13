// src/App.tsx
import React, { useEffect, useState } from 'react';
import { useBrandStore } from './lib/brandStore';
import { useStudioStore } from './lib/store';
import { SignIn } from './pages/SignIn';
import { InviteAccept } from './pages/InviteAccept';
import { BrandHeader } from './components/brand/BrandHeader';
import { BrandDashboard } from './components/brand/BrandDashboard';
import { GeneratePage } from './components/brand/GeneratePage';
import { RoomPage } from './components/brand/RoomPage';
import { LibraryPage } from './components/brand/library/LibraryPage';
import { DesignDetailView } from './components/brand/DesignDetailView';
import { BrandSettingsView } from './components/brand/BrandSettingsView';
import { AdminPage } from './components/brand/AdminPage';
import { NewTemplateModal } from './components/NewTemplateModal';
import { SpecSheetModal } from './components/SpecSheetModal';
import { CurtainTemplate } from './types/curtain';

export default function App() {
  const {
    currentUser,
    session,
    bootstrapSession,
    signOut,
    activeView,
    setActiveView,
    addBrandTemplate,
    currentBrandId,
    brands,
    designs,
    activeDesignId,
    brandFabrics,
  } = useBrandStore();

  const { assignments } = useStudioStore();
  const fabrics = brandFabrics.filter((f) => f.brand_id === currentBrandId || !f.brand_id);

  useEffect(() => { bootstrapSession(); }, []);
  const inviteToken = typeof window !== 'undefined' ? (window.location.pathname.match(/^\/invite\/([^/]+)/) || [])[1] : undefined;

  // Global modals
  const [isNewTemplateModalOpen, setIsNewTemplateModalOpen] = useState(false);
  const [isSpecSheetOpen, setIsSpecSheetOpen] = useState(false);

  const currentBrand = brands.find((b) => b.id === currentBrandId) || brands[0];
  const activeDesign = designs.find((d) => d.id === activeDesignId) || designs[0];

  const handleSaveNewTemplate = (template: CurtainTemplate) => {
    addBrandTemplate({
      ...template,
      brand_id: currentBrandId,
      source: 'user_upload',
    });
    useStudioStore.getState().selectTemplate(template.id, [
      { ...template, brand_id: currentBrandId, source: 'user_upload' },
      ...useBrandStore.getState().brandTemplates,
    ]);
    setIsNewTemplateModalOpen(false);
    setActiveView('editor');
  };

  if (inviteToken && session !== 'signed_in') {
    return <InviteAccept token={inviteToken} onDone={() => undefined} />;
  }

  if (session === 'loading') {
    return <div className="flex min-h-dvh items-center justify-center bg-[var(--color-bg-base)] text-[13px] text-[var(--color-text-secondary)]">Loading…</div>;
  }

  if (session === 'signed_out') {
    return <SignIn />;
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--color-bg-base)] font-sans text-[var(--color-text-primary)] antialiased">
      {/* Top Header with Multi-Tenant Switcher, Navigation & Usage Meter */}
      <BrandHeader onSignOut={() => { signOut(); }} />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col min-h-0">
        {activeView === 'dashboard' && (
          <BrandDashboard onOpenNewStyle={() => setIsNewTemplateModalOpen(true)} />
        )}

        {(activeView === 'library_styles' || activeView === 'library_fabrics') && (
          <LibraryPage
            tab={activeView === 'library_styles' ? 'styles' : 'fabrics'}
            onOpenNewStyle={() => setIsNewTemplateModalOpen(true)}
          />
        )}

        {activeView === 'editor' && <GeneratePage />}
        {activeView === 'room' && <RoomPage />}

        {activeView === 'design_detail' && (
          <DesignDetailView onOpenSpecSheet={() => setIsSpecSheetOpen(true)} />
        )}

        {activeView.startsWith('settings') && (
          <BrandSettingsView
            initialTab={
              activeView === 'settings_profile'
                ? 'profile'
                : activeView === 'settings_team'
                ? 'team'
                : activeView === 'settings_billing'
                ? 'billing'
                : 'models'
            }
          />
        )}

        {activeView === 'platform_admin' && <AdminPage />}
      </main>

      {/* Global Modals */}
      <NewTemplateModal
        isOpen={isNewTemplateModalOpen}
        onClose={() => setIsNewTemplateModalOpen(false)}
        onSaveTemplate={handleSaveNewTemplate}
      />

      {activeDesign && (
        <SpecSheetModal
          isOpen={isSpecSheetOpen}
          onClose={() => setIsSpecSheetOpen(false)}
          template={{
            id: activeDesign.template_id,
            name: activeDesign.template_name,
            style_code: 'AAT-DSG',
            tagline: 'Custom Atelier Drapery',
            description: 'Custom client drape with specified fabrics',
            original_image_url: activeDesign.final_image_url,
            structure_maps: {},
            regions: [],
            metadata: {
              created_at: activeDesign.created_at,
              source: 'upload',
              tags: ['bespoke'],
              pinch_style: 'Pinch Pleat',
            },
          }}
          assignments={assignments}
          fabrics={fabrics}
          currentPreviewImage={activeDesign.final_image_url}
        />
      )}
    </div>
  );
}

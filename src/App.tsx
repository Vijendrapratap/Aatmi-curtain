// src/App.tsx
import React, { useState } from 'react';
import { useBrandStore } from './lib/brandStore';
import { useStudioStore } from './lib/store';
import { SignIn } from './pages/SignIn';
import { OnboardingWizard } from './components/brand/OnboardingWizard';
import { BrandHeader } from './components/brand/BrandHeader';
import { BrandDashboard } from './components/brand/BrandDashboard';
import { TemplatesGallery } from './components/brand/TemplatesGallery';
import { TemplateEditor } from './components/brand/TemplateEditor';
import { CatalogView } from './components/brand/CatalogView';
import { DesignDetailView } from './components/brand/DesignDetailView';
import { BrandSettingsView } from './components/brand/BrandSettingsView';
import { PlatformAdminView } from './components/brand/PlatformAdminView';
import { BulkUploadModal } from './components/brand/BulkUploadModal';
import { CameraCaptureModal } from './components/brand/CameraCaptureModal';
import { NewTemplateModal } from './components/NewTemplateModal';
import { SpecSheetModal } from './components/SpecSheetModal';
import { CurtainTemplate } from './types/curtain';

export default function App() {
  const {
    currentUser,
    setCurrentUser,
    activeView,
    setActiveView,
    addBrandTemplate,
    currentBrandId,
    brands,
    designs,
    activeDesignId,
  } = useBrandStore();

  const { assignments, fabrics } = useStudioStore();

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  // Global modals
  const [isNewTemplateModalOpen, setIsNewTemplateModalOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isCameraCaptureOpen, setIsCameraCaptureOpen] = useState(false);
  const [isSpecSheetOpen, setIsSpecSheetOpen] = useState(false);

  const currentBrand = brands.find((b) => b.id === currentBrandId) || brands[0];
  const activeDesign = designs.find((d) => d.id === activeDesignId) || designs[0];

  const handleSaveNewTemplate = (template: CurtainTemplate) => {
    addBrandTemplate({
      ...template,
      brand_id: currentBrandId,
      source: 'user_upload',
    });
    setIsNewTemplateModalOpen(false);
    setActiveView('editor');
  };

  // Pre-auth Onboarding View
  if (activeView === 'onboarding') {
    return (
      <OnboardingWizard
        onComplete={() => {
          setIsAuthenticated(true);
          setActiveView('dashboard');
        }}
        onCancel={() => {
          if (isAuthenticated) {
            setActiveView('dashboard');
          } else {
            setActiveView('dashboard');
            setIsAuthenticated(false);
          }
        }}
      />
    );
  }

  // Pre-auth Sign In View
  if (!isAuthenticated) {
    return (
      <SignIn
        onStartOnboarding={() => setActiveView('onboarding')}
        onSuccess={() => setIsAuthenticated(true)}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-base)] text-[var(--color-text-primary)] font-sans antialiased">
      {/* Top Header with Multi-Tenant Switcher, Navigation & Usage Meter */}
      <BrandHeader onSignOut={() => setIsAuthenticated(false)} />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col min-h-0">
        {activeView === 'dashboard' && (
          <BrandDashboard
            onOpenNewTemplate={() => setIsNewTemplateModalOpen(true)}
            onOpenBulkUpload={() => setIsBulkUploadOpen(true)}
          />
        )}

        {activeView === 'templates' && (
          <TemplatesGallery
            onOpenNewTemplateModal={() => setIsNewTemplateModalOpen(true)}
          />
        )}

        {activeView === 'editor' && (
          <TemplateEditor
            onOpenSpecModal={() => setIsSpecSheetOpen(true)}
          />
        )}

        {activeView === 'catalog' && <CatalogView />}

        {activeView === 'design_detail' && (
          <DesignDetailView
            onBackToEditor={() => setActiveView('editor')}
            onOpenSpecSheet={() => setIsSpecSheetOpen(true)}
          />
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

        {activeView === 'platform_admin' && <PlatformAdminView />}
      </main>

      {/* Global Modals */}
      <NewTemplateModal
        isOpen={isNewTemplateModalOpen}
        onClose={() => setIsNewTemplateModalOpen(false)}
        onSaveTemplate={handleSaveNewTemplate}
      />

      <BulkUploadModal
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
      />

      <CameraCaptureModal
        isOpen={isCameraCaptureOpen}
        onClose={() => setIsCameraCaptureOpen(false)}
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

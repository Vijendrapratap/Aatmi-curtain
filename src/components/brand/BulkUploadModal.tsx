// src/components/brand/BulkUploadModal.tsx
import React, { useState } from 'react';
import { useBrandStore } from '../../lib/brandStore';
import { Fabric } from '../../types/curtain';
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  X,
  Layers,
  FileCheck,
} from 'lucide-react';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UploadQueueItem {
  id: string;
  name: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  fabricResult?: Fabric;
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ isOpen, onClose }) => {
  const { currentBrandId, bulkAddBrandFabrics } = useBrandStore();

  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newItems: UploadQueueItem[] = Array.from(files).map((file, i) => ({
      id: 'bulk-' + Date.now() + '-' + i,
      name: file.name.replace(/\.[^/.]+$/, ''),
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'pending',
    }));

    setQueue((prev) => [...prev, ...newItems]);
  };

  const handleStartProcessing = async () => {
    if (queue.length === 0) return;
    setIsProcessing(true);

    const completedFabrics: Fabric[] = [];

    // Process parallel background jobs (Section 6.3)
    const promises = queue.map(async (item, idx) => {
      // Mark item as processing
      setQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: 'processing' } : q))
      );

      // Simulate perspective-correct, background removal, crop to texture
      await new Promise((r) => setTimeout(r, 400 + Math.random() * 600));

      // 95% pass rate simulation for real files
      const isFailed = idx === 1 && queue.length > 3; // simulated occasional blur failure for testing retry

      if (isFailed) {
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? { ...q, status: 'failed', errorMessage: 'Resolution below 400x400 or excessive blur' }
              : q
          )
        );
      } else {
        const fab: Fabric = {
          id: 'fab-bulk-' + Date.now() + '-' + idx,
          brand_id: currentBrandId,
          name: item.name,
          image_url: item.previewUrl,
          category: 'Velvet',
          tileable: true,
          tags: ['catalog', 'bulk_upload'],
          visibility: 'catalog',
          source: 'bulk_upload',
          metadata: {
            weave: 'Batch Ingested Drapery Weave',
            scale: 'fine',
            sheen: 'Subtle Luster',
            weight: 'Heavyweight Drapery',
            composition: 'Physical Swatch Scan',
          },
          color_hex: '#5B4FE0',
        };

        completedFabrics.push(fab);

        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id ? { ...q, status: 'completed', fabricResult: fab } : q
          )
        );
      }
    });

    await Promise.all(promises);

    if (completedFabrics.length > 0) {
      bulkAddBrandFabrics(completedFabrics);
    }

    setIsProcessing(false);
    setIsDone(true);
  };

  const handleRetryFailed = async () => {
    const failedItems = queue.filter((q) => q.status === 'failed');
    if (failedItems.length === 0) return;

    setIsProcessing(true);
    const recovered: Fabric[] = [];

    for (const item of failedItems) {
      await new Promise((r) => setTimeout(r, 400));
      const fab: Fabric = {
        id: 'fab-retry-' + Date.now(),
        brand_id: currentBrandId,
        name: item.name + ' (Enhanced)',
        image_url: item.previewUrl,
        category: 'Velvet',
        tileable: true,
        tags: ['catalog', 'bulk_upload', 'enhanced'],
        visibility: 'catalog',
        source: 'bulk_upload',
        metadata: {
          weave: 'Enhanced Ingested Weave',
          scale: 'fine',
          sheen: 'Subtle Luster',
          weight: 'Medium',
          composition: 'Physical Swatch Scan',
        },
        color_hex: '#5B4FE0',
      };
      recovered.push(fab);

      setQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: 'completed', fabricResult: fab } : q))
      );
    }

    if (recovered.length > 0) {
      bulkAddBrandFabrics(recovered);
    }
    setIsProcessing(false);
  };

  const completedCount = queue.filter((q) => q.status === 'completed').length;
  const failedCount = queue.filter((q) => q.status === 'failed').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="brand-card w-full max-w-2xl p-6 bg-white space-y-5 relative max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[var(--color-bg-sunken)] text-[var(--color-text-secondary)] transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="eyebrow-label text-[var(--color-accent)] font-semibold">
            ENTERPRISE CATALOG INGESTION
          </div>
          <h2 className="text-xl font-display font-semibold text-[var(--color-text-primary)]">
            Bulk Fabric Catalog Upload
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Ingest physical fabric catalogs of dozens or hundreds of swatches with parallel perspective correction.
          </p>
        </div>

        {/* Drop Zone */}
        {!isProcessing && !isDone && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              handleFilesSelected(e.dataTransfer.files);
            }}
            className={`w-full h-44 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition ${
              dragActive
                ? 'border-[var(--color-accent)] bg-[var(--color-accent-tint)]'
                : 'border-[var(--color-border-strong)] bg-[var(--color-bg-sunken)]'
            }`}
          >
            <Upload className="w-8 h-8 text-[var(--color-accent)] mb-2" />
            <div className="text-xs font-semibold text-[var(--color-text-primary)]">
              Drop a folder or multi-file selection of fabric swatches
            </div>
            <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
              Accepts JPG, PNG. Queued files undergo automatic background removal and crop to texture.
            </p>

            <input
              type="file"
              multiple
              accept="image/*"
              id="bulk-file-input"
              className="hidden"
              onChange={(e) => handleFilesSelected(e.target.files)}
            />

            <label
              htmlFor="bulk-file-input"
              className="mt-3 px-4 py-1.5 rounded-[var(--radius-button)] bg-white border border-[var(--color-border-strong)] hover:bg-[var(--color-bg-base)] text-xs font-medium cursor-pointer shadow-xs"
            >
              Select Swatch Files ({queue.length} selected)
            </label>
          </div>
        )}

        {/* Live Progress Screen: "Processing 143 of 200" (Section 6.3) */}
        {queue.length > 0 && (
          <div className="flex-1 min-h-0 flex flex-col space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[var(--color-text-primary)]">
                {isProcessing
                  ? `Processing ${completedCount} of ${queue.length} swatches (Parallel Workers)...`
                  : isDone
                  ? `Completed Ingestion: ${completedCount} Added to Catalog`
                  : `Queued Swatches (${queue.length})`}
              </span>
              <span className="font-mono text-[11px] text-[var(--color-text-secondary)]">
                {Math.round((completedCount / queue.length) * 100 || 0)}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-[var(--color-bg-sunken)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-300"
                style={{ width: `${(completedCount / queue.length) * 100}%` }}
              />
            </div>

            {/* Live Updating Grid of Completed / Processing Thumbnails */}
            <div className="flex-1 overflow-y-auto max-h-60 p-2 rounded-xl bg-[var(--color-bg-sunken)] grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {queue.map((item) => (
                <div
                  key={item.id}
                  className={`aspect-square rounded-xl overflow-hidden relative border ${
                    item.status === 'completed'
                      ? 'border-emerald-400'
                      : item.status === 'failed'
                      ? 'border-red-400'
                      : item.status === 'processing'
                      ? 'border-[var(--color-accent)] animate-pulse'
                      : 'border-[var(--color-border-subtle)]'
                  }`}
                >
                  <img
                    src={item.previewUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  {item.status === 'completed' && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3" />
                    </div>
                  )}
                  {item.status === 'failed' && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center">
                      <AlertCircle className="w-3 h-3" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Summary & Failed Retry (Section 6.3) */}
            {failedCount > 0 && isDone && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    {failedCount} swatch{failedCount > 1 ? 'es' : ''} had low resolution or glare.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRetryFailed}
                  className="px-3 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Retry Failed</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer actions */}
        <div className="pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-[var(--radius-button)] text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer"
          >
            {isDone ? 'Close' : 'Cancel'}
          </button>

          {!isDone ? (
            <button
              type="button"
              disabled={queue.length === 0 || isProcessing}
              onClick={handleStartProcessing}
              className="px-5 py-2.5 rounded-[var(--radius-button)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer tactile-press disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isProcessing ? 'Processing Batch...' : `Process ${queue.length} Swatches`}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-[var(--radius-button)] bg-[var(--color-accent)] text-white text-xs font-semibold cursor-pointer tactile-press shadow-xs"
            >
              View In Catalog
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

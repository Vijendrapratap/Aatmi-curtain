import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Region } from '../types/curtain';
import { Paintbrush, Eraser, RotateCcw, Sliders, Layers } from 'lucide-react';

interface FreehandMaskCanvasProps {
  backgroundImageUrl: string;
  regions: Region[];
  activeRegionId: string | null;
  onUpdateRegionMask: (regionId: string, maskDataUrl: string) => void;
  onClearRegionMask: (regionId: string) => void;
}

export const FreehandMaskCanvas: React.FC<FreehandMaskCanvasProps> = ({
  backgroundImageUrl,
  regions,
  activeRegionId,
  onUpdateRegionMask,
  onClearRegionMask,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const compositeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [brushSize, setBrushSize] = useState<number>(24);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);

  const activeRegion = regions.find((r) => r.id === activeRegionId) || regions[0];

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 1000;

  // Redraw inactive regions onto composite layer
  useEffect(() => {
    const compCanvas = compositeCanvasRef.current;
    if (!compCanvas) return;
    const ctx = compCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw existing masks of other regions as faint colored outlines
    regions.forEach((reg) => {
      if (reg.id === activeRegionId) return;

      if (reg.mask_url) {
        const img = new Image();
        img.onload = () => {
          ctx.save();
          // Tint with region accent color
          ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          ctx.restore();
        };
        img.src = reg.mask_url;
      } else if (reg.polygon_coords && reg.polygon_coords.length > 2) {
        ctx.save();
        ctx.beginPath();
        reg.polygon_coords.forEach((pt, idx) => {
          const x = (pt.x / 100) * CANVAS_WIDTH;
          const y = (pt.y / 100) * CANVAS_HEIGHT;
          if (idx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fillStyle = `${reg.accent_color || '#D4AF37'}30`;
        ctx.strokeStyle = reg.accent_color || '#D4AF37';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    });
  }, [regions, activeRegionId]);

  // Load active region mask onto active canvas
  useEffect(() => {
    const canvas = activeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (activeRegion?.mask_url) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      };
      img.src = activeRegion.mask_url;
    } else if (activeRegion?.polygon_coords && activeRegion.polygon_coords.length > 2) {
      // Seed the canvas with initial polygon mask if no raster mask exists yet
      ctx.save();
      ctx.beginPath();
      activeRegion.polygon_coords.forEach((pt, idx) => {
        const x = (pt.x / 100) * CANVAS_WIDTH;
        const y = (pt.y / 100) * CANVAS_HEIGHT;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fillStyle = activeRegion.accent_color || '#D97706';
      ctx.fill();
      ctx.restore();
    }
  }, [activeRegionId]);

  // Coordinates helper
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = activeCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDrawing(true);
    const pt = getCanvasCoords(e);
    setLastPoint(pt);

    const canvas = activeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = activeRegion?.accent_color || '#D97706';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPoint) return;
    const pt = getCanvasCoords(e);

    const canvas = activeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = activeRegion?.accent_color || '#D97706';
    }

    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
    ctx.restore();

    setLastPoint(pt);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setLastPoint(null);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}

    // Export binary mask
    exportMask();
  };

  const exportMask = useCallback(() => {
    const canvas = activeCanvasRef.current;
    if (!canvas || !activeRegion) return;

    // Create binary mask canvas (white on black/transparent)
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = CANVAS_WIDTH;
    exportCanvas.height = CANVAS_HEIGHT;
    const expCtx = exportCanvas.getContext('2d');
    if (!expCtx) return;

    // Fill black
    expCtx.fillStyle = '#000000';
    expCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw active mask as pure white
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = CANVAS_WIDTH;
    tempCanvas.height = CANVAS_HEIGHT;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.drawImage(canvas, 0, 0);
      tempCtx.globalCompositeOperation = 'source-in';
      tempCtx.fillStyle = '#FFFFFF';
      tempCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      expCtx.drawImage(tempCanvas, 0, 0);
    }

    const maskDataUrl = exportCanvas.toDataURL('image/png');
    onUpdateRegionMask(activeRegion.id, maskDataUrl);
  }, [activeRegion, onUpdateRegionMask]);

  const handleClearZone = () => {
    const canvas = activeCanvasRef.current;
    if (!canvas || !activeRegion) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
    onClearRegionMask(activeRegion.id);
  };

  return (
    <div className="flex flex-col gap-2.5">
      {/* Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-stone-100 border border-stone-200 rounded-xl text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setTool('brush')}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition cursor-pointer ${
              tool === 'brush'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-300'
            }`}
          >
            <Paintbrush className="w-3.5 h-3.5" />
            <span>Brush</span>
          </button>

          <button
            type="button"
            onClick={() => setTool('eraser')}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition cursor-pointer ${
              tool === 'eraser'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-300'
            }`}
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Eraser</span>
          </button>

          <button
            type="button"
            onClick={handleClearZone}
            className="px-2.5 py-1.5 rounded-lg font-medium bg-white text-stone-600 hover:text-red-700 hover:bg-stone-50 border border-stone-300 flex items-center gap-1 transition cursor-pointer"
            title="Clear this region mask"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>

        {/* Brush Size Slider */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-stone-600">Size:</span>
          <input
            type="range"
            min="6"
            max="70"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-24 accent-amber-700 cursor-pointer"
          />
          <span className="text-[10px] font-mono text-stone-500 w-6 text-right">
            {brushSize}px
          </span>
        </div>

        {/* Active Zone Badge */}
        {activeRegion && (
          <div className="flex items-center gap-1.5 bg-white border border-stone-200 px-2.5 py-1 rounded-lg">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: activeRegion.accent_color || '#D97706' }}
            />
            <span className="text-[11px] font-semibold text-stone-800 truncate max-w-[130px]">
              {activeRegion.display_name}
            </span>
          </div>
        )}
      </div>

      {/* Drawing Viewport */}
      <div
        ref={containerRef}
        className="relative aspect-[4/5] bg-stone-950 rounded-xl overflow-hidden border border-stone-300 select-none touch-none shadow-inner"
      >
        {/* Layer 1: Background Photograph */}
        <img
          src={backgroundImageUrl}
          alt="Curtain Drapery Plate"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Layer 2: Other Regions Composite Overlay */}
        <canvas
          ref={compositeCanvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
        />

        {/* Layer 3: Active Painting Layer */}
        <canvas
          ref={activeCanvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`absolute inset-0 w-full h-full opacity-60 ${
            tool === 'eraser' ? 'cursor-cell' : 'cursor-crosshair'
          }`}
        />

        {/* Helper Instructions Badge */}
        <div className="absolute bottom-2.5 left-2.5 bg-stone-900/85 backdrop-blur-xs text-white text-[10px] px-2.5 py-1 rounded-md border border-stone-700 pointer-events-none flex items-center gap-1.5">
          <Layers className="w-3 h-3 text-amber-400" />
          <span>Paint over folds and contours to sculpt organic drape zone</span>
        </div>
      </div>
    </div>
  );
};

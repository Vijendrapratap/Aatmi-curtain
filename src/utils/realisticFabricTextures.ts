/**
 * Realistic High-Resolution Fabric Texture & Macro Weave Generator
 * Solves: "rendered image dont give original idea about the fabric"
 * Generates true-to-life macro photographic fabric textures with authentic
 * yarn loops, twill diagonals, metallic reflections, and woven structures.
 */

import { Fabric } from '../types/curtain';

export function generateMacroFabricTexture(fabricId: string, size = 256): string {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  switch (fabricId) {
    case 'fab-classic-houndstooth':
      renderHoundstoothMacro(ctx, size);
      break;
    case 'fab-chevron-jacquard':
      renderChevronJacquardMacro(ctx, size);
      break;
    case 'fab-metallic-gold-satin':
      renderMetallicGoldSatinMacro(ctx, size);
      break;
    case 'fab-greek-key-trim':
      renderGreekKeyTrimMacro(ctx, size);
      break;
    case 'fab-persian-tapestry':
      renderPersianTapestryMacro(ctx, size);
      break;
    case 'fab-terracotta-rust-velvet':
      renderTerracottaVelvetMacro(ctx, size);
      break;
    case 'fab-royal-midnight-velvet':
      renderMidnightVelvetMacro(ctx, size);
      break;
    case 'fab-camel-cashmere':
      renderCamelCashmereMacro(ctx, size);
      break;
    case 'fab-cream-boucle':
      renderCreamBoucleMacro(ctx, size);
      break;
    case 'fab-mustard-ochre-velvet':
      renderMustardVelvetMacro(ctx, size);
      break;
    default:
      renderGenericWeaveMacro(ctx, size, '#C5BCAC');
  }

  return canvas.toDataURL('image/png');
}

// 1. Classic Black & White Houndstooth Macro
function renderHoundstoothMacro(ctx: CanvasRenderingContext2D, size: number) {
  // Off-white wool base
  ctx.fillStyle = '#F7F6F2';
  ctx.fillRect(0, 0, size, size);

  const unit = size / 4; // 4x4 houndstooth grid
  ctx.fillStyle = '#141619';

  for (let y = 0; y < size; y += unit) {
    for (let x = 0; x < size; x += unit) {
      const half = unit / 2;
      ctx.fillRect(x, y, half, half);

      ctx.beginPath();
      ctx.moveTo(x + half, y + half);
      ctx.lineTo(x + unit, y + half);
      ctx.lineTo(x + unit, y + unit);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x + half, y);
      ctx.lineTo(x + unit, y + half);
      ctx.lineTo(x + half, y + half);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Authentic diagonal twill weave micro-threads overlay
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1.2;
  for (let d = -size; d < size * 2; d += 4) {
    ctx.beginPath();
    ctx.moveTo(d, 0);
    ctx.lineTo(d + size, size);
    ctx.stroke();
  }
  ctx.restore();
}

// 2. Chevron Jacquard Gold & Black Zigzag Macro
function renderChevronJacquardMacro(ctx: CanvasRenderingContext2D, size: number) {
  ctx.fillStyle = '#181A1D';
  ctx.fillRect(0, 0, size, size);

  // Chevron zigzags in champagne gold
  const rowH = size / 5;
  const colW = size / 4;

  ctx.strokeStyle = '#D4B982';
  ctx.lineWidth = 5;

  for (let y = -rowH; y < size + rowH; y += rowH * 0.45) {
    ctx.beginPath();
    for (let x = 0; x < size + colW; x += colW) {
      ctx.moveTo(x, y);
      ctx.lineTo(x + colW * 0.5, y + rowH * 0.45);
      ctx.lineTo(x + colW, y);
    }
    ctx.stroke();
  }

  // Gold metallic sheen
  const sheen = ctx.createLinearGradient(0, 0, size, size);
  sheen.addColorStop(0, 'rgba(255, 225, 150, 0.15)');
  sheen.addColorStop(0.5, 'rgba(0, 0, 0, 0.1)');
  sheen.addColorStop(1, 'rgba(255, 225, 150, 0.15)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, size, size);
}

// 3. Metallic Gold / Brass Satin Ribbon Macro
function renderMetallicGoldSatinMacro(ctx: CanvasRenderingContext2D, size: number) {
  const grad = ctx.createLinearGradient(0, 0, size, size * 0.3);
  grad.addColorStop(0, '#B89748');
  grad.addColorStop(0.2, '#F0DB99');
  grad.addColorStop(0.4, '#C9A757');
  grad.addColorStop(0.7, '#FFE8AA');
  grad.addColorStop(0.9, '#A68233');
  grad.addColorStop(1, '#826526');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Horizontal silky striations
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 1;
  for (let y = 0; y < size; y += 3) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }
}

// 4. Greek Key Embroidered Trim Macro
function renderGreekKeyTrimMacro(ctx: CanvasRenderingContext2D, size: number) {
  // Charcoal silk background
  ctx.fillStyle = '#22252A';
  ctx.fillRect(0, 0, size, size);

  // Gold borders
  ctx.fillStyle = '#D6B778';
  ctx.fillRect(0, 8, size, 6);
  ctx.fillRect(0, size - 14, size, 6);

  // Greek key fretwork embroidery
  ctx.strokeStyle = '#E8D4A2';
  ctx.lineWidth = 5;
  const unit = size / 3;

  for (let x = 0; x < size; x += unit) {
    const y = 30;
    const h = size - 60;
    ctx.beginPath();
    ctx.moveTo(x + 6, y + h);
    ctx.lineTo(x + 6, y);
    ctx.lineTo(x + unit - 6, y);
    ctx.lineTo(x + unit - 6, y + h);
    ctx.lineTo(x + unit * 0.35, y + h);
    ctx.lineTo(x + unit * 0.35, y + h * 0.4);
    ctx.lineTo(x + unit * 0.7, y + h * 0.4);
    ctx.lineTo(x + unit * 0.7, y + h * 0.7);
    ctx.stroke();
  }
}

// 5. Persian Tapestry Floral Macro
function renderPersianTapestryMacro(ctx: CanvasRenderingContext2D, size: number) {
  // Off-white linen ground
  ctx.fillStyle = '#F4ECE0';
  ctx.fillRect(0, 0, size, size);

  // Botanical embroidery
  const cx = size / 2;
  const cy = size / 2;

  // Golden vase
  ctx.fillStyle = '#D4A038';
  ctx.beginPath();
  ctx.arc(cx, cy + 45, 30, 0, Math.PI);
  ctx.fill();

  // Terracotta floral medallion
  ctx.fillStyle = '#B84E32';
  ctx.beginPath();
  ctx.arc(cx, cy - 25, 36, 0, Math.PI * 2);
  ctx.fill();

  // Indigo center
  ctx.fillStyle = '#223854';
  ctx.beginPath();
  ctx.arc(cx, cy - 25, 16, 0, Math.PI * 2);
  ctx.fill();

  // Olive leaves
  ctx.fillStyle = '#5A754E';
  ctx.beginPath();
  ctx.ellipse(cx - 45, cy - 10, 24, 12, Math.PI / 4, 0, Math.PI * 2);
  ctx.ellipse(cx + 45, cy - 10, 24, 12, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();
}

// 6. Terracotta Rust Velvet Macro
function renderTerracottaVelvetMacro(ctx: CanvasRenderingContext2D, size: number) {
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#B34A19');
  grad.addColorStop(0.5, '#C85C24');
  grad.addColorStop(1, '#8A320A');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Velvet pile micro-sheen
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  for (let i = 0; i < 600; i++) {
    const rx = Math.random() * size;
    const ry = Math.random() * size;
    ctx.fillRect(rx, ry, 2, 2);
  }
}

// 7. Midnight Navy Velvet Macro
function renderMidnightVelvetMacro(ctx: CanvasRenderingContext2D, size: number) {
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#0E1724');
  grad.addColorStop(0.5, '#1B2B44');
  grad.addColorStop(1, '#0A111C');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.09)';
  for (let i = 0; i < 600; i++) {
    const rx = Math.random() * size;
    const ry = Math.random() * size;
    ctx.fillRect(rx, ry, 2, 2);
  }
}

// 8. Camel Tan Cashmere Macro
function renderCamelCashmereMacro(ctx: CanvasRenderingContext2D, size: number) {
  ctx.fillStyle = '#CBB28A';
  ctx.fillRect(0, 0, size, size);

  // Cashmere fine twill lines
  ctx.strokeStyle = '#B39970';
  ctx.lineWidth = 1.2;
  for (let d = -size; d < size * 2; d += 5) {
    ctx.beginPath();
    ctx.moveTo(d, 0);
    ctx.lineTo(d + size, size);
    ctx.stroke();
  }
}

// 9. Cream Bouclé Macro
function renderCreamBoucleMacro(ctx: CanvasRenderingContext2D, size: number) {
  ctx.fillStyle = '#F5F2EB';
  ctx.fillRect(0, 0, size, size);

  // Looped bouclé curls
  ctx.strokeStyle = '#D8D1C2';
  ctx.lineWidth = 2.2;
  for (let i = 0; i < 180; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 3 + Math.random() * 5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 1.6);
    ctx.stroke();
  }
}

// 10. Mustard Ochre Velvet Macro
function renderMustardVelvetMacro(ctx: CanvasRenderingContext2D, size: number) {
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#9E781C');
  grad.addColorStop(0.5, '#BD942E');
  grad.addColorStop(1, '#785A10');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = 'rgba(255, 240, 180, 0.12)';
  for (let i = 0; i < 500; i++) {
    const rx = Math.random() * size;
    const ry = Math.random() * size;
    ctx.fillRect(rx, ry, 2, 2);
  }
}

function renderGenericWeaveMacro(ctx: CanvasRenderingContext2D, size: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  ctx.lineWidth = 1;
  for (let i = 0; i < size; i += 6) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }
}

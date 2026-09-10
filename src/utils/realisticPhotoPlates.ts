/**
 * High-Resolution Photographic Base Plates & Realistic Drape Generators
 * Provides authentic, photo-realistic base plates for the 6 real curtain archetypes:
 * 1. Chevron & Ribbon Accent Band Drape (Screenshot 1)
 * 2. Modern Color-Block Trio Drape (Screenshot 2)
 * 3. Haute Couture Velvet & Houndstooth (Screenshot 3)
 * 4. Ivory Velvet Greek Key Frame Border (Screenshot 4)
 * 5. Camel & Midnight Two-Tone Pinch Pleat (Screenshot 5)
 * 6. High-Ceiling Linen with Persian Tapestry Edge (Screenshot 6)
 */

export interface RealPhotoPlate {
  id: string;
  name: string;
  dataUrl: string;
}

/**
 * Creates an authentic photographic base plate on an offscreen canvas.
 * Includes natural room window daylight, floor reflections, deep drapery pleats,
 * and realistic photographic ambient lighting.
 */
export function generateRealisticPlate(plateId: string, width = 800, height = 1000): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  switch (plateId) {
    case 'plate-chevron-accent':
      renderChevronPlate(ctx, width, height);
      break;
    case 'plate-colorblock-trio':
      renderColorBlockTrioPlate(ctx, width, height);
      break;
    case 'plate-velvet-houndstooth':
      renderVelvetHoundstoothPlate(ctx, width, height);
      break;
    case 'plate-greek-key-frame':
      renderGreekKeyFramePlate(ctx, width, height);
      break;
    case 'plate-twotone-camel-black':
      renderTwoToneCamelBlackPlate(ctx, width, height);
      break;
    case 'plate-persian-tapestry':
      renderPersianTapestryPlate(ctx, width, height);
      break;
    default:
      renderDefaultCurtainPlate(ctx, width, height);
  }

  return canvas.toDataURL('image/jpeg', 0.92);
}

// 1. Chevron & Cream Accent Band Drape (Inspired by Screenshot 1)
function renderChevronPlate(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Dark studio backdrop
  const bgGrad = ctx.createLinearGradient(0, 0, w, h);
  bgGrad.addColorStop(0, '#23272D');
  bgGrad.addColorStop(0.6, '#1C1F24');
  bgGrad.addColorStop(1, '#15171B');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Left Drapery: Full Chevron Herringbone Zigzag Weave
  const leftW = w * 0.42;
  const leftX = w * 0.05;

  ctx.save();
  ctx.fillStyle = '#1A1D20';
  ctx.fillRect(leftX, 0, leftW, h);

  // Draw chevron rows on left drape
  ctx.strokeStyle = '#D1BA8D';
  ctx.lineWidth = 3.5;
  const chevronH = 32;
  const chevronW = 28;
  for (let y = -chevronH; y < h + chevronH; y += chevronH) {
    ctx.beginPath();
    for (let x = leftX; x < leftX + leftW + chevronW; x += chevronW * 2) {
      ctx.moveTo(x, y);
      ctx.lineTo(x + chevronW, y + chevronH);
      ctx.lineTo(x + chevronW * 2, y);
    }
    ctx.stroke();
  }

  // Deep vertical pleat shadows on left drape
  drawPhotographicPleats(ctx, leftX, 0, leftW, h, 6, 0.45);
  ctx.restore();

  // Right Drapery: Cream Bouclé with Mid-Height Chevron Band & Metallic Ribbon Trims
  const rightX = leftX + leftW + 6;
  const rightW = w * 0.48;

  // Upper & Lower Cream Bouclé Body
  ctx.save();
  const creamGrad = ctx.createLinearGradient(rightX, 0, rightX + rightW, 0);
  creamGrad.addColorStop(0, '#F5F2EB');
  creamGrad.addColorStop(0.5, '#FAF8F4');
  creamGrad.addColorStop(1, '#EAE5DB');
  ctx.fillStyle = creamGrad;
  ctx.fillRect(rightX, 0, rightW, h);

  // Subtle bouclé texture
  drawBoucleNoise(ctx, rightX, 0, rightW, h, 0.12);

  // Mid-Height Horizontal Section (Y: 22% to 38%)
  const bandY = h * 0.22;
  const bandH = h * 0.16;
  const trimH = h * 0.032;

  // Upper Metallic Ribbon Trim
  const goldTrimGrad = ctx.createLinearGradient(rightX, 0, rightX + rightW, 0);
  goldTrimGrad.addColorStop(0, '#C2A36B');
  goldTrimGrad.addColorStop(0.3, '#E6D3A7');
  goldTrimGrad.addColorStop(0.7, '#C2A36B');
  goldTrimGrad.addColorStop(1, '#9C7F4A');
  ctx.fillStyle = goldTrimGrad;
  ctx.fillRect(rightX, bandY, rightW, trimH);

  // Ribbon fine texture
  ctx.strokeStyle = '#7D6435';
  ctx.lineWidth = 0.8;
  for (let y = bandY + 3; y < bandY + trimH; y += 3) {
    ctx.beginPath();
    ctx.moveTo(rightX, y);
    ctx.lineTo(rightX + rightW, y);
    ctx.stroke();
  }

  // Center Chevron Accent Band (Y: bandY + trimH to bandY + bandH - trimH)
  const chevBandY = bandY + trimH;
  const chevBandH = bandH - trimH * 2;
  ctx.fillStyle = '#1C1F24';
  ctx.fillRect(rightX, chevBandY, rightW, chevBandH);

  ctx.strokeStyle = '#D1BA8D';
  ctx.lineWidth = 3;
  for (let y = chevBandY - chevronH; y < chevBandY + chevBandH + chevronH; y += chevronH * 0.85) {
    ctx.beginPath();
    for (let x = rightX; x < rightX + rightW + chevronW; x += chevronW * 1.8) {
      ctx.moveTo(x, y);
      ctx.lineTo(x + chevronW * 0.9, y + chevronH * 0.85);
      ctx.lineTo(x + chevronW * 1.8, y);
    }
    ctx.stroke();
  }

  // Lower Metallic Ribbon Trim
  ctx.fillStyle = goldTrimGrad;
  ctx.fillRect(rightX, bandY + bandH - trimH, rightW, trimH);
  for (let y = bandY + bandH - trimH + 3; y < bandY + bandH; y += 3) {
    ctx.beginPath();
    ctx.moveTo(rightX, y);
    ctx.lineTo(rightX + rightW, y);
    ctx.stroke();
  }

  // Deep vertical cylindrical pleat shadows across entire right drape
  drawPhotographicPleats(ctx, rightX, 0, rightW, h, 7, 0.42);
  ctx.restore();
}

// 2. Modern Color-Block Trio Drape (Inspired by Screenshot 2)
function renderColorBlockTrioPlate(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Soft interior wall
  const wallGrad = ctx.createLinearGradient(0, 0, w, 0);
  wallGrad.addColorStop(0, '#EAE6E1');
  wallGrad.addColorStop(0.5, '#F5F3F0');
  wallGrad.addColorStop(1, '#E6E1DC');
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, 0, w, h);

  // Architectural Window in background (center)
  const winX = w * 0.36;
  const winW = w * 0.28;
  const winY = h * 0.08;
  const winH = h * 0.84;

  // Window Daylight
  const winGrad = ctx.createLinearGradient(winX, winY, winX, winY + winH);
  winGrad.addColorStop(0, '#FFFFFF');
  winGrad.addColorStop(1, '#EBF2F7');
  ctx.fillStyle = winGrad;
  ctx.fillRect(winX, winY, winW, winH);

  // Window Panes / Mullions
  ctx.strokeStyle = '#D2CBC3';
  ctx.lineWidth = 4;
  ctx.strokeRect(winX, winY, winW, winH);
  // Horizontal mullions
  for (let i = 1; i <= 3; i++) {
    const my = winY + (winH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(winX, my);
    ctx.lineTo(winX + winW, my);
    ctx.stroke();
  }
  // Vertical mullion
  ctx.beginPath();
  ctx.moveTo(winX + winW / 2, winY);
  ctx.lineTo(winX + winW / 2, winY + winH);
  ctx.stroke();

  // Top Cornice / Valance Box
  ctx.fillStyle = '#F2EFEA';
  ctx.shadowColor = 'rgba(0,0,0,0.15)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 4;
  ctx.fillRect(w * 0.06, h * 0.03, w * 0.88, h * 0.055);
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Hardwood floor
  drawHardwoodFloor(ctx, w, h);

  // Left Curtain (Pinch Pleat)
  // Top 65%: Champagne Tan, Middle 10%: Terracotta, Bottom 25%: Midnight Navy
  const leftX = w * 0.08;
  const leftW = w * 0.32;
  const curtainTop = h * 0.085;
  const curtainH = h * 0.87;

  const split1Y = curtainTop + curtainH * 0.65;
  const split2Y = curtainTop + curtainH * 0.75;

  // Left - Top Block (Champagne)
  ctx.fillStyle = '#D9CEBF';
  ctx.fillRect(leftX, curtainTop, leftW, split1Y - curtainTop);

  // Left - Accent Stripe (Terracotta)
  ctx.fillStyle = '#C25D23';
  ctx.fillRect(leftX, split1Y, leftW, split2Y - split1Y);

  // Left - Bottom Block (Midnight Navy)
  ctx.fillStyle = '#1A2942';
  ctx.fillRect(leftX, split2Y, leftW, curtainTop + curtainH - split2Y);

  drawPhotographicPleats(ctx, leftX, curtainTop, leftW, curtainH, 10, 0.4);

  // Right Curtain (Inverted Color-Block)
  // Top 25%: Midnight Navy, Middle 10%: Terracotta, Bottom 65%: Champagne Tan
  const rightX = w * 0.60;
  const rightW = w * 0.32;
  const rSplit1Y = curtainTop + curtainH * 0.25;
  const rSplit2Y = curtainTop + curtainH * 0.35;

  // Right - Top Block (Midnight Navy)
  ctx.fillStyle = '#1A2942';
  ctx.fillRect(rightX, curtainTop, rightW, rSplit1Y - curtainTop);

  // Right - Accent Stripe (Terracotta)
  ctx.fillStyle = '#C25D23';
  ctx.fillRect(rightX, rSplit1Y, rightW, rSplit2Y - rSplit1Y);

  // Right - Bottom Block (Champagne Tan puddle)
  ctx.fillStyle = '#D9CEBF';
  ctx.fillRect(rightX, rSplit2Y, rightW, curtainTop + curtainH - rSplit2Y);

  // Puddling fabric on floor for right curtain
  ctx.fillStyle = '#D9CEBF';
  ctx.beginPath();
  ctx.ellipse(rightX + rightW * 0.5, curtainTop + curtainH + 8, rightW * 0.6, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  drawPhotographicPleats(ctx, rightX, curtainTop, rightW, curtainH, 10, 0.4);
}

// 3. Haute Couture Velvet & Houndstooth (Inspired by Screenshot 3)
function renderVelvetHoundstoothPlate(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Dark luxury interior paneled wall
  const wallGrad = ctx.createLinearGradient(0, 0, w, 0);
  wallGrad.addColorStop(0, '#1E2024');
  wallGrad.addColorStop(0.5, '#2A2D33');
  wallGrad.addColorStop(1, '#1A1C20');
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, 0, w, h);

  // Wall molding detail on the right
  ctx.strokeStyle = '#383C44';
  ctx.lineWidth = 2;
  ctx.strokeRect(w * 0.82, h * 0.05, w * 0.15, h * 0.85);

  // Polished dark wood floor
  const floorGrad = ctx.createLinearGradient(0, h * 0.93, 0, h);
  floorGrad.addColorStop(0, '#2B1E16');
  floorGrad.addColorStop(0.5, '#402C20');
  floorGrad.addColorStop(1, '#19120D');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, h * 0.93, w, h * 0.07);

  // Drape bounds: Single grand flowing drape
  const curX = w * 0.08;
  const curW = w * 0.72;
  const curTop = 0;
  const curH = h * 0.95;

  const splitY = curH * 0.50; // 50% Top Velvet
  const bandH = curH * 0.075; // 7.5% Metallic Gold Band
  const skirtH = curH - (splitY + bandH); // 42.5% Houndstooth Skirt

  // 1. Top Half: Deep Lustrous Charcoal Velvet
  const velvetGrad = ctx.createLinearGradient(curX, 0, curX + curW, 0);
  velvetGrad.addColorStop(0, '#15171A');
  velvetGrad.addColorStop(0.5, '#26292E');
  velvetGrad.addColorStop(1, '#131518');
  ctx.fillStyle = velvetGrad;
  ctx.fillRect(curX, curTop, curW, splitY);

  // 2. Middle: Metallic Antique Brass / Gold Satin Ribbon
  const goldBandGrad = ctx.createLinearGradient(curX, 0, curX + curW, 0);
  goldBandGrad.addColorStop(0, '#B89748');
  goldBandGrad.addColorStop(0.25, '#E5CE85');
  goldBandGrad.addColorStop(0.5, '#C6A554');
  goldBandGrad.addColorStop(0.75, '#F5E4AA');
  goldBandGrad.addColorStop(1, '#9C7D33');
  ctx.fillStyle = goldBandGrad;
  ctx.fillRect(curX, splitY, curW, bandH);

  // 3. Lower Half: Black & White Houndstooth
  ctx.save();
  ctx.beginPath();
  ctx.rect(curX, splitY + bandH, curW, skirtH + 20);
  ctx.clip();
  drawHoundstoothPattern(ctx, curX, splitY + bandH, curW, skirtH + 20, 16);
  ctx.restore();

  // Fabric pooling on floor with organic fold hem
  ctx.save();
  ctx.fillStyle = '#1A1C20';
  ctx.beginPath();
  ctx.ellipse(curX + curW * 0.5, curTop + curH + 4, curW * 0.55, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Heavy Columnar Deep Drapery Pleats across the full drape
  drawPhotographicPleats(ctx, curX, curTop, curW, curH, 11, 0.48);
}

// 4. Ivory Velvet Greek Key Frame Border (Inspired by Screenshot 4)
function renderGreekKeyFramePlate(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Neutral wall
  ctx.fillStyle = '#D6CEC2';
  ctx.fillRect(0, 0, w, h);

  const curX = w * 0.05;
  const curW = w * 0.90;
  const curH = h * 0.96;

  // Center Field: Off-white cream velvet
  ctx.fillStyle = '#F2ECE1';
  ctx.fillRect(curX, 0, curW, curH);

  // Border Dimensions (L-shape frame running along bottom and right leading edge)
  const outerGoldW = curW * 0.14; // outer ochre velvet border
  const greekKeyW = curW * 0.085; // inner Greek key embroidered band

  // Outer Mustard Gold / Ochre Velvet (Right edge and Bottom Hem)
  ctx.fillStyle = '#A88428';
  // Bottom outer hem
  ctx.fillRect(curX, curH - outerGoldW, curW, outerGoldW);
  // Right outer edge
  ctx.fillRect(curX + curW - outerGoldW, 0, outerGoldW, curH);

  // Embroidered Greek Key Ribbon Band
  const gkBottomY = curH - outerGoldW - greekKeyW;
  const gkRightX = curX + curW - outerGoldW - greekKeyW;

  ctx.fillStyle = '#DDD2BF';
  // Bottom horizontal band
  ctx.fillRect(curX, gkBottomY, curW - outerGoldW, greekKeyW);
  // Right vertical band
  ctx.fillRect(gkRightX, 0, greekKeyW, curH - outerGoldW);

  // Draw Greek Key geometric fretwork lines
  ctx.strokeStyle = '#635339';
  ctx.lineWidth = 2.2;
  // Horizontal Greek Key pattern
  const step = greekKeyW * 0.8;
  for (let x = curX + 10; x < curX + curW - outerGoldW - greekKeyW; x += step) {
    drawGreekKeyUnit(ctx, x, gkBottomY + 4, step - 8, greekKeyW - 8);
  }
  // Vertical Greek Key pattern
  for (let y = 10; y < curH - outerGoldW - greekKeyW; y += step) {
    drawGreekKeyUnit(ctx, gkRightX + 4, y, greekKeyW - 8, step - 8);
  }

  // Soft vertical ripple folds across the entire drape
  drawPhotographicPleats(ctx, curX, 0, curW, curH, 9, 0.38);
}

// 5. Camel & Midnight Two-Tone Pinch Pleat (Inspired by Screenshot 5)
function renderTwoToneCamelBlackPlate(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Wall & Window setting
  ctx.fillStyle = '#DED7CE';
  ctx.fillRect(0, 0, w, h);

  // Background window with sheer white voile curtain
  const winX = w * 0.30;
  const winW = w * 0.40;
  const winY = h * 0.06;
  const winH = h * 0.88;

  // Daylight through window
  ctx.fillStyle = '#F5FAFE';
  ctx.fillRect(winX, winY, winW, winH);

  // Sheer white vertical ripples
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.fillRect(winX, winY, winW, winH);
  for (let x = winX; x < winX + winW; x += 18) {
    ctx.fillStyle = 'rgba(230, 235, 240, 0.4)';
    ctx.fillRect(x, winY, 8, winH);
  }

  // Parquet wood floor
  drawHardwoodFloor(ctx, w, h);

  // Brass curtain rod & rings
  drawBrassRod(ctx, w, h);

  // Left Curtain: Gathered & Tied back with Tassel Cord
  const leftX = w * 0.06;
  const leftW = w * 0.38;
  const curTop = h * 0.045;
  const curH = h * 0.90;
  const headerH = curH * 0.25; // Top 25% Camel Tan Header

  // Upper Camel Tan Header
  ctx.fillStyle = '#CBB28A';
  ctx.fillRect(leftX, curTop, leftW, headerH);

  // Lower Midnight Charcoal Body
  ctx.fillStyle = '#1D2126';
  ctx.fillRect(leftX, curTop + headerH, leftW, curH - headerH);

  // Gathered taper for tied-back curtain
  drawPhotographicPleats(ctx, leftX, curTop, leftW, curH, 8, 0.45);

  // Golden braided rope tieback and tassel
  const tieY = curTop + curH * 0.58;
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(leftX + leftW * 0.5, tieY, leftW * 0.4, 0.2, Math.PI * 0.8);
  ctx.stroke();

  // Tassel
  ctx.fillStyle = '#C49B28';
  ctx.fillRect(leftX + 15, tieY + 20, 12, 35);

  // Right Curtain: Straight Hanging Two-Tone Drapery
  const rightX = w * 0.58;
  const rightW = w * 0.36;

  // Upper Camel Tan Header
  ctx.fillStyle = '#CBB28A';
  ctx.fillRect(rightX, curTop, rightW, headerH);

  // Lower Midnight Charcoal Body
  ctx.fillStyle = '#1D2126';
  ctx.fillRect(rightX, curTop + headerH, rightW, curH - headerH);

  drawPhotographicPleats(ctx, rightX, curTop, rightW, curH, 8, 0.42);
}

// 6. High-Ceiling Linen with Persian Tapestry Edge (Inspired by Screenshot 6)
function renderPersianTapestryPlate(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Tall grand window with outdoor greenery
  const winW = w * 0.32;
  const winX = w * 0.34;
  const winY = h * 0.06;
  const winH = h * 0.88;

  // Sky & Green Foliage through window
  const skyGrad = ctx.createLinearGradient(winX, winY, winX, winY + winH);
  skyGrad.addColorStop(0, '#E1EFF7');
  skyGrad.addColorStop(0.4, '#D3E6C7');
  skyGrad.addColorStop(1, '#5C7A48');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(winX, winY, winW, winH);

  // Black Steel Window Frames
  ctx.strokeStyle = '#22252A';
  ctx.lineWidth = 8;
  ctx.strokeRect(winX, winY, winW, winH);
  ctx.beginPath();
  ctx.moveTo(winX + winW / 2, winY);
  ctx.lineTo(winX + winW / 2, winY + winH);
  ctx.moveTo(winX, winY + winH * 0.35);
  ctx.lineTo(winX + winW, winY + winH * 0.35);
  ctx.stroke();

  // Warm wall molding surrounding windows
  ctx.fillStyle = '#E8E1D5';
  ctx.fillRect(0, 0, winX, h);
  ctx.fillRect(winX + winW, 0, w - (winX + winW), h);

  // Left Tall Drapery: Oatmeal Natural Linen with Persian Tapestry Vertical Stencil
  const leftX = w * 0.05;
  const leftW = w * 0.38;
  const curTop = h * 0.04;
  const curH = h * 0.94;
  const tapestryW = leftW * 0.26;

  // Main Oatmeal Linen Panel
  ctx.fillStyle = '#E5DEC9';
  ctx.fillRect(leftX, curTop, leftW, curH);

  // Linen slub texture
  drawBoucleNoise(ctx, leftX, curTop, leftW, curH, 0.08);

  // Leading Edge Persian Tapestry Ribbon on the right edge of left drape
  const tapX = leftX + leftW - tapestryW;
  drawPersianTapestryRibbon(ctx, tapX, curTop, tapestryW, curH);

  drawPhotographicPleats(ctx, leftX, curTop, leftW, curH, 7, 0.36);

  // Right Tall Drapery: Mirror symmetric
  const rightX = w * 0.57;
  const rightW = w * 0.38;
  const rTapX = rightX;

  ctx.fillStyle = '#E5DEC9';
  ctx.fillRect(rightX, curTop, rightW, curH);
  drawBoucleNoise(ctx, rightX, curTop, rightW, curH, 0.08);

  // Leading Edge Persian Tapestry Ribbon on left edge of right drape
  drawPersianTapestryRibbon(ctx, rTapX, curTop, tapestryW, curH);

  drawPhotographicPleats(ctx, rightX, curTop, rightW, curH, 7, 0.36);
}

// Fallback Standard Luxury Drapery Plate
function renderDefaultCurtainPlate(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#EAE5DB';
  ctx.fillRect(0, 0, w, h);
  drawHardwoodFloor(ctx, w, h);
  drawBrassRod(ctx, w, h);
  drawPhotographicPleats(ctx, w * 0.12, h * 0.05, w * 0.76, h * 0.9, 12, 0.4);
}

// Helper: Photorealistic Folds & Conical Drapery Pleats
export function drawPhotographicPleats(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  pleatCount: number,
  intensity = 0.42
) {
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';

  const pleatW = width / pleatCount;
  for (let i = 0; i < pleatCount; i++) {
    const px = x + i * pleatW;
    const grad = ctx.createLinearGradient(px, 0, px + pleatW, 0);

    const shadowA = (0.55 * intensity).toFixed(3);
    const midA = (0.22 * intensity).toFixed(3);
    const crestA = '0.02';

    grad.addColorStop(0, `rgba(18, 14, 10, ${shadowA})`);
    grad.addColorStop(0.2, `rgba(70, 60, 50, ${midA})`);
    grad.addColorStop(0.55, `rgba(255, 255, 255, ${crestA})`);
    grad.addColorStop(0.85, `rgba(80, 70, 60, ${midA})`);
    grad.addColorStop(1, `rgba(18, 14, 10, ${shadowA})`);

    ctx.fillStyle = grad;
    ctx.fillRect(px, y, pleatW, height);
  }

  // Sunlight highlight on pleat crests
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < pleatCount; i++) {
    const px = x + i * pleatW;
    const crestX = px + pleatW * 0.55;
    const crestW = pleatW * 0.28;

    const sheenGrad = ctx.createLinearGradient(crestX - crestW * 0.5, 0, crestX + crestW * 0.5, 0);
    sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    sheenGrad.addColorStop(0.5, `rgba(255, 250, 240, ${(0.35 * intensity).toFixed(3)})`);
    sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = sheenGrad;
    ctx.fillRect(crestX - crestW * 0.5, y, crestW, height);
  }

  ctx.restore();
}

// Helper: Classic Houndstooth Dogtooth Pattern Generator
export function drawHoundstoothPattern(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  unit = 16
) {
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x, y, w, h);

  ctx.fillStyle = '#181A1D';
  for (let py = y; py < y + h + unit; py += unit) {
    for (let px = x; px < x + w + unit; px += unit) {
      const half = unit / 2;
      // Top left square
      ctx.fillRect(px, py, half, half);
      // Bottom right triangle
      ctx.beginPath();
      ctx.moveTo(px + half, py + half);
      ctx.lineTo(px + unit, py + half);
      ctx.lineTo(px + unit, py + unit);
      ctx.closePath();
      ctx.fill();
      // Side tooth notch
      ctx.beginPath();
      ctx.moveTo(px + half, py);
      ctx.lineTo(px + unit, py + half);
      ctx.lineTo(px + half, py + half);
      ctx.closePath();
      ctx.fill();
    }
  }
}

// Helper: Persian Tapestry Embroidered Ribbon
function drawPersianTapestryRibbon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  // Cream linen base ribbon
  ctx.fillStyle = '#F4EDE2';
  ctx.fillRect(x, y, w, h);

  // Outer terracotta border lines
  ctx.strokeStyle = '#B34A2E';
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 2, y, w - 4, h);

  // Repeating Persian botanical motifs
  const motifH = w * 1.8;
  const motifCount = Math.ceil(h / motifH);

  for (let i = 0; i < motifCount; i++) {
    const my = y + i * motifH;
    const cx = x + w / 2;
    const cy = my + motifH / 2;

    // Golden vase base
    ctx.fillStyle = '#D49E35';
    ctx.beginPath();
    ctx.arc(cx, cy + motifH * 0.25, w * 0.2, 0, Math.PI);
    ctx.fill();

    // Terracotta palmette flower
    ctx.fillStyle = '#B34A2E';
    ctx.beginPath();
    ctx.arc(cx, cy - motifH * 0.15, w * 0.22, 0, Math.PI * 2);
    ctx.fill();

    // Sage green leaves
    ctx.fillStyle = '#5A7552';
    ctx.beginPath();
    ctx.ellipse(cx - w * 0.25, cy, w * 0.14, w * 0.08, Math.PI / 4, 0, Math.PI * 2);
    ctx.ellipse(cx + w * 0.25, cy, w * 0.14, w * 0.08, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    // Indigo blue center bud
    ctx.fillStyle = '#263D5C';
    ctx.beginPath();
    ctx.arc(cx, cy - motifH * 0.15, w * 0.09, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Helper: Greek Key Fretwork Unit
function drawGreekKeyUnit(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w * 0.35, y + h);
  ctx.lineTo(x + w * 0.35, y + h * 0.35);
  ctx.lineTo(x + w * 0.7, y + h * 0.35);
  ctx.lineTo(x + w * 0.7, y + h * 0.7);
  ctx.stroke();
}

// Helper: Hardwood floor
function drawHardwoodFloor(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const floorY = h * 0.94;
  const floorH = h * 0.06;
  const floorGrad = ctx.createLinearGradient(0, floorY, 0, h);
  floorGrad.addColorStop(0, '#B0A290');
  floorGrad.addColorStop(0.3, '#867664');
  floorGrad.addColorStop(1, '#4A3E31');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, floorY, w, floorH);

  // Baseboard trim
  ctx.strokeStyle = '#D9D3C5';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, floorY);
  ctx.lineTo(w, floorY);
  ctx.stroke();
}

// Helper: Brass hardware rod
function drawBrassRod(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const rodY = h * 0.038;
  const rodGrad = ctx.createLinearGradient(0, rodY - 6, 0, rodY + 6);
  rodGrad.addColorStop(0, '#C29B38');
  rodGrad.addColorStop(0.4, '#F4E3A1');
  rodGrad.addColorStop(0.8, '#9B7826');
  rodGrad.addColorStop(1, '#56410E');
  ctx.fillStyle = rodGrad;
  ctx.fillRect(w * 0.04, rodY - 5, w * 0.92, 10);

  // Finials
  ctx.beginPath();
  ctx.arc(w * 0.04, rodY, 12, 0, Math.PI * 2);
  ctx.arc(w * 0.96, rodY, 12, 0, Math.PI * 2);
  ctx.fill();
}

// Helper: Organic bouclé / slub noise
function drawBoucleNoise(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  opacity: number
) {
  ctx.save();
  ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
  // Draw subtle stippling loops
  for (let i = 0; i < 400; i++) {
    const rx = x + Math.random() * w;
    const ry = y + Math.random() * h;
    const rad = 0.6 + Math.random() * 1.4;
    ctx.beginPath();
    ctx.arc(rx, ry, rad, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

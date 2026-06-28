// Sizing constants in physical inches
export const MASTER_REF_WIDTH = 23.5;
export const MASTER_REF_HEIGHT = 28.0;
export const SLEEVE_REF_WIDTH = 11.75;
export const SLEEVE_HALF_REF_HEIGHT = 10.0;
export const SLEEVE_FULL_REF_HEIGHT = 28.0;

// Default SVG Templates
export const DEFAULT_SVGS = {
  front: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1140" width="800" height="1140">
        <defs>
            <linearGradient id="jerseyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#1e3a8a" />
                <stop offset="100%" stop-color="#1d4ed8" />
            </linearGradient>
            <linearGradient id="glowLines" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#facc15" stop-opacity="0.15" />
                <stop offset="50%" stop-color="#facc15" stop-opacity="0.0" />
                <stop offset="100%" stop-color="#facc15" stop-opacity="0.15" />
            </linearGradient>
        </defs>
        <rect width="800" height="1140" fill="url(#jerseyGrad)"/>
        <polygon points="0,0 250,0 120,1140 0,1140" fill="url(#glowLines)"/>
        <polygon points="550,0 800,0 800,1140 680,1140" fill="url(#glowLines)" />
        <path d="M 0,150 L 150,50 L 280,110 Q 400,160 520,110 L 650,50 L 800,150 L 730,420 Q 700,430 710,1140 L 90,1140 Q 100,430 70,420 Z" fill="none" stroke="#facc15" stroke-width="3" stroke-dasharray="6,4" />
        <path d="M 280,110 Q 400,160 520,110" fill="none" stroke="#facc15" stroke-width="4"/>
        <text x="400" y="570" fill="#facc15" font-size="28" font-family="sans-serif" font-weight="900" text-anchor="middle" opacity="0.3" letter-spacing="4">FRONT PALLA</text>
    </svg>
  `,
  back: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1140" width="800" height="1140">
        <defs>
            <linearGradient id="jerseyGradB" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#1e3a8a" />
                <stop offset="100%" stop-color="#1e40af" />
            </linearGradient>
            <linearGradient id="glowLinesB" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#eab308" stop-opacity="0.1" />
                <stop offset="100%" stop-color="#eab308" stop-opacity="0.0" />
            </linearGradient>
        </defs>
        <rect width="800" height="1140" fill="url(#jerseyGradB)"/>
        <path d="M 0,150 L 150,50 L 280,110 Q 400,160 520,110 L 650,50 L 800,150 L 730,420 Q 700,430 710,1140 L 90,1140 Q 100,430 70,420 Z" fill="none" stroke="#facc15" stroke-width="3" stroke-dasharray="6,4" />
        <text x="400" y="570" fill="#facc15" font-size="28" font-family="sans-serif" font-weight="900" text-anchor="middle" opacity="0.3" letter-spacing="4">BACK PALLA</text>
    </svg>
  `,
  halfSleeve: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 235 100" width="235" height="100">
        <rect width="235" height="100" fill="#1e3a8a"/>
        <path d="M 0,100 C 40,60 80,10 117.5,10 C 155,10 195,60 235,100 Z" fill="none" stroke="#facc15" stroke-width="1.5" stroke-dasharray="4,2"/>
        <text x="117.5" y="65" fill="#facc15" font-size="10" font-family="sans-serif" font-weight="bold" text-anchor="middle" opacity="0.25">HALF SLEEVE PANEL</text>
    </svg>
  `,
  fullSleeve: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 235 280" width="235" height="280">
        <rect width="235" height="280" fill="#1e3a8a"/>
        <path d="M 30,280 L 0,100 C 40,50 80,10 117.5,10 C 155,10 195,50 235,100 L 205,280 Z" fill="none" stroke="#facc15" stroke-width="2" stroke-dasharray="6,3" />
        <text x="117.5" y="150" fill="#facc15" font-size="12" font-family="sans-serif" font-weight="bold" text-anchor="middle" opacity="0.25">FULL SLEEVE PANEL</text>
    </svg>
  `
};

// Core Drawing Function to render any side of the jersey
export function drawJerseySide(ctx, canvas, side, state, playerIndex = 0, isGuidesEnabled = true, assetsCache = {}) {
  if (!ctx || !canvas) return;

  const dpi = state.dpi || 100;
  const isSleeve = side === 'leftSleeve' || side === 'rightSleeve';
  const sleeveType = state.activeSleeveType || 'HALF';
  
  // Calculate reference sizes in inches
  let refW = MASTER_REF_WIDTH;
  let refH = MASTER_REF_HEIGHT;
  if (isSleeve) {
    refW = SLEEVE_REF_WIDTH;
    refH = sleeveType === 'HALF' ? SLEEVE_HALF_REF_HEIGHT : SLEEVE_FULL_REF_HEIGHT;
  }

  // Sizing scale depending on graded size configuration
  let scaleX = 1.0;
  let scaleY = 1.0;
  const sizeMap = {
    '7XS': 0.72, '4XS': 0.82, 'S': 0.95, 'M': 1.0, 'L': 1.05, 'XXL': 1.15, '5XL': 1.30
  };
  const sizeScale = sizeMap[state.previewSize] || 1.0;
  scaleX *= sizeScale;
  scaleY *= sizeScale;

  const widthPx = refW * scaleX * dpi;
  const heightPx = refH * scaleY * dpi;

  // Set physical sizes of canvas context
  canvas.width = widthPx;
  canvas.height = heightPx;

  // Clear workspace
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, widthPx, heightPx);

  // 1. Draw Template Background
  let bgImg = null;
  if (side === 'front') bgImg = assetsCache.frontJersey || state.uploadedFrontJersey;
  else if (side === 'back') bgImg = assetsCache.backJersey || state.uploadedBackJersey;
  else if (side === 'leftSleeve') bgImg = sleeveType === 'HALF' ? (assetsCache.halfSleeve || state.uploadedHalfSleeve) : (assetsCache.fullSleeve || state.uploadedFullSleeve);
  else if (side === 'rightSleeve') bgImg = sleeveType === 'HALF' ? (assetsCache.halfSleeve || state.uploadedHalfSleeve) : (assetsCache.fullSleeve || state.uploadedFullSleeve);

  if (bgImg) {
    ctx.drawImage(bgImg, 0, 0, widthPx, heightPx);
  } else {
    // Render Fallback SVG Template
    const svgCode = DEFAULT_SVGS[isSleeve ? (sleeveType === 'HALF' ? 'halfSleeve' : 'fullSleeve') : side];
    const dataUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgCode);
    
    // Draw placeholder box for local synchronous renders
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(0, 0, widthPx, heightPx);
  }

  // 2. Render Custom Components
  const currentConfig = state[side];
  const activePlayer = state.players && state.players[playerIndex] ? state.players[playerIndex] : { name: "ROHIT", number: "45" };

  if (currentConfig) {
    Object.keys(currentConfig).forEach(elementKey => {
      const config = currentConfig[elementKey];
      if (!config.visible) return;

      // Draw custom uploaded PNG logo vs Scalable Typography Texts
      const isText = (elementKey === 'chestNumber' || elementKey === 'sponsor' || elementKey === 'name' || elementKey === 'number' || elementKey === 'teamName' || elementKey === 'text');
      
      if (isText) {
        let textVal = config.text || '';
        if (elementKey === 'name') textVal = activePlayer.name;
        if (elementKey === 'number' || elementKey === 'chestNumber') textVal = activePlayer.number;

        drawScalableText(ctx, textVal, config, scaleX, scaleY, dpi, refW, refH);
      } else {
        // Render graphics logo assets
        let imgObj = null;
        if (side === 'front') {
          if (elementKey === 'logo') imgObj = assetsCache.logo || state.uploadedLogoImage;
          if (elementKey === 'logoRight') imgObj = assetsCache.logoRight || state.uploadedRightLogoImage;
          if (elementKey === 'sponsorLogo') imgObj = assetsCache.sponsorLogo || state.uploadedFrontSponsorLogoImage;
        } else if (side === 'back') {
          if (elementKey === 'logo') imgObj = assetsCache.backLogo || state.uploadedBackLogoImage;
        } else if (isSleeve) {
          if (side === 'leftSleeve') imgObj = assetsCache.leftSleeveLogo || state.uploadedLeftSleeveLogoImage;
          if (side === 'rightSleeve') imgObj = assetsCache.rightSleeveLogo || state.uploadedRightSleeveLogoImage;
        }

        if (imgObj) {
          drawProportionalAsset(ctx, imgObj, config, scaleX, scaleY, dpi, refW, refH, side === 'rightSleeve' && state.mirrorSleeveLogoImage);
        } else {
          // Fallback box for placeholder layout alignment
          const x = config.xPosInches * scaleX * dpi;
          const y = config.yPosInches * scaleY * dpi;
          const w = config.targetWidthInches * scaleX * dpi;
          const h = config.maxHeightInches * scaleY * dpi;
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 2;
          ctx.strokeRect(x - w / 2, y - h / 2, w, h);
          ctx.fillStyle = 'rgba(246, 224, 94, 0.2)';
          ctx.fillRect(x - w / 2, y - h / 2, w, h);
        }
      }
    });
  }

  // 3. Draw Manufacturing Tags / Label (if enabled)
  if (state.comment && state.comment.visible && !isSleeve) {
    const comm = state.comment;
    const commentText = `${comm.text || 'BATCH'} | SIZE: ${state.previewSize}`;
    const tagY = (comm.yPosInches || 0.6) * scaleY * dpi;
    ctx.fillStyle = comm.fgColor || '#ffffff';
    ctx.strokeStyle = comm.outlineColor || '#000000';
    ctx.lineWidth = (comm.outlineThicknessInches || 0.04) * scaleX * dpi;
    ctx.font = `bold ${Math.round((comm.fontSizeInches || 0.2) * scaleX * dpi)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.strokeText(commentText, widthPx / 2, tagY);
    ctx.fillText(commentText, widthPx / 2, tagY);
  }

  // 4. Seam Safety Grid Overlays (Guidelines)
  if (isGuidesEnabled) {
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    
    // Physical print borders
    ctx.strokeRect(0, 0, widthPx, heightPx);
    
    // Dynamic Center alignment indicators
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
    ctx.beginPath();
    ctx.moveTo(widthPx / 2, 0);
    ctx.lineTo(widthPx / 2, heightPx);
    ctx.stroke();

    ctx.setLineDash([]);
  }
}

// Proportional drawing for logos
function drawProportionalAsset(ctx, img, config, scaleX, scaleY, dpi, refW, refH, mirrorHorizontal = false) {
  const x = config.xPosInches * scaleX * dpi;
  const y = config.yPosInches * scaleY * dpi;
  const targetW = config.targetWidthInches * scaleX * dpi;
  const targetH = config.maxHeightInches * scaleY * dpi;

  let imgW = img.width || 100;
  let imgH = img.height || 100;
  const ratio = Math.min(targetW / imgW, targetH / imgH);
  const drawW = imgW * ratio;
  const drawH = imgH * ratio;

  ctx.save();
  if (mirrorHorizontal) {
    ctx.translate(x, y);
    ctx.scale(-1, 1);
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
  } else {
    ctx.drawImage(img, x - drawW / 2, y - drawH / 2, drawW, drawH);
  }
  ctx.restore();
}

// Scalable, outline-supported, arced text drawing logic
function drawScalableText(ctx, text, config, scaleX, scaleY, dpi, refW, refH) {
  const x = config.xPosInches * scaleX * dpi;
  const y = config.yPosInches * scaleY * dpi;
  const targetW = config.targetWidthInches * scaleX * dpi;
  const targetH = config.maxHeightInches * scaleY * dpi;
  const letterSpacing = (config.letterSpacingInches || 0.15) * scaleX * dpi;
  const outlineWidth = (config.outlineThicknessInches || 0.12) * scaleX * dpi;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Build Font String
  const fontFamily = config.fontFamily || 'Teko';
  const fontWeight = config.fontWeight || 'bold';
  
  // Measure raw text width at a test size (100px)
  ctx.font = `${fontWeight} 100px "${fontFamily}", sans-serif`;
  const rawMeasure = ctx.measureText(text);
  const rawW = rawMeasure.width + (text.length - 1) * (letterSpacing * 100 / (scaleX * dpi));
  
  // Scale font size proportionally to fit target dimensions
  let fontSize = (targetW / rawW) * 100;
  if (fontSize > targetH) fontSize = targetH;
  
  ctx.font = `${fontWeight} ${Math.round(fontSize)}px "${fontFamily}", sans-serif`;
  ctx.fillStyle = config.fgColor || '#ffffff';
  ctx.strokeStyle = config.outlineColor || '#000000';
  ctx.lineWidth = outlineWidth;

  if (config.curvedEnabled && text.length > 0) {
    const curvature = config.arc || 25;
    const radius = (100 / curvature) * (targetW * 0.4);
    
    // Draw Curved / Arced Text
    const chars = text.split('');
    const charWidths = chars.map(c => ctx.measureText(c).width + letterSpacing);
    const totalTextWidth = charWidths.reduce((a, b) => a + b, 0);
    const totalAngle = totalTextWidth / radius;
    
    let currentAngle = -totalAngle / 2;
    ctx.translate(x, y + radius);

    chars.forEach((char, idx) => {
      const charW = charWidths[idx];
      const angleOffset = (charW / 2) / radius;
      currentAngle += angleOffset;

      ctx.save();
      ctx.rotate(currentAngle);
      ctx.translate(0, -radius);
      
      if (outlineWidth > 0) ctx.strokeText(char, 0, 0);
      ctx.fillText(char, 0, 0);
      ctx.restore();

      currentAngle += angleOffset;
    });
  } else {
    // Normal straight text drawing (letter-by-letter spacing supported)
    if (letterSpacing > 0) {
      const chars = text.split('');
      const charWidths = chars.map(c => ctx.measureText(c).width);
      const totalWidth = charWidths.reduce((a, b) => a + b, 0) + (chars.length - 1) * letterSpacing;
      let startX = x - totalWidth / 2;

      chars.forEach((char, idx) => {
        const charW = charWidths[idx];
        const cx = startX + charW / 2;
        if (outlineWidth > 0) ctx.strokeText(char, cx, y);
        ctx.fillText(char, cx, y);
        startX += charW + letterSpacing;
      });
    } else {
      if (outlineWidth > 0) ctx.strokeText(text, x, y);
      ctx.fillText(text, x, y);
    }
  }

  ctx.restore();
}

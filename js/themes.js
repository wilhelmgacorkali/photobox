/**
 * SNAPBOX Themes & Backgrounds
 * Curated Cute & Aesthetic frames with custom Canvas drawing patterns.
 */

const floralCurtainImage = new Image();
floralCurtainImage.onload = () => window.dispatchEvent(new Event('snapbox:backdrop-ready'));
floralCurtainImage.src = new URL('../assets/floral-curtain.png', import.meta.url).href;

const hogwartsImage = new Image();
hogwartsImage.onload = () => window.dispatchEvent(new Event('snapbox:backdrop-ready'));
hogwartsImage.src = new URL('../assets/hogwarts-castle.jpg', import.meta.url).href;

export const THEMES = {
  // === AESTHETIC CATEGORY ===
  'noir-minimal': {
    id: 'noir-minimal',
    name: 'Noir Minimal',
    category: 'aesthetic',
    previewBg: '#121214',
    textColor: '#ffffff',
    subtextColor: '#888890',
    borderColor: '#26262b',
    borderWidth: 2,
    drawBackground(ctx, w, h) {
      ctx.fillStyle = '#111215';
      ctx.fillRect(0, 0, w, h);

      // Fine grain / subtle noise lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Elegant inner border line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.strokeRect(16, 16, w - 32, h - 32);
    }
  },

  'cream-linen': {
    id: 'cream-linen',
    name: 'Cream Oatmeal',
    category: 'aesthetic',
    previewBg: '#f4ede4',
    textColor: '#292524',
    subtextColor: '#78716c',
    borderColor: '#e7ded4',
    borderWidth: 2,
    drawBackground(ctx, w, h) {
      // Warm organic paper cream
      ctx.fillStyle = '#f5efe6';
      ctx.fillRect(0, 0, w, h);

      // Fine paper grain texture
      ctx.fillStyle = 'rgba(120, 113, 108, 0.03)';
      for (let i = 0; i < 2000; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        ctx.fillRect(x, y, 1.5, 1.5);
      }

      ctx.strokeStyle = 'rgba(200, 185, 170, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(20, 20, w - 40, h - 40);
    }
  },

  'vintage-90s': {
    id: 'vintage-90s',
    name: 'Retro 90s Film',
    category: 'aesthetic',
    previewBg: '#2a241f',
    textColor: '#fef3c7',
    subtextColor: '#f59e0b',
    borderColor: '#453a2f',
    borderWidth: 2,
    drawBackground(ctx, w, h) {
      // Deep sepia brown
      ctx.fillStyle = '#261f1a';
      ctx.fillRect(0, 0, w, h);

      // 90s Film sprocket holes along side edge
      ctx.fillStyle = '#17120e';
      const holeW = 14;
      const holeH = 22;
      const holeGap = 34;
      for (let y = 20; y < h - 20; y += holeGap) {
        // Left side holes
        ctx.fillRect(10, y, holeW, holeH);
        // Right side holes
        ctx.fillRect(w - 10 - holeW, y, holeW, holeH);
      }

      // Vintage grain
      ctx.fillStyle = 'rgba(245, 158, 11, 0.025)';
      for (let i = 0; i < 1500; i++) {
        ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
      }
    }
  },

  'sunset-gradient': {
    id: 'sunset-gradient',
    name: 'Sunset Glow',
    category: 'aesthetic',
    previewBg: 'linear-gradient(135deg, #fbcfe8, #fed7aa)',
    textColor: '#4a044e',
    subtextColor: '#701a75',
    borderColor: '#ffffff',
    borderWidth: 3,
    drawBackground(ctx, w, h) {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#fbcfe8'); // soft rose
      grad.addColorStop(0.5, '#fed7aa'); // peach
      grad.addColorStop(1, '#ddd6fe'); // lavender
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Soft sun haze
      const radial = ctx.createRadialGradient(w * 0.7, h * 0.3, 20, w * 0.7, h * 0.3, w * 0.8);
      radial.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      radial.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, w, h);
    }
  },

  'y2k-chrome': {
    id: 'y2k-chrome',
    name: 'Liquid Chrome',
    category: 'aesthetic',
    previewBg: 'linear-gradient(135deg, #94a3b8, #e2e8f0)',
    textColor: '#0f172a',
    subtextColor: '#475569',
    borderColor: '#ffffff',
    borderWidth: 2,
    drawBackground(ctx, w, h) {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#cbd5e1');
      grad.addColorStop(0.35, '#f8fafc');
      grad.addColorStop(0.7, '#94a3b8');
      grad.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Y2K four-point stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      drawFourPointStar(ctx, w * 0.15, 45, 12);
      drawFourPointStar(ctx, w * 0.85, 40, 15);
      drawFourPointStar(ctx, w * 0.2, h - 80, 14);
      drawFourPointStar(ctx, w * 0.8, h - 90, 10);
    }
  },

  'matcha-sage': {
    id: 'matcha-sage',
    name: 'Matcha Sage',
    category: 'aesthetic',
    previewBg: '#d8e2dc',
    textColor: '#2d3b36',
    subtextColor: '#4f635b',
    borderColor: '#e8edea',
    borderWidth: 2,
    drawBackground(ctx, w, h) {
      ctx.fillStyle = '#dbe4de';
      ctx.fillRect(0, 0, w, h);

      // Soft botanical dots
      ctx.fillStyle = 'rgba(79, 99, 91, 0.1)';
      for (let x = 30; x < w; x += 40) {
        for (let y = 30; y < h; y += 40) {
          ctx.beginPath();
          ctx.arc(x, y, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  },

  // === LUCU / CUTE CATEGORY ===
  'coquette-bows': {
    id: 'coquette-bows',
    name: 'Coquette Bows 🎀',
    category: 'cute',
    previewBg: '#ffe4e6',
    textColor: '#be185d',
    subtextColor: '#db2777',
    borderColor: '#ffffff',
    borderWidth: 3,
    drawBackground(ctx, w, h) {
      // Soft baby pink
      ctx.fillStyle = '#fff1f2';
      ctx.fillRect(0, 0, w, h);

      // Subtle cute polka dots
      ctx.fillStyle = '#fecdd3';
      for (let x = 20; x < w; x += 36) {
        for (let y = 20; y < h; y += 36) {
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw cute corner bows / ribbon stamps
      ctx.font = '26px sans-serif';
      ctx.fillText('🎀', 20, 48);
      ctx.fillText('🎀', w - 50, 48);
      ctx.fillText('♡', w / 2 - 10, 48);
      ctx.fillText('🎀', 20, h - 50);
      ctx.fillText('🎀', w - 50, h - 50);
    }
  },

  'strawberry-milk': {
    id: 'strawberry-milk',
    name: 'Sweet Berry 🍓',
    category: 'cute',
    previewBg: '#fed7aa',
    textColor: '#9f1239',
    subtextColor: '#be123c',
    borderColor: '#ffffff',
    borderWidth: 3,
    drawBackground(ctx, w, h) {
      // Strawberry cream
      ctx.fillStyle = '#ffe8ec';
      ctx.fillRect(0, 0, w, h);

      // Gingham checkered header & footer bands
      const bandH = 50;
      drawGinghamBand(ctx, 0, 0, w, bandH, '#fda4af');
      drawGinghamBand(ctx, 0, h - bandH, w, bandH, '#fda4af');

      // Cute mini strawberries & flowers
      ctx.font = '24px sans-serif';
      ctx.fillText('🍓', 18, 36);
      ctx.fillText('🌸', w - 46, 36);
      ctx.fillText('🍓', w - 46, h - 16);
      ctx.fillText('🌸', 18, h - 16);
    }
  },

  'kawaii-clouds': {
    id: 'kawaii-clouds',
    name: 'Cloud & Stars ☁️',
    category: 'cute',
    previewBg: '#e0f2fe',
    textColor: '#0369a1',
    subtextColor: '#0284c7',
    borderColor: '#ffffff',
    borderWidth: 3,
    drawBackground(ctx, w, h) {
      // Sky blue
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(0, 0, w, h);

      // Cute white clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      drawCloud(ctx, 60, 40, 36);
      drawCloud(ctx, w - 80, 50, 40);
      drawCloud(ctx, 50, h - 70, 34);
      drawCloud(ctx, w - 70, h - 70, 38);

      // Stars
      ctx.font = '20px sans-serif';
      ctx.fillText('⭐', w * 0.48, 45);
      ctx.fillText('✨', w * 0.22, h - 80);
      ctx.fillText('✨', w * 0.75, h - 80);
    }
  },

  'y2k-bubblegum': {
    id: 'y2k-bubblegum',
    name: 'Y2K Hearts 💖',
    category: 'cute',
    previewBg: '#f3e8ff',
    textColor: '#701a75',
    subtextColor: '#a21caf',
    borderColor: '#ffffff',
    borderWidth: 3,
    drawBackground(ctx, w, h) {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#f5d0fe');
      grad.addColorStop(1, '#e9d5ff');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Floating cute hearts
      ctx.font = '22px sans-serif';
      ctx.fillText('💖', 25, 45);
      ctx.fillText('✨', w - 50, 45);
      ctx.fillText('🦄', w / 2 - 12, 45);
      ctx.fillText('💖', w - 50, h - 60);
      ctx.fillText('✨', 25, h - 60);
    }
  },

  'cute-bear': {
    id: 'cute-bear',
    name: 'Honey Bear 🧸',
    category: 'cute',
    previewBg: '#fef3c7',
    textColor: '#78350f',
    subtextColor: '#92400e',
    borderColor: '#ffffff',
    borderWidth: 3,
    drawBackground(ctx, w, h) {
      // Warm butter cream
      ctx.fillStyle = '#fffbeb';
      ctx.fillRect(0, 0, w, h);

      // Tiny bear paw dots
      ctx.fillStyle = 'rgba(180, 83, 9, 0.12)';
      for (let x = 30; x < w; x += 50) {
        for (let y = 30; y < h; y += 50) {
          ctx.beginPath();
          ctx.arc(x, y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.font = '24px sans-serif';
      ctx.fillText('🧸', 24, 46);
      ctx.fillText('🍯', w - 54, 46);
      ctx.fillText('🐾', w - 54, h - 60);
      ctx.fillText('🐾', 24, h - 60);
    }
  },

  'pop-candy': {
    id: 'pop-candy',
    name: 'Pop Candy 🍭',
    category: 'cute',
    previewBg: '#fed7aa',
    textColor: '#c2410c',
    subtextColor: '#ea580c',
    borderColor: '#ffffff',
    borderWidth: 3,
    drawBackground(ctx, w, h) {
      // Bright candy yellow-orange
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(0, 0, w, h);

      // Colorful confetti dots
      const colors = ['#f472b6', '#38bdf8', '#fb923c', '#a78bfa', '#4ade80'];
      for (let i = 0; i < 60; i++) {
        const x = (i * 47) % w;
        const y = (i * 61) % h;
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.font = '24px sans-serif';
      ctx.fillText('🍭', 20, 48);
      ctx.fillText('🍬', w - 50, 48);
      ctx.fillText('✨', w / 2 - 12, 48);
      ctx.fillText('🎈', w - 50, h - 55);
      ctx.fillText('🍭', 20, h - 55);
    }
  },

  'floral-curtain': {
    id: 'floral-curtain',
    name: 'Gorden Bunga',
    category: 'cute',
    previewBg: `url("${new URL('../assets/floral-curtain.png', import.meta.url).href}") center / cover`,
    textColor: '#7b2141',
    subtextColor: '#a34767',
    borderColor: '#fff1f5',
    borderWidth: 3,
    drawBackground(ctx, w, h) {
      if (!floralCurtainImage.complete || floralCurtainImage.naturalWidth === 0) {
        ctx.fillStyle = '#f5dfe6';
        ctx.fillRect(0, 0, w, h);
        return;
      }

      const imageRatio = floralCurtainImage.naturalWidth / floralCurtainImage.naturalHeight;
      const targetRatio = w / h;
      const cropWidth = imageRatio > targetRatio ? floralCurtainImage.naturalHeight * targetRatio : floralCurtainImage.naturalWidth;
      const cropHeight = imageRatio > targetRatio ? floralCurtainImage.naturalHeight : floralCurtainImage.naturalWidth / targetRatio;
      const cropX = (floralCurtainImage.naturalWidth - cropWidth) / 2;
      const cropY = (floralCurtainImage.naturalHeight - cropHeight) / 2;
      ctx.drawImage(floralCurtainImage, cropX, cropY, cropWidth, cropHeight, 0, 0, w, h);
      ctx.fillStyle = 'rgba(255, 241, 245, 0.12)';
      ctx.fillRect(0, 0, w, h);
    }
  },

  'hogwarts-castle': {
    id: 'hogwarts-castle',
    name: 'Kastil Hogwarts 🏰',
    category: 'aesthetic',
    previewBg: `url("${new URL('../assets/hogwarts-castle.jpg', import.meta.url).href}") center / cover`,
    textColor: '#fef08a',
    subtextColor: '#93c5fd',
    borderColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 2,
    drawBackground(ctx, w, h) {
      if (!hogwartsImage.complete || hogwartsImage.naturalWidth === 0) {
        ctx.fillStyle = '#0b1329';
        ctx.fillRect(0, 0, w, h);
        return;
      }

      const imageRatio = hogwartsImage.naturalWidth / hogwartsImage.naturalHeight;
      const targetRatio = w / h;
      const cropWidth = imageRatio > targetRatio ? hogwartsImage.naturalHeight * targetRatio : hogwartsImage.naturalWidth;
      const cropHeight = imageRatio > targetRatio ? hogwartsImage.naturalHeight : hogwartsImage.naturalWidth / targetRatio;
      const cropX = (hogwartsImage.naturalWidth - cropWidth) / 2;
      const cropY = (hogwartsImage.naturalHeight - cropHeight) / 2;
      ctx.drawImage(hogwartsImage, cropX, cropY, cropWidth, cropHeight, 0, 0, w, h);

      // Magical vignette overlay so photo slots pop beautifully
      const vignette = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.25, w / 2, h / 2, Math.max(w, h) * 0.85);
      vignette.addColorStop(0, 'rgba(15, 23, 42, 0.05)');
      vignette.addColorStop(1, 'rgba(8, 12, 24, 0.55)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      // Subtle golden star sparkles
      ctx.fillStyle = 'rgba(254, 240, 138, 0.85)';
      drawFourPointStar(ctx, w * 0.12, 45, 10);
      drawFourPointStar(ctx, w * 0.88, 48, 12);
      drawFourPointStar(ctx, w * 0.15, h - 70, 11);
      drawFourPointStar(ctx, w * 0.85, h - 75, 13);
    }
  }
};

// Available stickers library for stamping & dragging
export const STICKERS = [
  '🎀', '💖', '✨', '🧸', '🍓', '🌸', '🍒', '☁️',
  '🦋', '⭐', '🐱', '🍭', '🕶️', '👑', '🫧', '🎧',
  '💌', '🌈', '💫', '🌼', '☕', '🎂', '🐰', '🐾',
  '🌷', '🍰', '🪩', '🔮', '🎉', '🍀', '🤍', '📸'
];

// Available photo color filters
export const FILTERS = [
  { id: 'normal', name: 'Original', css: 'none' },
  { id: 'glow', name: 'Soft Glow ✨', css: 'brightness(1.08) contrast(1.02) saturate(1.15)' },
  { id: 'bw', name: 'B&W Classic', css: 'grayscale(1) contrast(1.2)' },
  { id: 'vintage', name: '90s Warm', css: 'sepia(0.35) contrast(1.1) brightness(1.04) hue-rotate(-10deg)' },
  { id: 'blush', name: 'Rosy Blush 🌸', css: 'brightness(1.05) contrast(1.05) saturate(1.25) hue-rotate(335deg)' },
  { id: 'cool', name: 'Cool Moody ❄️', css: 'saturate(0.9) contrast(1.15) hue-rotate(190deg) brightness(1.02)' },
  { id: 'matte', name: 'Matte Film', css: 'contrast(0.88) brightness(1.08) saturate(0.82) sepia(0.12)' },
  { id: 'vivid', name: 'Vivid Pop', css: 'contrast(1.16) saturate(1.45)' },
  { id: 'dreamy', name: 'Dreamy', css: 'brightness(1.12) saturate(0.82) sepia(0.12)' }
];

/* Helper drawing functions for cute / aesthetic patterns */
function drawFourPointStar(ctx, cx, cy, size) {
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    const x1 = cx + Math.cos(angle) * size;
    const y1 = cy + Math.sin(angle) * size;
    const xMid = cx + Math.cos(angle + Math.PI / 4) * (size * 0.28);
    const yMid = cy + Math.sin(angle + Math.PI / 4) * (size * 0.28);
    if (i === 0) ctx.moveTo(x1, y1);
    else ctx.lineTo(x1, y1);
    ctx.lineTo(xMid, yMid);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawGinghamBand(ctx, x, y, w, h, color) {
  ctx.save();
  ctx.fillStyle = color;
  const cellSize = 12;
  for (let cx = x; cx < x + w; cx += cellSize) {
    for (let cy = y; cy < y + h; cy += cellSize) {
      if ((Math.floor(cx / cellSize) + Math.floor(cy / cellSize)) % 2 === 0) {
        ctx.fillRect(cx, cy, cellSize, cellSize);
      }
    }
  }
  ctx.restore();
}

function drawCloud(ctx, cx, cy, size) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.5, 0, Math.PI * 2);
  ctx.arc(cx + size * 0.4, cy - size * 0.1, size * 0.4, 0, Math.PI * 2);
  ctx.arc(cx - size * 0.4, cy, size * 0.35, 0, Math.PI * 2);
  ctx.arc(cx + size * 0.7, cy + size * 0.1, size * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

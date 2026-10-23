/**
 * SNAPBOX High-Definition Canvas Renderer
 * Renders composite photostrips with backgrounds, filters, slots, typography & stickers.
 */

import { LAYOUTS } from './layouts.js';
import { THEMES, FILTERS } from './themes.js';

export class PhotostripRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // State
    this.currentLayoutId = 'strip-4';
    this.currentThemeId = 'coquette-bows';
    this.customBgColor = null;
    this.currentFilterId = 'normal';
    this.photos = []; // array of Image objects or DataURLs
    this.stickers = []; // array of { id, text, x, y, size, rotation }
    
    this.titleText = 'SNAPBOX STUDIO';
    this.dateText = this.getFormattedDate();
    this.subText = 'PHOTOBOOTH MEMORY ♡';
    this.showBarcode = true;
    this.showDate = true;

    // Interaction state for stickers on canvas
    this.selectedSticker = null;
    this.isDraggingSticker = false;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;

    this.initStickerInteraction();
  }

  getFormattedDate() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  }

  setLayout(layoutId) {
    if (LAYOUTS[layoutId]) {
      this.currentLayoutId = layoutId;
      this.render();
    }
  }

  setTheme(themeId) {
    if (THEMES[themeId]) {
      this.currentThemeId = themeId;
      this.customBgColor = null;
      this.render();
    }
  }

  setCustomBg(color) {
    this.customBgColor = color;
    this.render();
  }

  setFilter(filterId) {
    this.currentFilterId = filterId;
    this.render();
  }

  setPhotos(photosArray) {
    this.photos = photosArray.map(photo => photo instanceof HTMLImageElement ? photo : null);
    photosArray.forEach((photo, index) => {
      if (typeof photo === 'string') {
        this.setPhotoAt(index, photo);
      }
    });
    this.render();
  }

  setPhotoAt(index, photoSrc) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      this.photos[index] = img;
      this.render();
    };
    img.src = photoSrc;
  }

  clearPhotoAt(index) {
    this.photos[index] = null;
    this.render();
  }

  clearAllPhotos() {
    this.photos = [];
    this.render();
  }

  addSticker(emoji) {
    const layout = LAYOUTS[this.currentLayoutId];
    // Center initially with slight random offset
    const x = layout.width * 0.5 + (Math.random() * 80 - 40);
    const y = layout.height * 0.5 + (Math.random() * 80 - 40);

    const newSticker = {
      id: Date.now() + Math.random(),
      text: emoji,
      x,
      y,
      size: 52,
      rotation: (Math.random() * 20 - 10) * (Math.PI / 180)
    };
    this.stickers.push(newSticker);
    this.render();
  }

  removeSticker(id) {
    this.stickers = this.stickers.filter(s => s.id !== id);
    this.render();
  }

  clearStickers() {
    this.stickers = [];
    this.render();
  }

  setTexts({ title, subtitle, showDate, showBarcode }) {
    if (title !== undefined) this.titleText = title;
    if (subtitle !== undefined) this.subText = subtitle;
    if (showDate !== undefined) this.showDate = showDate;
    if (showBarcode !== undefined) this.showBarcode = showBarcode;
    this.render();
  }

  /**
   * Main rendering loop
   */
  async render() {
    const layout = LAYOUTS[this.currentLayoutId];
    if (!layout) return;

    // Set canvas dimensions to layout's crisp resolution
    if (this.canvas.width !== layout.width || this.canvas.height !== layout.height) {
      this.canvas.width = layout.width;
      this.canvas.height = layout.height;
    }

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    const theme = THEMES[this.currentThemeId] || THEMES['noir-minimal'];

    // 1. Draw Background
    if (this.customBgColor) {
      ctx.fillStyle = this.customBgColor;
      ctx.fillRect(0, 0, w, h);
    } else {
      theme.drawBackground(ctx, w, h);
    }

    // 2. Compute Layout Slots
    const { slots, footer, header } = layout.getSlots(w, h);

    // 3. Draw Header
    this.drawHeader(ctx, header, theme);

    // 4. Draw Photo Slots
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const photoImg = this.photos[i];
      await this.drawPhotoSlot(ctx, slot, photoImg, theme);
    }

    // 5. Draw Footer
    this.drawFooter(ctx, footer, theme);

    // 6. Draw User Stickers
    this.drawStickers(ctx);
  }

  drawHeader(ctx, header, theme) {
    if (!header || header.h < 20) return;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = theme.textColor;
    ctx.font = `600 ${Math.min(22, header.h * 0.45)}px 'Outfit', sans-serif`;
    ctx.letterSpacing = '3px';
    ctx.fillText('✦ SNAPBOX ✦', header.x + header.w / 2, header.y + header.h / 2);
    ctx.restore();
  }

  drawFooter(ctx, footer, theme) {
    if (!footer || footer.h < 30) return;
    ctx.save();
    const centerX = footer.x + footer.w / 2;
    let currY = footer.y + 35;

    // Title / Custom Event Name
    if (this.titleText) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = theme.textColor;
      ctx.font = `700 24px 'Fredoka', 'Outfit', sans-serif`;
      ctx.letterSpacing = '1px';
      ctx.fillText(this.titleText, centerX, currY);
      currY += 28;
    }

    // Subtitle
    if (this.subText) {
      ctx.textAlign = 'center';
      ctx.fillStyle = theme.subtextColor;
      ctx.font = `500 15px 'Outfit', sans-serif`;
      ctx.letterSpacing = '2px';
      ctx.fillText(this.subText, centerX, currY);
      currY += 26;
    }

    // Date
    if (this.showDate && this.dateText) {
      ctx.textAlign = 'center';
      ctx.fillStyle = theme.textColor;
      ctx.font = `600 14px 'Plus Jakarta Sans', monospace`;
      ctx.letterSpacing = '3px';
      ctx.fillText(this.dateText, centerX, currY);
      currY += 28;
    }

    // Barcode Simulation
    if (this.showBarcode) {
      this.drawBarcode(ctx, centerX - 90, currY, 180, 26, theme.textColor);
    }

    ctx.restore();
  }

  drawBarcode(ctx, x, y, w, h, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.75;
    
    // Deterministic striped pattern
    const pattern = [3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 4, 2, 1, 3, 2];
    let curX = x;
    const totalUnits = pattern.reduce((a, b) => a + b, 0) + pattern.length;
    const unitW = w / totalUnits;

    for (let i = 0; i < pattern.length; i++) {
      const barW = pattern[i] * unitW;
      ctx.fillRect(curX, y, barW, h);
      curX += barW + unitW;
      if (curX > x + w) break;
    }

    // Mini serial text under barcode
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '2px';
    ctx.fillText('NO. 2026-KR-SNAP', x + w / 2, y + h + 13);

    ctx.restore();
  }

  drawPhotoSlot(ctx, slot, photoImg, theme) {
    ctx.save();

    // Rounded rectangle path for the slot
    this.roundRect(ctx, slot.x, slot.y, slot.w, slot.h, slot.borderRadius);

    if (photoImg) {
      ctx.clip();

      // Apply filter
      const activeFilter = FILTERS.find(f => f.id === this.currentFilterId);
      if (activeFilter && activeFilter.css !== 'none') {
        ctx.filter = activeFilter.css;
      }

      // Draw photo with object-fit: cover logic
      this.drawImageCover(ctx, photoImg, slot.x, slot.y, slot.w, slot.h);
      ctx.filter = 'none';

      // Inner subtle border
      ctx.restore();
      ctx.save();
      this.roundRect(ctx, slot.x, slot.y, slot.w, slot.h, slot.borderRadius);
      ctx.strokeStyle = theme.borderColor || 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = theme.borderWidth || 2;
      ctx.stroke();
    } else {
      // Empty slot placeholder
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Placeholder icon and slot number
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '32px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('📷', slot.x + slot.w / 2, slot.y + slot.h / 2 - 14);

      ctx.font = '600 14px "Outfit", sans-serif';
      ctx.fillText(`FOTO ${slot.index + 1}`, slot.x + slot.w / 2, slot.y + slot.h / 2 + 20);
    }

    ctx.restore();
  }

  drawImageCover(ctx, img, x, y, w, h) {
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const targetRatio = w / h;

    let sx, sy, sw, sh;
    if (imgRatio > targetRatio) {
      sh = img.naturalHeight;
      sw = sh * targetRatio;
      sx = (img.naturalWidth - sw) / 2;
      sy = 0;
    } else {
      sw = img.naturalWidth;
      sh = sw / targetRatio;
      sx = 0;
      sy = (img.naturalHeight - sh) / 2;
    }

    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }

  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  drawStickers(ctx) {
    for (const sticker of this.stickers) {
      ctx.save();
      ctx.translate(sticker.x, sticker.y);
      ctx.rotate(sticker.rotation);
      ctx.font = `${sticker.size}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Glow/shadow for stickers
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 8;
      ctx.fillText(sticker.text, 0, 0);

      // If selected, show subtle bounding ring
      if (this.selectedSticker && this.selectedSticker.id === sticker.id) {
        ctx.strokeStyle = '#ff6584';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(0, 0, sticker.size * 0.65, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  /**
   * Touch & Mouse interaction to drag/move stickers on the canvas
   */
  initStickerInteraction() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    };

    const findStickerAt = (x, y) => {
      for (let i = this.stickers.length - 1; i >= 0; i--) {
        const s = this.stickers[i];
        const dist = Math.hypot(s.x - x, s.y - y);
        if (dist <= s.size * 0.75) {
          return s;
        }
      }
      return null;
    };

    const onStart = (e) => {
      const pos = getPos(e);
      const hit = findStickerAt(pos.x, pos.y);
      if (hit) {
        if (e.cancelable) e.preventDefault();
        this.selectedSticker = hit;
        this.isDraggingSticker = true;
        this.dragOffsetX = pos.x - hit.x;
        this.dragOffsetY = pos.y - hit.y;
        this.render();
      } else {
        if (this.selectedSticker) {
          this.selectedSticker = null;
          this.render();
        }
      }
    };

    const onMove = (e) => {
      if (!this.isDraggingSticker || !this.selectedSticker) return;
      if (e.cancelable) e.preventDefault();
      const pos = getPos(e);
      this.selectedSticker.x = pos.x - this.dragOffsetX;
      this.selectedSticker.y = pos.y - this.dragOffsetY;
      this.render();
    };

    const onEnd = () => {
      this.isDraggingSticker = false;
    };

    // Double tap/click sticker to remove
    const onDblClick = (e) => {
      const pos = getPos(e);
      const hit = findStickerAt(pos.x, pos.y);
      if (hit) {
        this.removeSticker(hit.id);
      }
    };

    this.canvas.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    this.canvas.addEventListener('dblclick', onDblClick);

    this.canvas.addEventListener('touchstart', onStart, { passive: false });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  }

  /**
   * Export high-res image DataURL or Blob for download / sharing
   */
  toDataURL(type = 'image/png', quality = 0.95) {
    return this.canvas.toDataURL(type, quality);
  }

  toBlob(callback, type = 'image/png', quality = 0.95) {
    this.canvas.toBlob(callback, type, quality);
  }
}

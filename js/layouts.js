/**
 * SNAPBOX Layout Configurations
 * Defines frames count, canvas dimensions, coordinate grids, and aspect ratios.
 */

export const LAYOUTS = {
  'strip-4': {
    id: 'strip-4',
    name: 'K-Strip 4 Foto',
    badge: 'Popular ★',
    photoCount: 4,
    width: 700,
    height: 2200,
    photoRatio: 4 / 3, // 4:3 landscape ratio per photo inside strip
    headerHeight: 60,
    footerHeight: 220,
    padding: 36,
    gap: 24,
    borderRadius: 14,
    getSlots(w, h) {
      const pad = 40;
      const gap = 24;
      const footerH = 220;
      const headerH = 70;
      const count = 4;
      
      const availW = w - pad * 2;
      const availH = h - headerH - footerH - pad - (gap * (count - 1));
      const cellH = availH / count;
      const cellW = availW;

      const slots = [];
      for (let i = 0; i < count; i++) {
        slots.push({
          index: i,
          x: pad,
          y: headerH + i * (cellH + gap),
          w: cellW,
          h: cellH,
          borderRadius: 12
        });
      }
      return {
        slots,
        footer: { x: pad, y: h - footerH, w: availW, h: footerH - pad },
        header: { x: pad, y: pad, w: availW, h: headerH - pad }
      };
    }
  },

  'strip-3': {
    id: 'strip-3',
    name: 'Classic 3 Strip',
    badge: 'Retro',
    photoCount: 3,
    width: 700,
    height: 1900,
    photoRatio: 4 / 3,
    getSlots(w, h) {
      const pad = 42;
      const gap = 26;
      const footerH = 200;
      const headerH = 70;
      const count = 3;

      const availW = w - pad * 2;
      const availH = h - headerH - footerH - pad - (gap * (count - 1));
      const cellH = availH / count;
      const cellW = availW;

      const slots = [];
      for (let i = 0; i < count; i++) {
        slots.push({
          index: i,
          x: pad,
          y: headerH + i * (cellH + gap),
          w: cellW,
          h: cellH,
          borderRadius: 14
        });
      }
      return {
        slots,
        footer: { x: pad, y: h - footerH, w: availW, h: footerH - pad },
        header: { x: pad, y: pad, w: availW, h: headerH - pad }
      };
    }
  },

  'grid-4': {
    id: 'grid-4',
    name: 'Grid 2x2 (4 Foto)',
    badge: 'Aesthetic',
    photoCount: 4,
    width: 1080,
    height: 1440,
    photoRatio: 1, // square or near square
    getSlots(w, h) {
      const pad = 48;
      const gap = 24;
      const footerH = 190;
      const headerH = 80;

      const availW = w - pad * 2 - gap;
      const cellW = availW / 2;
      const availH = h - headerH - footerH - pad - gap;
      const cellH = availH / 2;

      const slots = [
        { index: 0, x: pad, y: headerH, w: cellW, h: cellH, borderRadius: 14 },
        { index: 1, x: pad + cellW + gap, y: headerH, w: cellW, h: cellH, borderRadius: 14 },
        { index: 2, x: pad, y: headerH + cellH + gap, w: cellW, h: cellH, borderRadius: 14 },
        { index: 3, x: pad + cellW + gap, y: headerH + cellH + gap, w: cellW, h: cellH, borderRadius: 14 }
      ];

      return {
        slots,
        footer: { x: pad, y: h - footerH, w: w - pad * 2, h: footerH - pad },
        header: { x: pad, y: pad, w: w - pad * 2, h: headerH - pad }
      };
    }
  },

  'strip-2': {
    id: 'strip-2',
    name: 'Duo 2 Foto',
    badge: 'Cute',
    photoCount: 2,
    width: 700,
    height: 1380,
    photoRatio: 4 / 3,
    getSlots(w, h) {
      const pad = 44;
      const gap = 26;
      const footerH = 180;
      const headerH = 70;
      const count = 2;

      const availW = w - pad * 2;
      const availH = h - headerH - footerH - pad - (gap * (count - 1));
      const cellH = availH / count;
      const cellW = availW;

      const slots = [];
      for (let i = 0; i < count; i++) {
        slots.push({
          index: i,
          x: pad,
          y: headerH + i * (cellH + gap),
          w: cellW,
          h: cellH,
          borderRadius: 14
        });
      }
      return {
        slots,
        footer: { x: pad, y: h - footerH, w: availW, h: footerH - pad },
        header: { x: pad, y: pad, w: availW, h: headerH - pad }
      };
    }
  },

  'grid-6': {
    id: 'grid-6',
    name: 'Cinema 6 Foto',
    badge: 'Storybook',
    photoCount: 6,
    width: 1080,
    height: 1720,
    photoRatio: 4 / 3,
    getSlots(w, h) {
      const pad = 44;
      const gap = 20;
      const footerH = 200;
      const headerH = 75;

      const availW = w - pad * 2 - gap;
      const cellW = availW / 2;
      const availH = h - headerH - footerH - pad - (gap * 2);
      const cellH = availH / 3;

      const slots = [];
      let idx = 0;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 2; c++) {
          slots.push({
            index: idx++,
            x: pad + c * (cellW + gap),
            y: headerH + r * (cellH + gap),
            w: cellW,
            h: cellH,
            borderRadius: 12
          });
        }
      }

      return {
        slots,
        footer: { x: pad, y: h - footerH, w: w - pad * 2, h: footerH - pad },
        header: { x: pad, y: pad, w: w - pad * 2, h: headerH - pad }
      };
    }
  },

  'polaroid-1': {
    id: 'polaroid-1',
    name: 'Polaroid Solo',
    badge: 'Classic',
    photoCount: 1,
    width: 900,
    height: 1100,
    photoRatio: 1,
    getSlots(w, h) {
      const padX = 54;
      const padTop = 60;
      const footerH = 260;

      const cellW = w - padX * 2;
      const cellH = cellW; // square photo

      return {
        slots: [
          { index: 0, x: padX, y: padTop, w: cellW, h: cellH, borderRadius: 8 }
        ],
        footer: { x: padX, y: padTop + cellH, w: cellW, h: footerH },
        header: { x: padX, y: 0, w: cellW, h: padTop }
      };
    }
  }
};

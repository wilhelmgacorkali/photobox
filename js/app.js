/**
 * SNAPBOX Main Application Controller
 * Orchestrates UI tabs, camera interaction, layout & theme selection,
 * stickers, text customization, and exports.
 */

import { LAYOUTS } from './layouts.js';
import { THEMES, STICKERS, FILTERS } from './themes.js';
import { PhotostripRenderer } from './renderer.js';
import { CameraBooth } from './camera.js';
import { CAMERA_BACKGROUNDS } from './virtual-background.js';
import { soundFX } from './audio.js';

// DOM Elements
const canvas = document.getElementById('photostrip-canvas');
const video = document.getElementById('camera-video');
const cameraPlaceholder = document.getElementById('camera-placeholder');
const flashOverlay = document.getElementById('flash-overlay');
const countdownOverlay = document.getElementById('countdown-overlay');
const countdownNumber = document.getElementById('countdown-number');
const countdownStatusText = document.getElementById('countdown-status');

// Controls
const btnStartCamera = document.getElementById('btn-start-camera');
const btnFlipCamera = document.getElementById('btn-flip-camera');
const btnMirrorCamera = document.getElementById('btn-mirror-camera');
const btnShutter = document.getElementById('btn-shutter');
const timerSelect = document.getElementById('timer-select');
const btnUploadGallery = document.getElementById('btn-upload-gallery');
const fileInput = document.getElementById('file-input');
const btnDemoPhotos = document.getElementById('btn-demo-photos');

// Customizer Controls
const layoutContainer = document.getElementById('layout-selector-container');
const themeContainer = document.getElementById('themes-grid-container');
const categoryPills = document.querySelectorAll('.cat-pill');
const customColorInput = document.getElementById('custom-bg-color');
const filtersContainer = document.getElementById('filters-scroll-container');
const backdropsContainer = document.getElementById('camera-backdrops');
const stickersContainer = document.getElementById('stickers-picker-container');
const btnClearStickers = document.getElementById('btn-clear-stickers');

// Text Inputs
const inputTitle = document.getElementById('input-title');
const inputSubtitle = document.getElementById('input-subtitle');
const toggleDate = document.getElementById('toggle-date');
const toggleBarcode = document.getElementById('toggle-barcode');

// Export Buttons
const btnDownload = document.getElementById('btn-download');
const btnShare = document.getElementById('btn-share');
const btnPrint = document.getElementById('btn-print');
const btnCopy = document.getElementById('btn-copy');

// Shots Tray
const shotsList = document.getElementById('shots-list');
const shotCountBadge = document.getElementById('shot-count-badge');

// Tabs
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-content');

// Toast
const toastContainer = document.getElementById('toast-container');

// Instantiate Core Engines
const renderer = new PhotostripRenderer(canvas);
const camera = new CameraBooth(video, flashOverlay, countdownOverlay, countdownNumber, countdownStatusText);

// App State
let activeThemeCategory = 'all';
let capturedSlots = []; // array of Image objects or DataURLs matching active layout slots

function init() {
  setupTabs();
  renderLayouts();
  renderThemes('all');
  renderFilters();
  renderCameraBackdrops();
  renderStickers();
  updateShotsTray();

  // Attach Event Listeners
  setupCameraListeners();
  setupCustomizerListeners();
  setupExportListeners();

  // Initial initialisation of the canvas renderer
  renderer.render();

  // Try auto-starting camera if supported
  tryAutoStartCamera();
}

function showToast(message, type = 'normal') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}

/**
 * Camera & Booth Flow
 */
async function tryAutoStartCamera() {
  try {
    await camera.startCamera();
    cameraPlaceholder.classList.add('hidden');
    showToast("Kamera aktif! Pilih gaya bingkai & tekan Ambil Foto ✨", "success");
  } catch (err) {
    cameraPlaceholder.classList.remove('hidden');
    console.log("Camera awaiting user tap or not available.");
  }
}

function setupCameraListeners() {
  camera.background.onError = error => {
    showToast(`Efek background berhenti: ${error.message}`, 'error');
  };

  btnStartCamera.addEventListener('click', async () => {
    try {
      await camera.startCamera();
      cameraPlaceholder.classList.add('hidden');
      showToast("Kamera siap! 📸", "success");
    } catch (err) {
      showToast("Tidak dapat mengakses kamera. Silakan pilih 'Upload Foto HP' atau 'Contoh Foto'.", "error");
    }
  });

  btnFlipCamera.addEventListener('click', async () => {
    try {
      await camera.switchCamera();
      showToast(`Beralih ke kamera ${camera.facingMode === 'user' ? 'Depan' : 'Belakang'}`);
    } catch (e) {
      showToast("Gagal beralih kamera", "error");
    }
  });

  btnMirrorCamera.addEventListener('click', () => {
    const isMirrored = camera.toggleMirror();
    btnMirrorCamera.classList.toggle('active', isMirrored);
    showToast(`Cermin: ${isMirrored ? 'Aktif' : 'Non-aktif'}`);
  });

  timerSelect.addEventListener('change', (e) => {
    camera.setTimerSeconds(e.target.value);
    showToast(`Timer diatur ke ${e.target.value} detik`);
  });

  // Main Shutter Click -> Starts sequential booth capture
  btnShutter.addEventListener('click', async () => {
    if (camera.isShooting) return;
    const layout = LAYOUTS[renderer.currentLayoutId];
    const targetCount = layout.photoCount;

    // Check if camera stream is active; if not, ask to activate or upload
    if (!camera.stream) {
      try {
        await camera.startCamera();
        cameraPlaceholder.classList.add('hidden');
      } catch (e) {
        showToast("Harap aktifkan kamera atau gunakan tombol 'Upload Foto' terlebih dahulu!", "error");
        return;
      }
    }

    btnShutter.classList.add('disabled');

    await camera.startBoothSequence(targetCount, (slotIndex, photoDataUrl) => {
      // Put captured frame into slot
      capturedSlots[slotIndex] = photoDataUrl;
      renderer.setPhotoAt(slotIndex, photoDataUrl);
      updateShotsTray();
      showToast(`Foto ${slotIndex + 1} tersimpan! 💖`);
    });

    btnShutter.classList.remove('disabled');
    showToast("Semua foto selesai! Kreasikan stiker & background lucu! 🎉", "success");
  });

  // Upload from mobile phone gallery / computer file
  btnUploadGallery.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    const layout = LAYOUTS[renderer.currentLayoutId];
    const maxFiles = Math.min(files.length, layout.photoCount);

    files.slice(0, maxFiles).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const dataUrl = loadEvt.target.result;
        capturedSlots[index] = dataUrl;
        renderer.setPhotoAt(index, dataUrl);
        updateShotsTray();
      };
      reader.readAsDataURL(file);
    });

    showToast(`${maxFiles} foto berhasil dimasukkan dari galeri HP! 📱✨`, "success");
    fileInput.value = '';
  });

  // Demo Photos Generator (Generates cute pastel portrait demos)
  btnDemoPhotos.addEventListener('click', () => {
    generateDemoPhotos();
  });
}

/**
 * Generate colorful mock photobooth portrait images using Canvas
 * so user can immediately preview without needing a real webcam.
 */
function generateDemoPhotos() {
  const layout = LAYOUTS[renderer.currentLayoutId];
  const count = layout.photoCount;
  const emojis = ['🌸', '✨', '✌️', '💖', '🎀', '🥰'];
  const colors = [
    ['#ffd1dc', '#ffb6c1'],
    ['#e0c3fc', '#8ec5fc'],
    ['#fbc2eb', '#a6c1ee'],
    ['#fed6e3', '#a8edea'],
    ['#fddb92', '#d1fdff'],
    ['#cd9cf2', '#f6f3ff']
  ];

  for (let i = 0; i < count; i++) {
    const demoCanvas = document.createElement('canvas');
    demoCanvas.width = 640;
    demoCanvas.height = 480;
    const ctx = demoCanvas.getContext('2d');

    // Gradient background
    const grad = ctx.createLinearGradient(0, 0, 640, 480);
    const [c1, c2] = colors[i % colors.length];
    grad.addColorStop(0, c1);
    grad.addColorStop(1, c2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 640, 480);

    // Cute portrait avatar silhouette
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.arc(320, 220, 100, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(320, 480, 180, 0, Math.PI, true);
    ctx.fill();

    // Fun pose emoji
    ctx.font = '100px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emojis[i % emojis.length], 320, 220);

    // Pose watermark
    ctx.font = 'bold 28px "Outfit", sans-serif';
    ctx.fillStyle = '#4a044e';
    ctx.fillText(`POSE #${i + 1}`, 320, 390);

    const dataUrl = demoCanvas.toDataURL('image/jpeg', 0.9);
    capturedSlots[i] = dataUrl;
    renderer.setPhotoAt(i, dataUrl);
  }

  updateShotsTray();
  showToast(`Berhasil memuat contoh foto pose photobooth! 📸✨`, "success");
}

/**
 * Shots Tray Rendering
 */
function updateShotsTray() {
  const layout = LAYOUTS[renderer.currentLayoutId];
  const count = layout.photoCount;
  shotsList.innerHTML = '';

  const filledCount = capturedSlots.filter(Boolean).length;
  shotCountBadge.textContent = `${filledCount}/${count} Foto`;

  for (let i = 0; i < count; i++) {
    const slotEl = document.createElement('div');
    slotEl.className = 'shot-slot' + (capturedSlots[i] ? ' filled' : '');
    
    if (capturedSlots[i]) {
      const img = document.createElement('img');
      img.src = capturedSlots[i];
      slotEl.appendChild(img);

      // Retake single photo button
      const retakeBtn = document.createElement('button');
      retakeBtn.className = 'retake-btn';
      retakeBtn.title = 'Ulangi foto ini';
      retakeBtn.innerHTML = '✕';
      retakeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        retakeSingleSlot(i);
      });
      slotEl.appendChild(retakeBtn);
    } else {
      slotEl.textContent = `#${i + 1}`;
    }

    shotsList.appendChild(slotEl);
  }
}

async function retakeSingleSlot(index) {
  if (!camera.stream) {
    try {
      await camera.startCamera();
      cameraPlaceholder.classList.add('hidden');
    } catch (e) {
      showToast("Aktifkan kamera untuk mengulang foto ini", "error");
      return;
    }
  }

  showToast(`Mengulang Foto #${index + 1}... Bersiap!`);
  countdownOverlay.classList.add('active');
  countdownStatusText.textContent = `Ulangi Foto #${index + 1}: Bersiap!`;

  for (let sec = camera.timerSeconds; sec > 0; sec--) {
    countdownNumber.textContent = sec;
    soundFX.playBeep(sec === 1);
    await camera.delay(1000);
  }

  countdownNumber.textContent = '📸';
  camera.triggerFlash();
  const photo = camera.captureCurrentFrame();
  capturedSlots[index] = photo;
  renderer.setPhotoAt(index, photo);
  updateShotsTray();

  countdownOverlay.classList.remove('active');
  showToast(`Foto #${index + 1} berhasil diperbarui! ✨`, "success");
}

/**
 * Layout Selection Rendering
 */
function renderLayouts() {
  layoutContainer.innerHTML = '';

  Object.values(LAYOUTS).forEach(layout => {
    const card = document.createElement('div');
    card.className = `layout-card ${layout.id === renderer.currentLayoutId ? 'active' : ''}`;
    card.dataset.id = layout.id;

    // Mini visual icon
    let iconClass = 'layout-preview-icon';
    if (layout.id === 'grid-4') iconClass += ' grid-2x2';
    if (layout.id === 'grid-6') iconClass += ' grid-2x3';

    let cellsHtml = '';
    for (let c = 0; c < layout.photoCount; c++) {
      cellsHtml += `<div class="layout-cell-mini"></div>`;
    }

    card.innerHTML = `
      <div class="${iconClass}">
        ${cellsHtml}
      </div>
      <div class="layout-name">${layout.name}</div>
      <div class="layout-desc">${layout.badge}</div>
    `;

    card.addEventListener('click', () => {
      document.querySelectorAll('.layout-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      renderer.setLayout(layout.id);
      // Trim captured photos if new layout has fewer slots
      capturedSlots = capturedSlots.slice(0, layout.photoCount);
      renderer.setPhotos(capturedSlots);
      updateShotsTray();
      showToast(`Bingkai diubah ke: ${layout.name}`);
    });

    layoutContainer.appendChild(card);
  });
}

/**
 * Theme Selection Rendering
 */
function renderThemes(category = 'all') {
  themeContainer.innerHTML = '';

  Object.values(THEMES).forEach(theme => {
    if (category !== 'all' && theme.category !== category) return;

    const card = document.createElement('div');
    card.className = `theme-card ${theme.id === renderer.currentThemeId ? 'active' : ''}`;
    card.dataset.id = theme.id;
    card.style.background = theme.previewBg;

    card.innerHTML = `
      <div class="theme-name">${theme.name}</div>
    `;

    card.addEventListener('click', () => {
      document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      renderer.setTheme(theme.id);
      showToast(`Tema diterapkan: ${theme.name} ✨`);
    });

    themeContainer.appendChild(card);
  });
}

/**
 * Filter Selection Rendering
 */
function renderFilters() {
  filtersContainer.innerHTML = '';

  FILTERS.forEach(f => {
    const chip = document.createElement('button');
    chip.className = `filter-chip ${f.id === renderer.currentFilterId ? 'active' : ''}`;
    chip.type = 'button';
    chip.setAttribute('aria-pressed', String(f.id === renderer.currentFilterId));
    chip.title = `Gunakan efek ${f.name}`;

    const preview = document.createElement('span');
    preview.className = 'filter-preview';
    preview.setAttribute('aria-hidden', 'true');
    preview.textContent = '◉';
    preview.style.filter = f.css;

    const label = document.createElement('span');
    label.textContent = f.name;
    chip.append(preview, label);

    chip.addEventListener('click', () => {
      filtersContainer.querySelectorAll('.filter-chip').forEach(c => {
        c.classList.remove('active');
        c.setAttribute('aria-pressed', 'false');
      });
      chip.classList.add('active');
      chip.setAttribute('aria-pressed', 'true');
      renderer.setFilter(f.id);

      // Also apply filter live on webcam video
      camera.setFilter(f.css);
      showToast(`Filter: ${f.name}`);
    });

    filtersContainer.appendChild(chip);
  });
}

function renderCameraBackdrops() {
  backdropsContainer.innerHTML = '';

  CAMERA_BACKGROUNDS.forEach(background => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `backdrop-chip ${background.id === camera.background.currentId ? 'active' : ''}`;
    button.dataset.backdrop = background.id;
    button.setAttribute('aria-pressed', String(background.id === camera.background.currentId));
    button.innerHTML = `<span class="backdrop-swatch" aria-hidden="true"></span><span>${background.name}</span>`;

    button.addEventListener('click', async () => {
      backdropsContainer.querySelectorAll('.backdrop-chip').forEach(chip => {
        chip.classList.remove('active');
        chip.setAttribute('aria-pressed', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');

      try {
        await camera.setBackground(background.id);
        showToast(`Background kamera: ${background.name}`, 'success');
      } catch (error) {
        button.classList.remove('active');
        button.setAttribute('aria-pressed', 'false');
        const previous = backdropsContainer.querySelector(`[data-backdrop="${camera.background.currentId}"]`);
        previous?.classList.add('active');
        previous?.setAttribute('aria-pressed', 'true');
        showToast(`Background tidak dapat dimuat: ${error.message}`, 'error');
      }
    });

    backdropsContainer.appendChild(button);
  });
}

/**
 * Stickers Picker Rendering
 */
function renderStickers() {
  stickersContainer.innerHTML = '';

  STICKERS.forEach(emoji => {
    const item = document.createElement('div');
    item.className = 'sticker-item';
    item.textContent = emoji;

    item.addEventListener('click', () => {
      renderer.addSticker(emoji);
      showToast(`Stiker ${emoji} ditempel! Geser posisinya di foto 💖`);
    });

    stickersContainer.appendChild(item);
  });
}

/**
 * Customizer Controls Listeners
 */
function setupCustomizerListeners() {
  // Theme category filter tabs
  categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      categoryPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeThemeCategory = pill.dataset.cat;
      renderThemes(activeThemeCategory);
    });
  });

  // Custom Color Background Picker
  customColorInput.addEventListener('input', (e) => {
    document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
    renderer.setCustomBg(e.target.value);
  });

  // Clear stickers
  btnClearStickers.addEventListener('click', () => {
    renderer.clearStickers();
    showToast("Semua stiker dihapus");
  });

  // Text inputs & stamp toggles
  inputTitle.addEventListener('input', (e) => {
    renderer.setTexts({ title: e.target.value });
  });

  inputSubtitle.addEventListener('input', (e) => {
    renderer.setTexts({ subtitle: e.target.value });
  });

  toggleDate.addEventListener('change', (e) => {
    renderer.setTexts({ showDate: e.target.checked });
  });

  toggleBarcode.addEventListener('change', (e) => {
    renderer.setTexts({ showBarcode: e.target.checked });
  });
}

/**
 * Setup Tabs (Bingkai, Background/Tema, Stiker & Teks)
 */
function setupTabs() {
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const panel = document.getElementById(`panel-${targetTab}`);
      if (panel) panel.classList.add('active');
    });
  });
}

/**
 * Export Options: Download HD, Web Share, Print, Copy
 */
function setupExportListeners() {
  // Download PNG HD
  btnDownload.addEventListener('click', () => {
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '');
    link.download = `SNAPBOX-${renderer.currentLayoutId}-${timestamp}.png`;
    link.href = renderer.toDataURL('image/png', 0.98);
    link.click();
    showToast("Foto strip HD berhasil diunduh! 📥✨", "success");
  });

  // Native Mobile Web Share API
  btnShare.addEventListener('click', async () => {
    if (!navigator.canShare) {
      // Fallback: download instead
      btnDownload.click();
      return;
    }

    renderer.toBlob(async (blob) => {
      const file = new File([blob], 'snapbox-photostrip.png', { type: 'image/png' });
      try {
        await navigator.share({
          title: 'SNAPBOX Photobooth Strip',
          text: 'Lihat photostrip lucuku dari SNAPBOX Digital Photobooth! ♡',
          files: [file]
        });
        showToast("Berhasil dibagikan! 💌", "success");
      } catch (err) {
        if (err.name !== 'AbortError') {
          showToast("Gagal membagikan, file otomatis diunduh", "normal");
          btnDownload.click();
        }
      }
    });
  });

  // Direct Browser Print
  btnPrint.addEventListener('click', () => {
    window.print();
  });

  // Copy Image to Clipboard
  btnCopy.addEventListener('click', async () => {
    if (!navigator.clipboard || !window.ClipboardItem) {
      showToast("Salin gambar tidak didukung di browser ini, gunakan Unduh", "error");
      return;
    }

    renderer.toBlob(async (blob) => {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        showToast("Gambar tersalin ke clipboard! Siap di-paste ke chat 📋✨", "success");
      } catch (err) {
        showToast("Gagal menyalin gambar, silakan unduh manual", "error");
      }
    });
  });
}

// Start application on DOM Ready
document.addEventListener('DOMContentLoaded', init);
  
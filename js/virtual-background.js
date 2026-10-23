export const CAMERA_BACKGROUNDS = [
  { id: 'original', name: 'Asli' },
  { id: 'curtain-pink', name: 'Gorden Pink' },
  { id: 'curtain-cream', name: 'Gorden Cream' },
  { id: 'curtain-flowers', name: 'Gorden Bunga' },
  { id: 'plain-white', name: 'Polos Putih' },
  { id: 'plain-blue', name: 'Polos Biru' },
  { id: 'plain-pink', name: 'Polos Pink' }
];

const VISION_VERSION = '1.1.1';
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/1/selfie_segmenter.tflite';

export class CameraBackground {
  constructor(video, canvas) {
    this.video = video;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.foregroundCanvas = document.createElement('canvas');
    this.foregroundCtx = this.foregroundCanvas.getContext('2d');
    this.maskCanvas = document.createElement('canvas');
    this.maskCtx = this.maskCanvas.getContext('2d');
    this.floralBackdrop = new Image();
    this.floralBackdrop.src = new URL('../assets/floral-curtain.png', import.meta.url).href;
    this.currentId = 'original';
    this.filterCSS = 'none';
    this.isMirrored = true;
    this.segmenter = null;
    this.loadPromise = null;
    this.frameId = null;
    this.lastTimestamp = 0;
    this.isRunning = false;
  }

  async setBackground(backgroundId) {
    if (!CAMERA_BACKGROUNDS.some(background => background.id === backgroundId)) {
      throw new Error('Background tidak dikenal.');
    }

    if (backgroundId === 'original') {
      this.currentId = backgroundId;
      this.stop();
      return;
    }

    await this.initialize();
    if (backgroundId === 'curtain-flowers') {
      await this.loadFloralBackdrop();
    }
    this.currentId = backgroundId;
    if (this.video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      this.start();
    }
  }

  async initialize() {
    if (this.segmenter) return;
    if (!this.loadPromise) {
      this.loadPromise = this.loadSegmenter().catch(error => {
        this.loadPromise = null;
        throw new Error(`Efek background memerlukan browser yang didukung dan koneksi internet. ${error.message}`);
      });
    }
    await this.loadPromise;
  }

  loadFloralBackdrop() {
    if (this.floralBackdrop.complete && this.floralBackdrop.naturalWidth > 0) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      this.floralBackdrop.addEventListener('load', resolve, { once: true });
      this.floralBackdrop.addEventListener('error', () => reject(new Error('Gambar background gorden bunga gagal dimuat.')), { once: true });
    });
  }

  async loadSegmenter() {
    const vision = await import(`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VISION_VERSION}/vision_bundle.mjs`);
    const wasmRoot = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VISION_VERSION}/wasm`;
    const fileset = await vision.FilesetResolver.forVisionTasks(wasmRoot);
    const options = delegate => vision.ImageSegmenter.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: MODEL_URL, delegate },
      runningMode: 'VIDEO',
      outputCategoryMask: false,
      outputConfidenceMasks: true
    });

    try {
      this.segmenter = await options('GPU');
    } catch (gpuError) {
      try {
        this.segmenter = await options('CPU');
      } catch (cpuError) {
        throw new Error(`Model segmentasi tidak bisa dijalankan. GPU: ${gpuError.message} CPU: ${cpuError.message}`);
      }
    }
  }

  setFilter(filterCSS) {
    this.filterCSS = filterCSS;
  }

  start() {
    if (!this.segmenter || this.isRunning || this.video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
    this.isRunning = true;
    this.video.closest('.viewfinder-card')?.classList.add('virtual-background-active');
    this.renderFrame();
  }

  stop() {
    this.isRunning = false;
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
    this.video.closest('.viewfinder-card')?.classList.remove('virtual-background-active');
  }

  renderFrame() {
    if (!this.isRunning || !this.segmenter) return;

    try {
      const timestamp = Math.max(performance.now(), this.lastTimestamp + 1);
      this.lastTimestamp = timestamp;
      const result = this.segmenter.segmentForVideo(this.video, timestamp);
      const mask = result.confidenceMasks[0];
      if (mask) {
        this.drawComposite(mask);
        mask.close();
      }
    } catch (error) {
      this.stop();
      console.error('Virtual background rendering failed:', error);
      if (this.onError) this.onError(error);
      return;
    }

    this.frameId = requestAnimationFrame(() => this.renderFrame());
  }

  drawComposite(confidenceMask) {
    const width = this.video.videoWidth;
    const height = this.video.videoHeight;
    if (!width || !height) return;

    const scale = Math.min(1, 1280 / width, 720 / height);
    const outputWidth = Math.round(width * scale);
    const outputHeight = Math.round(height * scale);
    if (this.canvas.width !== outputWidth || this.canvas.height !== outputHeight) {
      this.canvas.width = outputWidth;
      this.canvas.height = outputHeight;
    }
    if (this.foregroundCanvas.width !== outputWidth || this.foregroundCanvas.height !== outputHeight) {
      this.foregroundCanvas.width = outputWidth;
      this.foregroundCanvas.height = outputHeight;
    }
    if (this.maskCanvas.width !== confidenceMask.width || this.maskCanvas.height !== confidenceMask.height) {
      this.maskCanvas.width = confidenceMask.width;
      this.maskCanvas.height = confidenceMask.height;
    }

    const confidence = confidenceMask.getAsFloat32Array();
    const imageData = this.maskCtx.createImageData(confidenceMask.width, confidenceMask.height);
    for (let i = 0; i < confidence.length; i++) {
      const alpha = Math.max(0, Math.min(1, (confidence[i] - 0.2) / 0.5));
      const pixel = i * 4;
      imageData.data[pixel] = 255;
      imageData.data[pixel + 1] = 255;
      imageData.data[pixel + 2] = 255;
      imageData.data[pixel + 3] = Math.round(alpha * 255);
    }
    this.maskCtx.putImageData(imageData, 0, 0);

    const background = CAMERA_BACKGROUNDS.find(item => item.id === this.currentId);
    this.ctx.save();
    if (this.isMirrored) {
      this.ctx.scale(-1, 1);
      this.ctx.translate(-outputWidth, 0);
    }
    this.drawBackdrop(this.ctx, background, outputWidth, outputHeight);

    this.foregroundCtx.clearRect(0, 0, outputWidth, outputHeight);
    this.foregroundCtx.filter = this.filterCSS;
    this.foregroundCtx.drawImage(this.video, 0, 0, outputWidth, outputHeight);
    this.foregroundCtx.filter = 'none';
    this.foregroundCtx.globalCompositeOperation = 'destination-in';
    this.foregroundCtx.drawImage(this.maskCanvas, 0, 0, outputWidth, outputHeight);
    this.foregroundCtx.globalCompositeOperation = 'source-over';
    this.ctx.drawImage(this.foregroundCanvas, 0, 0);
    this.ctx.restore();
  }

  drawBackdrop(ctx, background, width, height) {
    if (background.id === 'original') {
      ctx.drawImage(this.video, 0, 0, width, height);
      return;
    }

    if (background.id === 'curtain-flowers') {
      ctx.drawImage(this.floralBackdrop, 0, 0, width, height);
      return;
    }

    if (background.id.startsWith('curtain-')) {
      const palette = background.id === 'curtain-pink'
        ? ['#9d2449', '#f1a4b9', '#b92d55', '#ffe0e8', '#b92d55', '#f1a4b9', '#9d2449']
        : ['#8c7554', '#ead8b7', '#b79a6d', '#fff0d7', '#b79a6d', '#ead8b7', '#8c7554'];
      const curtain = ctx.createLinearGradient(0, 0, width, 0);
      palette.forEach((color, index) => curtain.addColorStop(index / (palette.length - 1), color));
      ctx.fillStyle = curtain;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = background.id === 'curtain-pink' ? 'rgba(255, 218, 228, 0.52)' : 'rgba(255, 241, 217, 0.56)';
      ctx.fillRect(0, 0, width, height * 0.08);

      const foldColor = background.id === 'curtain-pink' ? 'rgba(100, 15, 48, 0.22)' : 'rgba(92, 67, 35, 0.2)';
      ctx.strokeStyle = foldColor;
      ctx.lineWidth = Math.max(1, width / 300);
      for (let x = 0; x <= width; x += width / 14) {
        ctx.beginPath();
        ctx.moveTo(x, height * 0.08);
        ctx.bezierCurveTo(x - width * 0.035, height * 0.38, x + width * 0.035, height * 0.7, x, height);
        ctx.stroke();
      }
      return;
    }

    const backdrop = ctx.createLinearGradient(0, 0, 0, height);
    if (background.id === 'plain-white') {
      backdrop.addColorStop(0, '#fffdfa');
      backdrop.addColorStop(1, '#eeeae4');
    } else if (background.id === 'plain-blue') {
      backdrop.addColorStop(0, '#dbeafe');
      backdrop.addColorStop(1, '#93c5fd');
    } else {
      backdrop.addColorStop(0, '#ffe4e6');
      backdrop.addColorStop(1, '#f9a8d4');
    }
    ctx.fillStyle = backdrop;
    ctx.fillRect(0, 0, width, height);
  }

  captureFrame() {
    if (!this.isRunning || !this.canvas.width || !this.canvas.height) {
      throw new Error('Background virtual belum siap. Tunggu kamera beberapa saat lalu coba lagi.');
    }
    return this.canvas.toDataURL('image/jpeg', 0.95);
  }
}

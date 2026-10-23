/**
 * SNAPBOX Camera Management & Multi-Shot Booth Controller
 * Supports front/back mobile camera, mirror mode, countdown, flash FX & gallery upload.
 */

import { soundFX } from './audio.js';

export class CameraBooth {
  constructor(videoElement, flashOverlay, countdownOverlay, countdownNumber, countdownStatusText) {
    this.video = videoElement;
    this.flashOverlay = flashOverlay;
    this.countdownOverlay = countdownOverlay;
    this.countdownNumber = countdownNumber;
    this.countdownStatusText = countdownStatusText;

    this.stream = null;
    this.facingMode = 'user'; // 'user' (front selfie) or 'environment' (back camera)
    this.isMirrored = true;
    this.timerSeconds = 3; // 3s, 5s, 10s
    this.isShooting = false;
    this.capturedPhotos = []; // array of data URLs

    // In-memory capture canvas
    this.captureCanvas = document.createElement('canvas');
    this.captureCtx = this.captureCanvas.getContext('2d');

    // Callbacks
    this.onPhotoCaptured = null; // (index, dataUrl) => {}
    this.onSequenceComplete = null; // (allPhotos) => {}
    this.onStatusChange = null; // (statusText) => {}
  }

  async startCamera() {
    this.stopCamera();

    const constraints = {
      video: {
        facingMode: this.facingMode,
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      },
      audio: false
    };

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Kamera tidak didukung pada browser ini atau koneksi tidak aman (HTTPS/Localhost diperlukan).");
      }

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.video.srcObject = this.stream;
      await this.video.play();
      this.updateMirrorStyle();
      return true;
    } catch (err) {
      console.warn("Camera start failed, falling back to simulated/upload mode:", err);
      throw err;
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  switchCamera() {
    this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
    // Back camera usually shouldn't be mirrored
    if (this.facingMode === 'environment') {
      this.isMirrored = false;
    } else {
      this.isMirrored = true;
    }
    this.updateMirrorStyle();
    return this.startCamera();
  }

  toggleMirror() {
    this.isMirrored = !this.isMirrored;
    this.updateMirrorStyle();
    return this.isMirrored;
  }

  updateMirrorStyle() {
    if (this.isMirrored) {
      this.video.classList.remove('unmirrored');
    } else {
      this.video.classList.add('unmirrored');
    }
  }

  setTimerSeconds(sec) {
    this.timerSeconds = parseInt(sec, 10) || 3;
  }

  /**
   * Take single snapshot from video element
   */
  captureCurrentFrame() {
    const vW = this.video.videoWidth || 640;
    const vH = this.video.videoHeight || 480;

    this.captureCanvas.width = vW;
    this.captureCanvas.height = vH;

    this.captureCtx.save();
    if (this.isMirrored) {
      this.captureCtx.translate(vW, 0);
      this.captureCtx.scale(-1, 1);
    }
    this.captureCtx.drawImage(this.video, 0, 0, vW, vH);
    this.captureCtx.restore();

    return this.captureCanvas.toDataURL('image/jpeg', 0.95);
  }

  /**
   * Trigger screen flash effect
   */
  triggerFlash() {
    soundFX.playShutter();
    this.flashOverlay.classList.add('flashing');
    setTimeout(() => {
      this.flashOverlay.classList.remove('flashing');
    }, 120);
  }

  /**
   * Run automated multi-shot booth sequence
   */
  async startBoothSequence(targetCount, onSlotReady) {
    if (this.isShooting) return;
    this.isShooting = true;
    this.capturedPhotos = [];

    for (let slotIdx = 0; slotIdx < targetCount; slotIdx++) {
      if (!this.isShooting) break; // cancelled

      // 1. Show Pose Preparation Notice
      this.countdownOverlay.classList.add('active');
      this.countdownStatusText.textContent = `Foto ${slotIdx + 1} dari ${targetCount}: Bersiap!`;

      // 2. Countdown loop
      for (let sec = this.timerSeconds; sec > 0; sec--) {
        if (!this.isShooting) break;
        this.countdownNumber.textContent = sec;
        soundFX.playBeep(sec === 1);
        await this.delay(1000);
      }

      if (!this.isShooting) break;

      // 3. Shutter Snapshot
      this.countdownNumber.textContent = '📸';
      this.triggerFlash();
      const photoData = this.captureCurrentFrame();
      this.capturedPhotos.push(photoData);

      if (onSlotReady) {
        onSlotReady(slotIdx, photoData);
      }

      // 4. Brief Breather between shots
      if (slotIdx < targetCount - 1) {
        this.countdownStatusText.textContent = 'Bagus! Ganti pose... ✨';
        this.countdownNumber.textContent = '✌️';
        await this.delay(1500);
      }
    }

    // Sequence completed
    this.countdownOverlay.classList.remove('active');
    this.isShooting = false;
    soundFX.playCelebration();

    if (this.onSequenceComplete) {
      this.onSequenceComplete(this.capturedPhotos);
    }
  }

  cancelSequence() {
    this.isShooting = false;
    this.countdownOverlay.classList.remove('active');
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

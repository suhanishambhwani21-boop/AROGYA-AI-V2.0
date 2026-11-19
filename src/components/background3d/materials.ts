import * as THREE from 'three';

export interface QueueBoardController {
  texture: THREE.CanvasTexture;
  updateToken: (
    currentToken: string,
    counterLabel: string,
    estWaitMins: number,
    waitingList: string[]
  ) => void;
}

export interface ECGMonitorController {
  texture: THREE.CanvasTexture;
  updateWave: (
    time: number,
    occupied: boolean,
    status: 'occupied' | 'free' | 'reserved',
    bpm: number
  ) => void;
}

export interface HospitalMaterialRegistry {
  geometries: THREE.BufferGeometry[];
  materials: THREE.Material[];
  textures: THREE.Texture[];
  trackGeo: <T extends THREE.BufferGeometry>(g: T) => T;
  trackMat: <T extends THREE.Material>(m: T) => T;
  trackTex: <T extends THREE.Texture>(t: T) => T;
  disposeAll: () => void;
}

export function createRegistry(): HospitalMaterialRegistry {
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const textures: THREE.Texture[] = [];

  return {
    geometries,
    materials,
    textures,
    trackGeo<T extends THREE.BufferGeometry>(g: T): T {
      geometries.push(g);
      return g;
    },
    trackMat<T extends THREE.Material>(m: T): T {
      materials.push(m);
      return m;
    },
    trackTex<T extends THREE.Texture>(t: T): T {
      textures.push(t);
      return t;
    },
    disposeAll() {
      geometries.forEach(g => g.dispose());
      materials.forEach(m => m.dispose());
      textures.forEach(t => t.dispose());
      geometries.length = 0;
      materials.length = 0;
      textures.length = 0;
    },
  };
}

export function createFloorTileTexture(
  reg: HospitalMaterialRegistry,
  maxAniso: number,
  baseHex: string,
  groutHex: string,
  accentHex?: string,
  repeatX = 6,
  repeatY = 6
): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, size, size);

  const cells = 4;
  const step = size / cells;

  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      const shade = (r + c) % 2 === 0 ? 'rgba(255,255,255,0.22)' : 'rgba(15,23,42,0.02)';
      ctx.fillStyle = shade;
      ctx.fillRect(c * step + 2, r * step + 2, step - 4, step - 4);
    }
  }

  if (accentHex) {
    ctx.fillStyle = accentHex;
    ctx.globalAlpha = 0.12;
    ctx.fillRect(0, size * 0.48, size, size * 0.04);
    ctx.globalAlpha = 1;
  }

  ctx.strokeStyle = groutHex;
  ctx.lineWidth = 3;
  for (let i = 0; i <= cells; i++) {
    const p = i * step;
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, p);
    ctx.lineTo(size, p);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = maxAniso;
  return reg.trackTex(tex);
}

export function createCharcoalRoadTexture(
  reg: HospitalMaterialRegistry,
  maxAniso: number,
  withBayStencils = true
): THREE.CanvasTexture {
  const w = 512;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Soft charcoal asphalt
  ctx.fillStyle = '#2d3440';
  ctx.fillRect(0, 0, w, h);

  // Subtle surface texture
  for (let i = 0; i < 2400; i++) {
    const x = (i * 73) % w;
    const y = (i * 137) % h;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.06)';
    ctx.fillRect(x, y, 2, 2);
  }

  // Crisp white dashed center line
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 8;
  ctx.setLineDash([32, 24]);
  ctx.beginPath();
  ctx.moveTo(w * 0.5, 8);
  ctx.lineTo(w * 0.5, h - 8);
  ctx.stroke();
  ctx.setLineDash([]);

  // Side white edge lines
  ctx.strokeStyle = 'rgba(248, 250, 252, 0.55)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(16, 0);
  ctx.lineTo(16, h);
  ctx.moveTo(w - 16, 0);
  ctx.lineTo(w - 16, h);
  ctx.stroke();

  if (withBayStencils) {
    // Ambulance bay box
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 6;
    ctx.strokeRect(42, 48, w - 84, h * 0.42);

    // Crimson cross stencil
    ctx.fillStyle = 'rgba(225, 29, 72, 0.85)';
    ctx.fillRect(w * 0.5 - 26, h * 0.22 - 8, 52, 16);
    ctx.fillRect(w * 0.5 - 8, h * 0.22 - 26, 16, 52);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EMERGENCY BAY', w * 0.5, h * 0.39);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return reg.trackTex(tex);
}

export function createSignTexture(
  reg: HospitalMaterialRegistry,
  maxAniso: number,
  label: string,
  bgHex: string,
  textHex: string,
  withCross = false
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = bgHex;
  ctx.fillRect(0, 0, 512, 128);

  // Navy outer architectural border trim (#1e2a44)
  ctx.strokeStyle = '#1e2a44';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, 502, 118);

  ctx.strokeStyle = 'rgba(255,255,255,0.28)';
  ctx.lineWidth = 3;
  ctx.strokeRect(14, 14, 484, 100);

  if (withCross) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(38, 54, 40, 20);
    ctx.fillRect(48, 44, 20, 40);
  }

  ctx.fillStyle = textHex;
  ctx.font = '800 38px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.textAlign = withCross ? 'left' : 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, withCross ? 98 : 256, 65);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return reg.trackTex(tex);
}

export function createNoticeBoardTexture(
  reg: HospitalMaterialRegistry,
  maxAniso: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Cork / warm felt backing
  ctx.fillStyle = '#e6ccb2';
  ctx.fillRect(0, 0, 384, 256);

  // Header strip
  ctx.fillStyle = '#4f46e5';
  ctx.fillRect(0, 0, 384, 38);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('HOSPITAL NOTICES & OPD HOURS', 192, 25);

  // Colorful pinned flyers
  const notes = [
    { x: 22, y: 54, w: 96, h: 80, bg: '#fef08a', pin: '#e11d48', title: 'OPD 8AM-6PM' },
    { x: 142, y: 58, w: 102, h: 74, bg: '#bae6fd', pin: '#4f46e5', title: 'PHARMACY' },
    { x: 264, y: 52, w: 98, h: 86, bg: '#bbf7d0', pin: '#0d9488', title: 'VACCINATION' },
    { x: 34, y: 152, w: 140, h: 82, bg: '#fbcfe8', pin: '#7c3aed', title: 'BLOOD DRIVE' },
    { x: 200, y: 154, w: 150, h: 80, bg: '#ffffff', pin: '#f59e0b', title: 'VISITOR GUIDE' },
  ];

  notes.forEach(n => {
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(n.x + 3, n.y + 4, n.w, n.h);
    ctx.fillStyle = n.bg;
    ctx.fillRect(n.x, n.y, n.w, n.h);

    ctx.fillStyle = '#1e2a44';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(n.title, n.x + 8, n.y + 24);

    ctx.fillStyle = '#64748b';
    ctx.fillRect(n.x + 8, n.y + 34, n.w - 18, 5);
    ctx.fillRect(n.x + 8, n.y + 45, n.w - 28, 5);
    ctx.fillRect(n.x + 8, n.y + 56, n.w - 22, 5);

    ctx.fillStyle = n.pin;
    ctx.beginPath();
    ctx.arc(n.x + n.w * 0.5, n.y + 7, 5, 0, Math.PI * 2);
    ctx.fill();
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return reg.trackTex(tex);
}

export function createWallMapTexture(
  reg: HospitalMaterialRegistry,
  maxAniso: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 384, 256);

  ctx.fillStyle = '#1e2a44';
  ctx.fillRect(0, 0, 384, 38);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('AROGYA AI • FLOOR DIRECTORY', 192, 25);

  // Colored zone blocks matching actual floor tints
  const zones = [
    { x: 20, y: 54, w: 90, h: 80, bg: '#bae6fd', label: 'OPD' },
    { x: 118, y: 54, w: 72, h: 80, bg: '#a7f3d0', label: 'LAB' },
    { x: 198, y: 54, w: 80, h: 80, bg: '#99f6e4', label: 'ICU' },
    { x: 286, y: 54, w: 78, h: 80, bg: '#bbf7d0', label: 'OT' },
    { x: 20, y: 146, w: 120, h: 90, bg: '#e0f2fe', label: 'RECEPTION' },
    { x: 148, y: 146, w: 56, h: 90, bg: '#d1fae5', label: 'CORR' },
    { x: 212, y: 146, w: 152, h: 90, bg: '#ddd6fe', label: 'WARD' },
  ];

  zones.forEach(z => {
    ctx.fillStyle = z.bg;
    ctx.fillRect(z.x, z.y, z.w, z.h);
    ctx.strokeStyle = '#1e2a44';
    ctx.lineWidth = 2;
    ctx.strokeRect(z.x, z.y, z.w, z.h);

    ctx.fillStyle = '#1e2a44';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(z.label, z.x + z.w * 0.5, z.y + z.h * 0.5 + 4);
  });

  // "You are here" marker
  ctx.fillStyle = '#e11d48';
  ctx.beginPath();
  ctx.arc(176, 192, 7, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return reg.trackTex(tex);
}

export function createFramedArtTexture(
  reg: HospitalMaterialRegistry,
  maxAniso: number,
  palette: [string, string, string]
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 192;
  canvas.height = 144;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#fffbeb';
  ctx.fillRect(0, 0, 192, 144);

  // Soft stylized botanical / landscape hills
  ctx.fillStyle = palette[0];
  ctx.beginPath();
  ctx.arc(138, 42, 22, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = palette[1];
  ctx.beginPath();
  ctx.moveTo(0, 144);
  ctx.quadraticCurveTo(64, 65, 192, 118);
  ctx.lineTo(192, 144);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = palette[2];
  ctx.beginPath();
  ctx.moveTo(0, 144);
  ctx.quadraticCurveTo(120, 82, 192, 144);
  ctx.closePath();
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return reg.trackTex(tex);
}

export function createRugTexture(
  reg: HospitalMaterialRegistry,
  maxAniso: number,
  baseHex: string,
  borderHex: string
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = borderHex;
  ctx.lineWidth = 18;
  ctx.strokeRect(16, 16, 224, 224);

  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 4;
  ctx.strokeRect(32, 32, 192, 192);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return reg.trackTex(tex);
}

export function createDirectionArrowTexture(
  reg: HospitalMaterialRegistry,
  maxAniso: number,
  colorHex: string,
  label: string
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 256, 128);

  ctx.fillStyle = colorHex;
  // Arrow shaft + head pointing +X
  ctx.fillRect(24, 48, 130, 32);
  ctx.beginPath();
  ctx.moveTo(150, 20);
  ctx.lineTo(232, 64);
  ctx.lineTo(150, 108);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 95, 64);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return reg.trackTex(tex);
}

export function createQueueBoardController(
  reg: HospitalMaterialRegistry,
  maxAniso: number
): QueueBoardController {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 288;
  const ctx = canvas.getContext('2d')!;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAniso;
  reg.trackTex(texture);

  const updateToken = (
    currentToken: string,
    counterLabel: string,
    estWaitMins: number,
    waitingList: string[]
  ) => {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 512, 288);

    // Indigo header bar
    ctx.fillStyle = '#4f46e5';
    ctx.fillRect(0, 0, 512, 52);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 21px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('AROGYA AI • OPD QUEUE', 20, 33);

    ctx.fillStyle = '#5eead4';
    ctx.font = '800 17px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('LIVE', 490, 33);

    // Main Now Serving box
    ctx.fillStyle = '#1e2a44';
    ctx.fillRect(18, 68, 296, 202);
    ctx.strokeStyle = '#14b8a6';
    ctx.lineWidth = 3;
    ctx.strokeRect(18, 68, 296, 202);

    ctx.fillStyle = '#5eead4';
    ctx.font = '800 18px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('NOW SERVING', 166, 98);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 72px monospace';
    ctx.fillText(currentToken, 166, 168);

    ctx.fillStyle = '#a5b4fc';
    ctx.font = '700 20px system-ui, sans-serif';
    ctx.fillText(counterLabel, 166, 212);

    ctx.fillStyle = '#fde047';
    ctx.font = '800 18px system-ui, sans-serif';
    ctx.fillText(`EST. WAIT: ~${estWaitMins} MIN`, 166, 248);

    // Right column: Next Tokens
    ctx.fillStyle = '#17233b';
    ctx.fillRect(328, 68, 166, 202);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(328, 68, 166, 202);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '700 16px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('UP NEXT', 411, 98);

    waitingList.slice(0, 3).forEach((tok, idx) => {
      const y = 142 + idx * 46;
      ctx.fillStyle = idx === 0 ? '#5eead4' : '#e2e8f0';
      ctx.font = '800 28px monospace';
      ctx.fillText(tok, 411, y);
    });

    texture.needsUpdate = true;
  };

  updateToken('A-101', 'COUNTER 01', 4, ['A-102', 'A-103', 'A-104']);
  return { texture, updateToken };
}

export function createECGMonitorController(
  reg: HospitalMaterialRegistry,
  maxAniso: number
): ECGMonitorController {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAniso;
  reg.trackTex(texture);

  const samplePQRST = (phase: number): number => {
    const p = phase % 1;
    if (p > 0.1 && p < 0.18) {
      return Math.sin(((p - 0.1) / 0.08) * Math.PI) * 0.22;
    }
    if (p >= 0.24 && p < 0.27) {
      return -0.22 * ((p - 0.24) / 0.03);
    }
    if (p >= 0.27 && p < 0.31) {
      return -0.22 + 1.22 * Math.sin(((p - 0.27) / 0.04) * Math.PI * 0.5);
    }
    if (p >= 0.31 && p < 0.35) {
      return 1.0 - 1.38 * ((p - 0.31) / 0.04);
    }
    if (p >= 0.35 && p < 0.39) {
      return -0.38 * (1 - (p - 0.35) / 0.04);
    }
    if (p >= 0.48 && p < 0.62) {
      return Math.sin(((p - 0.48) / 0.14) * Math.PI) * 0.32;
    }
    return 0;
  };

  const updateWave = (
    time: number,
    occupied: boolean,
    status: 'occupied' | 'free' | 'reserved',
    bpm: number
  ) => {
    ctx.fillStyle = '#071324';
    ctx.fillRect(0, 0, 256, 160);

    ctx.strokeStyle = 'rgba(20, 184, 166, 0.14)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= 256; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 160);
      ctx.stroke();
    }
    for (let y = 0; y <= 160; y += 24) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }

    if (occupied) {
      ctx.fillStyle = '#4ade80';
      ctx.font = '700 22px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`HR ${bpm}`, 12, 26);

      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'right';
      ctx.fillText('SpO2 99%', 244, 26);

      const sweepX = ((time * 0.55) % 1) * 256;
      const baseY = 92;
      const amp = 40;

      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let x = 0; x <= 256; x += 4) {
        const distFromSweep = (sweepX - x + 256) % 256;
        if (distFromSweep < 14) {
          ctx.moveTo(x, baseY);
          continue;
        }
        const phase = x / 110 + time * (bpm / 60) * 0.08;
        const y = baseY - samplePQRST(phase) * amp;
        if (x === 0 || distFromSweep < 18) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      const sweepPhase = sweepX / 110 + time * (bpm / 60) * 0.08;
      const dotY = baseY - samplePQRST(sweepPhase) * amp;
      ctx.fillStyle = '#bbf7d0';
      ctx.beginPath();
      ctx.arc(sweepX, dotY, 4.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x <= 256; x += 5) {
        const y = 138 - Math.max(0, Math.sin(x * 0.085 - time * 5.2)) * 14;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    } else {
      const label = status === 'reserved' ? 'RESERVED' : 'FREE';
      const col = status === 'reserved' ? '#fbbf24' : '#34d399';
      ctx.fillStyle = col;
      ctx.font = '800 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(label, 128, 44);

      ctx.strokeStyle = status === 'reserved' ? 'rgba(251, 191, 36, 0.55)' : 'rgba(52, 211, 153, 0.55)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(16, 98);
      ctx.lineTo(240, 98);
      ctx.stroke();

      const scanX = 16 + ((time * 90) % 224);
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(scanX, 98, 3.8, 0, Math.PI * 2);
      ctx.fill();
    }

    texture.needsUpdate = true;
  };

  return { texture, updateWave };
}

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createRegistry } from './materials';
import { HOSPITAL_SCENE_CONFIG, buildHospitalScene } from './HospitalSceneBuilder';

interface HospitalBackground3DProps {
  /** 'contained' fills its parent wrapper (e.g. 70vh landing showcase); 'backdrop' is fixed full-viewport */
  mode?: 'contained' | 'backdrop';
  /** Subtle dimming veil opacity over the 3D scene (e.g., higher on dense data dashboards) */
  scrimOpacity?: number;
  className?: string;
}

// Pre-allocated math helpers outside render loop (zero GC)
const _camPos = new THREE.Vector3();
const _lookTarget = new THREE.Vector3();

function detectSoftwareWebGL(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

function createSkyGradientTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0.0, '#cfe8fc'); // soft sky blue zenith
  grad.addColorStop(0.45, '#e0f2fe'); // crisp light sky blue
  grad.addColorStop(0.82, '#eff8ff'); // airy horizon glow
  grad.addColorStop(1.0, '#f0f9ff');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 16, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export const HospitalBackground3D: React.FC<HospitalBackground3DProps> = ({
  mode = 'contained',
  scrimOpacity = 0,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
        alpha: false,
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const canvas = renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    container.appendChild(canvas);

    // Very light sky-blue gradient background + seamless horizon fog
    const skyTex = createSkyGradientTexture();
    const scene = new THREE.Scene();
    scene.background = skyTex;
    scene.fog = new THREE.Fog(0xe8f4fd, 62, 120);

    // Mandatory Studio Environment Map
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // Camera: Narrower 22-deg FOV near-isometric perspective for crisp 1.6x zoomed cutaway framing
    const initialW = container.clientWidth || window.innerWidth;
    const initialH = Math.max(1, container.clientHeight || window.innerHeight * 0.7);
    const fovDeg = 22;
    const camera = new THREE.PerspectiveCamera(fovDeg, initialW / initialH, 0.5, 165);
    const tanHalfFov = Math.tan(THREE.MathUtils.degToRad(fovDeg * 0.5));

    // Bright, friendly 3-point lighting with lightweight 1024x1024 soft shadows
    const hemiLight = new THREE.HemisphereLight(0xf0f9ff, 0xcbd5e1, 1.05);
    hemiLight.position.set(0, 32, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.8);
    keyLight.position.set(16, 26, 18);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 2;
    keyLight.shadow.camera.far = 75;
    keyLight.shadow.camera.left = -22;
    keyLight.shadow.camera.right = 22;
    keyLight.shadow.camera.top = 14;
    keyLight.shadow.camera.bottom = -14;
    keyLight.shadow.bias = -0.0006;
    keyLight.shadow.normalBias = 0.02;
    keyLight.target.position.set(-0.4, 0, -0.8);
    scene.add(keyLight);
    scene.add(keyLight.target);

    const rimLight = new THREE.DirectionalLight(0xcffafe, 0.65);
    rimLight.position.set(-18, 14, -16);
    rimLight.castShadow = false;
    scene.add(rimLight);

    // Warm reception/corridor fill & clinical ward/ICU/OT fill (non-shadow)
    const receptionFill = new THREE.PointLight(0xfffbeb, 12, 32, 1.4);
    receptionFill.position.set(-3.2, 4.3, 1.0);
    scene.add(receptionFill);

    const wardFill = new THREE.PointLight(0xf0f9ff, 12, 32, 1.4);
    wardFill.position.set(8.8, 4.3, -0.4);
    scene.add(wardFill);

    // Subtle ground apron extending cleanly to the light sky-blue horizon
    const groundApronGeo = new THREE.PlaneGeometry(200, 200);
    groundApronGeo.rotateX(-Math.PI * 0.5);
    const groundApronMat = new THREE.MeshStandardMaterial({
      color: 0xdbeaf5,
      roughness: 0.94,
      metalness: 0.0,
    });
    const groundApron = new THREE.Mesh(groundApronGeo, groundApronMat);
    groundApron.position.y = -0.53;
    groundApron.receiveShadow = true;
    scene.add(groundApron);

    // Build complete living hospital scene
    const reg = createRegistry();
    reg.trackTex(skyTex);
    reg.trackGeo(groundApronGeo);
    reg.trackMat(groundApronMat);
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const hospitalScene = buildHospitalScene(reg, maxAniso, isSoftwareGl);
    scene.add(hospitalScene.root);

    // Sizing helper
    let currentAspect = initialW / initialH;
    const updateSize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = Math.max(1, container.clientHeight || window.innerHeight * 0.7);
      currentAspect = w / h;
      camera.aspect = currentAspect;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);
    window.addEventListener('resize', updateSize);

    // Pre-warm shaders on hardware GPU
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // WebGL Context Loss Safety
    let contextLost = false;
    const onContextLost = (e: Event) => {
      e.preventDefault();
      contextLost = true;
    };
    const onContextRestored = () => {
      contextLost = false;
    };
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    // Animation loop with Software WebGL afterDraw pacing
    let frameId = 0;
    let disposed = false;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const baseAzimuth = 0.11; // ~6.3 deg crisp architectural cutaway offset
    const baseElevation = 0.54; // ~31 deg pitch showing front + back wings unobstructed

    // Campus coverage half-extents (x = -18.5..+17.8, z = -8.9..+6.9, y = 0..4.4)
    const targetHalfWidth = 18.4;
    const targetHalfHeight = 6.75;

    const tick = () => {
      if (disposed) return;
      if (!contextLost) {
        const delta = Math.min(clock.getDelta(), 0.1);
        const elapsed = clock.getElapsedTime();

        // Advance actors, ambulances, helicopter, ECGs, queue tokens, centrifuge
        const animTime = prefersReducedMotion ? elapsed * 0.25 : elapsed;
        const animDelta = prefersReducedMotion ? delta * 0.25 : delta;
        hospitalScene.update(animTime, animDelta);

        // Slow, gentle camera sway (few degrees, zero jumps)
        const swayAmp = prefersReducedMotion ? 0.08 : 1.0;
        const az =
          baseAzimuth +
          Math.sin(elapsed * 0.13) * HOSPITAL_SCENE_CONFIG.speeds.cameraSwayAzimuthRad * swayAmp;
        const el =
          baseElevation +
          Math.cos(elapsed * 0.095) * HOSPITAL_SCENE_CONFIG.speeds.cameraSwayElevationRad * swayAmp;

        // Dynamically fit entire campus edge-to-edge with ~1.6x zoom and zero cropping
        const distForWidth = targetHalfWidth / (Math.max(0.55, currentAspect) * tanHalfFov);
        const distForHeight = targetHalfHeight / tanHalfFov;
        const dist = Math.max(distForWidth, distForHeight);

        const horiz = dist * Math.cos(el);
        _lookTarget.set(
          -0.45 + Math.sin(elapsed * 0.1) * 0.18 * swayAmp,
          0.95,
          -0.85 + Math.cos(elapsed * 0.085) * 0.12 * swayAmp
        );
        _camPos.set(
          _lookTarget.x + horiz * Math.sin(az),
          _lookTarget.y + dist * Math.sin(el),
          _lookTarget.z + horiz * Math.cos(az)
        );

        camera.position.copy(_camPos);
        camera.lookAt(_lookTarget);

        renderer.render(scene, camera);
      }

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateSize);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);

      reg.disposeAll();
      envTarget.dispose();
      renderer.dispose();
      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    };
  }, []);

  const wrapperClass =
    mode === 'backdrop'
      ? `fixed inset-0 z-0 pointer-events-none select-none overflow-hidden ${className}`
      : `relative w-full h-full pointer-events-none select-none overflow-hidden ${className}`;

  if (webglFailed) {
    return (
      <div
        className={`${wrapperClass} bg-linear-to-b from-sky-100 via-sky-50 to-slate-50`}
        aria-hidden="true"
      />
    );
  }

  return (
    <div className={wrapperClass} aria-hidden="true">
      <div ref={mountRef} className="w-full h-full" />
      {scrimOpacity > 0 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: `rgba(241, 245, 249, ${scrimOpacity})` }}
        />
      )}
    </div>
  );
};

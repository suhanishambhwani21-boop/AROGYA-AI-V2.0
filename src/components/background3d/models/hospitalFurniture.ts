import * as THREE from 'three';
import {
  HospitalMaterialRegistry,
  ECGMonitorController,
  QueueBoardController,
  createECGMonitorController,
  createQueueBoardController,
} from '../materials';

export type BedOccupancyStatus = 'occupied' | 'free' | 'reserved';

export interface HospitalBedOptions {
  status: BedOccupancyStatus;
  blanketHex?: string;
  curtainHex?: string;
  sharedEcgController?: ECGMonitorController;
  ecgPhaseOffset?: number;
  bpm?: number;
  withCurtain?: boolean;
}

export interface HospitalBedInstance {
  group: THREE.Group;
  status: BedOccupancyStatus;
  ecgController: ECGMonitorController;
  ecgPhaseOffset: number;
  bpm: number;
  patientSpot: THREE.Group;
}

export interface BedSharedAssets {
  frameSteelMat: THREE.MeshStandardMaterial;
  darkMetalMat: THREE.MeshStandardMaterial;
  headboardMat: THREE.MeshStandardMaterial;
  mattressMat: THREE.MeshStandardMaterial;
  ivBagMat: THREE.MeshPhysicalMaterial;
  wheelGeo: THREE.CylinderGeometry;
  legGeo: THREE.CylinderGeometry;
  deckGeo: THREE.BoxGeometry;
  mattressGeo: THREE.BoxGeometry;
  blanketGeo: THREE.BoxGeometry;
  pillowGeo: THREE.BoxGeometry;
  headboardGeo: THREE.BoxGeometry;
  footboardGeo: THREE.BoxGeometry;
  railGeo: THREE.CylinderGeometry;
  beaconPoleGeo: THREE.CylinderGeometry;
  beaconDomeGeo: THREE.SphereGeometry;
  beaconGlowGeo: THREE.SphereGeometry;
  standBaseGeo: THREE.CylinderGeometry;
  standPoleGeo: THREE.CylinderGeometry;
  monitorBodyGeo: THREE.BoxGeometry;
  screenGeo: THREE.PlaneGeometry;
  ivFootGeo: THREE.BoxGeometry;
  ivPoleGeo: THREE.CylinderGeometry;
  ivHookGeo: THREE.BoxGeometry;
  ivBagGeo: THREE.BoxGeometry;
  curtainRailGeo: THREE.CylinderGeometry;
  curtainGeo: THREE.BoxGeometry;
}

export function createBedSharedAssets(reg: HospitalMaterialRegistry): BedSharedAssets {
  const wheelGeo = reg.trackGeo(new THREE.CylinderGeometry(0.055, 0.055, 0.04, 10));
  wheelGeo.rotateZ(Math.PI * 0.5);
  const railGeo = reg.trackGeo(new THREE.CylinderGeometry(0.018, 0.018, 1.15, 8));
  railGeo.rotateX(Math.PI * 0.5);

  return {
    frameSteelMat: reg.trackMat(
      new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.3, metalness: 0.72 })
    ),
    darkMetalMat: reg.trackMat(
      new THREE.MeshStandardMaterial({ color: '#1e2a44', roughness: 0.45, metalness: 0.55 })
    ),
    headboardMat: reg.trackMat(
      new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.52, metalness: 0.08 })
    ),
    mattressMat: reg.trackMat(
      new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.85, metalness: 0.02 })
    ),
    ivBagMat: reg.trackMat(
      new THREE.MeshPhysicalMaterial({
        color: '#bae6fd',
        roughness: 0.2,
        metalness: 0.0,
        transparent: true,
        opacity: 0.82,
      })
    ),
    wheelGeo,
    legGeo: reg.trackGeo(new THREE.CylinderGeometry(0.032, 0.032, 0.34, 8)),
    deckGeo: reg.trackGeo(new THREE.BoxGeometry(0.96, 0.09, 1.98)),
    mattressGeo: reg.trackGeo(new THREE.BoxGeometry(0.90, 0.16, 1.88)),
    blanketGeo: reg.trackGeo(new THREE.BoxGeometry(0.92, 0.07, 1.22)),
    pillowGeo: reg.trackGeo(new THREE.BoxGeometry(0.54, 0.09, 0.32)),
    headboardGeo: reg.trackGeo(new THREE.BoxGeometry(0.98, 0.64, 0.07)),
    footboardGeo: reg.trackGeo(new THREE.BoxGeometry(0.98, 0.44, 0.06)),
    railGeo,
    beaconPoleGeo: reg.trackGeo(new THREE.CylinderGeometry(0.016, 0.016, 0.45, 8)),
    beaconDomeGeo: reg.trackGeo(new THREE.SphereGeometry(0.078, 12, 10)),
    beaconGlowGeo: reg.trackGeo(new THREE.SphereGeometry(0.16, 10, 8)),
    standBaseGeo: reg.trackGeo(new THREE.CylinderGeometry(0.17, 0.19, 0.05, 12)),
    standPoleGeo: reg.trackGeo(new THREE.CylinderGeometry(0.022, 0.025, 1.24, 8)),
    monitorBodyGeo: reg.trackGeo(new THREE.BoxGeometry(0.46, 0.32, 0.13)),
    screenGeo: reg.trackGeo(new THREE.PlaneGeometry(0.41, 0.26)),
    ivFootGeo: reg.trackGeo(new THREE.BoxGeometry(0.34, 0.024, 0.03)),
    ivPoleGeo: reg.trackGeo(new THREE.CylinderGeometry(0.015, 0.02, 1.7, 8)),
    ivHookGeo: reg.trackGeo(new THREE.BoxGeometry(0.26, 0.018, 0.018)),
    ivBagGeo: reg.trackGeo(new THREE.BoxGeometry(0.11, 0.18, 0.045)),
    curtainRailGeo: reg.trackGeo(new THREE.CylinderGeometry(0.016, 0.016, 1.9, 8)),
    curtainGeo: reg.trackGeo(new THREE.BoxGeometry(0.05, 1.52, 0.72)),
  };
}

export function createHospitalBed(
  reg: HospitalMaterialRegistry,
  maxAniso: number,
  shared: BedSharedAssets,
  opts: HospitalBedOptions
): HospitalBedInstance {
  const {
    status,
    blanketHex,
    curtainHex = '#c7d2fe',
    sharedEcgController,
    ecgPhaseOffset = 0,
    bpm = 74,
    withCurtain = true,
  } = opts;

  const group = new THREE.Group();

  const blanketColor =
    blanketHex ??
    (status === 'occupied' ? '#7dd3fc' : status === 'reserved' ? '#fde68a' : '#a7f3d0');
  const blanketMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: blanketColor, roughness: 0.85, metalness: 0.02 })
  );

  // Wheels + Legs
  [
    [-0.42, -0.90],
    [0.42, -0.90],
    [-0.42, 0.90],
    [0.42, 0.90],
  ].forEach(([x, z]) => {
    const w = new THREE.Mesh(shared.wheelGeo, shared.darkMetalMat);
    w.position.set(x, 0.055, z);
    group.add(w);

    const leg = new THREE.Mesh(shared.legGeo, shared.frameSteelMat);
    leg.position.set(x, 0.25, z);
    group.add(leg);
  });

  const deck = new THREE.Mesh(shared.deckGeo, shared.frameSteelMat);
  deck.position.y = 0.42;
  deck.castShadow = true;
  deck.receiveShadow = true;
  group.add(deck);

  const mattress = new THREE.Mesh(shared.mattressGeo, shared.mattressMat);
  mattress.position.y = 0.54;
  mattress.castShadow = true;
  mattress.receiveShadow = true;
  group.add(mattress);

  const blanket = new THREE.Mesh(shared.blanketGeo, blanketMat);
  blanket.position.set(0, 0.62, 0.30);
  blanket.castShadow = true;
  group.add(blanket);

  const pillow = new THREE.Mesh(shared.pillowGeo, shared.mattressMat);
  pillow.position.set(0, 0.66, -0.66);
  pillow.rotation.x = 0.12;
  group.add(pillow);

  const headboard = new THREE.Mesh(shared.headboardGeo, shared.headboardMat);
  headboard.position.set(0, 0.72, -0.98);
  headboard.castShadow = true;
  group.add(headboard);

  const footboard = new THREE.Mesh(shared.footboardGeo, shared.headboardMat);
  footboard.position.set(0, 0.62, 0.98);
  footboard.castShadow = true;
  group.add(footboard);

  [-0.48, 0.48].forEach(x => {
    const rail = new THREE.Mesh(shared.railGeo, shared.frameSteelMat);
    rail.position.set(x, 0.76, -0.1);
    group.add(rail);
  });

  // Status Beacon (Green free, Red occupied, Amber reserved) + faint glow halo
  const statusColors: Record<BedOccupancyStatus, string> = {
    free: '#22c55e',
    occupied: '#e11d48',
    reserved: '#f59e0b',
  };
  const statusCol = statusColors[status];

  const beaconPole = new THREE.Mesh(shared.beaconPoleGeo, shared.darkMetalMat);
  beaconPole.position.set(0.43, 1.15, -0.96);
  group.add(beaconPole);

  const statusBeaconMat = reg.trackMat(
    new THREE.MeshStandardMaterial({
      color: statusCol,
      emissive: statusCol,
      emissiveIntensity: 1.6,
      roughness: 0.2,
    })
  );
  const beaconDome = new THREE.Mesh(shared.beaconDomeGeo, statusBeaconMat);
  beaconDome.position.set(0.43, 1.40, -0.96);
  group.add(beaconDome);

  const glowMat = reg.trackMat(
    new THREE.MeshBasicMaterial({
      color: statusCol,
      transparent: true,
      opacity: 0.24,
      depthWrite: false,
    })
  );
  const beaconGlow = new THREE.Mesh(shared.beaconGlowGeo, glowMat);
  beaconGlow.position.set(0.43, 1.40, -0.96);
  group.add(beaconGlow);

  // Bedside ECG Monitor
  const ecgController = sharedEcgController ?? createECGMonitorController(reg, maxAniso);
  const monitorGroup = new THREE.Group();
  monitorGroup.position.set(-0.72, 0, -0.66);
  monitorGroup.rotation.y = 0.34;

  const standBase = new THREE.Mesh(shared.standBaseGeo, shared.darkMetalMat);
  standBase.position.y = 0.025;
  monitorGroup.add(standBase);

  const standPole = new THREE.Mesh(shared.standPoleGeo, shared.frameSteelMat);
  standPole.position.y = 0.64;
  monitorGroup.add(standPole);

  const monitorBody = new THREE.Mesh(shared.monitorBodyGeo, shared.darkMetalMat);
  monitorBody.position.set(0, 1.32, 0);
  monitorBody.rotation.x = -0.18;
  monitorGroup.add(monitorBody);

  const screenMat = reg.trackMat(
    new THREE.MeshStandardMaterial({
      map: ecgController.texture,
      emissiveMap: ecgController.texture,
      emissive: new THREE.Color('#ffffff'),
      emissiveIntensity: 0.8,
      roughness: 0.25,
    })
  );
  const screenMesh = new THREE.Mesh(shared.screenGeo, screenMat);
  screenMesh.position.set(0, 0, 0.068);
  monitorBody.add(screenMesh);

  group.add(monitorGroup);

  // IV Stand
  const ivGroup = new THREE.Group();
  ivGroup.position.set(0.68, 0, -0.56);

  for (let a = 0; a < 2; a++) {
    const legBar = new THREE.Mesh(shared.ivFootGeo, shared.frameSteelMat);
    legBar.position.y = 0.03;
    legBar.rotation.y = (a * Math.PI) / 2 + Math.PI / 4;
    ivGroup.add(legBar);
  }

  const ivPole = new THREE.Mesh(shared.ivPoleGeo, shared.frameSteelMat);
  ivPole.position.y = 0.88;
  ivGroup.add(ivPole);

  const ivHook = new THREE.Mesh(shared.ivHookGeo, shared.frameSteelMat);
  ivHook.position.y = 1.72;
  ivGroup.add(ivHook);

  const ivBag = new THREE.Mesh(shared.ivBagGeo, shared.ivBagMat);
  ivBag.position.set(-0.1, 1.59, 0);
  ivGroup.add(ivBag);
  group.add(ivGroup);

  // Privacy Curtain Divider (side rail + partially drawn soft fabric)
  if (withCurtain) {
    const curtainRail = new THREE.Mesh(shared.curtainRailGeo, shared.frameSteelMat);
    curtainRail.rotation.x = Math.PI * 0.5;
    curtainRail.position.set(0.95, 2.05, -0.05);
    group.add(curtainRail);

    const cMat = reg.trackMat(
      new THREE.MeshStandardMaterial({
        color: curtainHex,
        roughness: 0.88,
        transparent: true,
        opacity: 0.82,
      })
    );
    const curtain = new THREE.Mesh(shared.curtainGeo, cMat);
    curtain.position.set(0.95, 1.28, -0.62);
    group.add(curtain);
  }

  const patientSpot = new THREE.Group();
  patientSpot.position.set(0, 0.59, 0.02);
  group.add(patientSpot);

  return {
    group,
    status,
    ecgController,
    ecgPhaseOffset,
    bpm,
    patientSpot,
  };
}

export interface VentilatorInstance {
  group: THREE.Group;
  blinkMat: THREE.MeshStandardMaterial;
}

export function createVentilatorMachine(reg: HospitalMaterialRegistry): VentilatorInstance {
  const group = new THREE.Group();
  const bodyMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: '#f1f5f9', roughness: 0.45, metalness: 0.15 })
  );
  const navyMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: '#1e2a44', roughness: 0.4, metalness: 0.4 })
  );
  const screenMat = reg.trackMat(
    new THREE.MeshStandardMaterial({
      color: '#38bdf8',
      emissive: '#0284c7',
      emissiveIntensity: 0.9,
    })
  );
  const blinkMat = reg.trackMat(
    new THREE.MeshStandardMaterial({
      color: '#22c55e',
      emissive: '#22c55e',
      emissiveIntensity: 1.5,
    })
  );

  const base = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.42, 0.12, 0.42)), navyMat);
  base.position.y = 0.06;
  group.add(base);

  const tower = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.32, 0.92, 0.30)), bodyMat);
  tower.position.y = 0.58;
  tower.castShadow = true;
  group.add(tower);

  const screenBox = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.40, 0.30, 0.10)), navyMat);
  screenBox.position.set(0, 1.18, 0.04);
  screenBox.rotation.x = -0.2;
  group.add(screenBox);

  const scr = new THREE.Mesh(reg.trackGeo(new THREE.PlaneGeometry(0.34, 0.22)), screenMat);
  scr.position.set(0, 0, 0.055);
  screenBox.add(scr);

  const blinkLed = new THREE.Mesh(reg.trackGeo(new THREE.SphereGeometry(0.038, 10, 8)), blinkMat);
  blinkLed.position.set(0.16, 1.36, 0.04);
  group.add(blinkLed);

  return { group, blinkMat };
}

export function createOperatingTheatreRig(reg: HospitalMaterialRegistry): THREE.Group {
  const group = new THREE.Group();
  const steelMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.25, metalness: 0.85 })
  );
  const padMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: '#14b8a6', roughness: 0.72 })
  );
  const drapeMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: '#86efac', roughness: 0.82 })
  );
  const navyMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: '#1e2a44', roughness: 0.4, metalness: 0.5 })
  );
  const lightEmitMat = reg.trackMat(
    new THREE.MeshStandardMaterial({
      color: '#ffffff',
      emissive: '#fef9c3',
      emissiveIntensity: 1.6,
    })
  );

  // Surgical Table Pedestal + Top
  const ped = new THREE.Mesh(reg.trackGeo(new THREE.CylinderGeometry(0.24, 0.32, 0.68, 14)), steelMat);
  ped.position.y = 0.34;
  ped.castShadow = true;
  group.add(ped);

  const tableTop = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.76, 0.10, 2.05)), padMat);
  tableTop.position.y = 0.72;
  tableTop.castShadow = true;
  group.add(tableTop);

  // Sterile draped patient on OT table
  const patientDrape = new THREE.Mesh(reg.trackGeo(new THREE.CapsuleGeometry(0.20, 1.15, 6, 12)), drapeMat);
  patientDrape.rotation.x = Math.PI * 0.5;
  patientDrape.position.set(0, 0.88, 0.05);
  patientDrape.scale.set(1.1, 1.0, 0.75);
  group.add(patientDrape);

  // Overhead Round Surgical Light on Side Support Arm
  const armPole = new THREE.Mesh(reg.trackGeo(new THREE.CylinderGeometry(0.045, 0.045, 2.45, 10)), steelMat);
  armPole.position.set(-0.95, 1.225, -1.15);
  group.add(armPole);

  const armBoom = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(1.1, 0.06, 0.08)), steelMat);
  armBoom.position.set(-0.45, 2.42, -0.58);
  armBoom.rotation.y = -0.78;
  group.add(armBoom);

  const lampHousing = new THREE.Mesh(
    reg.trackGeo(new THREE.CylinderGeometry(0.46, 0.54, 0.14, 20)),
    navyMat
  );
  lampHousing.position.set(0, 2.34, 0);
  lampHousing.castShadow = true;
  group.add(lampHousing);

  const lampLens = new THREE.Mesh(reg.trackGeo(new THREE.CylinderGeometry(0.42, 0.42, 0.04, 18)), lightEmitMat);
  lampLens.position.set(0, 2.26, 0);
  group.add(lampLens);

  // Soft downward light cone glow
  const coneMat = reg.trackMat(
    new THREE.MeshBasicMaterial({
      color: '#fef9c3',
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  const beam = new THREE.Mesh(reg.trackGeo(new THREE.ConeGeometry(0.92, 1.4, 18, 1, true)), coneMat);
  beam.position.set(0, 1.56, 0);
  group.add(beam);

  // Anesthesia workstation beside table head
  const anesBody = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.56, 1.1, 0.44)), navyMat);
  anesBody.position.set(0.95, 0.55, -0.95);
  anesBody.castShadow = true;
  group.add(anesBody);

  const anesScr = new THREE.Mesh(
    reg.trackGeo(new THREE.PlaneGeometry(0.40, 0.28)),
    reg.trackMat(
      new THREE.MeshStandardMaterial({
        color: '#4ade80',
        emissive: '#16a34a',
        emissiveIntensity: 0.85,
      })
    )
  );
  anesScr.position.set(0.95, 1.24, -0.72);
  group.add(anesScr);

  return group;
}

export interface LabStationInstance {
  group: THREE.Group;
  centrifugeRotor: THREE.Group;
}

export function createLabBenchAndCentrifuge(reg: HospitalMaterialRegistry): LabStationInstance {
  const group = new THREE.Group();
  const cabinetMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.55 })
  );
  const topMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: '#1e2a44', roughness: 0.35, metalness: 0.2 })
  );
  const tealMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: '#14b8a6', roughness: 0.4 })
  );
  const whiteMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.4 })
  );

  // Lab Workbench
  const bench = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(2.8, 0.86, 0.78)), cabinetMat);
  bench.position.y = 0.43;
  bench.castShadow = true;
  bench.receiveShadow = true;
  group.add(bench);

  const benchTop = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(2.88, 0.06, 0.84)), topMat);
  benchTop.position.y = 0.89;
  group.add(benchTop);

  // Centrifuge Machine (left on bench)
  const centBody = new THREE.Mesh(reg.trackGeo(new THREE.CylinderGeometry(0.22, 0.25, 0.24, 16)), whiteMat);
  centBody.position.set(-0.75, 1.04, 0.02);
  centBody.castShadow = true;
  group.add(centBody);

  const centLid = new THREE.Mesh(
    reg.trackGeo(new THREE.CylinderGeometry(0.18, 0.20, 0.04, 16)),
    reg.trackMat(
      new THREE.MeshPhysicalMaterial({
        color: '#bae6fd',
        transparent: true,
        opacity: 0.72,
        roughness: 0.15,
      })
    )
  );
  centLid.position.set(-0.75, 1.18, 0.02);
  group.add(centLid);

  // Spinning rotor inside centrifuge
  const centrifugeRotor = new THREE.Group();
  centrifugeRotor.position.set(-0.75, 1.15, 0.02);
  const tubeMat = reg.trackMat(new THREE.MeshStandardMaterial({ color: '#e11d48', roughness: 0.3 }));
  const tubeGeo = reg.trackGeo(new THREE.CylinderGeometry(0.02, 0.02, 0.09, 8));
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    const t = new THREE.Mesh(tubeGeo, tubeMat);
    t.position.set(Math.cos(ang) * 0.11, 0, Math.sin(ang) * 0.11);
    t.rotation.z = 0.35;
    centrifugeRotor.add(t);
  }
  group.add(centrifugeRotor);

  // Lab Microscope (center)
  const microArm = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.08, 0.32, 0.16)), tealMat);
  microArm.position.set(0.05, 1.08, 0);
  group.add(microArm);

  const microTube = new THREE.Mesh(reg.trackGeo(new THREE.CylinderGeometry(0.03, 0.03, 0.22, 10)), topMat);
  microTube.position.set(0.05, 1.24, 0.05);
  microTube.rotation.x = 0.38;
  group.add(microTube);

  // Colorful Sample Rack (right)
  const rack = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.36, 0.08, 0.16)), tealMat);
  rack.position.set(0.75, 0.96, 0.05);
  group.add(rack);

  const vialColors = ['#e11d48', '#4f46e5', '#facc15', '#14b8a6'];
  vialColors.forEach((col, i) => {
    const vial = new THREE.Mesh(
      reg.trackGeo(new THREE.CylinderGeometry(0.022, 0.022, 0.14, 8)),
      reg.trackMat(new THREE.MeshStandardMaterial({ color: col, roughness: 0.3 }))
    );
    vial.position.set(0.62 + i * 0.085, 1.05, 0.05);
    group.add(vial);
  });

  return { group, centrifugeRotor };
}

export function createPharmacyCounter(reg: HospitalMaterialRegistry): THREE.Group {
  const group = new THREE.Group();
  const baseMat = reg.trackMat(new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.45 }));
  const tealMat = reg.trackMat(new THREE.MeshStandardMaterial({ color: '#14b8a6', roughness: 0.5 }));
  const navyMat = reg.trackMat(new THREE.MeshStandardMaterial({ color: '#1e2a44', roughness: 0.45 }));

  const counter = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(2.3, 0.96, 0.74)), baseMat);
  counter.position.y = 0.48;
  counter.castShadow = true;
  group.add(counter);

  const stripe = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(2.32, 0.18, 0.76)), tealMat);
  stripe.position.y = 0.85;
  group.add(stripe);

  // Back shelf unit with colorful medicine boxes
  const shelfFrame = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(2.2, 1.95, 0.32)), navyMat);
  shelfFrame.position.set(0, 0.98, -1.18);
  shelfFrame.castShadow = true;
  group.add(shelfFrame);

  const boxColors = ['#38bdf8', '#fb7185', '#facc15', '#4ade80', '#a78bfa'];
  const boxGeo = reg.trackGeo(new THREE.BoxGeometry(0.18, 0.18, 0.18));
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 6; col++) {
      const boxMat = reg.trackMat(
        new THREE.MeshStandardMaterial({ color: boxColors[(row + col) % boxColors.length], roughness: 0.5 })
      );
      const b = new THREE.Mesh(boxGeo, boxMat);
      b.position.set(-0.78 + col * 0.31, 0.65 + row * 0.46, -1.04);
      group.add(b);
    }
  }

  return group;
}

export function createMedicineTrolley(reg: HospitalMaterialRegistry): THREE.Group {
  const group = new THREE.Group();
  const steelMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.3, metalness: 0.75 })
  );
  const tealMat = reg.trackMat(new THREE.MeshStandardMaterial({ color: '#14b8a6', roughness: 0.5 }));
  const wheelMat = reg.trackMat(new THREE.MeshStandardMaterial({ color: '#1e2a44', roughness: 0.7 }));

  const wheelGeo = reg.trackGeo(new THREE.CylinderGeometry(0.05, 0.05, 0.035, 10));
  wheelGeo.rotateZ(Math.PI * 0.5);
  [
    [-0.22, -0.32],
    [0.22, -0.32],
    [-0.22, 0.32],
    [0.22, 0.32],
  ].forEach(([x, z]) => {
    const w = new THREE.Mesh(wheelGeo, wheelMat);
    w.position.set(x, 0.05, z);
    group.add(w);
  });

  const body = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.52, 0.78, 0.76)), tealMat);
  body.position.y = 0.50;
  body.castShadow = true;
  group.add(body);

  const topTray = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.56, 0.05, 0.80)), steelMat);
  topTray.position.y = 0.92;
  group.add(topTray);

  const handle = new THREE.Mesh(reg.trackGeo(new THREE.CylinderGeometry(0.018, 0.018, 0.52, 8)), steelMat);
  handle.rotation.z = Math.PI * 0.5;
  handle.position.set(0, 1.0, -0.44);
  group.add(handle);

  // Pill bottles on top
  ['#e11d48', '#4f46e5', '#facc15'].forEach((col, i) => {
    const b = new THREE.Mesh(
      reg.trackGeo(new THREE.CylinderGeometry(0.035, 0.035, 0.12, 8)),
      reg.trackMat(new THREE.MeshStandardMaterial({ color: col, roughness: 0.4 }))
    );
    b.position.set(-0.14 + i * 0.14, 1.01, 0.1);
    group.add(b);
  });

  return group;
}

export function createWaterCooler(reg: HospitalMaterialRegistry): THREE.Group {
  const group = new THREE.Group();
  const bodyMat = reg.trackMat(new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.45 }));
  const jugMat = reg.trackMat(
    new THREE.MeshPhysicalMaterial({
      color: '#38bdf8',
      roughness: 0.15,
      transparent: true,
      opacity: 0.76,
    })
  );

  const base = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.42, 0.96, 0.42)), bodyMat);
  base.position.y = 0.48;
  base.castShadow = true;
  group.add(base);

  const jug = new THREE.Mesh(reg.trackGeo(new THREE.CylinderGeometry(0.16, 0.16, 0.46, 14)), jugMat);
  jug.position.y = 1.19;
  group.add(jug);

  return group;
}

export function createHandSanitizerStation(reg: HospitalMaterialRegistry): THREE.Group {
  const group = new THREE.Group();
  const bodyMat = reg.trackMat(new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.4 }));
  const gelMat = reg.trackMat(
    new THREE.MeshStandardMaterial({
      color: '#06b6d4',
      emissive: '#0891b2',
      emissiveIntensity: 0.4,
    })
  );

  const plate = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.24, 0.38, 0.12)), bodyMat);
  group.add(plate);

  const windowMesh = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.12, 0.16, 0.04)), gelMat);
  windowMesh.position.set(0, 0.03, 0.06);
  group.add(windowMesh);

  return group;
}

export function createWallClock(reg: HospitalMaterialRegistry): {
  group: THREE.Group;
  minuteHand: THREE.Mesh;
  hourHand: THREE.Mesh;
} {
  const group = new THREE.Group();
  const rimMat = reg.trackMat(new THREE.MeshStandardMaterial({ color: '#1e2a44', roughness: 0.35 }));
  const faceMat = reg.trackMat(new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.4 }));
  const handMat = reg.trackMat(new THREE.MeshStandardMaterial({ color: '#e11d48', roughness: 0.3 }));

  const rim = new THREE.Mesh(reg.trackGeo(new THREE.CylinderGeometry(0.32, 0.32, 0.06, 24)), rimMat);
  rim.rotation.x = Math.PI * 0.5;
  group.add(rim);

  const face = new THREE.Mesh(reg.trackGeo(new THREE.CylinderGeometry(0.27, 0.27, 0.07, 24)), faceMat);
  face.rotation.x = Math.PI * 0.5;
  group.add(face);

  const minuteHand = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.025, 0.20, 0.02)), rimMat);
  minuteHand.position.set(0, 0, 0.045);
  group.add(minuteHand);

  const hourHand = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.03, 0.14, 0.02)), handMat);
  hourHand.position.set(0, 0, 0.05);
  group.add(hourHand);

  return { group, minuteHand, hourHand };
}

export function createMopBucket(reg: HospitalMaterialRegistry): THREE.Group {
  const group = new THREE.Group();
  const yellowMat = reg.trackMat(new THREE.MeshStandardMaterial({ color: '#facc15', roughness: 0.5 }));
  const darkMat = reg.trackMat(new THREE.MeshStandardMaterial({ color: '#1e2a44', roughness: 0.6 }));

  const tub = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.42, 0.38, 0.48)), yellowMat);
  tub.position.y = 0.24;
  tub.castShadow = true;
  group.add(tub);

  const wringer = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.24, 0.18, 0.22)), darkMat);
  wringer.position.set(0, 0.46, -0.10);
  group.add(wringer);

  return group;
}

export function createWheelchair(reg: HospitalMaterialRegistry): THREE.Group {
  const group = new THREE.Group();
  const chromeMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.25, metalness: 0.85 })
  );
  const fabricMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: '#4f46e5', roughness: 0.8, metalness: 0.04 })
  );
  const tireMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: '#1e2a44', roughness: 0.85, metalness: 0.05 })
  );

  const bigWheelGeo = reg.trackGeo(new THREE.TorusGeometry(0.26, 0.026, 8, 18));
  bigWheelGeo.rotateY(Math.PI * 0.5);
  [-0.31, 0.31].forEach(x => {
    const w = new THREE.Mesh(bigWheelGeo, tireMat);
    w.position.set(x, 0.285, -0.08);
    group.add(w);
  });

  const casterGeo = reg.trackGeo(new THREE.CylinderGeometry(0.08, 0.08, 0.03, 10));
  casterGeo.rotateZ(Math.PI * 0.5);
  [-0.24, 0.24].forEach(x => {
    const c = new THREE.Mesh(casterGeo, tireMat);
    c.position.set(x, 0.08, 0.28);
    group.add(c);
  });

  const seat = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.48, 0.06, 0.44)), fabricMat);
  seat.position.set(0, 0.44, 0.04);
  group.add(seat);

  const backrest = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.46, 0.48, 0.06)), fabricMat);
  backrest.position.set(0, 0.72, -0.17);
  backrest.rotation.x = -0.08;
  group.add(backrest);

  [-0.24, 0.24].forEach(x => {
    const post = new THREE.Mesh(reg.trackGeo(new THREE.CylinderGeometry(0.016, 0.016, 0.52, 8)), chromeMat);
    post.position.set(x, 0.74, -0.2);
    group.add(post);
  });

  return group;
}

export function createStretcher(reg: HospitalMaterialRegistry): THREE.Group {
  const group = new THREE.Group();
  const chromeMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.28, metalness: 0.78 })
  );
  const darkMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: '#1e2a44', roughness: 0.6, metalness: 0.2 })
  );
  const padMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: '#e0f2fe', roughness: 0.8 })
  );
  const pillowMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.85 })
  );

  const wheelGeo = reg.trackGeo(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 10));
  wheelGeo.rotateZ(Math.PI * 0.5);
  [
    [-0.3, -0.78],
    [0.3, -0.78],
    [-0.3, 0.78],
    [0.3, 0.78],
  ].forEach(([x, z]) => {
    const w = new THREE.Mesh(wheelGeo, darkMat);
    w.position.set(x, 0.06, z);
    group.add(w);
  });

  const baseFrame = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.64, 0.05, 1.68)), darkMat);
  baseFrame.position.y = 0.15;
  group.add(baseFrame);

  const topDeck = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.72, 0.06, 1.92)), chromeMat);
  topDeck.position.y = 0.68;
  topDeck.castShadow = true;
  group.add(topDeck);

  const pad = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.68, 0.11, 1.86)), padMat);
  pad.position.y = 0.76;
  group.add(pad);

  const pillow = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.42, 0.08, 0.26)), pillowMat);
  pillow.position.set(0, 0.84, -0.68);
  group.add(pillow);

  return group;
}

export function createReceptionDesk(reg: HospitalMaterialRegistry, accentHex = '#4f46e5'): THREE.Group {
  const group = new THREE.Group();
  const whiteMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.42, metalness: 0.04 })
  );
  const woodMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: '#d4a373', roughness: 0.65 })
  );
  const accentMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: accentHex, roughness: 0.42, metalness: 0.08 })
  );
  const navyMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: '#1e2a44', roughness: 0.4, metalness: 0.35 })
  );
  const screenGlowMat = reg.trackMat(
    new THREE.MeshStandardMaterial({
      color: '#38bdf8',
      emissive: '#0ea5e9',
      emissiveIntensity: 0.85,
    })
  );

  const baseBody = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(2.8, 0.94, 0.76)), whiteMat);
  baseBody.position.y = 0.47;
  baseBody.castShadow = true;
  baseBody.receiveShadow = true;
  group.add(baseBody);

  const frontPanel = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(2.68, 0.62, 0.06)), woodMat);
  frontPanel.position.set(0, 0.40, 0.39);
  group.add(frontPanel);

  const counterTop = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(2.94, 0.08, 0.88)), whiteMat);
  counterTop.position.set(0, 0.98, 0.02);
  counterTop.castShadow = true;
  group.add(counterTop);

  const stripe = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(2.74, 0.09, 0.04)), accentMat);
  stripe.position.set(0, 0.83, 0.40);
  group.add(stripe);

  // Computer monitor
  const bezel = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.54, 0.34, 0.04)), navyMat);
  bezel.position.set(-0.2, 1.24, -0.1);
  group.add(bezel);

  const screen = new THREE.Mesh(reg.trackGeo(new THREE.PlaneGeometry(0.48, 0.28)), screenGlowMat);
  screen.position.set(-0.2, 1.24, -0.125);
  screen.rotation.y = Math.PI;
  group.add(screen);

  return group;
}

/** InstancedMesh builder for all waiting chairs (zero draw-call bloat) */
export function createInstancedWaitingChairs(
  reg: HospitalMaterialRegistry,
  placements: Array<{ x: number; y: number; z: number; rotY: number; color: string }>
): THREE.Group {
  const group = new THREE.Group();
  const count = placements.length;
  if (count === 0) return group;

  const metalMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: '#1e2a44', roughness: 0.38, metalness: 0.65 })
  );
  const seatMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.68, metalness: 0.04 })
  );

  const seatGeo = reg.trackGeo(new THREE.BoxGeometry(0.54, 0.07, 0.48));
  const backGeo = reg.trackGeo(new THREE.BoxGeometry(0.52, 0.50, 0.07));
  const legGeo = reg.trackGeo(new THREE.BoxGeometry(0.06, 0.40, 0.44));

  const seatInst = new THREE.InstancedMesh(seatGeo, seatMat, count);
  const backInst = new THREE.InstancedMesh(backGeo, seatMat, count);
  const legInst = new THREE.InstancedMesh(legGeo, metalMat, count);
  seatInst.castShadow = true;
  seatInst.receiveShadow = true;
  backInst.castShadow = true;

  const dummy = new THREE.Object3D();
  const col = new THREE.Color();

  placements.forEach((p, idx) => {
    col.set(p.color);

    // Seat
    dummy.position.set(p.x, p.y + 0.44, p.z);
    dummy.rotation.set(0, p.rotY, 0);
    dummy.updateMatrix();
    seatInst.setMatrixAt(idx, dummy.matrix);
    seatInst.setColorAt(idx, col);

    // Backrest (offset behind seat in local -Z)
    const bx = p.x - Math.sin(p.rotY) * 0.21;
    const bz = p.z - Math.cos(p.rotY) * 0.21;
    dummy.position.set(bx, p.y + 0.71, bz);
    dummy.rotation.set(-0.1, p.rotY, 0);
    dummy.updateMatrix();
    backInst.setMatrixAt(idx, dummy.matrix);
    backInst.setColorAt(idx, col);

    // Support leg
    dummy.position.set(p.x, p.y + 0.20, p.z);
    dummy.rotation.set(0, p.rotY, 0);
    dummy.updateMatrix();
    legInst.setMatrixAt(idx, dummy.matrix);
  });

  seatInst.instanceMatrix.needsUpdate = true;
  backInst.instanceMatrix.needsUpdate = true;
  legInst.instanceMatrix.needsUpdate = true;
  if (seatInst.instanceColor) seatInst.instanceColor.needsUpdate = true;
  if (backInst.instanceColor) backInst.instanceColor.needsUpdate = true;

  seatInst.computeBoundingSphere();
  backInst.computeBoundingSphere();
  legInst.computeBoundingSphere();

  group.add(seatInst, backInst, legInst);
  return group;
}

export function createQueueDisplayBoard(
  reg: HospitalMaterialRegistry,
  maxAniso: number
): { group: THREE.Group; controller: QueueBoardController } {
  const group = new THREE.Group();
  const controller = createQueueBoardController(reg, maxAniso);

  const bezelMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: '#1e2a44', roughness: 0.35, metalness: 0.55 })
  );
  const screenMat = reg.trackMat(
    new THREE.MeshStandardMaterial({
      map: controller.texture,
      emissiveMap: controller.texture,
      emissive: new THREE.Color('#ffffff'),
      emissiveIntensity: 0.9,
      roughness: 0.2,
    })
  );

  const frame = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(2.65, 1.52, 0.12)), bezelMat);
  frame.castShadow = true;
  group.add(frame);

  const screen = new THREE.Mesh(reg.trackGeo(new THREE.PlaneGeometry(2.48, 1.36)), screenMat);
  screen.position.z = 0.065;
  group.add(screen);

  // Subtle ambient screen glow halo
  const haloMat = reg.trackMat(
    new THREE.MeshBasicMaterial({
      color: '#4f46e5',
      transparent: true,
      opacity: 0.14,
      depthWrite: false,
    })
  );
  const halo = new THREE.Mesh(reg.trackGeo(new THREE.PlaneGeometry(2.85, 1.72)), haloMat);
  halo.position.z = 0.055;
  group.add(halo);

  return { group, controller };
}

export function createPottedPlant(reg: HospitalMaterialRegistry): THREE.Group {
  const group = new THREE.Group();
  const potMat = reg.trackMat(new THREE.MeshStandardMaterial({ color: '#fb7185', roughness: 0.65 }));
  const leafMat1 = reg.trackMat(new THREE.MeshStandardMaterial({ color: '#16a34a', roughness: 0.7 }));
  const leafMat2 = reg.trackMat(new THREE.MeshStandardMaterial({ color: '#4ade80', roughness: 0.65 }));

  const pot = new THREE.Mesh(reg.trackGeo(new THREE.CylinderGeometry(0.22, 0.16, 0.36, 12)), potMat);
  pot.position.y = 0.18;
  pot.castShadow = true;
  group.add(pot);

  const leafGeo = reg.trackGeo(new THREE.SphereGeometry(0.15, 8, 6));
  for (let i = 0; i < 6; i++) {
    const ang = i * 1.05;
    const leaf = new THREE.Mesh(leafGeo, i % 2 === 0 ? leafMat1 : leafMat2);
    leaf.scale.set(0.75, 1.45, 0.45);
    leaf.position.set(Math.cos(ang) * 0.11, 0.52 + (i % 2) * 0.08, Math.sin(ang) * 0.11);
    leaf.rotation.set(0.32, ang, 0.22);
    group.add(leaf);
  }

  return group;
}

export function createLawnTree(reg: HospitalMaterialRegistry, scale = 1.0): THREE.Group {
  const group = new THREE.Group();
  const trunkMat = reg.trackMat(new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.9 }));
  const canopyMat1 = reg.trackMat(new THREE.MeshStandardMaterial({ color: '#22c55e', roughness: 0.78 }));
  const canopyMat2 = reg.trackMat(new THREE.MeshStandardMaterial({ color: '#16a34a', roughness: 0.8 }));

  const trunk = new THREE.Mesh(reg.trackGeo(new THREE.CylinderGeometry(0.16, 0.22, 1.35, 10)), trunkMat);
  trunk.position.y = 0.675;
  trunk.castShadow = true;
  group.add(trunk);

  const c1 = new THREE.Mesh(reg.trackGeo(new THREE.SphereGeometry(0.88, 12, 10)), canopyMat1);
  c1.position.y = 1.85;
  c1.castShadow = true;
  group.add(c1);

  const c2 = new THREE.Mesh(reg.trackGeo(new THREE.SphereGeometry(0.65, 10, 8)), canopyMat2);
  c2.position.set(0.35, 2.25, 0.2);
  group.add(c2);

  group.scale.setScalar(scale);
  return group;
}

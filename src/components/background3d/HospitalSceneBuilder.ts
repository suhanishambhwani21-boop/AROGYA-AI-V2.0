import * as THREE from 'three';
import {
  ECGMonitorController,
  HospitalMaterialRegistry,
  createCharcoalRoadTexture,
  createDirectionArrowTexture,
  createECGMonitorController,
  createFloorTileTexture,
  createFramedArtTexture,
  createNoticeBoardTexture,
  createRugTexture,
  createSignTexture,
  createWallMapTexture,
} from './materials';
import {
  CASUAL_PANTS,
  CASUAL_SHIRTS,
  HAIR_COLORS,
  HairStyle,
  SKIN_TONES,
  StylizedPersonRig,
  animateWalkingRig,
  createStylizedPerson,
} from './models/people';
import {
  BedOccupancyStatus,
  HospitalBedInstance,
  VentilatorInstance,
  createBedSharedAssets,
  createHandSanitizerStation,
  createHospitalBed,
  createInstancedWaitingChairs,
  createLabBenchAndCentrifuge,
  createLawnTree,
  createMedicineTrolley,
  createMopBucket,
  createOperatingTheatreRig,
  createPharmacyCounter,
  createPottedPlant,
  createQueueDisplayBoard,
  createReceptionDesk,
  createStretcher,
  createVentilatorMachine,
  createWallClock,
  createWaterCooler,
  createWheelchair,
} from './models/hospitalFurniture';
import {
  AmbulanceInstance,
  HelicopterInstance,
  createAmbulance,
  createHelicopter,
  createHelipadDeck,
} from './models/ambulance';

/**
 * Central configuration for all actor counts, ward capacities, cycle durations, and animation speeds.
 */
export const HOSPITAL_SCENE_CONFIG = {
  counts: {
    waitingChairs: 14,
    seatedPatients: 8,
    generalWardBeds: 10,
    icuBeds: 4,
    surgicalTeamMembers: 3,
    ambulances: 2,
    lawnTrees: 6,
  },
  speeds: {
    cameraSwayAzimuthRad: 0.055,
    cameraSwayElevationRad: 0.018,
    tokenTickIntervalSec: 5.5,
    ambulance1CycleSec: 25.0,
    ambulance2CycleSec: 29.0,
    ambulance2PhaseOffsetSec: 13.0,
    helicopterCycleSec: 34.0,
    wheelchairPatrolSec: 22.0,
    stretcherPatrolSec: 26.0,
    trolleyPatrolSec: 20.0,
    doctorRoundsSpeed: 0.95,
    centrifugeRpmRad: 14.0,
    ecgRefreshIntervalSec: 0.05,
  },
  palette: {
    navyTrim: '#1e2a44',
    indigoSign: '#4f46e5',
    tealSign: '#14b8a6',
    violetSign: '#7c3aed',
    crimsonEmergency: '#e11d48',
    receptionFloor: '#e0f2fe',
    corridorFloor: '#dcfce7',
    wardFloor: '#ede9fe',
    icuFloor: '#cffafe',
    theatreFloor: '#d1fae5',
    labFloor: '#f0f9ff',
    lawnGreen: '#86efac',
  },
} as const;

export interface HospitalSceneController {
  root: THREE.Group;
  update: (elapsedTime: number, deltaTime: number) => void;
}

interface WalkerActor {
  rig: StylizedPersonRig;
  xStart: number;
  xEnd: number;
  z: number;
  speed: number;
  phaseOffset: number;
  pauseDuration: number;
}

const TOKEN_SEQUENCE = [
  'A-101',
  'A-102',
  'A-103',
  'A-104',
  'A-105',
  'A-106',
  'A-107',
  'A-108',
  'A-109',
  'A-110',
];

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function buildHospitalScene(
  reg: HospitalMaterialRegistry,
  maxAniso: number,
  isSoftwareGl: boolean
): HospitalSceneController {
  const root = new THREE.Group();
  const { palette, speeds } = HOSPITAL_SCENE_CONFIG;

  // =========================================================================
  // 1. ARCHITECTURAL PLINTH, LAWN, CHARCOAL ROAD & COLORFUL AREA FLOORS
  // =========================================================================
  const navyMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: palette.navyTrim, roughness: 0.55, metalness: 0.2 })
  );
  const plinth = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(38.0, 0.5, 17.6)), navyMat);
  plinth.position.set(-0.5, -0.28, -0.9);
  plinth.receiveShadow = true;
  root.add(plinth);

  // Green Lawns flanking left & right of campus
  const lawnMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: palette.lawnGreen, roughness: 0.9, metalness: 0.0 })
  );
  const leftLawn = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(3.8, 0.08, 17.4)), lawnMat);
  leftLawn.position.set(-17.6, -0.01, -0.9);
  leftLawn.receiveShadow = true;
  root.add(leftLawn);

  const rightLawn = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(2.8, 0.08, 17.4)), lawnMat);
  rightLawn.position.set(17.1, -0.01, -0.9);
  rightLawn.receiveShadow = true;
  root.add(rightLawn);

  // Stylized Lawn Trees
  const treePositions: Array<[number, number, number]> = [
    [-18.0, -6.5, 1.0],
    [-17.4, -1.5, 0.88],
    [-18.1, 3.8, 1.05],
    [-17.2, 6.4, 0.82],
    [17.2, -5.8, 0.96],
    [17.3, 4.2, 1.02],
  ];
  treePositions.slice(0, HOSPITAL_SCENE_CONFIG.counts.lawnTrees).forEach(([x, z, s]) => {
    const tree = createLawnTree(reg, s);
    tree.position.set(x, 0.03, z);
    root.add(tree);
  });

  // Charcoal Road with white dashes (x = -15.7 to -10.5)
  const roadBayTex = createCharcoalRoadTexture(reg, maxAniso, true);
  const roadStripTex = createCharcoalRoadTexture(reg, maxAniso, false);
  const roadBayMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ map: roadBayTex, roughness: 0.88, metalness: 0.04 })
  );
  const roadStripMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ map: roadStripTex, roughness: 0.9, metalness: 0.04 })
  );

  const mainRoad = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(5.2, 0.06, 17.4)), roadBayMat);
  mainRoad.position.set(-13.1, -0.01, -0.9);
  mainRoad.receiveShadow = true;
  root.add(mainRoad);

  const roadFront = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(5.2, 0.04, 14)), roadStripMat);
  roadFront.position.set(-13.1, -0.02, 14.8);
  roadFront.receiveShadow = true;
  root.add(roadFront);

  const roadBack = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(5.2, 0.04, 14)), roadStripMat);
  roadBack.position.set(-13.1, -0.02, -16.6);
  roadBack.receiveShadow = true;
  root.add(roadBack);

  // Sidewalk curb (x = -10.5 to -9.6)
  const curbMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.72 })
  );
  const sidewalk = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.95, 0.12, 16.2)), curbMat);
  sidewalk.position.set(-10.05, 0.04, -0.9);
  sidewalk.receiveShadow = true;
  root.add(sidewalk);

  // --- Interior Colored Area Floors ---
  const addFloorZone = (
    x: number,
    z: number,
    w: number,
    d: number,
    baseHex: string,
    groutHex: string,
    accentHex: string
  ) => {
    const tex = createFloorTileTexture(reg, maxAniso, baseHex, groutHex, accentHex, Math.round(w / 1.8), Math.round(d / 1.8));
    const mat = reg.trackMat(new THREE.MeshStandardMaterial({ map: tex, roughness: 0.56, metalness: 0.03 }));
    const mesh = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(w, 0.06, d)), mat);
    mesh.position.set(x, 0, z);
    mesh.receiveShadow = true;
    root.add(mesh);
  };

  // Front Wing (z = -2.4 to +6.8 -> center z = +2.2, depth = 9.2)
  addFloorZone(-5.4, 2.2, 8.4, 9.2, palette.receptionFloor, '#bae6fd', '#4f46e5'); // Reception: pale blue
  addFloorZone(0.8, 2.2, 4.0, 9.2, palette.corridorFloor, '#bbf7d0', '#14b8a6'); // Corridor: pale mint
  addFloorZone(9.3, 2.2, 13.0, 9.2, palette.wardFloor, '#ddd6fe', '#7c3aed'); // General Ward: pale lavender

  // Back Wing (z = -8.8 to -2.4 -> center z = -5.6, depth = 6.4)
  addFloorZone(-4.4, -5.6, 10.4, 6.4, palette.labFloor, '#bae6fd', '#14b8a6'); // Pharmacy & Lab
  addFloorZone(4.8, -5.6, 8.0, 6.4, palette.icuFloor, '#a5f3fc', '#0ea5e9'); // ICU: soft aqua
  addFloorZone(12.3, -5.6, 7.0, 6.4, palette.theatreFloor, '#a7f3d0', '#16a34a'); // Operation Theatre: light green

  // =========================================================================
  // 2. CUTAWAY WALLS WITH NAVY (#1e2a44) TRIM & ARCHWAYS
  // =========================================================================
  const wallMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.72, metalness: 0.02 })
  );
  const glassMat = reg.trackMat(
    new THREE.MeshPhysicalMaterial({
      color: '#bae6fd',
      roughness: 0.1,
      transparent: true,
      opacity: 0.45,
    })
  );

  const wallT = 0.20;
  const backWallH = 3.25;
  const midWallH = 1.48; // Low cutaway divider so Back Wing rooms remain 100% visible

  // Outer Back Wall (z = -8.8, x = -9.6 to +15.8)
  const backWall = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(25.4, backWallH, wallT)), wallMat);
  backWall.position.set(3.1, backWallH * 0.5, -8.8);
  backWall.castShadow = true;
  backWall.receiveShadow = true;
  root.add(backWall);

  const backCap = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(25.46, 0.08, wallT + 0.05)), navyMat);
  backCap.position.set(3.1, backWallH + 0.04, -8.8);
  root.add(backCap);

  // Outer Right Wall (x = +15.8, z = -8.8 to +6.8, stepped cutaway down toward front)
  const rightWallBack = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(wallT, backWallH, 6.4)), wallMat);
  rightWallBack.position.set(15.8, backWallH * 0.5, -5.6);
  rightWallBack.castShadow = true;
  root.add(rightWallBack);

  const rightCapBack = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(wallT + 0.05, 0.08, 6.4)), navyMat);
  rightCapBack.position.set(15.8, backWallH + 0.04, -5.6);
  root.add(rightCapBack);

  const rightWallFront = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(wallT, midWallH, 9.2)), wallMat);
  rightWallFront.position.set(15.8, midWallH * 0.5, 2.2);
  rightWallFront.castShadow = true;
  root.add(rightWallFront);

  const rightCapFront = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(wallT + 0.05, 0.08, 9.2)), navyMat);
  rightCapFront.position.set(15.8, midWallH + 0.04, 2.2);
  root.add(rightCapFront);

  // Back Wing Internal Partitions (at x = +0.8 and x = +8.8)
  [0.8, 8.8].forEach(xPos => {
    const p = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(wallT, backWallH * 0.85, 6.4)), wallMat);
    p.position.set(xPos, backWallH * 0.425, -5.6);
    p.castShadow = true;
    root.add(p);

    const cap = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(wallT + 0.04, 0.08, 6.4)), navyMat);
    cap.position.set(xPos, backWallH * 0.85 + 0.04, -5.6);
    root.add(cap);
  });

  // Mid-Divider Cutaway Wall at z = -2.4 separating Back Wing & Front Wing (with doorway gaps)
  const midSegments: Array<[number, number]> = [
    [-9.6, -5.4],
    [-3.6, 0.2],
    [1.8, 5.2],
    [6.8, 10.6],
    [12.4, 15.8],
  ];
  midSegments.forEach(([x1, x2]) => {
    const w = x2 - x1;
    const cx = (x1 + x2) * 0.5;
    const seg = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(w, midWallH, wallT)), wallMat);
    seg.position.set(cx, midWallH * 0.5, -2.4);
    seg.castShadow = true;
    seg.receiveShadow = true;
    root.add(seg);

    const cap = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(w, 0.07, wallT + 0.04)), navyMat);
    cap.position.set(cx, midWallH + 0.035, -2.4);
    root.add(cap);
  });

  // Left Entrance Wall (x = -9.6, doorway gap at z = -0.2 to +3.0)
  const leftSegBack = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(wallT, backWallH, 8.6)), wallMat);
  leftSegBack.position.set(-9.6, backWallH * 0.5, -4.5);
  leftSegBack.castShadow = true;
  root.add(leftSegBack);

  const leftCapBack = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(wallT + 0.04, 0.08, 8.6)), navyMat);
  leftCapBack.position.set(-9.6, backWallH + 0.04, -4.5);
  root.add(leftCapBack);

  const leftSegFront = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(wallT, midWallH, 3.8)), wallMat);
  leftSegFront.position.set(-9.6, midWallH * 0.5, 4.9);
  leftSegFront.castShadow = true;
  root.add(leftSegFront);

  const leftCapFront = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(wallT + 0.04, 0.08, 3.8)), navyMat);
  leftCapFront.position.set(-9.6, midWallH + 0.04, 4.9);
  root.add(leftCapFront);

  // Automatic Sliding Glass Doors at Emergency Entrance (x = -9.6, z = -0.2 to +3.0 -> center +1.4)
  const doorSlideLeft = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.06, 2.35, 1.56)), glassMat);
  doorSlideLeft.position.set(-9.6, 1.18, 0.62);
  root.add(doorSlideLeft);

  const doorSlideRight = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.06, 2.35, 1.56)), glassMat);
  doorSlideRight.position.set(-9.6, 1.18, 2.18);
  root.add(doorSlideRight);

  // Front Wing Partition Walls (x = -1.2 and x = +2.8, doorway gaps at z = +0.1 to +3.1)
  [-1.2, 2.8].forEach(xPos => {
    const segB = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(wallT, midWallH, 2.5)), wallMat);
    segB.position.set(xPos, midWallH * 0.5, -1.15);
    segB.castShadow = true;
    root.add(segB);

    const capB = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(wallT + 0.04, 0.07, 2.5)), navyMat);
    capB.position.set(xPos, midWallH + 0.035, -1.15);
    root.add(capB);

    const segF = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(wallT, 1.15, 3.7)), wallMat);
    segF.position.set(xPos, 0.575, 4.95);
    segF.castShadow = true;
    root.add(segF);

    const capF = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(wallT + 0.04, 0.07, 3.7)), navyMat);
    capF.position.set(xPos, 1.185, 4.95);
    root.add(capF);
  });

  // =========================================================================
  // 3. EMERGENCY ENTRANCE, CRIMSON CANOPY, HELIPAD & 2 AMBULANCES
  // =========================================================================
  const canopyMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.4 })
  );
  const crimsonMat = reg.trackMat(
    new THREE.MeshStandardMaterial({
      color: palette.crimsonEmergency,
      emissive: '#9f1239',
      emissiveIntensity: 0.35,
      roughness: 0.35,
    })
  );

  const canopyRoof = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(2.3, 0.20, 4.0)), canopyMat);
  canopyRoof.position.set(-10.75, 2.85, 1.4);
  canopyRoof.castShadow = true;
  root.add(canopyRoof);

  const canopyTrim = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.12, 0.32, 4.06)), crimsonMat);
  canopyTrim.position.set(-11.88, 2.85, 1.4);
  root.add(canopyTrim);

  const emergSignTex = createSignTexture(reg, maxAniso, 'EMERGENCY', palette.crimsonEmergency, '#ffffff', true);
  const emergSignMat = reg.trackMat(
    new THREE.MeshStandardMaterial({
      map: emergSignTex,
      emissiveMap: emergSignTex,
      emissive: new THREE.Color('#ffffff'),
      emissiveIntensity: 0.38,
    })
  );
  const emergSignFront = new THREE.Mesh(reg.trackGeo(new THREE.PlaneGeometry(2.2, 0.54)), emergSignMat);
  emergSignFront.position.set(-10.75, 2.88, 3.42);
  root.add(emergSignFront);

  // Rooftop Helipad Deck (back-left over emergency staging zone, leaving interior unroofed)
  const helipad = createHelipadDeck(reg);
  helipad.position.set(-13.1, 0, -6.2);
  root.add(helipad);

  const helicopter: HelicopterInstance = createHelicopter(reg);
  root.add(helicopter.group);

  // Ambulance 1 & Ambulance 2
  const ambulance1: AmbulanceInstance = createAmbulance(reg, isSoftwareGl);
  const ambulance2: AmbulanceInstance = createAmbulance(reg, isSoftwareGl);
  root.add(ambulance1.group, ambulance2.group);

  // Shared Paramedics & Stretcher Helper
  const makeEmergCrew = (skinA: number, skinB: number, skinP: number) => {
    const grp = new THREE.Group();
    grp.add(createStretcher(reg));
    const pat = createStylizedPerson(reg, {
      role: 'patient_gown',
      pose: 'lying',
      skinHex: SKIN_TONES[skinP],
      hairHex: HAIR_COLORS[1],
      hairStyle: 'short',
      heightScale: 0.96,
    });
    pat.group.position.set(0, 0.65, 0);
    grp.add(pat.group);

    const pRear = createStylizedPerson(reg, {
      role: 'paramedic',
      pose: 'pushing',
      skinHex: SKIN_TONES[skinA],
      hairHex: HAIR_COLORS[0],
      hairStyle: 'short',
      heightScale: 1.02,
    });
    pRear.group.position.set(0, 0, -1.32);
    grp.add(pRear.group);

    const pFront = createStylizedPerson(reg, {
      role: 'paramedic',
      pose: 'standing',
      skinHex: SKIN_TONES[skinB],
      hairHex: HAIR_COLORS[2],
      hairStyle: 'bun',
      heightScale: 0.96,
    });
    pFront.group.position.set(0, 0, 1.32);
    grp.add(pFront.group);

    root.add(grp);
    return { grp, pat, pRear, pFront };
  };

  const crew1 = makeEmergCrew(3, 0, 2);
  const crew2 = makeEmergCrew(5, 1, 4);

  // =========================================================================
  // 4. RECEPTION & OPD HALL (x = -9.6 to -1.2, z = -2.4 to +6.8)
  // =========================================================================
  // Warm area rug under waiting chairs
  const rugTex = createRugTexture(reg, maxAniso, '#e0e7ff', '#4f46e5');
  const rug = new THREE.Mesh(
    reg.trackGeo(new THREE.PlaneGeometry(6.6, 4.2)),
    reg.trackMat(new THREE.MeshStandardMaterial({ map: rugTex, roughness: 0.92 }))
  );
  rug.rotation.x = -Math.PI * 0.5;
  rug.position.set(-5.3, 0.035, 3.4);
  rug.receiveShadow = true;
  root.add(rug);

  // Reception Signboard (Indigo #4f46e5 + Navy trim)
  const recepSignTex = createSignTexture(reg, maxAniso, 'RECEPTION & OPD', palette.indigoSign, '#ffffff', false);
  const recepSign = new THREE.Mesh(
    reg.trackGeo(new THREE.PlaneGeometry(2.8, 0.66)),
    reg.trackMat(new THREE.MeshStandardMaterial({ map: recepSignTex, roughness: 0.35 }))
  );
  recepSign.position.set(-7.4, 2.15, -2.28);
  root.add(recepSign);

  // Queue Token Display Board ("NOW SERVING", A-1xx, "EST. WAIT")
  const { group: queueBoardGroup, controller: queueBoardCtrl } = createQueueDisplayBoard(reg, maxAniso);
  queueBoardGroup.position.set(-3.8, 2.25, -2.26);
  root.add(queueBoardGroup);

  // Wall Clock (animated hands!) mounted on left/back reception wall
  const wallClock = createWallClock(reg);
  wallClock.group.position.set(-9.45, 2.35, -0.8);
  wallClock.group.rotation.y = Math.PI * 0.5;
  root.add(wallClock.group);

  // Notice Board mounted on left interior wall
  const noticeTex = createNoticeBoardTexture(reg, maxAniso);
  const noticeBoard = new THREE.Mesh(
    reg.trackGeo(new THREE.BoxGeometry(0.08, 1.15, 1.7)),
    reg.trackMat(new THREE.MeshStandardMaterial({ map: noticeTex, roughness: 0.65 }))
  );
  noticeBoard.position.set(-9.46, 1.9, -4.6);
  root.add(noticeBoard);

  // Framed Art Pictures on Reception wall
  const art1Tex = createFramedArtTexture(reg, maxAniso, ['#facc15', '#14b8a6', '#4f46e5']);
  const art1 = new THREE.Mesh(
    reg.trackGeo(new THREE.BoxGeometry(0.06, 0.85, 1.1)),
    reg.trackMat(new THREE.MeshStandardMaterial({ map: art1Tex, roughness: 0.5 }))
  );
  art1.position.set(-9.46, 1.85, -6.5);
  root.add(art1);

  // Desk 1 (Main Receptionist Desk) & Desk 2 (Nurse OPD Triage Desk)
  const desk1 = createReceptionDesk(reg, palette.indigoSign);
  desk1.position.set(-7.1, 0.03, -0.75);
  root.add(desk1);

  const receptionist = createStylizedPerson(reg, {
    role: 'receptionist',
    pose: 'standing',
    skinHex: SKIN_TONES[1],
    hairHex: HAIR_COLORS[0],
    hairStyle: 'bun',
    heightScale: 0.96,
  });
  receptionist.group.position.set(-7.1, 0.03, -1.45);
  root.add(receptionist.group);

  const desk2 = createReceptionDesk(reg, palette.tealSign);
  desk2.position.set(-3.4, 0.03, -0.75);
  root.add(desk2);

  const triageNurse = createStylizedPerson(reg, {
    role: 'nurse',
    pose: 'standing',
    skinHex: SKIN_TONES[3],
    hairHex: HAIR_COLORS[1],
    hairStyle: 'bob',
    scrubHex: '#14b8a6',
    heightScale: 0.95,
  });
  triageNurse.group.position.set(-3.4, 0.03, -1.45);
  root.add(triageNurse.group);

  // Visitor at Desk 1 & Elderly Person with Walking Stick at Desk 2
  const deskVisitor = createStylizedPerson(reg, {
    role: 'patient_casual',
    pose: 'standing',
    skinHex: SKIN_TONES[4],
    hairHex: HAIR_COLORS[0],
    hairStyle: 'short',
    shirtHex: CASUAL_SHIRTS[0],
    heightScale: 1.0,
  });
  deskVisitor.group.position.set(-7.0, 0.03, 0.25);
  deskVisitor.group.rotation.y = Math.PI;
  root.add(deskVisitor.group);

  const elderlyPatient = createStylizedPerson(reg, {
    role: 'patient_casual',
    pose: 'standing',
    skinHex: SKIN_TONES[0],
    hairHex: HAIR_COLORS[4], // silver-grey
    hairStyle: 'parted',
    shirtHex: CASUAL_SHIRTS[2], // warm yellow
    heightScale: 0.94,
    prop: 'walking_stick',
  });
  elderlyPatient.group.position.set(-3.3, 0.03, 0.3);
  elderlyPatient.group.rotation.y = Math.PI;
  root.add(elderlyPatient.group);

  // Water Cooler & Potted Plants in Reception
  const waterCooler = createWaterCooler(reg);
  waterCooler.position.set(-1.75, 0.03, -1.6);
  root.add(waterCooler);

  [
    [-8.95, 5.95],
    [-1.85, 5.95],
    [-8.95, -1.65],
  ].forEach(([px, pz]) => {
    const p = createPottedPlant(reg);
    p.position.set(px, 0.03, pz);
    root.add(p);
  });

  // 14 Waiting Chairs in Two Groups (InstancedMesh)
  // Group A: 2 rows x 4 chairs = 8 chairs (x = -7.6, -6.9, -6.2, -5.5)
  // Group B: 2 rows x 3 chairs = 6 chairs (x = -4.0, -3.3, -2.6)
  const chairPlacements: Array<{ x: number; y: number; z: number; rotY: number; color: string }> = [];
  const groupAX = [-7.6, -6.9, -6.2, -5.5];
  const groupBX = [-4.0, -3.3, -2.6];
  const rowZ = [2.25, 4.35];

  rowZ.forEach((z, rIdx) => {
    groupAX.forEach(x => {
      chairPlacements.push({
        x,
        y: 0.03,
        z,
        rotY: Math.PI,
        color: rIdx === 0 ? '#14b8a6' : '#4f46e5',
      });
    });
    groupBX.forEach(x => {
      chairPlacements.push({
        x,
        y: 0.03,
        z,
        rotY: Math.PI,
        color: rIdx === 0 ? '#0ea5e9' : '#7c3aed',
      });
    });
  });

  root.add(createInstancedWaitingChairs(reg, chairPlacements));

  // Seated Patients (9 seated, including parent + child in Group A, varied vibrant attire)
  const seatedSpecs: Array<{
    x: number;
    z: number;
    skinIdx: number;
    hairIdx: number;
    hairStyle: HairStyle;
    shirtIdx: number;
    height: number;
  }> = [
    { x: -7.6, z: 2.25, skinIdx: 0, hairIdx: 1, hairStyle: 'bob', shirtIdx: 1, height: 0.94 }, // coral
    { x: -6.9, z: 2.25, skinIdx: 2, hairIdx: 0, hairStyle: 'short', shirtIdx: 3, height: 1.02 }, // indigo
    { x: -5.5, z: 2.25, skinIdx: 5, hairIdx: 4, hairStyle: 'parted', shirtIdx: 2, height: 0.97 }, // yellow
    { x: -4.0, z: 2.25, skinIdx: 3, hairIdx: 0, hairStyle: 'bun', shirtIdx: 4, height: 0.95 }, // pink
    { x: -2.6, z: 2.25, skinIdx: 1, hairIdx: 2, hairStyle: 'short', shirtIdx: 5, height: 1.03 }, // green
    { x: -7.6, z: 4.35, skinIdx: 4, hairIdx: 0, hairStyle: 'bob', shirtIdx: 0, height: 0.96 }, // Parent
    { x: -6.9, z: 4.35, skinIdx: 4, hairIdx: 0, hairStyle: 'short', shirtIdx: 2, height: 0.66 }, // Child with parent!
    { x: -5.5, z: 4.35, skinIdx: 2, hairIdx: 3, hairStyle: 'parted', shirtIdx: 8, height: 0.99 }, // violet
    { x: -3.3, z: 4.35, skinIdx: 0, hairIdx: 1, hairStyle: 'bun', shirtIdx: 6, height: 0.93 }, // coral-orange
  ];

  const seatedPatients: StylizedPersonRig[] = [];
  seatedSpecs.forEach(cfg => {
    const p = createStylizedPerson(reg, {
      role: 'patient_casual',
      pose: 'seated',
      skinHex: SKIN_TONES[cfg.skinIdx],
      hairHex: HAIR_COLORS[cfg.hairIdx],
      hairStyle: cfg.hairStyle,
      shirtHex: CASUAL_SHIRTS[cfg.shirtIdx],
      pantsHex: CASUAL_PANTS[cfg.skinIdx % CASUAL_PANTS.length],
      heightScale: cfg.height,
    });
    p.group.position.set(cfg.x, 0.03, cfg.z - 0.02);
    p.group.rotation.y = Math.PI;
    root.add(p.group);
    seatedPatients.push(p);
  });

  // Person on Crutches standing/moving gently in reception aisle
  const crutchesPatient = createStylizedPerson(reg, {
    role: 'patient_casual',
    pose: 'standing',
    skinHex: SKIN_TONES[3],
    hairHex: HAIR_COLORS[1],
    hairStyle: 'short',
    shirtHex: CASUAL_SHIRTS[4], // pink
    heightScale: 0.98,
    prop: 'crutches',
  });
  crutchesPatient.group.position.set(-4.7, 0.03, 5.55);
  crutchesPatient.group.rotation.y = Math.PI;
  root.add(crutchesPatient.group);

  // =========================================================================
  // 5. BACK WING: PHARMACY COUNTER, DIAGNOSTIC LAB + CENTRIFUGE, ICU (4 BEDS), OT
  // =========================================================================
  // 5A. Pharmacy Counter & Pharmacist (x = -9.4 to -4.6, z = -8.6 to -2.5)
  const pharmSignTex = createSignTexture(reg, maxAniso, 'PHARMACY', palette.tealSign, '#ffffff', false);
  const pharmSign = new THREE.Mesh(
    reg.trackGeo(new THREE.PlaneGeometry(2.6, 0.60)),
    reg.trackMat(new THREE.MeshStandardMaterial({ map: pharmSignTex, roughness: 0.35 }))
  );
  pharmSign.position.set(-7.1, 2.55, -8.67);
  root.add(pharmSign);

  const pharmacyCounter = createPharmacyCounter(reg);
  pharmacyCounter.position.set(-7.1, 0.03, -6.2);
  root.add(pharmacyCounter);

  const pharmacist = createStylizedPerson(reg, {
    role: 'pharmacist',
    pose: 'standing',
    skinHex: SKIN_TONES[2],
    hairHex: HAIR_COLORS[0],
    hairStyle: 'bun',
    heightScale: 0.96,
  });
  pharmacist.group.position.set(-7.1, 0.03, -6.85);
  root.add(pharmacist.group);

  // 5B. Diagnostic Lab Room with Technician & Spinning Centrifuge (x = -4.2 to +0.6)
  const labSignTex = createSignTexture(reg, maxAniso, 'DIAGNOSTIC LAB', palette.violetSign, '#ffffff', false);
  const labSign = new THREE.Mesh(
    reg.trackGeo(new THREE.PlaneGeometry(2.8, 0.60)),
    reg.trackMat(new THREE.MeshStandardMaterial({ map: labSignTex, roughness: 0.35 }))
  );
  labSign.position.set(-1.9, 2.55, -8.67);
  root.add(labSign);

  const labStation = createLabBenchAndCentrifuge(reg);
  labStation.group.position.set(-1.9, 0.03, -6.5);
  root.add(labStation.group);

  const labTech = createStylizedPerson(reg, {
    role: 'lab_tech',
    pose: 'standing',
    skinHex: SKIN_TONES[1],
    hairHex: HAIR_COLORS[2],
    hairStyle: 'parted',
    heightScale: 0.98,
  });
  labTech.group.position.set(-1.9, 0.03, -7.35);
  root.add(labTech.group);

  // 5C. ICU Room with 4 Beds & Ventilators (x = +0.8 to +8.8, z = -8.6 to -2.4)
  const icuSignTex = createSignTexture(reg, maxAniso, 'ICU • 04 BEDS', palette.indigoSign, '#ffffff', true);
  const icuSign = new THREE.Mesh(
    reg.trackGeo(new THREE.PlaneGeometry(3.2, 0.62)),
    reg.trackMat(new THREE.MeshStandardMaterial({ map: icuSignTex, roughness: 0.35 }))
  );
  icuSign.position.set(4.8, 2.55, -8.67);
  root.add(icuSign);

  // Shared ECG controllers (4 live channels + 2 standby states across all 14 monitors for 60fps!)
  const liveEcgs: Array<{ ctrl: ECGMonitorController; bpm: number; offset: number }> = [
    { ctrl: createECGMonitorController(reg, maxAniso), bpm: 72, offset: 0.0 },
    { ctrl: createECGMonitorController(reg, maxAniso), bpm: 79, offset: 0.35 },
    { ctrl: createECGMonitorController(reg, maxAniso), bpm: 86, offset: 0.7 },
    { ctrl: createECGMonitorController(reg, maxAniso), bpm: 94, offset: 1.1 },
  ];
  const freeEcg = createECGMonitorController(reg, maxAniso);
  const reservedEcg = createECGMonitorController(reg, maxAniso);

  const bedAssets = createBedSharedAssets(reg);
  const icuBedPositions = [1.85, 3.8, 5.75, 7.7];
  const icuVentilators: VentilatorInstance[] = [];
  const bedPatients: Array<{ rig: StylizedPersonRig; phase: number }> = [];

  icuBedPositions.forEach((bx, idx) => {
    const ecgSpec = liveEcgs[idx % liveEcgs.length];
    const icuBed = createHospitalBed(reg, maxAniso, bedAssets, {
      status: 'occupied',
      blanketHex: ['#38bdf8', '#2dd4bf', '#818cf8', '#60a5fa'][idx % 4],
      sharedEcgController: ecgSpec.ctrl,
      ecgPhaseOffset: ecgSpec.offset,
      bpm: ecgSpec.bpm,
      withCurtain: false,
    });
    icuBed.group.position.set(bx, 0.03, -5.85);
    root.add(icuBed.group);

    const pat = createStylizedPerson(reg, {
      role: 'patient_gown',
      pose: 'lying',
      skinHex: SKIN_TONES[(idx + 1) % SKIN_TONES.length],
      hairHex: HAIR_COLORS[idx % HAIR_COLORS.length],
      hairStyle: idx % 2 === 0 ? 'short' : 'bob',
      heightScale: 0.96,
    });
    icuBed.patientSpot.add(pat.group);
    bedPatients.push({ rig: pat, phase: idx * 0.9 });

    // Ventilator beside each ICU bed
    const vent = createVentilatorMachine(reg);
    vent.group.position.set(bx + 0.65, 0.03, -6.55);
    root.add(vent.group);
    icuVentilators.push(vent);
  });

  // 5D. Operation Theatre (x = +8.8 to +15.8, z = -8.6 to -2.4)
  const otSignTex = createSignTexture(reg, maxAniso, 'OPERATION THEATRE', palette.tealSign, '#ffffff', true);
  const otSign = new THREE.Mesh(
    reg.trackGeo(new THREE.PlaneGeometry(3.4, 0.62)),
    reg.trackMat(new THREE.MeshStandardMaterial({ map: otSignTex, roughness: 0.35 }))
  );
  otSign.position.set(12.3, 2.55, -8.67);
  root.add(otSign);

  const otRig = createOperatingTheatreRig(reg);
  otRig.position.set(12.3, 0.03, -5.65);
  root.add(otRig);

  // Surgical Team (3 surgeons/nurses in green scrubs & masks)
  const surgeonConfigs: Array<{ x: number; z: number; rotY: number; skinIdx: number }> = [
    { x: 11.45, z: -5.55, rotY: Math.PI * 0.5, skinIdx: 1 },
    { x: 13.15, z: -5.55, rotY: -Math.PI * 0.5, skinIdx: 3 },
    { x: 12.35, z: -6.95, rotY: 0, skinIdx: 0 },
  ];
  const surgicalTeam: StylizedPersonRig[] = [];
  surgeonConfigs.slice(0, HOSPITAL_SCENE_CONFIG.counts.surgicalTeamMembers).forEach(sc => {
    const s = createStylizedPerson(reg, {
      role: 'surgeon',
      pose: 'standing',
      skinHex: SKIN_TONES[sc.skinIdx],
      heightScale: 0.98,
    });
    s.group.position.set(sc.x, 0.03, sc.z);
    s.group.rotation.y = sc.rotY;
    root.add(s.group);
    surgicalTeam.push(s);
  });

  // =========================================================================
  // 6. WARD CORRIDOR (x = -1.2 to +2.8, z = -2.4 to +6.8)
  // =========================================================================
  // Wall Directory Map
  const mapTex = createWallMapTexture(reg, maxAniso);
  const wallMap = new THREE.Mesh(
    reg.trackGeo(new THREE.BoxGeometry(1.5, 1.0, 0.08)),
    reg.trackMat(new THREE.MeshStandardMaterial({ map: mapTex, roughness: 0.45 }))
  );
  wallMap.position.set(0.95, 1.02, -2.26);
  root.add(wallMap);

  // Floor Direction Arrows
  const arrowWardTex = createDirectionArrowTexture(reg, maxAniso, palette.tealSign, 'WARD');
  const arrowIcuTex = createDirectionArrowTexture(reg, maxAniso, palette.indigoSign, 'ICU');
  [
    { x: 0.8, z: 0.6, rot: 0, tex: arrowWardTex },
    { x: 0.8, z: 3.1, rot: 0, tex: arrowWardTex },
    { x: 0.8, z: -1.1, rot: Math.PI * 0.5, tex: arrowIcuTex },
  ].forEach(a => {
    const decal = new THREE.Mesh(
      reg.trackGeo(new THREE.PlaneGeometry(1.35, 0.65)),
      reg.trackMat(new THREE.MeshStandardMaterial({ map: a.tex, transparent: true, roughness: 0.6 }))
    );
    decal.rotation.x = -Math.PI * 0.5;
    decal.rotation.z = a.rot;
    decal.position.set(a.x, 0.036, a.z);
    root.add(decal);
  });

  // Hand-Sanitizer Stations on doorway pillars
  [
    [-1.06, -1.75],
    [2.66, -1.75],
  ].forEach(([sx, sz]) => {
    const hs = createHandSanitizerStation(reg);
    hs.position.set(sx, 1.15, sz);
    hs.rotation.y = sx < 0 ? Math.PI * 0.5 : -Math.PI * 0.5;
    root.add(hs);
  });

  // Moving Unit A: Nurse pushing a Patient in Wheelchair
  const wheelchairRigGroup = new THREE.Group();
  wheelchairRigGroup.add(createWheelchair(reg));
  const wcPatient = createStylizedPerson(reg, {
    role: 'patient_gown',
    pose: 'seated',
    skinHex: SKIN_TONES[3],
    hairHex: HAIR_COLORS[4],
    hairStyle: 'short',
    heightScale: 0.94,
  });
  wcPatient.group.position.set(0, 0.06, 0.04);
  wheelchairRigGroup.add(wcPatient.group);
  const wcNurse = createStylizedPerson(reg, {
    role: 'nurse',
    pose: 'pushing',
    skinHex: SKIN_TONES[1],
    hairHex: HAIR_COLORS[1],
    hairStyle: 'bun',
    scrubHex: '#0284c7',
    heightScale: 0.97,
  });
  wcNurse.group.position.set(0, 0, -0.62);
  wheelchairRigGroup.add(wcNurse.group);
  root.add(wheelchairRigGroup);

  // Moving Unit B: Two Staff pushing a Patient on a Stretcher
  const corridorStretcherGroup = new THREE.Group();
  corridorStretcherGroup.add(createStretcher(reg));
  const corrStretcherPatient = createStylizedPerson(reg, {
    role: 'patient_gown',
    pose: 'lying',
    skinHex: SKIN_TONES[0],
    hairHex: HAIR_COLORS[2],
    hairStyle: 'bob',
    heightScale: 0.96,
  });
  corrStretcherPatient.group.position.set(0, 0.65, 0);
  corridorStretcherGroup.add(corrStretcherPatient.group);
  const corrStaffRear = createStylizedPerson(reg, {
    role: 'nurse',
    pose: 'pushing',
    skinHex: SKIN_TONES[5],
    hairHex: HAIR_COLORS[0],
    hairStyle: 'short',
    scrubHex: '#14b8a6',
    heightScale: 1.02,
  });
  corrStaffRear.group.position.set(0, 0, -1.32);
  corridorStretcherGroup.add(corrStaffRear.group);
  const corrStaffFront = createStylizedPerson(reg, {
    role: 'doctor',
    pose: 'standing',
    skinHex: SKIN_TONES[2],
    hairHex: HAIR_COLORS[0],
    hairStyle: 'parted',
    heightScale: 1.0,
  });
  corrStaffFront.group.position.set(0, 0, 1.32);
  corridorStretcherGroup.add(corrStaffFront.group);
  root.add(corridorStretcherGroup);

  // Moving Unit C: Nurse pushing Medicine Trolley in Corridor
  const trolleyUnitGroup = new THREE.Group();
  trolleyUnitGroup.add(createMedicineTrolley(reg));
  const trolleyNurse = createStylizedPerson(reg, {
    role: 'nurse',
    pose: 'pushing',
    skinHex: SKIN_TONES[0],
    hairHex: HAIR_COLORS[3],
    hairStyle: 'bun',
    scrubHex: '#16a34a',
    heightScale: 0.96,
  });
  trolleyNurse.group.position.set(0, 0, -0.78);
  trolleyUnitGroup.add(trolleyNurse.group);
  root.add(trolleyUnitGroup);

  // =========================================================================
  // 7. GENERAL WARD — 10 BEDS IN TWO ROWS + NURSES' STATION + DOCTOR + VISITORS + CLEANER
  // =========================================================================
  const wardSignTex = createSignTexture(reg, maxAniso, 'GENERAL WARD • 10 BEDS', palette.violetSign, '#ffffff', true);
  const wardSign = new THREE.Mesh(
    reg.trackGeo(new THREE.PlaneGeometry(3.8, 0.66)),
    reg.trackMat(new THREE.MeshStandardMaterial({ map: wardSignTex, roughness: 0.35 }))
  );
  wardSign.position.set(9.4, 2.15, -2.28);
  root.add(wardSign);

  // Framed Art on right ward wall
  const art2Tex = createFramedArtTexture(reg, maxAniso, ['#fb7185', '#7c3aed', '#14b8a6']);
  const art2 = new THREE.Mesh(
    reg.trackGeo(new THREE.BoxGeometry(0.06, 0.85, 1.1)),
    reg.trackMat(new THREE.MeshStandardMaterial({ map: art2Tex, roughness: 0.5 }))
  );
  art2.position.set(15.65, 1.9, -4.5);
  root.add(art2);

  // Nurses' Station inside General Ward Entrance (x = 3.85, z = 2.0) with computer + 2 staff
  const nursesStation = createReceptionDesk(reg, palette.violetSign);
  nursesStation.scale.set(0.65, 0.95, 0.82);
  nursesStation.rotation.y = Math.PI * 0.5;
  nursesStation.position.set(3.85, 0.03, 2.0);
  root.add(nursesStation);

  const wardStationStaff1 = createStylizedPerson(reg, {
    role: 'nurse',
    pose: 'standing',
    skinHex: SKIN_TONES[2],
    hairHex: HAIR_COLORS[0],
    hairStyle: 'bun',
    scrubHex: '#14b8a6',
    heightScale: 0.95,
  });
  wardStationStaff1.group.position.set(3.38, 0.03, 1.55);
  wardStationStaff1.group.rotation.y = Math.PI * 0.5;
  root.add(wardStationStaff1.group);

  const wardStationStaff2 = createStylizedPerson(reg, {
    role: 'nurse',
    pose: 'standing',
    skinHex: SKIN_TONES[4],
    hairHex: HAIR_COLORS[1],
    hairStyle: 'short',
    scrubHex: '#0284c7',
    heightScale: 1.0,
  });
  wardStationStaff2.group.position.set(3.38, 0.03, 2.45);
  wardStationStaff2.group.rotation.y = Math.PI * 0.5;
  root.add(wardStationStaff2.group);

  // 10 Hospital Beds in 2 Rows of 5 (Back row z = -0.55, Front row z = +4.85)
  const wardBedXs = [5.75, 7.95, 10.15, 12.35, 14.55];
  const wardBedConfigs: Array<{
    x: number;
    z: number;
    status: BedOccupancyStatus;
    blanketHex: string;
    curtainHex: string;
    skinIdx: number;
    hairIdx: number;
    hairStyle: HairStyle;
  }> = [
    // Back Row (5 beds)
    { x: wardBedXs[0], z: -0.55, status: 'occupied', blanketHex: '#7dd3fc', curtainHex: '#c7d2fe', skinIdx: 1, hairIdx: 0, hairStyle: 'short' },
    { x: wardBedXs[1], z: -0.55, status: 'occupied', blanketHex: '#fda4af', curtainHex: '#bae6fd', skinIdx: 4, hairIdx: 4, hairStyle: 'bob' },
    { x: wardBedXs[2], z: -0.55, status: 'free', blanketHex: '#a7f3d0', curtainHex: '#bbf7d0', skinIdx: 0, hairIdx: 0, hairStyle: 'short' },
    { x: wardBedXs[3], z: -0.55, status: 'occupied', blanketHex: '#c4b5fd', curtainHex: '#ddd6fe', skinIdx: 2, hairIdx: 1, hairStyle: 'parted' },
    { x: wardBedXs[4], z: -0.55, status: 'reserved', blanketHex: '#fde68a', curtainHex: '#fef08a', skinIdx: 0, hairIdx: 0, hairStyle: 'short' },
    // Front Row (5 beds)
    { x: wardBedXs[0], z: 4.85, status: 'occupied', blanketHex: '#5eead4', curtainHex: '#99f6e4', skinIdx: 5, hairIdx: 0, hairStyle: 'bun' },
    { x: wardBedXs[1], z: 4.85, status: 'free', blanketHex: '#a7f3d0', curtainHex: '#bbf7d0', skinIdx: 0, hairIdx: 0, hairStyle: 'short' }, // Cleaner mopping here!
    { x: wardBedXs[2], z: 4.85, status: 'occupied', blanketHex: '#93c5fd', curtainHex: '#c7d2fe', skinIdx: 0, hairIdx: 2, hairStyle: 'short' },
    { x: wardBedXs[3], z: 4.85, status: 'occupied', blanketHex: '#f9a8d4', curtainHex: '#fbcfe8', skinIdx: 3, hairIdx: 0, hairStyle: 'bob' },
    { x: wardBedXs[4], z: 4.85, status: 'reserved', blanketHex: '#fde68a', curtainHex: '#fef08a', skinIdx: 0, hairIdx: 0, hairStyle: 'short' },
  ];

  const wardBeds: HospitalBedInstance[] = [];
  wardBedConfigs.slice(0, HOSPITAL_SCENE_CONFIG.counts.generalWardBeds).forEach((cfg, idx) => {
    const ecgSpec = liveEcgs[idx % liveEcgs.length];
    const ecgCtrl =
      cfg.status === 'occupied'
        ? ecgSpec.ctrl
        : cfg.status === 'free'
        ? freeEcg
        : reservedEcg;

    const bed = createHospitalBed(reg, maxAniso, bedAssets, {
      status: cfg.status,
      blanketHex: cfg.blanketHex,
      curtainHex: cfg.curtainHex,
      sharedEcgController: ecgCtrl,
      ecgPhaseOffset: ecgSpec.offset,
      bpm: ecgSpec.bpm,
      withCurtain: true,
    });
    bed.group.position.set(cfg.x, 0.03, cfg.z);
    root.add(bed.group);
    wardBeds.push(bed);

    if (cfg.status === 'occupied') {
      const pat = createStylizedPerson(reg, {
        role: 'patient_gown',
        pose: 'lying',
        skinHex: SKIN_TONES[cfg.skinIdx],
        hairHex: HAIR_COLORS[cfg.hairIdx],
        hairStyle: cfg.hairStyle,
        heightScale: 0.96,
      });
      bed.patientSpot.add(pat.group);
      bedPatients.push({ rig: pat, phase: idx * 0.85 + 2.0 });
    }
  });

  // Visitors sitting beside occupied beds (Bed 1 & Bed 9)
  const visitorChairMat = reg.trackMat(new THREE.MeshStandardMaterial({ color: '#4f46e5', roughness: 0.6 }));
  const visitorSpecs = [
    { x: wardBedXs[0] + 0.82, z: -0.25, rotY: -Math.PI * 0.35, skinIdx: 2, shirtIdx: 6 },
    { x: wardBedXs[3] + 0.82, z: 4.95, rotY: -Math.PI * 0.4, skinIdx: 1, shirtIdx: 2 },
  ];
  visitorSpecs.forEach(v => {
    const stool = new THREE.Mesh(reg.trackGeo(new THREE.CylinderGeometry(0.24, 0.22, 0.44, 12)), visitorChairMat);
    stool.position.set(v.x, 0.25, v.z);
    root.add(stool);

    const vis = createStylizedPerson(reg, {
      role: 'patient_casual',
      pose: 'seated',
      skinHex: SKIN_TONES[v.skinIdx],
      hairHex: HAIR_COLORS[1],
      hairStyle: 'bob',
      shirtHex: CASUAL_SHIRTS[v.shirtIdx],
      heightScale: 0.95,
    });
    vis.group.position.set(v.x, 0.03, v.z);
    vis.group.rotation.y = v.rotY;
    root.add(vis.group);
  });

  // Cleaner mopping beside freshly emptied Bed 7 (free green light at x = 7.95, z = 4.85)
  const mopBucket = createMopBucket(reg);
  mopBucket.position.set(wardBedXs[1] + 0.88, 0.03, 5.55);
  root.add(mopBucket);

  const cleanerRig = createStylizedPerson(reg, {
    role: 'cleaner',
    pose: 'standing',
    skinHex: SKIN_TONES[4],
    hairHex: HAIR_COLORS[0],
    hairStyle: 'short',
    heightScale: 0.98,
    prop: 'mop',
  });
  cleanerRig.group.position.set(wardBedXs[1] + 0.45, 0.03, 3.65);
  cleanerRig.group.rotation.y = 0.35;
  root.add(cleanerRig.group);

  // Doctor doing rounds with glowing tablet along General Ward central aisle
  const roundsDoctor = createStylizedPerson(reg, {
    role: 'doctor',
    pose: 'standing',
    skinHex: SKIN_TONES[1],
    hairHex: HAIR_COLORS[0],
    hairStyle: 'parted',
    heightScale: 1.04,
    prop: 'tablet',
  });
  roundsDoctor.group.position.set(5.4, 0.03, 2.05);
  root.add(roundsDoctor.group);

  // Additional Walking Patients & Staff
  const walkers: WalkerActor[] = [
    {
      rig: createStylizedPerson(reg, {
        role: 'patient_casual',
        pose: 'standing',
        skinHex: SKIN_TONES[2],
        hairHex: HAIR_COLORS[1],
        hairStyle: 'short',
        shirtHex: CASUAL_SHIRTS[0],
        heightScale: 0.98,
      }),
      xStart: -2.4,
      xEnd: 3.0,
      z: -0.95,
      speed: 0.82,
      phaseOffset: 0.2,
      pauseDuration: 1.2,
    },
    {
      rig: createStylizedPerson(reg, {
        role: 'nurse',
        pose: 'standing',
        skinHex: SKIN_TONES[0],
        hairHex: HAIR_COLORS[2],
        hairStyle: 'bun',
        scrubHex: '#14b8a6',
        heightScale: 0.96,
      }),
      xStart: 4.5,
      xEnd: 13.8,
      z: 1.45,
      speed: 0.96,
      phaseOffset: 2.1,
      pauseDuration: 1.4,
    },
  ];
  walkers.forEach(w => {
    w.rig.group.position.set(w.xStart, 0.03, w.z);
    root.add(w.rig.group);
  });

  // =========================================================================
  // 8. ANIMATION UPDATE LOOP (ZERO GC, LIGHT & SMOOTH 60FPS)
  // =========================================================================
  let lastTokenIdx = -1;
  let lastEcgUpdateTime = -1;

  const updateAmbulanceSlot = (
    amb: AmbulanceInstance,
    crew: ReturnType<typeof makeEmergCrew>,
    tLocal: number,
    cycleLen: number,
    laneX: number,
    deltaTime: number,
    elapsedTime: number
  ) => {
    const flash = Math.sin(elapsedTime * 16.0) > 0;
    const beaconActive = tLocal < cycleLen - 2.0;
    if (beaconActive) {
      amb.redBeaconMat.emissiveIntensity = flash ? 2.4 : 0.2;
      amb.blueBeaconMat.emissiveIntensity = flash ? 0.2 : 2.4;
      amb.redGlowSprite.visible = flash;
      amb.blueGlowSprite.visible = !flash;
    } else {
      amb.redBeaconMat.emissiveIntensity = 0.2;
      amb.blueBeaconMat.emissiveIntensity = 0.2;
      amb.redGlowSprite.visible = false;
      amb.blueGlowSprite.visible = false;
    }

    // Drive in from +Z (z = +16.5) -> stop at bay (z = +1.4) -> pull out forward toward -Z (z = -17.5)
    let ambZ = 1.4;
    let ambSpeed = 0;
    if (tLocal < 5.0) {
      const p = smoothstep(0, 5.0, tLocal);
      ambZ = 16.5 - p * 15.1;
      ambSpeed = 1.0 - Math.abs(p - 0.5) * 1.2;
    } else if (tLocal < cycleLen - 5.5) {
      ambZ = 1.4;
      ambSpeed = 0;
    } else {
      const p = smoothstep(cycleLen - 5.5, cycleLen, tLocal);
      ambZ = 1.4 - p * 18.9;
      ambSpeed = 0.4 + p * 0.9;
    }

    amb.group.position.set(laneX, 0, ambZ);
    amb.group.rotation.y = Math.PI;
    amb.wheels.forEach(w => {
      w.rotation.x -= deltaTime * ambSpeed * 7.0;
    });

    // Rear doors
    const closeStart = cycleLen - 7.0;
    let doorOpen = 0;
    if (tLocal >= 5.0 && tLocal < 6.2) {
      doorOpen = smoothstep(5.0, 6.2, tLocal);
    } else if (tLocal >= 6.2 && tLocal < closeStart) {
      doorOpen = 1;
    } else if (tLocal >= closeStart && tLocal < closeStart + 1.2) {
      doorOpen = 1 - smoothstep(closeStart, closeStart + 1.2, tLocal);
    }
    amb.leftDoor.rotation.y = -doorOpen * 1.85;
    amb.rightDoor.rotation.y = doorOpen * 1.85;

    // Stretcher & Paramedics bringing patient inside
    if (tLocal < 6.0 || tLocal >= closeStart) {
      crew.grp.visible = false;
      return false;
    }

    crew.grp.visible = true;
    let tx = laneX;
    let tz = 3.2;
    let ty = 0.0;
    let tYaw = 0;
    let staffWalking = true;
    let doorNeeded = false;

    if (tLocal < 7.8) {
      const p = smoothstep(6.0, 7.8, tLocal);
      tx = laneX;
      tz = 3.0 + p * 1.4;
      crew.pat.group.visible = true;
    } else if (tLocal < 9.6) {
      const p = smoothstep(7.8, 9.6, tLocal);
      tx = laneX + p * (-11.0 - laneX);
      tz = 4.4 - p * 3.0;
      ty = 0.04 * p;
      tYaw = Math.PI * 0.5 * p;
      crew.pat.group.visible = true;
      doorNeeded = true;
    } else if (tLocal < 12.6) {
      const p = smoothstep(9.6, 12.6, tLocal);
      tx = -11.0 + p * 3.8;
      tz = 1.4;
      ty = 0.05;
      tYaw = Math.PI * 0.5;
      crew.pat.group.visible = true;
      doorNeeded = true;
    } else if (tLocal < 14.2) {
      tx = -7.2;
      tz = 1.4;
      ty = 0.05;
      tYaw = Math.PI * 0.5;
      staffWalking = false;
      crew.pat.group.visible = true;
      doorNeeded = true;
    } else if (tLocal < closeStart - 1.5) {
      const p = smoothstep(14.2, closeStart - 1.5, tLocal);
      tx = -7.2 + p * (laneX + 1.2 + 7.2);
      tz = 1.4 + p * 1.8;
      ty = 0.05 * (1 - p);
      tYaw = -Math.PI * 0.5;
      crew.pat.group.visible = false;
      doorNeeded = p < 0.65;
    } else {
      const p = smoothstep(closeStart - 1.5, closeStart, tLocal);
      tx = laneX + 1.2 * (1 - p);
      tz = 3.2;
      tYaw = Math.PI;
      crew.pat.group.visible = false;
    }

    crew.grp.position.set(tx, ty, tz);
    crew.grp.rotation.y = tYaw;
    if (staffWalking) {
      animateWalkingRig(crew.pRear, elapsedTime * 5.8, 0.44, true);
      animateWalkingRig(crew.pFront, elapsedTime * 5.8 + Math.PI, 0.44, false);
    } else {
      animateWalkingRig(crew.pRear, 0, 0, true);
      animateWalkingRig(crew.pFront, 0, 0, false);
    }
    return doorNeeded;
  };

  const computePatrol = (xMin: number, xMax: number, period: number, phaseShift: number, elapsed: number) => {
    const span = xMax - xMin;
    const u = ((elapsed + phaseShift) % period) / period;
    let x: number;
    let yaw: number;
    let isMoving = true;

    if (u < 0.44) {
      x = xMin + smoothstep(0, 0.44, u) * span;
      yaw = Math.PI * 0.5;
    } else if (u < 0.5) {
      x = xMax;
      yaw = Math.PI * 0.5 + ((u - 0.44) / 0.06) * Math.PI;
      isMoving = false;
    } else if (u < 0.94) {
      x = xMax - smoothstep(0.5, 0.94, u) * span;
      yaw = -Math.PI * 0.5;
    } else {
      x = xMin;
      yaw = -Math.PI * 0.5 + ((u - 0.94) / 0.06) * Math.PI;
      isMoving = false;
    }
    return { x, yaw, isMoving };
  };

  const update = (elapsedTime: number, deltaTime: number) => {
    // 1. Queue Board Token Tick (Now Serving + Est. Wait)
    const tokenIdx = Math.floor(elapsedTime / speeds.tokenTickIntervalSec) % TOKEN_SEQUENCE.length;
    if (tokenIdx !== lastTokenIdx) {
      lastTokenIdx = tokenIdx;
      const curTok = TOKEN_SEQUENCE[tokenIdx];
      const next1 = TOKEN_SEQUENCE[(tokenIdx + 1) % TOKEN_SEQUENCE.length];
      const next2 = TOKEN_SEQUENCE[(tokenIdx + 2) % TOKEN_SEQUENCE.length];
      const next3 = TOKEN_SEQUENCE[(tokenIdx + 3) % TOKEN_SEQUENCE.length];
      const deskLabel = tokenIdx % 2 === 0 ? 'COUNTER 01' : 'TRIAGE 02';
      const estWait = 3 + ((tokenIdx * 2) % 6);
      queueBoardCtrl.updateToken(curTok, deskLabel, estWait, [next1, next2, next3]);
    }

    // Wall Clock Hands
    wallClock.minuteHand.rotation.z = -elapsedTime * 0.35;
    wallClock.hourHand.rotation.z = -elapsedTime * 0.03;

    // Receptionist, Triage Nurse, Visitors & Seated Patients
    receptionist.leftArm.rotation.x = -0.62 + Math.sin(elapsedTime * 5.0) * 0.08;
    receptionist.rightArm.rotation.x = -0.62 + Math.cos(elapsedTime * 5.5) * 0.08;
    triageNurse.head.rotation.y = Math.sin(elapsedTime * 1.1) * 0.16;
    deskVisitor.head.rotation.x = Math.sin(elapsedTime * 1.3) * 0.06;
    elderlyPatient.head.rotation.y = Math.sin(elapsedTime * 0.7) * 0.12;
    crutchesPatient.torso.scale.y = 1 + Math.sin(elapsedTime * 1.8) * 0.015;

    seatedPatients.forEach((p, idx) => {
      p.torso.scale.y = 1 + Math.sin(elapsedTime * 2.1 + idx) * 0.012;
      p.head.rotation.y = Math.sin(elapsedTime * 0.52 + idx * 1.4) * 0.16;
    });

    // Lab Centrifuge Rotor & Technician + Pharmacist
    labStation.centrifugeRotor.rotation.y += deltaTime * speeds.centrifugeRpmRad;
    labTech.leftArm.rotation.x = -0.55 + Math.sin(elapsedTime * 2.8) * 0.12;
    pharmacist.rightArm.rotation.x = -0.45 + Math.cos(elapsedTime * 2.1) * 0.15;

    // Surgical Team gentle focus sway
    surgicalTeam.forEach((s, idx) => {
      s.rightArm.rotation.x = -0.55 + Math.sin(elapsedTime * 2.4 + idx) * 0.08;
    });

    // ICU Ventilator Blinking Status Lights
    icuVentilators.forEach((v, idx) => {
      const pulse = 0.5 + 0.5 * Math.sin(elapsedTime * 3.8 + idx * 1.3);
      v.blinkMat.emissiveIntensity = 0.4 + pulse * 1.5;
    });

    // 2. Corridor Patrols (Wheelchair, Stretcher, Medicine Trolley)
    const wc = computePatrol(-2.6, 4.1, speeds.wheelchairPatrolSec, 1.5, elapsedTime);
    wheelchairRigGroup.position.set(wc.x, 0.03, 0.25);
    wheelchairRigGroup.rotation.y = wc.yaw;
    animateWalkingRig(wcNurse, wc.isMoving ? elapsedTime * 5.4 : 0, wc.isMoving ? 0.42 : 0, true);

    const st = computePatrol(-2.5, 4.1, speeds.stretcherPatrolSec, 11.0, elapsedTime);
    corridorStretcherGroup.position.set(st.x, 0.03, 2.45);
    corridorStretcherGroup.rotation.y = st.yaw;
    animateWalkingRig(corrStaffRear, st.isMoving ? elapsedTime * 5.0 : 0, st.isMoving ? 0.40 : 0, true);
    animateWalkingRig(corrStaffFront, st.isMoving ? elapsedTime * 5.0 + Math.PI : 0, st.isMoving ? 0.40 : 0, false);

    const tr = computePatrol(-1.8, 3.6, speeds.trolleyPatrolSec, 5.0, elapsedTime);
    trolleyUnitGroup.position.set(tr.x, 0.03, 4.65);
    trolleyUnitGroup.rotation.y = tr.yaw;
    animateWalkingRig(trolleyNurse, tr.isMoving ? elapsedTime * 5.5 : 0, tr.isMoving ? 0.42 : 0, true);

    // Doctor doing rounds with tablet along General Ward central aisle (z = 2.05)
    const docState = computePatrol(5.2, 14.5, 28.0, 4.0, elapsedTime);
    roundsDoctor.group.position.set(docState.x, 0.03, 2.05);
    roundsDoctor.group.rotation.y = docState.yaw;
    animateWalkingRig(
      roundsDoctor,
      docState.isMoving ? elapsedTime * 4.8 * speeds.doctorRoundsSpeed : 0,
      docState.isMoving ? 0.40 : 0,
      true
    );

    // Cleaner gentle mopping motion beside Bed 7
    cleanerRig.torso.rotation.y = Math.sin(elapsedTime * 2.8) * 0.24;
    cleanerRig.torso.rotation.x = 0.14 + Math.sin(elapsedTime * 5.6) * 0.06;

    // Independent Walkers
    walkers.forEach((w, idx) => {
      const dist = Math.abs(w.xEnd - w.xStart);
      const travelTime = dist / w.speed;
      const cycle = travelTime * 2 + w.pauseDuration * 2;
      const tLocal = (elapsedTime + w.phaseOffset * 3.1) % cycle;

      let x = w.xStart;
      let yaw = w.xEnd > w.xStart ? Math.PI * 0.5 : -Math.PI * 0.5;
      let walking = true;

      if (tLocal < travelTime) {
        x = w.xStart + (w.xEnd - w.xStart) * (tLocal / travelTime);
      } else if (tLocal < travelTime + w.pauseDuration) {
        x = w.xEnd;
        walking = false;
        yaw += smoothstep(0.2, 0.8, (tLocal - travelTime) / w.pauseDuration) * Math.PI;
      } else if (tLocal < travelTime * 2 + w.pauseDuration) {
        x = w.xEnd + (w.xStart - w.xEnd) * ((tLocal - travelTime - w.pauseDuration) / travelTime);
        yaw = w.xEnd > w.xStart ? -Math.PI * 0.5 : Math.PI * 0.5;
      } else {
        x = w.xStart;
        walking = false;
        yaw = (w.xEnd > w.xStart ? -Math.PI * 0.5 : Math.PI * 0.5) + smoothstep(0.2, 0.8, (tLocal - travelTime * 2 - w.pauseDuration) / w.pauseDuration) * Math.PI;
      }

      w.rig.group.position.set(x, 0.03, w.z);
      w.rig.group.rotation.y = yaw;
      animateWalkingRig(w.rig, walking ? elapsedTime * w.speed * 5.0 + idx : 0, walking ? 0.45 : 0, false);
    });

    // 3. ECG Waveform Updates (shared 4 live textures + 2 standby textures -> 60fps!)
    if (elapsedTime - lastEcgUpdateTime >= speeds.ecgRefreshIntervalSec) {
      lastEcgUpdateTime = elapsedTime;
      liveEcgs.forEach(ch => {
        ch.ctrl.updateWave(elapsedTime + ch.offset, true, 'occupied', ch.bpm);
      });
      freeEcg.updateWave(elapsedTime, false, 'free', 0);
      reservedEcg.updateWave(elapsedTime, false, 'reserved', 0);
    }

    bedPatients.forEach(bp => {
      bp.rig.torso.scale.z = 1 + Math.sin(elapsedTime * 1.9 + bp.phase) * 0.03;
    });

    // 4. Dual Staggered Ambulances (Road lanes x = -14.2 and x = -11.9)
    const tAmb1 = elapsedTime % speeds.ambulance1CycleSec;
    const tAmb2 = (elapsedTime + speeds.ambulance2PhaseOffsetSec) % speeds.ambulance2CycleSec;

    const d1 = updateAmbulanceSlot(ambulance1, crew1, tAmb1, speeds.ambulance1CycleSec, -14.2, deltaTime, elapsedTime);
    const d2 = updateAmbulanceSlot(ambulance2, crew2, tAmb2, speeds.ambulance2CycleSec, -11.9, deltaTime, elapsedTime);

    const openDoors = d1 || d2;
    const targetSlide = openDoors ? 1.25 : 0.0;
    const currentSlide = Math.abs(doorSlideLeft.position.z - 0.62);
    const nextSlide = THREE.MathUtils.lerp(currentSlide, targetSlide, Math.min(1, deltaTime * 5.0));
    doorSlideLeft.position.z = 0.62 - nextSlide;
    doorSlideRight.position.z = 2.18 + nextSlide;

    // 5. Occasional Rooftop Helicopter Landing Loop (34s cycle)
    const tHeli = elapsedTime % speeds.helicopterCycleSec;
    const padX = -13.1;
    const padY = 3.78;
    const padZ = -6.2;

    let hx = padX;
    let hy = padY;
    let hz = padZ;
    let pitch = 0;
    let rotorSpeed = 24.0;

    if (tHeli < 8.0) {
      // Approach descent from upper-left sky
      const p = smoothstep(0, 8.0, tHeli);
      hx = padX - (1 - p) * 18.0;
      hy = padY + (1 - p) * 14.0;
      hz = padZ - (1 - p) * 8.0;
      pitch = (1 - p) * 0.14;
      rotorSpeed = 28.0;
    } else if (tHeli < 22.0) {
      // Landed on helipad, rotors slowing down gently
      hx = padX;
      hy = padY;
      hz = padZ;
      pitch = 0;
      rotorSpeed = tHeli < 11.0 || tHeli > 19.5 ? 20.0 : 5.5;
    } else if (tHeli < 30.0) {
      // Liftoff and climb away
      const p = smoothstep(22.0, 30.0, tHeli);
      hx = padX + p * 16.0;
      hy = padY + p * 15.0;
      hz = padZ - p * 10.0;
      pitch = -p * 0.16;
      rotorSpeed = 30.0;
    } else {
      // Out of frame cruise before next arrival
      hx = padX - 24.0;
      hy = padY + 20.0;
      hz = padZ - 14.0;
      rotorSpeed = 24.0;
    }

    helicopter.group.position.set(hx, hy, hz);
    helicopter.group.rotation.set(pitch, 0.72, 0);
    helicopter.mainRotor.rotation.y += deltaTime * rotorSpeed;
    helicopter.tailRotor.rotation.x += deltaTime * rotorSpeed * 1.4;
    helicopter.beaconMat.emissiveIntensity = Math.sin(elapsedTime * 9.0) > 0 ? 2.2 : 0.25;
  };

  return { root, update };
}

import * as THREE from 'three';
import { HospitalMaterialRegistry } from '../materials';

export type PersonRole =
  | 'doctor'
  | 'nurse'
  | 'surgeon'
  | 'paramedic'
  | 'receptionist'
  | 'pharmacist'
  | 'lab_tech'
  | 'cleaner'
  | 'patient_casual'
  | 'patient_gown';

export type PersonPose = 'standing' | 'seated' | 'pushing' | 'lying';

export type HairStyle = 'short' | 'bob' | 'bun' | 'parted';

export type PersonProp = 'none' | 'walking_stick' | 'crutches' | 'tablet' | 'mop';

export interface PersonOptions {
  role: PersonRole;
  pose?: PersonPose;
  skinHex?: string;
  hairHex?: string;
  hairStyle?: HairStyle;
  shirtHex?: string;
  pantsHex?: string;
  scrubHex?: string;
  heightScale?: number;
  castShadow?: boolean;
  prop?: PersonProp;
}

export interface StylizedPersonRig {
  group: THREE.Group;
  bodyRoot: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  pose: PersonPose;
  baseY: number;
  propGroup?: THREE.Group;
}

/** 25% larger base human scale for crisp visibility in isometric cutaway */
export const PERSON_BASE_SCALE = 1.25;

export const SKIN_TONES = [
  '#f8d9c4',
  '#eec3a3',
  '#dca67e',
  '#c48759',
  '#9c633c',
  '#6c4328',
];

export const HAIR_COLORS = [
  '#1e1b18',
  '#3b281c',
  '#6c4a32',
  '#a17b47',
  '#cbd5e1', // silver-grey for elderly
  '#4c1d95',
];

export const CASUAL_SHIRTS = [
  '#14b8a6', // teal
  '#fb7185', // coral / pink
  '#facc15', // yellow
  '#4f46e5', // indigo
  '#ec4899', // pink
  '#22c55e', // green
  '#f97316', // coral-orange
  '#0ea5e9', // sky blue
  '#7c3aed', // violet
];

export const CASUAL_PANTS = [
  '#1e2a44',
  '#334155',
  '#3f3f46',
  '#1e293b',
  '#475569',
];

export function createStylizedPerson(
  reg: HospitalMaterialRegistry,
  opts: PersonOptions
): StylizedPersonRig {
  const pose = opts.pose ?? 'standing';
  const heightScale = (opts.heightScale ?? 1.0) * PERSON_BASE_SCALE;
  const castShadow = opts.castShadow ?? true;

  const skinColor = opts.skinHex ?? SKIN_TONES[0];
  const hairColor = opts.hairHex ?? HAIR_COLORS[0];
  const hairStyle = opts.hairStyle ?? 'short';
  const prop = opts.prop ?? 'none';

  let topHex = opts.shirtHex ?? '#14b8a6';
  let bottomHex = opts.pantsHex ?? '#1e2a44';
  let coatHex: string | null = null;
  let surgicalGear = false;

  if (opts.role === 'doctor' || opts.role === 'pharmacist' || opts.role === 'lab_tech') {
    topHex = opts.shirtHex ?? (opts.role === 'lab_tech' ? '#0284c7' : '#14b8a6');
    bottomHex = opts.pantsHex ?? '#1e2a44';
    coatHex = '#ffffff';
  } else if (opts.role === 'nurse') {
    topHex = opts.scrubHex ?? '#14b8a6';
    bottomHex = opts.scrubHex ?? '#0f766e';
  } else if (opts.role === 'surgeon') {
    topHex = '#16a34a';
    bottomHex = '#15803d';
    surgicalGear = true;
  } else if (opts.role === 'paramedic') {
    topHex = '#1e2a44';
    bottomHex = '#0f172a';
  } else if (opts.role === 'receptionist') {
    topHex = opts.shirtHex ?? '#4f46e5';
    bottomHex = '#1e2a44';
  } else if (opts.role === 'cleaner') {
    topHex = '#0284c7';
    bottomHex = '#1e2a44';
  } else if (opts.role === 'patient_gown') {
    topHex = '#bae6fd';
    bottomHex = '#7dd3fc';
  }

  const skinMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.72, metalness: 0.02 })
  );
  const hairMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.85, metalness: 0.04 })
  );
  const topMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: topHex, roughness: 0.74, metalness: 0.04 })
  );
  const bottomMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: bottomHex, roughness: 0.8, metalness: 0.04 })
  );
  const shoeMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.55, metalness: 0.1 })
  );

  const root = new THREE.Group();
  const bodyRoot = new THREE.Group();
  root.add(bodyRoot);

  const legLen = 0.66;
  const torsoH = 0.52;
  const headRadius = 0.155;

  const pelvisGeo = reg.trackGeo(new THREE.CylinderGeometry(0.145, 0.15, 0.14, 12));
  const pelvis = new THREE.Mesh(
    pelvisGeo,
    coatHex ? reg.trackMat(new THREE.MeshStandardMaterial({ color: coatHex, roughness: 0.7 })) : bottomMat
  );
  pelvis.position.y = legLen + 0.05;
  pelvis.castShadow = castShadow;
  bodyRoot.add(pelvis);

  const torso = new THREE.Group();
  torso.position.y = legLen + 0.08;
  bodyRoot.add(torso);

  const torsoGeo = reg.trackGeo(new THREE.CapsuleGeometry(0.16, 0.28, 6, 14));
  const torsoMesh = new THREE.Mesh(torsoGeo, topMat);
  torsoMesh.position.y = 0.24;
  torsoMesh.scale.set(1.08, 1.0, 0.78);
  torsoMesh.castShadow = castShadow;
  torso.add(torsoMesh);

  if (coatHex) {
    const coatMat = reg.trackMat(
      new THREE.MeshStandardMaterial({ color: coatHex, roughness: 0.68, metalness: 0.03 })
    );
    const coatGeo = reg.trackGeo(
      new THREE.CylinderGeometry(0.175, 0.205, 0.54, 12, 1, false, Math.PI * 0.14, Math.PI * 1.72)
    );
    const coatMesh = new THREE.Mesh(coatGeo, coatMat);
    coatMesh.position.y = 0.16;
    coatMesh.rotation.y = Math.PI;
    coatMesh.scale.set(1.06, 1.0, 0.84);
    coatMesh.castShadow = castShadow;
    torso.add(coatMesh);

    if (opts.role === 'doctor') {
      const stethMat = reg.trackMat(
        new THREE.MeshStandardMaterial({ color: '#1e2a44', roughness: 0.35, metalness: 0.65 })
      );
      const steth = new THREE.Mesh(
        reg.trackGeo(new THREE.TorusGeometry(0.125, 0.015, 8, 16, Math.PI * 1.35)),
        stethMat
      );
      steth.position.set(0, 0.48, 0.03);
      steth.rotation.set(Math.PI * 0.42, 0, Math.PI * 0.82);
      torso.add(steth);
    }
  } else if (opts.role === 'paramedic') {
    const crimsonMat = reg.trackMat(
      new THREE.MeshStandardMaterial({ color: '#e11d48', roughness: 0.45, metalness: 0.05 })
    );
    const stripe = new THREE.Mesh(
      reg.trackGeo(new THREE.CylinderGeometry(0.172, 0.172, 0.11, 12)),
      crimsonMat
    );
    stripe.position.y = 0.26;
    stripe.scale.set(1.09, 1, 0.8);
    torso.add(stripe);
  } else if (opts.role === 'nurse' || opts.role === 'receptionist') {
    const badgeMat = reg.trackMat(
      new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.4 })
    );
    const badge = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.055, 0.075, 0.015)), badgeMat);
    badge.position.set(0.08, 0.34, 0.135);
    torso.add(badge);
  }

  // Head
  const head = new THREE.Group();
  head.position.y = torsoH + 0.02;
  torso.add(head);

  const neck = new THREE.Mesh(
    reg.trackGeo(new THREE.CylinderGeometry(0.058, 0.068, 0.11, 10)),
    skinMat
  );
  neck.position.y = 0.02;
  head.add(neck);

  const headMesh = new THREE.Mesh(reg.trackGeo(new THREE.SphereGeometry(headRadius, 14, 12)), skinMat);
  headMesh.position.y = 0.18;
  headMesh.scale.set(0.95, 1.06, 0.98);
  headMesh.castShadow = castShadow;
  head.add(headMesh);

  if (surgicalGear) {
    // Surgical scrub cap + face mask
    const capMat = reg.trackMat(
      new THREE.MeshStandardMaterial({ color: '#22c55e', roughness: 0.72 })
    );
    const maskMat = reg.trackMat(
      new THREE.MeshStandardMaterial({ color: '#bbf7d0', roughness: 0.8 })
    );
    const cap = new THREE.Mesh(
      reg.trackGeo(new THREE.SphereGeometry(headRadius * 1.06, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.56)),
      capMat
    );
    cap.position.set(0, 0.2, 0);
    head.add(cap);

    const mask = new THREE.Mesh(
      reg.trackGeo(new THREE.CylinderGeometry(headRadius * 0.96, headRadius * 0.92, 0.11, 12, 1, false, -0.9, 1.8)),
      maskMat
    );
    mask.position.set(0, 0.14, 0.025);
    head.add(mask);
  } else if (hairStyle === 'short') {
    const cap = new THREE.Mesh(
      reg.trackGeo(new THREE.SphereGeometry(headRadius * 1.04, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.56)),
      hairMat
    );
    cap.position.set(0, 0.195, -0.015);
    cap.rotation.x = -0.22;
    head.add(cap);
  } else if (hairStyle === 'bob') {
    const cap = new THREE.Mesh(
      reg.trackGeo(new THREE.SphereGeometry(headRadius * 1.07, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.68)),
      hairMat
    );
    cap.position.set(0, 0.185, -0.02);
    cap.rotation.x = -0.35;
    head.add(cap);
  } else if (hairStyle === 'bun') {
    const cap = new THREE.Mesh(
      reg.trackGeo(new THREE.SphereGeometry(headRadius * 1.04, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.58)),
      hairMat
    );
    cap.position.set(0, 0.19, -0.015);
    cap.rotation.x = -0.26;
    head.add(cap);

    const bun = new THREE.Mesh(reg.trackGeo(new THREE.SphereGeometry(0.068, 10, 8)), hairMat);
    bun.position.set(0, 0.25, -0.155);
    head.add(bun);
  } else {
    const cap = new THREE.Mesh(
      reg.trackGeo(new THREE.SphereGeometry(headRadius * 1.05, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55)),
      hairMat
    );
    cap.position.set(0, 0.195, -0.01);
    cap.rotation.set(-0.2, 0, 0.15);
    head.add(cap);
  }

  // Arms
  const armMat = coatHex
    ? reg.trackMat(new THREE.MeshStandardMaterial({ color: coatHex, roughness: 0.7 }))
    : topMat;
  const gloveMat =
    opts.role === 'lab_tech' || surgicalGear
      ? reg.trackMat(new THREE.MeshStandardMaterial({ color: '#bae6fd', roughness: 0.5 }))
      : skinMat;

  const sleeveGeo = reg.trackGeo(new THREE.CapsuleGeometry(0.048, 0.26, 5, 8));
  const handGeo = reg.trackGeo(new THREE.SphereGeometry(0.045, 8, 6));

  const buildArm = (side: -1 | 1) => {
    const armPivot = new THREE.Group();
    armPivot.position.set(side * 0.215, 0.44, 0);

    const sleeve = new THREE.Mesh(sleeveGeo, armMat);
    sleeve.position.y = -0.17;
    sleeve.castShadow = castShadow;
    armPivot.add(sleeve);

    const hand = new THREE.Mesh(handGeo, gloveMat);
    hand.position.y = -0.35;
    armPivot.add(hand);

    torso.add(armPivot);
    return armPivot;
  };

  const leftArm = buildArm(-1);
  const rightArm = buildArm(1);

  // Legs
  const legGeo = reg.trackGeo(new THREE.CapsuleGeometry(0.06, 0.44, 5, 10));
  const shoeGeo = reg.trackGeo(new THREE.CapsuleGeometry(0.052, 0.08, 5, 8));

  const buildLeg = (side: -1 | 1) => {
    const legPivot = new THREE.Group();
    legPivot.position.set(side * 0.085, legLen, 0);

    const legMesh = new THREE.Mesh(legGeo, bottomMat);
    legMesh.position.y = -0.28;
    legMesh.castShadow = castShadow;
    legPivot.add(legMesh);

    const shoe = new THREE.Mesh(shoeGeo, shoeMat);
    shoe.rotation.x = Math.PI * 0.5;
    shoe.position.set(0, -0.60, 0.045);
    shoe.castShadow = castShadow;
    legPivot.add(shoe);

    bodyRoot.add(legPivot);
    return legPivot;
  };

  const leftLeg = buildLeg(-1);
  const rightLeg = buildLeg(1);

  // Handheld Props
  let propGroup: THREE.Group | undefined;
  if (prop === 'walking_stick') {
    const woodMat = reg.trackMat(new THREE.MeshStandardMaterial({ color: '#92400e', roughness: 0.6 }));
    const stick = new THREE.Mesh(reg.trackGeo(new THREE.CylinderGeometry(0.018, 0.015, 0.85, 8)), woodMat);
    stick.position.set(0.04, -0.72, 0.14);
    stick.rotation.x = 0.14;
    rightArm.add(stick);
    rightArm.rotation.x = -0.25;
  } else if (prop === 'crutches') {
    const aluMat = reg.trackMat(
      new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.35, metalness: 0.75 })
    );
    const padMat = reg.trackMat(new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.7 }));
    [leftArm, rightArm].forEach((arm, idx) => {
      const side = idx === 0 ? -0.05 : 0.05;
      const shaft = new THREE.Mesh(reg.trackGeo(new THREE.CylinderGeometry(0.016, 0.014, 1.05, 8)), aluMat);
      shaft.position.set(side, -0.58, 0.08);
      arm.add(shaft);
      const topPad = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.05, 0.04, 0.16)), padMat);
      topPad.position.set(side, -0.04, 0.06);
      arm.add(topPad);
      arm.rotation.x = -0.15;
    });
  } else if (prop === 'tablet') {
    const tabFrameMat = reg.trackMat(
      new THREE.MeshStandardMaterial({ color: '#1e2a44', roughness: 0.4, metalness: 0.5 })
    );
    const tabScreenMat = reg.trackMat(
      new THREE.MeshStandardMaterial({
        color: '#38bdf8',
        emissive: '#0ea5e9',
        emissiveIntensity: 0.9,
      })
    );
    propGroup = new THREE.Group();
    const body = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.24, 0.02, 0.18)), tabFrameMat);
    const scr = new THREE.Mesh(reg.trackGeo(new THREE.PlaneGeometry(0.20, 0.14)), tabScreenMat);
    scr.rotation.x = -Math.PI * 0.5;
    scr.position.y = 0.012;
    propGroup.add(body, scr);
    propGroup.position.set(0, 0.16, 0.30);
    propGroup.rotation.x = 0.38;
    torso.add(propGroup);
    leftArm.rotation.x = -0.78;
    rightArm.rotation.x = -0.78;
    leftArm.rotation.z = -0.22;
    rightArm.rotation.z = 0.22;
  } else if (prop === 'mop') {
    const handleMat = reg.trackMat(new THREE.MeshStandardMaterial({ color: '#eab308', roughness: 0.5 }));
    const headMat = reg.trackMat(new THREE.MeshStandardMaterial({ color: '#e0f2fe', roughness: 0.95 }));
    propGroup = new THREE.Group();
    const pole = new THREE.Mesh(reg.trackGeo(new THREE.CylinderGeometry(0.018, 0.018, 1.35, 8)), handleMat);
    pole.position.set(0, 0.05, 0.34);
    pole.rotation.x = 0.42;
    const mopHead = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.36, 0.07, 0.18)), headMat);
    mopHead.position.set(0, -0.58, 0.62);
    propGroup.add(pole, mopHead);
    torso.add(propGroup);
    leftArm.rotation.x = -0.72;
    rightArm.rotation.x = -0.55;
  }

  // Apply Pose
  let baseY = 0;
  if (pose === 'seated') {
    leftLeg.rotation.x = -Math.PI * 0.48;
    rightLeg.rotation.x = -Math.PI * 0.48;
    if (prop === 'none') {
      leftArm.rotation.x = -0.35;
      rightArm.rotation.x = -0.35;
    }
    bodyRoot.position.y = -0.26;
  } else if (pose === 'pushing') {
    leftArm.rotation.x = -Math.PI * 0.36;
    rightArm.rotation.x = -Math.PI * 0.36;
  } else if (pose === 'lying') {
    bodyRoot.rotation.x = Math.PI * 0.5;
    bodyRoot.position.set(0, 0.16, -0.66);
    leftArm.rotation.z = 0.08;
    rightArm.rotation.z = -0.08;
    baseY = 0.16;
  }

  root.scale.setScalar(heightScale);

  return {
    group: root,
    bodyRoot,
    torso,
    head,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    pose,
    baseY,
    propGroup,
  };
}

export function animateWalkingRig(
  rig: StylizedPersonRig,
  walkPhase: number,
  strideAmp = 0.45,
  keepArmsFixed = false
) {
  const s = Math.sin(walkPhase);
  rig.leftLeg.rotation.x = s * strideAmp;
  rig.rightLeg.rotation.x = -s * strideAmp;

  if (!keepArmsFixed) {
    rig.leftArm.rotation.x = -s * strideAmp * 0.72;
    rig.rightArm.rotation.x = s * strideAmp * 0.72;
  } else if (rig.pose === 'pushing') {
    rig.leftArm.rotation.x = -Math.PI * 0.36 + Math.sin(walkPhase * 2) * 0.03;
    rig.rightArm.rotation.x = -Math.PI * 0.36 - Math.sin(walkPhase * 2) * 0.03;
  }
  rig.bodyRoot.position.y = Math.abs(Math.cos(walkPhase)) * 0.022;
}

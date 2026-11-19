import * as THREE from 'three';
import { HospitalMaterialRegistry } from '../materials';

export interface AmbulanceInstance {
  group: THREE.Group;
  wheels: THREE.Group[];
  redBeaconMat: THREE.MeshStandardMaterial;
  blueBeaconMat: THREE.MeshStandardMaterial;
  redGlowSprite: THREE.Mesh;
  blueGlowSprite: THREE.Mesh;
  leftDoor: THREE.Group;
  rightDoor: THREE.Group;
}

export interface HelicopterInstance {
  group: THREE.Group;
  mainRotor: THREE.Group;
  tailRotor: THREE.Group;
  beaconMat: THREE.MeshStandardMaterial;
}

export function createAmbulance(reg: HospitalMaterialRegistry, isSoftwareGl: boolean): AmbulanceInstance {
  const group = new THREE.Group();

  const bodyWhiteMat = reg.trackMat(
    new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      roughness: 0.25,
      metalness: 0.08,
      clearcoat: 0.6,
      clearcoatRoughness: 0.18,
    })
  );
  // Crimson (#e11d48) kept as the strongest red in the scene
  const stripeCrimsonMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: '#e11d48', roughness: 0.35, metalness: 0.08 })
  );
  const stripeAmberMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.35, metalness: 0.08 })
  );
  const darkTrimMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: '#1e2a44', roughness: 0.58, metalness: 0.25 })
  );
  const chromeMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.22, metalness: 0.85 })
  );
  const glassMat = reg.trackMat(
    new THREE.MeshPhysicalMaterial({
      color: '#0f172a',
      roughness: 0.08,
      metalness: 0.1,
      clearcoat: 1.0,
      transparent: true,
      opacity: isSoftwareGl ? 0.65 : 0.78,
    })
  );
  const headlightMat = reg.trackMat(
    new THREE.MeshStandardMaterial({
      color: '#fef9c3',
      emissive: '#fde047',
      emissiveIntensity: 1.1,
      roughness: 0.2,
    })
  );

  // Lower chassis
  const chassis = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(1.76, 0.24, 4.35)), darkTrimMat);
  chassis.position.set(0, 0.36, 0);
  chassis.castShadow = true;
  group.add(chassis);

  // Rear patient compartment
  const rearBox = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(1.86, 1.48, 2.75)), bodyWhiteMat);
  rearBox.position.set(0, 1.20, -0.78);
  rearBox.castShadow = true;
  rearBox.receiveShadow = true;
  group.add(rearBox);

  [-0.935, 0.935].forEach(x => {
    const redStripe = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.02, 0.22, 2.72)), stripeCrimsonMat);
    redStripe.position.set(x, 0.92, -0.78);
    group.add(redStripe);

    const amberStripe = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.02, 0.08, 2.72)), stripeAmberMat);
    amberStripe.position.set(x, 0.74, -0.78);
    group.add(amberStripe);

    const crossH = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.03, 0.14, 0.42)), stripeCrimsonMat);
    crossH.position.set(x, 1.44, -0.78);
    group.add(crossH);

    const crossV = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.03, 0.42, 0.14)), stripeCrimsonMat);
    crossV.position.set(x, 1.44, -0.78);
    group.add(crossV);
  });

  // Roof cross
  const roofCrossH = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.56, 0.03, 0.18)), stripeCrimsonMat);
  roofCrossH.position.set(0, 1.95, -0.88);
  group.add(roofCrossH);
  const roofCrossV = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.18, 0.03, 0.56)), stripeCrimsonMat);
  roofCrossV.position.set(0, 1.95, -0.88);
  group.add(roofCrossV);

  // Cab + Hood
  const cabBody = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(1.76, 1.15, 1.15)), bodyWhiteMat);
  cabBody.position.set(0, 1.04, 1.12);
  cabBody.castShadow = true;
  group.add(cabBody);

  const hood = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(1.72, 0.58, 0.75)), bodyWhiteMat);
  hood.position.set(0, 0.76, 1.88);
  hood.castShadow = true;
  group.add(hood);

  const windshield = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(1.56, 0.52, 0.08)), glassMat);
  windshield.position.set(0, 1.32, 1.66);
  windshield.rotation.x = -0.34;
  group.add(windshield);

  [-0.885, 0.885].forEach(x => {
    const sideWin = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.02, 0.44, 0.78)), glassMat);
    sideWin.position.set(x, 1.30, 1.18);
    group.add(sideWin);
  });

  const bumper = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(1.82, 0.20, 0.18)), darkTrimMat);
  bumper.position.set(0, 0.42, 2.24);
  group.add(bumper);

  const grille = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.96, 0.28, 0.06)), chromeMat);
  grille.position.set(0, 0.68, 2.24);
  group.add(grille);

  [-0.66, 0.66].forEach(x => {
    const hl = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.26, 0.14, 0.06)), headlightMat);
    hl.position.set(x, 0.68, 2.24);
    group.add(hl);
  });

  // Rear Hinged Doors
  const leftDoor = new THREE.Group();
  leftDoor.position.set(-0.90, 1.18, -2.16);
  const leftDoorMesh = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.88, 1.24, 0.06)), bodyWhiteMat);
  leftDoorMesh.position.set(0.44, 0, 0);
  leftDoor.add(leftDoorMesh);
  const leftDoorWin = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.52, 0.42, 0.075)), glassMat);
  leftDoorWin.position.set(0.44, 0.24, 0);
  leftDoor.add(leftDoorWin);
  group.add(leftDoor);

  const rightDoor = new THREE.Group();
  rightDoor.position.set(0.90, 1.18, -2.16);
  const rightDoorMesh = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.88, 1.24, 0.06)), bodyWhiteMat);
  rightDoorMesh.position.set(-0.44, 0, 0);
  rightDoor.add(rightDoorMesh);
  const rightDoorWin = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.52, 0.42, 0.075)), glassMat);
  rightDoorWin.position.set(-0.44, 0.24, 0);
  rightDoor.add(rightDoorWin);
  group.add(rightDoor);

  // Roof Flashing Lightbar (Crimson & Blue)
  const lightbarBase = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(1.24, 0.08, 0.26)), darkTrimMat);
  lightbarBase.position.set(0, 1.98, 0.36);
  group.add(lightbarBase);

  const redBeaconMat = reg.trackMat(
    new THREE.MeshStandardMaterial({
      color: '#e11d48',
      emissive: '#e11d48',
      emissiveIntensity: 2.2,
      roughness: 0.2,
    })
  );
  const blueBeaconMat = reg.trackMat(
    new THREE.MeshStandardMaterial({
      color: '#3b82f6',
      emissive: '#2563eb',
      emissiveIntensity: 0.3,
      roughness: 0.2,
    })
  );

  const redBeacon = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.44, 0.14, 0.24)), redBeaconMat);
  redBeacon.position.set(-0.36, 2.06, 0.36);
  group.add(redBeacon);

  const blueBeacon = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.44, 0.14, 0.24)), blueBeaconMat);
  blueBeacon.position.set(0.36, 2.06, 0.36);
  group.add(blueBeacon);

  const redGlowMat = reg.trackMat(
    new THREE.MeshBasicMaterial({
      color: '#e11d48',
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
    })
  );
  const blueGlowMat = reg.trackMat(
    new THREE.MeshBasicMaterial({
      color: '#3b82f6',
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
    })
  );
  const glowGeo = reg.trackGeo(new THREE.SphereGeometry(0.48, 10, 8));
  const redGlowSprite = new THREE.Mesh(glowGeo, redGlowMat);
  redGlowSprite.position.set(-0.36, 2.08, 0.36);
  group.add(redGlowSprite);

  const blueGlowSprite = new THREE.Mesh(glowGeo, blueGlowMat);
  blueGlowSprite.position.set(0.36, 2.08, 0.36);
  group.add(blueGlowSprite);

  // Wheels
  const wheels: THREE.Group[] = [];
  const tireGeo = reg.trackGeo(new THREE.CylinderGeometry(0.32, 0.32, 0.22, 14));
  tireGeo.rotateZ(Math.PI * 0.5);
  const rimGeo = reg.trackGeo(new THREE.CylinderGeometry(0.18, 0.18, 0.24, 10));
  rimGeo.rotateZ(Math.PI * 0.5);

  [
    [-0.88, 0.32, 1.48],
    [0.88, 0.32, 1.48],
    [-0.88, 0.32, -1.32],
    [0.88, 0.32, -1.32],
  ].forEach(([x, y, z]) => {
    const wg = new THREE.Group();
    wg.position.set(x, y, z);
    const tire = new THREE.Mesh(tireGeo, darkTrimMat);
    tire.castShadow = true;
    wg.add(tire);
    wg.add(new THREE.Mesh(rimGeo, chromeMat));
    group.add(wg);
    wheels.push(wg);
  });

  return {
    group,
    wheels,
    redBeaconMat,
    blueBeaconMat,
    redGlowSprite,
    blueGlowSprite,
    leftDoor,
    rightDoor,
  };
}

export function createHelipadDeck(reg: HospitalMaterialRegistry): THREE.Group {
  const group = new THREE.Group();
  const navyMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: '#1e2a44', roughness: 0.65, metalness: 0.2 })
  );
  const padMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.85 })
  );
  const yellowMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: '#facc15', roughness: 0.5 })
  );
  const whiteMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.4 })
  );
  const lightMat = reg.trackMat(
    new THREE.MeshStandardMaterial({
      color: '#22c55e',
      emissive: '#22c55e',
      emissiveIntensity: 1.5,
    })
  );

  // Structural columns supporting roof helipad
  const colGeo = reg.trackGeo(new THREE.CylinderGeometry(0.14, 0.16, 3.6, 10));
  [
    [-2.0, -2.0],
    [2.0, -2.0],
    [-2.0, 2.0],
    [2.0, 2.0],
  ].forEach(([x, z]) => {
    const col = new THREE.Mesh(colGeo, navyMat);
    col.position.set(x, 1.8, z);
    col.castShadow = true;
    group.add(col);
  });

  // Helipad Platform Slab at y = 3.6
  const deck = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(5.0, 0.24, 5.0)), navyMat);
  deck.position.y = 3.62;
  deck.castShadow = true;
  deck.receiveShadow = true;
  group.add(deck);

  const surface = new THREE.Mesh(reg.trackGeo(new THREE.CylinderGeometry(2.2, 2.2, 0.04, 28)), padMat);
  surface.position.y = 3.76;
  surface.receiveShadow = true;
  group.add(surface);

  const ring = new THREE.Mesh(reg.trackGeo(new THREE.RingGeometry(1.65, 1.86, 28)), yellowMat);
  ring.rotation.x = -Math.PI * 0.5;
  ring.position.y = 3.79;
  group.add(ring);

  // Crisp White "H"
  const hLeft = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.24, 0.03, 1.45)), whiteMat);
  hLeft.position.set(-0.46, 3.79, 0);
  const hRight = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.24, 0.03, 1.45)), whiteMat);
  hRight.position.set(0.46, 3.79, 0);
  const hCross = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.92, 0.03, 0.24)), whiteMat);
  hCross.position.set(0, 3.79, 0);
  group.add(hLeft, hRight, hCross);

  // Perimeter corner guide lights
  const ledGeo = reg.trackGeo(new THREE.SphereGeometry(0.09, 8, 8));
  [
    [-2.25, -2.25],
    [2.25, -2.25],
    [-2.25, 2.25],
    [2.25, 2.25],
  ].forEach(([x, z]) => {
    const led = new THREE.Mesh(ledGeo, lightMat);
    led.position.set(x, 3.78, z);
    group.add(led);
  });

  return group;
}

export function createHelicopter(reg: HospitalMaterialRegistry): HelicopterInstance {
  const group = new THREE.Group();

  const whiteMat = reg.trackMat(
    new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.25, clearcoat: 0.6 })
  );
  const crimsonMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: '#e11d48', roughness: 0.35 })
  );
  const navyMat = reg.trackMat(
    new THREE.MeshStandardMaterial({ color: '#1e2a44', roughness: 0.4, metalness: 0.55 })
  );
  const glassMat = reg.trackMat(
    new THREE.MeshPhysicalMaterial({
      color: '#0f172a',
      roughness: 0.1,
      transparent: true,
      opacity: 0.72,
    })
  );
  const beaconMat = reg.trackMat(
    new THREE.MeshStandardMaterial({
      color: '#e11d48',
      emissive: '#e11d48',
      emissiveIntensity: 1.8,
    })
  );

  // Main rounded cabin fuselage
  const cabin = new THREE.Mesh(reg.trackGeo(new THREE.CapsuleGeometry(0.58, 1.25, 8, 14)), whiteMat);
  cabin.rotation.x = Math.PI * 0.5;
  cabin.scale.set(1.05, 1.0, 0.96);
  cabin.position.set(0, 0.85, 0.15);
  cabin.castShadow = true;
  group.add(cabin);

  // Crimson belly & stripe
  const stripe = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(1.24, 0.18, 1.4)), crimsonMat);
  stripe.position.set(0, 0.72, 0.05);
  group.add(stripe);

  // Cockpit canopy
  const cockpit = new THREE.Mesh(
    reg.trackGeo(new THREE.SphereGeometry(0.55, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55)),
    glassMat
  );
  cockpit.rotation.x = Math.PI * 0.38;
  cockpit.position.set(0, 0.90, 0.76);
  group.add(cockpit);

  // Tail boom + fin
  const boom = new THREE.Mesh(reg.trackGeo(new THREE.CylinderGeometry(0.11, 0.18, 1.9, 10)), whiteMat);
  boom.rotation.x = Math.PI * 0.5;
  boom.position.set(0, 0.92, -1.42);
  boom.castShadow = true;
  group.add(boom);

  const fin = new THREE.Mesh(reg.trackGeo(new THREE.BoxGeometry(0.08, 0.65, 0.38)), crimsonMat);
  fin.position.set(0, 1.15, -2.25);
  fin.rotation.x = -0.25;
  group.add(fin);

  // Landing Skids (bottom at y = 0)
  const skidGeo = reg.trackGeo(new THREE.CylinderGeometry(0.038, 0.038, 2.25, 8));
  skidGeo.rotateX(Math.PI * 0.5);
  [-0.58, 0.58].forEach(x => {
    const skid = new THREE.Mesh(skidGeo, navyMat);
    skid.position.set(x, 0.04, 0.12);
    group.add(skid);

    [-0.4, 0.55].forEach(z => {
      const strut = new THREE.Mesh(reg.trackGeo(new THREE.CylinderGeometry(0.028, 0.028, 0.45, 6)), navyMat);
      strut.position.set(x * 0.85, 0.25, z);
      strut.rotation.z = x > 0 ? 0.35 : -0.35;
      group.add(strut);
    });
  });

  // Main Rotor Assembly
  const mainRotor = new THREE.Group();
  mainRotor.position.set(0, 1.56, 0.05);
  const mast = new THREE.Mesh(reg.trackGeo(new THREE.CylinderGeometry(0.06, 0.08, 0.24, 10)), navyMat);
  mast.position.y = -0.10;
  mainRotor.add(mast);

  const bladeGeo = reg.trackGeo(new THREE.BoxGeometry(3.8, 0.03, 0.16));
  const b1 = new THREE.Mesh(bladeGeo, navyMat);
  const b2 = new THREE.Mesh(bladeGeo, navyMat);
  b2.rotation.y = Math.PI * 0.5;
  mainRotor.add(b1, b2);
  group.add(mainRotor);

  // Tail Rotor
  const tailRotor = new THREE.Group();
  tailRotor.position.set(0.11, 1.24, -2.25);
  const tBladeGeo = reg.trackGeo(new THREE.BoxGeometry(0.02, 0.66, 0.08));
  const tb1 = new THREE.Mesh(tBladeGeo, navyMat);
  const tb2 = new THREE.Mesh(tBladeGeo, navyMat);
  tb2.rotation.x = Math.PI * 0.5;
  tailRotor.add(tb1, tb2);
  group.add(tailRotor);

  // Tail Beacon
  const beacon = new THREE.Mesh(reg.trackGeo(new THREE.SphereGeometry(0.08, 8, 8)), beaconMat);
  beacon.position.set(0, 1.48, -2.28);
  group.add(beacon);

  return { group, mainRotor, tailRotor, beaconMat };
}

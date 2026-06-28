import * as THREE from "three";

/**
 * Procedural Honda Civic, broken into individually clickable parts.
 *
 * Authoring convention:
 *   - x = width (left = -x, right = +x), car centered on 0
 *   - y = up, ground plane at y = 0
 *   - z = length, FRONT of the car at +z, REAR at -z
 *
 * Every part is a THREE.Group positioned at the origin whose child meshes are
 * placed at their true world coordinates. To "explode" a part we simply set
 * group.position = explode * amount, so at amount 0 everything is assembled.
 */

// ---------- Materials ----------
export function makeMaterials() {
  return {
    body: new THREE.MeshStandardMaterial({ color: 0xd11f22, metalness: 0.25, roughness: 0.45 }),
    bodyDark: new THREE.MeshStandardMaterial({ color: 0x7c1013, metalness: 0.2, roughness: 0.5 }),
    glass: new THREE.MeshStandardMaterial({ color: 0x9fc4d6, metalness: 0.1, roughness: 0.05, transparent: true, opacity: 0.4 }),
    tire: new THREE.MeshStandardMaterial({ color: 0x16181c, metalness: 0.1, roughness: 0.9 }),
    rim: new THREE.MeshStandardMaterial({ color: 0xc7ccd4, metalness: 0.95, roughness: 0.25 }),
    chrome: new THREE.MeshStandardMaterial({ color: 0xdfe4ea, metalness: 1.0, roughness: 0.15 }),
    engine: new THREE.MeshStandardMaterial({ color: 0x70757e, metalness: 0.85, roughness: 0.4 }),
    engineRed: new THREE.MeshStandardMaterial({ color: 0xb32f2f, metalness: 0.6, roughness: 0.45 }),
    metalDark: new THREE.MeshStandardMaterial({ color: 0x474d57, metalness: 0.8, roughness: 0.5 }),
    plastic: new THREE.MeshStandardMaterial({ color: 0x23262c, metalness: 0.2, roughness: 0.8 }),
    seat: new THREE.MeshStandardMaterial({ color: 0x33373f, metalness: 0.1, roughness: 0.95 }),
    copper: new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.9, roughness: 0.4 }),
    battery: new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.3, roughness: 0.7 }),
    light: new THREE.MeshStandardMaterial({ color: 0xfff4c2, emissive: 0xfff0b0, emissiveIntensity: 0.6, roughness: 0.2 }),
    redLight: new THREE.MeshStandardMaterial({ color: 0xff5252, emissive: 0xd11, emissiveIntensity: 0.5, roughness: 0.3 }),
    exhaust: new THREE.MeshStandardMaterial({ color: 0x9aa0a8, metalness: 0.9, roughness: 0.45 }),
  };
}

// ---------- Geometry helpers ----------
function box(w, h, d, x, y, z, material, rot) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(x, y, z);
  if (rot) m.rotation.set(rot[0] || 0, rot[1] || 0, rot[2] || 0);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}
function cyl(rTop, rBot, h, x, y, z, material, axis = "y", rot) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, 28), material);
  m.position.set(x, y, z);
  if (axis === "x") m.rotation.z = Math.PI / 2;
  if (axis === "z") m.rotation.x = Math.PI / 2;
  if (rot) m.rotation.set(rot[0] || 0, rot[1] || 0, rot[2] || 0);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}
function group(...meshes) {
  const g = new THREE.Group();
  meshes.forEach((m) => g.add(m));
  return g;
}

// ---------- Individual part builders ----------
function buildBodyShell(M) {
  const g = new THREE.Group();
  // Lower body / fenders / sills (the bit that stays when panels come off)
  g.add(box(1.55, 0.44, 4.0, 0, 0.56, -0.02, M.body));
  // Beltline rail under the windows
  g.add(box(1.52, 0.08, 4.0, 0, 0.8, -0.02, M.bodyDark));
  // Sills
  g.add(box(1.62, 0.12, 3.4, 0, 0.4, -0.02, M.bodyDark));
  // Pillars (A / B / C) on both sides that hold the roof
  const pillarZ = [0.82, -0.28, -1.18];
  for (const z of pillarZ) {
    for (const x of [-0.74, 0.74]) {
      g.add(box(0.07, 0.56, 0.09, x, 1.07, z, M.body));
    }
  }
  // Rear deck / parcel shelf base
  g.add(box(1.5, 0.1, 0.8, 0, 0.86, -1.55, M.body));
  // Taillights (cosmetic, stay with shell)
  g.add(box(0.42, 0.18, 0.05, -0.55, 0.78, -2.04, M.redLight));
  g.add(box(0.42, 0.18, 0.05, 0.55, 0.78, -2.04, M.redLight));
  return g;
}

function buildHood(M) {
  const g = new THREE.Group();
  g.add(box(1.46, 0.06, 1.05, 0, 0.92, 1.42, M.body, [-0.06, 0, 0]));
  // subtle power bulge
  g.add(box(0.5, 0.04, 0.9, 0, 0.95, 1.42, M.bodyDark));
  return g;
}

function buildRoof(M) {
  const g = new THREE.Group();
  g.add(box(1.36, 0.07, 1.6, 0, 1.34, -0.06, M.body));
  // Windshield (front, sloped)
  g.add(box(1.3, 0.58, 0.05, 0, 1.06, 0.92, M.glass, [-0.62, 0, 0]));
  // Rear glass (sloped)
  g.add(box(1.3, 0.52, 0.05, 0, 1.06, -1.18, M.glass, [0.6, 0, 0]));
  return g;
}

function buildTrunk(M) {
  return group(box(1.46, 0.06, 0.92, 0, 0.92, -1.78, M.body, [0.05, 0, 0]));
}

function buildDoor(M, side, frontBack) {
  const x = side === "L" ? -0.79 : 0.79;
  const z = frontBack === "front" ? 0.27 : -0.73;
  const g = new THREE.Group();
  // lower door skin
  g.add(box(0.06, 0.42, 0.66, x, 0.56, z, M.body));
  // window glass
  g.add(box(0.04, 0.32, 0.6, x, 0.99, z, M.glass));
  // handle
  g.add(box(0.03, 0.05, 0.16, x + (side === "L" ? -0.02 : 0.02), 0.74, z + 0.12, M.chrome));
  // side mirror on front doors
  if (frontBack === "front") {
    g.add(box(0.1, 0.09, 0.14, x + (side === "L" ? -0.08 : 0.08), 0.86, z + 0.34, M.body));
  }
  return g;
}

function buildBumper(M, frontBack) {
  const z = frontBack === "front" ? 2.12 : -2.12;
  const g = new THREE.Group();
  g.add(box(1.68, 0.34, 0.22, 0, 0.5, z, M.bodyDark));
  g.add(box(1.4, 0.1, 0.12, 0, 0.36, z + (frontBack === "front" ? 0.06 : -0.06), M.plastic));
  return g;
}

function buildEngine(M) {
  const g = new THREE.Group();
  // block (transverse, so it's wider in x)
  g.add(box(0.72, 0.5, 0.6, 0.12, 0.62, 1.52, M.engine));
  // cylinder head + valve cover (Honda red)
  g.add(box(0.74, 0.16, 0.55, 0.12, 0.92, 1.52, M.engineRed));
  // intake manifold
  g.add(cyl(0.07, 0.07, 0.5, 0.12, 0.86, 1.86, M.engine, "x"));
  // pulleys on the end
  g.add(cyl(0.13, 0.13, 0.08, 0.52, 0.62, 1.52, M.metalDark, "x"));
  return g;
}

function buildTransmission(M) {
  const g = new THREE.Group();
  // bell housing + transaxle, sits beside the engine (transverse FWD)
  g.add(cyl(0.27, 0.22, 0.34, -0.5, 0.6, 1.5, M.metalDark, "x"));
  g.add(box(0.34, 0.42, 0.5, -0.74, 0.55, 1.5, M.metalDark));
  // driveshaft stub
  g.add(cyl(0.05, 0.05, 0.4, -1.0, 0.55, 1.5, M.chrome, "x"));
  return g;
}

function buildRadiator(M) {
  const g = new THREE.Group();
  g.add(box(1.1, 0.5, 0.08, 0, 0.62, 1.98, M.metalDark));
  // cooling fins
  for (let i = -4; i <= 4; i++) {
    g.add(box(1.05, 0.03, 0.06, 0, 0.62 + i * 0.055, 1.99, M.exhaust));
  }
  // fan
  g.add(cyl(0.2, 0.2, 0.05, 0, 0.62, 1.9, M.plastic, "z"));
  return g;
}

function buildAirIntake(M) {
  const g = new THREE.Group();
  g.add(box(0.42, 0.26, 0.4, 0.42, 0.95, 1.55, M.plastic));
  g.add(cyl(0.06, 0.06, 0.35, 0.1, 0.95, 1.6, M.plastic, "x"));
  return g;
}

function buildExhaust(M) {
  const g = new THREE.Group();
  // header down from engine, then a long pipe to the rear
  g.add(cyl(0.05, 0.05, 0.5, 0.15, 0.45, 1.4, M.exhaust, "y"));
  g.add(cyl(0.045, 0.045, 3.2, 0.18, 0.2, -0.1, M.exhaust, "z"));
  // muffler + tip
  g.add(cyl(0.13, 0.13, 0.55, 0.18, 0.22, -1.7, M.exhaust, "z"));
  g.add(cyl(0.05, 0.05, 0.18, 0.18, 0.22, -2.05, M.chrome, "z"));
  return g;
}

function buildFuelTank(M) {
  return group(box(0.9, 0.3, 0.7, 0, 0.34, -1.0, M.metalDark));
}

function buildDashboard(M) {
  const g = new THREE.Group();
  g.add(box(1.4, 0.26, 0.28, 0, 0.84, 0.74, M.plastic));
  // instrument cluster + screen
  g.add(box(0.4, 0.16, 0.04, -0.42, 0.9, 0.6, M.glass));
  g.add(box(0.34, 0.2, 0.04, 0.18, 0.88, 0.6, M.glass));
  // center console
  g.add(box(0.26, 0.42, 0.7, 0, 0.55, 0.2, M.plastic));
  return g;
}

function buildSteeringWheel(M) {
  const g = new THREE.Group();
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.025, 12, 32), M.plastic);
  wheel.position.set(-0.42, 0.92, 0.6);
  wheel.rotation.x = 1.15;
  wheel.castShadow = true;
  g.add(wheel);
  g.add(cyl(0.03, 0.03, 0.22, -0.42, 0.86, 0.66, M.plastic, "z", [1.15, 0, 0]));
  return g;
}

function buildFrontSeats(M) {
  const g = new THREE.Group();
  for (const x of [-0.4, 0.4]) {
    g.add(box(0.46, 0.12, 0.5, x, 0.62, 0.18, M.seat)); // cushion
    g.add(box(0.46, 0.56, 0.12, x, 0.9, -0.06, M.seat)); // backrest
    g.add(box(0.2, 0.16, 0.12, x, 1.22, -0.05, M.seat)); // headrest
  }
  return g;
}

function buildRearSeat(M) {
  const g = new THREE.Group();
  g.add(box(1.2, 0.12, 0.5, 0, 0.62, -0.95, M.seat));
  g.add(box(1.2, 0.5, 0.12, 0, 0.86, -1.2, M.seat));
  return g;
}

function buildSubframe(M) {
  const g = new THREE.Group();
  // frame rails + cross members under the floor
  for (const x of [-0.55, 0.55]) g.add(box(0.1, 0.12, 3.4, x, 0.3, 0, M.metalDark));
  g.add(box(1.3, 0.1, 0.14, 0, 0.3, 1.4, M.metalDark));
  g.add(box(1.3, 0.1, 0.14, 0, 0.3, -1.4, M.metalDark));
  g.add(box(1.3, 0.1, 0.14, 0, 0.3, 0, M.metalDark));
  return g;
}

function buildSuspension(M, frontBack) {
  const z = frontBack === "front" ? 1.45 : -1.45;
  const g = new THREE.Group();
  for (const x of [-0.7, 0.7]) {
    // strut
    g.add(cyl(0.04, 0.06, 0.45, x, 0.5, z, M.chrome));
    // coil spring (stylised)
    g.add(cyl(0.11, 0.11, 0.3, x, 0.5, z, M.exhaust));
    // lower control arm
    g.add(box(0.3, 0.05, 0.12, x * 0.7, 0.32, z, M.metalDark));
  }
  return g;
}

function buildWheel(M, x, z) {
  const g = new THREE.Group();
  const tire = cyl(0.34, 0.34, 0.22, x, 0.34, z, M.tire, "x");
  g.add(tire);
  const rim = cyl(0.21, 0.21, 0.23, x, 0.34, z, M.rim, "x");
  g.add(rim);
  // spokes
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const spoke = box(0.04, 0.32, 0.05, x, 0.34, z, M.rim);
    spoke.rotation.x = a;
    g.add(spoke);
  }
  g.add(cyl(0.06, 0.06, 0.25, x, 0.34, z, M.chrome, "x")); // hub cap
  return g;
}

function buildBattery(M) {
  const g = new THREE.Group();
  g.add(box(0.34, 0.28, 0.24, -0.5, 0.86, 1.78, M.battery));
  g.add(box(0.07, 0.05, 0.07, -0.58, 1.02, 1.7, M.copper));
  g.add(box(0.07, 0.05, 0.07, -0.42, 1.02, 1.7, M.copper));
  return g;
}

function buildHeadlights(M) {
  const g = new THREE.Group();
  for (const x of [-0.6, 0.6]) {
    g.add(box(0.34, 0.18, 0.1, x, 0.66, 2.0, M.light));
  }
  return g;
}

// ---------- Part registry ----------
// Each entry: id, name, category, explode vector, build fn, info {desc, specs[]}
export function createParts() {
  const M = makeMaterials();

  const defs = [
    // POWERTRAIN
    {
      id: "engine", name: "Engine", category: "Powertrain", explode: [0, 1.7, 1.0],
      build: () => buildEngine(M),
      info: {
        desc: "A transverse-mounted inline-4 gasoline engine. On the modern Civic this is typically a 2.0L naturally aspirated or a turbocharged 1.5L unit driving the front wheels.",
        specs: [["Layout", "Inline-4, transverse"], ["Displacement", "1.5L turbo / 2.0L"], ["Output", "158–200 hp"], ["Valvetrain", "DOHC i-VTEC"]],
      },
    },
    {
      id: "transmission", name: "Transmission (Transaxle)", category: "Powertrain", explode: [-1.4, 0.9, 0.6],
      build: () => buildTransmission(M),
      info: {
        desc: "Combined gearbox and differential (a transaxle) that sits next to the engine in a front-wheel-drive layout. It sends power to the front wheels via the half-shafts.",
        specs: [["Type", "CVT or 6-speed manual"], ["Drive", "Front-wheel drive"], ["Diff", "Integrated open differential"]],
      },
    },
    {
      id: "radiator", name: "Radiator", category: "Powertrain", explode: [0, 0.6, 1.9],
      build: () => buildRadiator(M),
      info: {
        desc: "Front-mounted heat exchanger that cools engine coolant. Air passing through the fins (helped by the electric fan) carries heat away from the engine.",
        specs: [["Coolant", "50/50 ethylene glycol"], ["Fan", "Electric, thermostat-controlled"], ["Location", "Behind front grille"]],
      },
    },
    {
      id: "intake", name: "Air Intake", category: "Powertrain", explode: [0.6, 1.9, 1.4],
      build: () => buildAirIntake(M),
      info: {
        desc: "Routes filtered outside air into the engine. The airbox houses the air filter that keeps dust out of the combustion chambers.",
        specs: [["Filter", "Pleated paper element"], ["Path", "Airbox → throttle body"]],
      },
    },
    {
      id: "exhaust", name: "Exhaust System", category: "Powertrain", explode: [0, -1.1, -1.3],
      build: () => buildExhaust(M),
      info: {
        desc: "Carries combustion gases from the engine to the rear of the car, reducing noise (muffler) and emissions (catalytic converter) along the way.",
        specs: [["Material", "Stainless steel"], ["Includes", "Header, cat, muffler"], ["Routing", "Engine bay → rear tip"]],
      },
    },
    {
      id: "fuel-tank", name: "Fuel Tank", category: "Powertrain", explode: [0, -1.2, -1.0],
      build: () => buildFuelTank(M),
      info: {
        desc: "Stores gasoline, mounted ahead of the rear axle under the rear seat for crash safety and weight distribution.",
        specs: [["Capacity", "~47 L (12.4 gal)"], ["Location", "Under rear seat"], ["Material", "High-density polyethylene"]],
      },
    },

    // BODY & EXTERIOR
    {
      id: "body-shell", name: "Body Shell (Unibody)", category: "Body & Exterior", explode: [0, 0, 0],
      build: () => buildBodyShell(M),
      info: {
        desc: "The unibody structure — fenders, sills, pillars and roof rails formed as one welded shell. It's the backbone everything else bolts to. (This is the reference part; everything explodes away from it.)",
        specs: [["Construction", "Welded steel unibody"], ["Pillars", "A / B / C"], ["Includes", "Taillights, beltline"]],
      },
    },
    {
      id: "hood", name: "Hood", category: "Body & Exterior", explode: [0, 1.4, 0.5],
      build: () => buildHood(M),
      info: {
        desc: "Hinged panel covering the engine bay. Lift it to reach the engine, battery and fluids.",
        specs: [["Material", "Stamped steel / aluminum"], ["Hinge", "Rear-hinged"]],
      },
    },
    {
      id: "roof", name: "Roof & Glass", category: "Body & Exterior", explode: [0, 2.0, 0],
      build: () => buildRoof(M),
      info: {
        desc: "The roof panel together with the front windshield and rear glass that enclose the cabin.",
        specs: [["Windshield", "Laminated safety glass"], ["Rear glass", "Tempered, often defrosted"]],
      },
    },
    {
      id: "trunk", name: "Trunk Lid", category: "Body & Exterior", explode: [0, 1.2, -1.0],
      build: () => buildTrunk(M),
      info: {
        desc: "Rear-hinged lid over the cargo area. Provides access to the trunk and spare wheel well.",
        specs: [["Type", "Sedan deck lid"], ["Latch", "Electric release"]],
      },
    },
    {
      id: "bumper-front", name: "Front Bumper", category: "Body & Exterior", explode: [0, 0.2, 1.7],
      build: () => buildBumper(M, "front"),
      info: {
        desc: "Energy-absorbing front fascia. Houses the lower grille and, on many trims, parking sensors and fog lights.",
        specs: [["Material", "Molded polypropylene"], ["Function", "Pedestrian & low-speed protection"]],
      },
    },
    {
      id: "bumper-rear", name: "Rear Bumper", category: "Body & Exterior", explode: [0, 0.2, -1.7],
      build: () => buildBumper(M, "rear"),
      info: {
        desc: "Rear energy-absorbing fascia, typically integrating reflectors and parking sensors.",
        specs: [["Material", "Molded polypropylene"], ["Function", "Low-speed impact protection"]],
      },
    },
    {
      id: "door-fl", name: "Front Left Door", category: "Body & Exterior", explode: [-1.6, 0.3, 0.3],
      build: () => buildDoor(M, "L", "front"),
      info: { desc: "Driver's door (LHD). Carries the window, side mirror, and door handle.", specs: [["Side", "Front left"], ["Includes", "Mirror, window, handle"]] },
    },
    {
      id: "door-fr", name: "Front Right Door", category: "Body & Exterior", explode: [1.6, 0.3, 0.3],
      build: () => buildDoor(M, "R", "front"),
      info: { desc: "Front passenger door. Carries the window, side mirror, and door handle.", specs: [["Side", "Front right"], ["Includes", "Mirror, window, handle"]] },
    },
    {
      id: "door-rl", name: "Rear Left Door", category: "Body & Exterior", explode: [-1.6, 0.3, -0.7],
      build: () => buildDoor(M, "L", "rear"),
      info: { desc: "Rear left passenger door.", specs: [["Side", "Rear left"], ["Includes", "Window, handle"]] },
    },
    {
      id: "door-rr", name: "Rear Right Door", category: "Body & Exterior", explode: [1.6, 0.3, -0.7],
      build: () => buildDoor(M, "R", "rear"),
      info: { desc: "Rear right passenger door.", specs: [["Side", "Rear right"], ["Includes", "Window, handle"]] },
    },

    // INTERIOR
    {
      id: "dashboard", name: "Dashboard", category: "Interior", explode: [0, 1.5, 1.2],
      build: () => buildDashboard(M),
      info: {
        desc: "The instrument panel: gauges, infotainment screen, climate controls and the center console between the front seats.",
        specs: [["Cluster", "Digital / hybrid gauges"], ["Infotainment", "Touchscreen + HVAC"], ["Console", "Shifter & storage"]],
      },
    },
    {
      id: "steering", name: "Steering Wheel", category: "Interior", explode: [-1.0, 1.4, 0.9],
      build: () => buildSteeringWheel(M),
      info: {
        desc: "Driver's steering wheel and column. Connects through a rack-and-pinion to steer the front wheels; usually houses the airbag and audio/cruise controls.",
        specs: [["System", "Electric power steering"], ["Position", "Left-hand drive"], ["Controls", "Airbag, cruise, audio"]],
      },
    },
    {
      id: "front-seats", name: "Front Seats", category: "Interior", explode: [0, 1.7, 0.4],
      build: () => buildFrontSeats(M),
      info: {
        desc: "Driver and front-passenger bucket seats with headrests. Higher trims add heating and power adjustment.",
        specs: [["Type", "Bucket seats"], ["Adjustment", "Manual / power"], ["Headrests", "Adjustable"]],
      },
    },
    {
      id: "rear-seat", name: "Rear Seat", category: "Interior", explode: [0, 1.6, -1.2],
      build: () => buildRearSeat(M),
      info: {
        desc: "60/40 split-folding rear bench, seating three and folding to extend the trunk.",
        specs: [["Layout", "60/40 split bench"], ["Capacity", "3 passengers"], ["Feature", "Folds for cargo"]],
      },
    },

    // CHASSIS & WHEELS
    {
      id: "subframe", name: "Subframe / Chassis", category: "Chassis & Wheels", explode: [0, -1.3, 0],
      build: () => buildSubframe(M),
      info: {
        desc: "Structural frame rails and cross-members under the floor that carry the powertrain and suspension loads into the unibody.",
        specs: [["Material", "High-strength steel"], ["Carries", "Engine, suspension"], ["Type", "Front & rear subframes"]],
      },
    },
    {
      id: "susp-front", name: "Front Suspension", category: "Chassis & Wheels", explode: [0, -0.9, 1.5],
      build: () => buildSuspension(M, "front"),
      info: {
        desc: "MacPherson-strut front suspension: a coil-over strut and lower control arm at each front wheel that absorb bumps and locate the wheel.",
        specs: [["Type", "MacPherson strut"], ["Spring", "Coil-over damper"], ["Arms", "Lower control arm"]],
      },
    },
    {
      id: "susp-rear", name: "Rear Suspension", category: "Chassis & Wheels", explode: [0, -0.9, -1.5],
      build: () => buildSuspension(M, "rear"),
      info: {
        desc: "Multi-link rear suspension that keeps the rear tires planted for ride comfort and handling.",
        specs: [["Type", "Multi-link"], ["Spring", "Coil + damper"], ["Benefit", "Ride & handling balance"]],
      },
    },
    {
      id: "wheel-fl", name: "Front Left Wheel", category: "Chassis & Wheels", explode: [-1.7, -0.4, 1.2],
      build: () => buildWheel(M, -0.82, 1.45),
      info: { desc: "Alloy wheel with tire — front left. Driven and steered on a FWD car.", specs: [["Wheel", "Alloy, 16–18 in"], ["Tire", "All-season"], ["Role", "Drive + steer"]] },
    },
    {
      id: "wheel-fr", name: "Front Right Wheel", category: "Chassis & Wheels", explode: [1.7, -0.4, 1.2],
      build: () => buildWheel(M, 0.82, 1.45),
      info: { desc: "Alloy wheel with tire — front right. Driven and steered on a FWD car.", specs: [["Wheel", "Alloy, 16–18 in"], ["Tire", "All-season"], ["Role", "Drive + steer"]] },
    },
    {
      id: "wheel-rl", name: "Rear Left Wheel", category: "Chassis & Wheels", explode: [-1.7, -0.4, -1.2],
      build: () => buildWheel(M, -0.82, -1.45),
      info: { desc: "Alloy wheel with tire — rear left.", specs: [["Wheel", "Alloy, 16–18 in"], ["Tire", "All-season"], ["Role", "Rolling / braking"]] },
    },
    {
      id: "wheel-rr", name: "Rear Right Wheel", category: "Chassis & Wheels", explode: [1.7, -0.4, -1.2],
      build: () => buildWheel(M, 0.82, -1.45),
      info: { desc: "Alloy wheel with tire — rear right.", specs: [["Wheel", "Alloy, 16–18 in"], ["Tire", "All-season"], ["Role", "Rolling / braking"]] },
    },

    // ELECTRICAL
    {
      id: "battery", name: "12V Battery", category: "Electrical", explode: [-1.2, 1.2, 1.3],
      build: () => buildBattery(M),
      info: {
        desc: "12-volt lead-acid battery in the engine bay. Powers the starter, lights and electronics, and is recharged by the alternator.",
        specs: [["Voltage", "12 V"], ["Type", "Lead-acid"], ["Powers", "Starter, ECU, lights"]],
      },
    },
    {
      id: "headlights", name: "Headlights", category: "Electrical", explode: [0, 0.8, 1.7],
      build: () => buildHeadlights(M),
      info: {
        desc: "Front lighting cluster — low/high beam, turn signals and daytime running lights. Modern Civics use LED projectors.",
        specs: [["Source", "LED projector"], ["Includes", "DRL, turn signal"], ["Aim", "Adjustable"]],
      },
    },
  ];

  return defs;
}

// Categories in display order
export const CATEGORY_ORDER = [
  "Powertrain",
  "Body & Exterior",
  "Interior",
  "Chassis & Wheels",
  "Electrical",
];

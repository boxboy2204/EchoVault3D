import * as THREE from "./three.module.js";

const canvas = document.getElementById("game");

const ui = {
  sceneStat: document.getElementById("sceneStat"),
  bagStat: document.getElementById("bagStat"),
  flockStat: document.getElementById("flockStat"),
  tierStat: document.getElementById("tierStat"),
  promptStat: document.getElementById("promptStat"),
  overlayCard: document.getElementById("overlayCard"),
  inventoryPanel: document.getElementById("inventoryPanel"),
  rosterPanel: document.getElementById("rosterPanel"),
  portrait: document.getElementById("portrait"),
  hatchBtn: document.getElementById("hatchBtn"),
  useItemBtn: document.getElementById("useItemBtn"),
  cycleBagBtn: document.getElementById("cycleBagBtn"),
  sendFlightBtn: document.getElementById("sendFlightBtn"),
  hairSelect: document.getElementById("hairSelect"),
  jacketSelect: document.getElementById("jacketSelect"),
  packSelect: document.getElementById("packSelect"),
};

const keys = new Set();
const WORLD_RADIUS = 92;
const MOVE_SPEED = 18;
const INTERACT_DISTANCE = 7.5;
const CAMERA_DISTANCE = 14;
const CAMERA_HEIGHT = 7;
const CAMERA_LOOK_HEIGHT = 3;

const CHARACTER_COLORS = {
  hair: { ember: "#7a3928", midnight: "#1d2438", mint: "#60a899" },
  jacket: { gold: "#c99834", teal: "#2b7f88", rose: "#b46577" },
  pack: { tan: "#8f6c43", navy: "#33506b", forest: "#446c48" },
};

const SPECIES = [
  { id: "sunflare", name: "Sunflare", rarity: "common", unlockLevel: 0, color: "#f29a2f", accent: "#ffe39b", perk: "Flame-feather dashes score extra XP.", base: { speed: 1.05, lift: 0.95, growth: 1.02 }, look: "flame" },
  { id: "stormwing", name: "Stormwing", rarity: "common", unlockLevel: 0, color: "#bfc7cf", accent: "#ffffff", perk: "Gray-white wings hold altitude through gusts.", base: { speed: 0.98, lift: 1.12, growth: 0.96 }, look: "storm" },
  { id: "bloomtail", name: "Bloomtail", rarity: "common", unlockLevel: 0, color: "#72c86d", accent: "#f097bb", perk: "Flower-bright feathers pull stars and grow fast.", base: { speed: 0.94, lift: 0.98, growth: 1.14 }, look: "bloom" },
  { id: "embercrest", name: "Embercrest", rarity: "uncommon", unlockLevel: 6, color: "#cd632f", accent: "#ffd06f", perk: "Molten crest boosts launch speed.", base: { speed: 1.12, lift: 0.92, growth: 1.02 }, look: "crest" },
  { id: "mistfinch", name: "Mistfinch", rarity: "uncommon", unlockLevel: 6, color: "#7fbdd2", accent: "#dff8ff", perk: "Mist feathers recover flight energy faster.", base: { speed: 0.99, lift: 1.08, growth: 1.02 }, look: "mist" },
  { id: "thornbeak", name: "Thornbeak", rarity: "uncommon", unlockLevel: 6, color: "#698f42", accent: "#d3f79c", perk: "Forest plumage stacks strong growth gains.", base: { speed: 0.92, lift: 0.95, growth: 1.18 }, look: "thorn" },
  { id: "glimmerowl", name: "Glimmerowl", rarity: "rare", unlockLevel: 14, color: "#7066d2", accent: "#fff1be", perk: "Moon-dusted wings widen ring pickups.", base: { speed: 1.06, lift: 1.06, growth: 1.08 }, look: "glimmer" },
  { id: "tempestkite", name: "Tempest Kite", rarity: "rare", unlockLevel: 14, color: "#547bd0", accent: "#f4fbff", perk: "Storm fins turn gusts into bigger score bursts.", base: { speed: 1.14, lift: 1.12, growth: 0.98 }, look: "tempest" },
  { id: "rosephoenix", name: "Rose Phoenix", rarity: "rare", unlockLevel: 14, color: "#f06182", accent: "#ffd4e0", perk: "Floral fire plumage grants passive flight XP.", base: { speed: 1.05, lift: 0.98, growth: 1.18 }, look: "phoenix" },
  { id: "auroraseraph", name: "Aurora Seraph", rarity: "epic", unlockLevel: 24, color: "#61d0f6", accent: "#ffe47d", perk: "Aurora ribbons widen rings and accelerate growth.", base: { speed: 1.14, lift: 1.14, growth: 1.2 }, look: "aurora" },
  { id: "titanroc", name: "Titan Roc", rarity: "epic", unlockLevel: 24, color: "#b67939", accent: "#fff2bd", perk: "Massive feathers push speed and size higher.", base: { speed: 1.16, lift: 1.02, growth: 1.18 }, look: "roc" },
  { id: "verdantseraph", name: "Verdant Seraph", rarity: "epic", unlockLevel: 24, color: "#4fb06c", accent: "#f0a9ff", perk: "Sacred bloom-feathers amplify item bonuses.", base: { speed: 1.02, lift: 1.08, growth: 1.24 }, look: "seraph" },
];

const ITEM_DEFS = [
  { id: "sunfruit", name: "Sunfruit", effect: "growth", amount: 42, color: "#f4b547", desc: "A glowing fruit that grants quick growth XP." },
  { id: "gust_crystal", name: "Gust Crystal", effect: "lift", amount: 0.14, color: "#86d8ff", desc: "Improves lift and flap height." },
  { id: "feather_charm", name: "Feather Charm", effect: "ability", ability: "Tailwind", color: "#dcb8ff", desc: "Unlocks Tailwind for better energy regen." },
  { id: "bloom_nectar", name: "Bloom Nectar", effect: "growth", amount: 58, color: "#ff88b4", desc: "Rare nectar that strongly accelerates growth." },
  { id: "ember_relic", name: "Ember Relic", effect: "speed", amount: 0.15, color: "#ff8a52", desc: "Ancient relic that increases launch speed." },
];

const LANDMARKS = {
  nest: { x: 0, z: 0, label: "Star Nest", type: "nest", color: "#f3c97c" },
  perch: { x: 22, z: -18, label: "Sky Perch", type: "perch", color: "#bceeff" },
  tailor: { x: -20, z: 16, label: "Wanderer's Camp", type: "tailor", color: "#f1a0ac" },
};

const FORAGE_SPOTS = [
  { x: -42, z: -44 }, { x: -31, z: -37 }, { x: -15, z: -49 }, { x: 3, z: -42 }, { x: 22, z: -38 }, { x: 38, z: -25 },
  { x: 49, z: -8 }, { x: 43, z: 13 }, { x: 30, z: 28 }, { x: 13, z: 43 }, { x: -8, z: 48 }, { x: -26, z: 39 },
  { x: -42, z: 24 }, { x: -48, z: 5 }, { x: -36, z: -15 }, { x: -18, z: 24 }, { x: 10, z: 19 }, { x: 18, z: 5 },
];

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9fc9e8);
scene.fog = new THREE.FogExp2(0xb7d0e2, 0.0085);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(canvas.clientWidth || canvas.width, canvas.clientHeight || canvas.height, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const camera = new THREE.PerspectiveCamera(58, canvas.clientWidth / canvas.clientHeight, 0.1, 500);
scene.add(camera);

const hemi = new THREE.HemisphereLight(0xd7efff, 0x455f3d, 1.55);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xfff0cf, 2.2);
sun.position.set(70, 95, 45);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -90;
sun.shadow.camera.right = 90;
sun.shadow.camera.top = 90;
sun.shadow.camera.bottom = -90;
sun.shadow.bias = -0.00012;
scene.add(sun);

const worldRoot = new THREE.Group();
scene.add(worldRoot);

const interactables = [];
const animalMeshes = [];
const grassMaterials = [];
const grassBlades = [];
const flightObjects = [];

const raycaster = new THREE.Raycaster();
const down = new THREE.Vector3(0, -1, 0);

let terrainMesh = null;
let terrainGeometry = null;
let terrainPositions = null;
let playerMesh = null;
let backpackMesh = null;
let companionMesh = null;
let currentCompanionBirdId = null;
let nestMesh = null;
let perchMesh = null;
let campMesh = null;

function createState() {
  return {
    scene: "land",
    time: 0,
    pointerLocked: false,
    prompt: "Click the game view to lock the mouse and explore the sanctuary.",
    message: "This is a mythical bird sanctuary. Wander, collect eggs, and build your flock.",
    player: {
      x: 0,
      z: 24,
      y: 0,
      yaw: Math.PI,
      bob: 0,
      moveBlend: 0,
    },
    character: { hair: "ember", jacket: "gold", pack: "tan" },
    backpack: [],
    selectedBagIndex: 0,
    birds: [],
    selectedBirdIndex: 0,
    nextEntityId: 1,
    worldEntities: [],
    spawnCooldown: 0,
    flight: null,
  };
}

let state = createState();

function noiseHeight(x, z) {
  return (
    Math.sin(x * 0.06) * 3.6 +
    Math.cos(z * 0.05) * 2.8 +
    Math.sin((x + z) * 0.035) * 5.2 +
    Math.cos((x - z) * 0.025) * 2.2
  );
}

function getTerrainHeight(x, z) {
  return noiseHeight(x, z);
}

function clearWorld() {
  while (worldRoot.children.length) {
    const child = worldRoot.children.pop();
    disposeHierarchy(child);
  }
  interactables.length = 0;
  animalMeshes.length = 0;
  grassBlades.length = 0;
  grassMaterials.length = 0;
  flightObjects.length = 0;
  terrainMesh = null;
  terrainGeometry = null;
  terrainPositions = null;
  playerMesh = null;
  backpackMesh = null;
  companionMesh = null;
  currentCompanionBirdId = null;
  nestMesh = null;
  perchMesh = null;
  campMesh = null;
}

function disposeHierarchy(object) {
  object.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (Array.isArray(child.material)) child.material.forEach((mat) => mat.dispose());
    else if (child.material) child.material.dispose();
  });
}

function seedWorld(sourceState) {
  sourceState.worldEntities = [];
  const shuffled = shuffle(FORAGE_SPOTS.slice(), 77);
  for (let i = 0; i < 6; i += 1) sourceState.worldEntities.push(makeEggEntity(sourceState, shuffled[i]));
  for (let i = 6; i < 11; i += 1) sourceState.worldEntities.push(makeItemEntity(sourceState, shuffled[i]));
}

function totalFlockLevel(sourceState = state) {
  return sourceState.birds.reduce((sum, bird) => sum + bird.level, 0);
}

function currentTier() {
  const total = totalFlockLevel();
  if (total >= 24) return "epic";
  if (total >= 14) return "rare";
  if (total >= 6) return "uncommon";
  return "common";
}

function availableSpecies(sourceState = state) {
  return SPECIES.filter((species) => species.unlockLevel <= totalFlockLevel(sourceState));
}

function rollRarity(sourceState = state) {
  const total = totalFlockLevel(sourceState);
  const roll = Math.random();
  if (total >= 24) {
    if (roll < 0.16) return "epic";
    if (roll < 0.42) return "rare";
    if (roll < 0.76) return "uncommon";
    return "common";
  }
  if (total >= 14) {
    if (roll < 0.14) return "rare";
    if (roll < 0.44) return "uncommon";
    return "common";
  }
  if (total >= 6) {
    if (roll < 0.25) return "uncommon";
    return "common";
  }
  return "common";
}

function rollEggSpecies(sourceState = state) {
  const rarity = rollRarity(sourceState);
  const pool = availableSpecies(sourceState).filter((species) => species.rarity === rarity);
  const fallback = availableSpecies(sourceState).filter((species) => species.rarity === "common");
  const source = pool.length ? pool : fallback;
  return source[Math.floor(Math.random() * source.length)];
}

function makeEggEntity(sourceState, spot) {
  const species = rollEggSpecies(sourceState);
  return {
    id: sourceState.nextEntityId++,
    type: "egg",
    x: spot.x,
    z: spot.z,
    speciesId: species.id,
    rarity: species.rarity,
    label: `${species.name} Egg`,
  };
}

function makeItemEntity(sourceState, spot) {
  const def = ITEM_DEFS[Math.floor(Math.random() * ITEM_DEFS.length)];
  return {
    id: sourceState.nextEntityId++,
    type: "item",
    x: spot.x,
    z: spot.z,
    itemId: def.id,
    label: def.name,
  };
}

function resetGame() {
  state = createState();
  seedWorld(state);
  rebuildWorld();
  syncCustomizationUI();
  refreshUI();
}

function selectedBird() {
  return state.birds[state.selectedBirdIndex] || null;
}

function selectBird(index) {
  if (index >= state.birds.length) return;
  state.selectedBirdIndex = index;
  state.message = `${state.birds[index].name} selected.`;
  updateCompanionBird();
}

function gainBirdXp(bird, amount) {
  bird.xp += amount;
  while (bird.xp >= bird.xpToNext) {
    bird.xp -= bird.xpToNext;
    bird.level += 1;
    bird.size = +(bird.size + 0.08).toFixed(2);
    bird.speed = +(bird.speed + 0.04).toFixed(2);
    bird.lift = +(bird.lift + 0.05).toFixed(2);
    bird.growth = +(bird.growth + 0.06).toFixed(2);
    bird.xpToNext = Math.round(bird.xpToNext * 1.28);
    state.message = `${bird.name} reached level ${bird.level} and grew larger.`;
  }
}

function hatchSelectedEgg() {
  const bagItem = state.backpack[state.selectedBagIndex];
  if (!bagItem || bagItem.type !== "egg") {
    state.message = "Select an egg in your backpack to hatch it.";
    return;
  }
  const species = SPECIES.find((entry) => entry.id === bagItem.speciesId);
  const bird = {
    id: `bird-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    speciesId: species.id,
    name: species.name,
    rarity: species.rarity,
    level: 1,
    xp: 0,
    xpToNext: 90,
    size: 0.88,
    speed: species.base.speed,
    lift: species.base.lift,
    growth: species.base.growth,
    abilities: [],
  };
  state.birds.push(bird);
  state.selectedBirdIndex = state.birds.length - 1;
  state.backpack.splice(state.selectedBagIndex, 1);
  state.selectedBagIndex = clamp(state.selectedBagIndex, 0, Math.max(state.backpack.length - 1, 0));
  state.prompt = `${bird.name} hatched. Launch it into training to earn XP and reveal rarer eggs.`;
  state.message = `${bird.name} hatched successfully.`;
  updateCompanionBird();
}

function useSelectedItem() {
  const bagItem = state.backpack[state.selectedBagIndex];
  const bird = selectedBird();
  if (!bird) {
    state.message = "Hatch a bird first.";
    return;
  }
  if (!bagItem || bagItem.type !== "item") {
    state.message = "Select a growth item in your backpack.";
    return;
  }
  const def = ITEM_DEFS.find((item) => item.id === bagItem.itemId);
  if (def.effect === "growth") gainBirdXp(bird, Math.round(def.amount * bird.growth));
  else if (def.effect === "lift") bird.lift = +(bird.lift + def.amount).toFixed(2);
  else if (def.effect === "speed") bird.speed = +(bird.speed + def.amount).toFixed(2);
  else if (def.effect === "ability" && !bird.abilities.includes(def.ability)) bird.abilities.push(def.ability);
  state.backpack.splice(state.selectedBagIndex, 1);
  state.selectedBagIndex = clamp(state.selectedBagIndex, 0, Math.max(state.backpack.length - 1, 0));
  state.message = `${def.name} used on ${bird.name}.`;
  updateCompanionBird();
}

function createTerrain() {
  const size = WORLD_RADIUS * 2.25;
  const segments = 180;
  const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
  geometry.rotateX(-Math.PI / 2);
  const positions = geometry.attributes.position;
  const colors = [];

  for (let i = 0; i < positions.count; i += 1) {
    const x = positions.getX(i);
    const z = positions.getZ(i);
    const y = getTerrainHeight(x, z);
    positions.setY(i, y);

    const moisture = 0.5 + Math.sin(x * 0.08 + z * 0.03) * 0.25;
    const slopeTint = 0.4 + y * 0.03;
    const color = new THREE.Color().setHSL(0.26 - slopeTint * 0.02, 0.42, 0.26 + moisture * 0.12);
    if (y > 5) color.offsetHSL(0, -0.08, 0.08);
    colors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 1,
    metalness: 0,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  mesh.castShadow = false;
  worldRoot.add(mesh);

  terrainMesh = mesh;
  terrainGeometry = geometry;
  terrainPositions = positions;

  createGrassTufts();
  createCliffs();
  createWaterPlane();
}

function createGrassTufts() {
  const bladeGeo = new THREE.PlaneGeometry(0.38, 2.6, 1, 4);
  bladeGeo.translate(0, 1.3, 0);
  for (let i = 0; i < 1200; i += 1) {
    const radius = Math.sqrt(Math.random()) * (WORLD_RADIUS - 4);
    const angle = Math.random() * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = getTerrainHeight(x, z);
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(0.25 + Math.random() * 0.03, 0.45, 0.24 + Math.random() * 0.08),
      side: THREE.DoubleSide,
      roughness: 1,
    });
    const blade = new THREE.Mesh(bladeGeo, mat);
    blade.position.set(x, y, z);
    blade.rotation.y = Math.random() * Math.PI * 2;
    blade.rotation.z = (Math.random() - 0.5) * 0.18;
    blade.castShadow = false;
    blade.receiveShadow = false;
    blade.userData.sway = Math.random() * Math.PI * 2;
    grassBlades.push(blade);
    grassMaterials.push(mat);
    worldRoot.add(blade);
  }
}

function createWaterPlane() {
  const water = new THREE.Mesh(
    new THREE.CircleGeometry(16, 32),
    new THREE.MeshStandardMaterial({
      color: 0x4f89a6,
      transparent: true,
      opacity: 0.7,
      roughness: 0.2,
      metalness: 0.15,
    }),
  );
  water.rotation.x = -Math.PI / 2;
  water.position.set(-34, getTerrainHeight(-34, 24) - 0.6, 24);
  water.receiveShadow = true;
  worldRoot.add(water);
}

function createCliffs() {
  for (let i = 0; i < 18; i += 1) {
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(2 + Math.random() * 3.2, 0),
      new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0x6a675f : 0x7c786f, roughness: 1 }),
    );
    const radius = 22 + Math.random() * 50;
    const angle = i * 1.43 + Math.random();
    rock.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    rock.position.y = getTerrainHeight(rock.position.x, rock.position.z) + 1.3;
    rock.rotation.set(Math.random(), Math.random(), Math.random());
    rock.scale.setScalar(1 + Math.random() * 2);
    rock.castShadow = true;
    rock.receiveShadow = true;
    worldRoot.add(rock);
  }
}

function createTree(position, scale = 1) {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45 * scale, 0.7 * scale, 8 * scale, 7),
    new THREE.MeshStandardMaterial({ color: 0x6d4a2b, roughness: 1 }),
  );
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  trunk.position.y = 4 * scale;
  group.add(trunk);

  const canopyColors = [0x315d35, 0x416f3e, 0x557d4d];
  for (let i = 0; i < 4; i += 1) {
    const canopy = new THREE.Mesh(
      new THREE.SphereGeometry((2.9 + Math.random() * 1.4) * scale, 8, 8),
      new THREE.MeshStandardMaterial({ color: canopyColors[i % canopyColors.length], roughness: 1 }),
    );
    canopy.castShadow = true;
    canopy.receiveShadow = true;
    canopy.position.set((Math.random() - 0.5) * 2.4 * scale, (8.2 + i * 0.7) * scale, (Math.random() - 0.5) * 2.4 * scale);
    group.add(canopy);
  }

  group.position.set(position.x, getTerrainHeight(position.x, position.z), position.z);
  return group;
}

function createBush(position, scale = 1) {
  const group = new THREE.Group();
  const colors = [0x45683b, 0x5d7a46, 0x6b8952];
  for (let i = 0; i < 3; i += 1) {
    const bush = new THREE.Mesh(
      new THREE.SphereGeometry((1.5 + Math.random() * 0.7) * scale, 7, 7),
      new THREE.MeshStandardMaterial({ color: colors[i % colors.length], roughness: 1 }),
    );
    bush.castShadow = true;
    bush.receiveShadow = true;
    bush.position.set((i - 1) * 1.2 * scale, (1 + Math.random() * 0.5) * scale, (Math.random() - 0.5) * 0.8 * scale);
    group.add(bush);
  }
  group.position.set(position.x, getTerrainHeight(position.x, position.z), position.z);
  return group;
}

function createAnimal(position, type) {
  const group = new THREE.Group();
  const color = type === "deer" ? 0x8d6a47 : 0x6f736f;
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.9, 2.3, 4, 8),
    new THREE.MeshStandardMaterial({ color, roughness: 1 }),
  );
  body.rotation.z = Math.PI / 2;
  body.castShadow = true;
  body.position.y = 2.2;
  group.add(body);

  for (let i = 0; i < 4; i += 1) {
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.15, 1.9, 5),
      new THREE.MeshStandardMaterial({ color: 0x403126, roughness: 1 }),
    );
    leg.position.set((i < 2 ? -0.7 : 0.7), 1, i % 2 === 0 ? -0.45 : 0.45);
    leg.castShadow = true;
    group.add(leg);
  }

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.72, 8, 8),
    new THREE.MeshStandardMaterial({ color, roughness: 1 }),
  );
  head.position.set(1.8, 2.9, 0);
  head.castShadow = true;
  group.add(head);

  if (type === "deer") {
    const antlerMat = new THREE.MeshStandardMaterial({ color: 0xd7c6a1, roughness: 1 });
    const antlerA = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.9, 4), antlerMat);
    const antlerB = antlerA.clone();
    antlerA.position.set(2.0, 3.6, -0.16);
    antlerB.position.set(2.0, 3.6, 0.16);
    antlerA.rotation.z = -0.35;
    antlerB.rotation.z = 0.35;
    group.add(antlerA, antlerB);
  }

  group.position.set(position.x, getTerrainHeight(position.x, position.z), position.z);
  group.rotation.y = Math.random() * Math.PI * 2;
  group.userData.wander = Math.random() * Math.PI * 2;
  animalMeshes.push(group);
  return group;
}

function createLandmarks() {
  nestMesh = createNestMesh();
  nestMesh.position.set(LANDMARKS.nest.x, getTerrainHeight(LANDMARKS.nest.x, LANDMARKS.nest.z), LANDMARKS.nest.z);
  worldRoot.add(nestMesh);

  perchMesh = createPerchMesh();
  perchMesh.position.set(LANDMARKS.perch.x, getTerrainHeight(LANDMARKS.perch.x, LANDMARKS.perch.z), LANDMARKS.perch.z);
  worldRoot.add(perchMesh);

  campMesh = createCampMesh();
  campMesh.position.set(LANDMARKS.tailor.x, getTerrainHeight(LANDMARKS.tailor.x, LANDMARKS.tailor.z), LANDMARKS.tailor.z);
  worldRoot.add(campMesh);
}

function createNestMesh() {
  const group = new THREE.Group();
  const bowl = new THREE.Mesh(
    new THREE.TorusGeometry(2.5, 0.8, 8, 20),
    new THREE.MeshStandardMaterial({ color: 0x8b5a35, roughness: 1 }),
  );
  bowl.rotation.x = Math.PI / 2;
  bowl.position.y = 0.8;
  bowl.castShadow = true;
  bowl.receiveShadow = true;
  group.add(bowl);

  const glow = new THREE.PointLight(0xf4d38f, 8, 22, 2);
  glow.position.set(0, 4, 0);
  group.add(glow);
  return group;
}

function createPerchMesh() {
  const group = new THREE.Group();
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.5, 8.5, 6),
    new THREE.MeshStandardMaterial({ color: 0x5d452f, roughness: 1 }),
  );
  pole.position.y = 4.2;
  pole.castShadow = true;
  pole.receiveShadow = true;
  group.add(pole);

  const beam = new THREE.Mesh(
    new THREE.BoxGeometry(5.5, 0.42, 0.42),
    new THREE.MeshStandardMaterial({ color: 0xd2ecff, emissive: 0x7fb7d7, emissiveIntensity: 0.25, roughness: 0.4 }),
  );
  beam.position.set(0, 8.2, 0);
  beam.castShadow = true;
  group.add(beam);

  return group;
}

function createCampMesh() {
  const group = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(4.5, 5.2, 2.8, 6),
    new THREE.MeshStandardMaterial({ color: 0x82664a, roughness: 1 }),
  );
  base.position.y = 1.4;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  const tent = new THREE.Mesh(
    new THREE.ConeGeometry(5.5, 5.8, 4),
    new THREE.MeshStandardMaterial({ color: 0xb06773, roughness: 1 }),
  );
  tent.position.y = 5.4;
  tent.rotation.y = Math.PI / 4;
  tent.castShadow = true;
  group.add(tent);
  return group;
}

function createPlayerMesh() {
  const group = new THREE.Group();

  const boots = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.65, 2.1, 6),
    new THREE.MeshStandardMaterial({ color: 0x3f3228, roughness: 1 }),
  );
  boots.position.y = 1.05;
  boots.castShadow = true;
  group.add(boots);

  const coat = new THREE.Mesh(
    new THREE.CapsuleGeometry(1.6, 3.8, 5, 10),
    new THREE.MeshStandardMaterial({ color: new THREE.Color(CHARACTER_COLORS.jacket[state.character.jacket]), roughness: 1 }),
  );
  coat.position.y = 4.2;
  coat.castShadow = true;
  group.add(coat);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.98, 14, 14),
    new THREE.MeshStandardMaterial({ color: 0xf1d2ba, roughness: 1 }),
  );
  head.position.y = 7.2;
  head.castShadow = true;
  group.add(head);

  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(1.03, 14, 14, 0, Math.PI * 2, 0, Math.PI * 0.55),
    new THREE.MeshStandardMaterial({ color: new THREE.Color(CHARACTER_COLORS.hair[state.character.hair]), roughness: 1 }),
  );
  hair.position.y = 7.45;
  hair.castShadow = true;
  group.add(hair);

  backpackMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1.9, 2.6, 1.1),
    new THREE.MeshStandardMaterial({ color: new THREE.Color(CHARACTER_COLORS.pack[state.character.pack]), roughness: 1 }),
  );
  backpackMesh.position.set(0, 4.25, -1.35);
  backpackMesh.castShadow = true;
  group.add(backpackMesh);

  group.position.set(state.player.x, getTerrainHeight(state.player.x, state.player.z), state.player.z);
  playerMesh = group;
  worldRoot.add(group);
}

function recolorPlayer() {
  if (!playerMesh) return;
  const [boots, coat, head, hair] = playerMesh.children;
  coat.material.color.set(CHARACTER_COLORS.jacket[state.character.jacket]);
  hair.material.color.set(CHARACTER_COLORS.hair[state.character.hair]);
  backpackMesh.material.color.set(CHARACTER_COLORS.pack[state.character.pack]);
}

function createSpeciesBirdMesh(species, scale = 1) {
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(species.color), roughness: 0.95 });
  const accentMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(species.accent), roughness: 0.8, emissive: new THREE.Color(species.accent).multiplyScalar(0.08) });
  const beakMat = new THREE.MeshStandardMaterial({ color: 0xe3b558, roughness: 0.7 });

  const body = new THREE.Mesh(new THREE.SphereGeometry(1.2, 12, 12), bodyMat);
  body.scale.set(1.45, 1, 1);
  body.castShadow = true;
  group.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 12), accentMat);
  head.position.set(1.15, 0.35, 0);
  head.castShadow = true;
  group.add(head);

  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.75, 5), beakMat);
  beak.rotation.z = -Math.PI / 2;
  beak.position.set(1.95, 0.28, 0);
  beak.castShadow = true;
  group.add(beak);

  const wingGeo = new THREE.BoxGeometry(1.8, 0.16, 0.85);
  const leftWing = new THREE.Mesh(wingGeo, bodyMat);
  const rightWing = leftWing.clone();
  leftWing.position.set(-0.3, 0.2, -1.15);
  rightWing.position.set(-0.3, 0.2, 1.15);
  leftWing.rotation.x = 0.2;
  rightWing.rotation.x = -0.2;
  leftWing.castShadow = true;
  rightWing.castShadow = true;
  group.add(leftWing, rightWing);

  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.2, 5), accentMat);
  tail.rotation.z = Math.PI / 2;
  tail.position.set(-1.4, -0.1, 0);
  tail.castShadow = true;
  group.add(tail);

  if (species.look === "flame" || species.look === "phoenix" || species.look === "crest") {
    const crest = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.95, 5), accentMat);
    crest.position.set(0.95, 1.05, 0);
    crest.rotation.z = 0.18;
    group.add(crest);
  } else if (species.look === "storm" || species.look === "tempest" || species.look === "mist") {
    const finA = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.85, 0.08), accentMat);
    const finB = finA.clone();
    finA.position.set(-0.2, 0.75, -0.45);
    finB.position.set(-0.2, 0.75, 0.45);
    finA.rotation.z = 0.22;
    finB.rotation.z = -0.22;
    group.add(finA, finB);
  } else {
    for (let i = 0; i < 3; i += 1) {
      const petal = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), accentMat);
      petal.position.set(0.1 + i * 0.25, 0.95 + (i % 2) * 0.12, i === 1 ? 0 : i === 0 ? -0.25 : 0.25);
      group.add(petal);
    }
  }

  group.scale.setScalar(scale);
  return group;
}

function createEggMesh(entity) {
  const species = SPECIES.find((entry) => entry.id === entity.speciesId);
  const group = new THREE.Group();
  const shellMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(species.accent), roughness: 0.6 });
  const stripeMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(species.color), roughness: 0.8, emissive: new THREE.Color(species.color).multiplyScalar(0.08) });

  const shell = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 14), shellMat);
  shell.scale.y = 1.35;
  shell.castShadow = true;
  group.add(shell);

  const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.12, 6, 12), stripeMat);
  stripe.rotation.x = Math.PI / 2;
  stripe.position.y = 0.18;
  group.add(stripe);

  const glow = new THREE.PointLight(new THREE.Color(species.color), 1.3, 10, 2);
  glow.position.y = 1.2;
  group.add(glow);
  return group;
}

function createItemMesh(entity) {
  const def = ITEM_DEFS.find((item) => item.id === entity.itemId);
  const group = new THREE.Group();
  const color = new THREE.Color(def.color);
  let mesh;
  if (def.effect === "growth") {
    mesh = new THREE.Mesh(new THREE.SphereGeometry(1.05, 12, 12), new THREE.MeshStandardMaterial({ color, roughness: 0.5, emissive: color.clone().multiplyScalar(0.15) }));
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.7, 6), new THREE.MeshStandardMaterial({ color: 0xc9f090 }));
    stem.position.y = 1.1;
    group.add(stem);
  } else if (def.effect === "ability") {
    mesh = new THREE.Mesh(new THREE.OctahedronGeometry(1.1), new THREE.MeshStandardMaterial({ color, roughness: 0.35, emissive: color.clone().multiplyScalar(0.2), metalness: 0.08 }));
  } else {
    mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(1.02), new THREE.MeshStandardMaterial({ color, roughness: 0.45, emissive: color.clone().multiplyScalar(0.12) }));
  }
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  const glow = new THREE.PointLight(color, 1.1, 9, 2);
  glow.position.y = 1;
  group.add(glow);
  return group;
}

function placeInteractableMesh(entity) {
  let mesh;
  if (entity.type === "egg") mesh = createEggMesh(entity);
  else mesh = createItemMesh(entity);
  mesh.position.set(entity.x, getTerrainHeight(entity.x, entity.z) + 1.25, entity.z);
  mesh.userData.entityId = entity.id;
  mesh.userData.kind = entity.type;
  mesh.userData.floatOffset = Math.random() * Math.PI * 2;
  interactables.push(mesh);
  worldRoot.add(mesh);
}

function createForest() {
  for (let i = 0; i < 90; i += 1) {
    const radius = 12 + Math.sqrt(Math.random()) * (WORLD_RADIUS - 10);
    const angle = Math.random() * Math.PI * 2;
    const position = { x: Math.cos(angle) * radius, z: Math.sin(angle) * radius };
    if (Math.hypot(position.x, position.z) < 16) continue;
    worldRoot.add(createTree(position, 0.85 + Math.random() * 1.45));
  }

  for (let i = 0; i < 140; i += 1) {
    const radius = 10 + Math.sqrt(Math.random()) * (WORLD_RADIUS - 8);
    const angle = Math.random() * Math.PI * 2;
    const position = { x: Math.cos(angle) * radius, z: Math.sin(angle) * radius };
    if (Math.hypot(position.x, position.z) < 10) continue;
    worldRoot.add(createBush(position, 0.75 + Math.random() * 0.9));
  }

  for (let i = 0; i < 12; i += 1) {
    const radius = 18 + Math.sqrt(Math.random()) * (WORLD_RADIUS - 12);
    const angle = Math.random() * Math.PI * 2;
    const position = { x: Math.cos(angle) * radius, z: Math.sin(angle) * radius };
    worldRoot.add(createAnimal(position, i % 3 === 0 ? "deer" : "wolf"));
  }
}

function rebuildWorld() {
  clearWorld();
  createTerrain();
  createForest();
  createLandmarks();
  createPlayerMesh();
  for (const entity of state.worldEntities) placeInteractableMesh(entity);
  updateCompanionBird();
}

function updateCompanionBird() {
  const bird = selectedBird();
  if (!bird) {
    if (companionMesh) {
      worldRoot.remove(companionMesh);
      disposeHierarchy(companionMesh);
      companionMesh = null;
      currentCompanionBirdId = null;
    }
    return;
  }

  if (currentCompanionBirdId !== bird.id) {
    if (companionMesh) {
      worldRoot.remove(companionMesh);
      disposeHierarchy(companionMesh);
    }
    const species = SPECIES.find((entry) => entry.id === bird.speciesId);
    companionMesh = createSpeciesBirdMesh(species, 0.85 * bird.size);
    companionMesh.castShadow = true;
    companionMesh.traverse((child) => {
      if (child.isMesh) child.castShadow = true;
    });
    worldRoot.add(companionMesh);
    currentCompanionBirdId = bird.id;
  } else {
    companionMesh.scale.setScalar(0.85 * bird.size);
  }
}

function currentPromptText() {
  if (state.scene === "flight") return "A/D steer, Space flap, Shift dash. Clear rings for XP.";
  const nearby = nearestInteraction();
  if (!nearby) return state.prompt;
  if (nearby.kind === "egg") return "Press E to place the egg into your backpack.";
  if (nearby.kind === "item") return "Press E to collect the growth item.";
  if (nearby.kind === "nest") return "Press E or use the Hatch button to hatch the selected egg.";
  if (nearby.kind === "perch") return "Press E, Space, or Launch Bird to start a flight run.";
  return "Use the right panel to customize your explorer.";
}

function overlayMarkup() {
  const bird = selectedBird();
  if (state.scene === "flight" && bird) {
    return `<strong>${bird.name} In Flight</strong>
      Altitude ${state.flight.altitude.toFixed(2)} · Energy ${Math.round(state.flight.energy)} · Combo ${state.flight.combo}
      <br />Run XP ${Math.round(state.flight.runXp)} · Time ${state.flight.timer.toFixed(1)}s`;
  }
  if (!bird) {
    return `<strong>Sanctuary Brief</strong>The scene is now real 3D via three.js. Explore the valley, collect eggs, and begin forming your flock.`;
  }
  const species = SPECIES.find((entry) => entry.id === bird.speciesId);
  return `<strong>${bird.name}</strong>${species.perk}<br />Level ${bird.level} · XP ${Math.round(bird.xp)}/${bird.xpToNext} · Size ${(bird.size * 100).toFixed(0)}%`;
}

function inventoryMarkup() {
  if (!state.backpack.length) {
    return `<div class="entry"><h3>Empty Backpack</h3><p>Eggs and growth items you collect in the sanctuary appear here.</p></div>`;
  }
  const entries = state.backpack.map((item, index) => {
    const active = index === state.selectedBagIndex ? " active" : "";
    if (item.type === "egg") {
      const species = SPECIES.find((entry) => entry.id === item.speciesId);
      return `<button class="entry${active}" data-bag-index="${index}" type="button">
        <h3>${species.name} Egg</h3>
        <p>${capitalize(item.rarity)} egg. The rare pool expands as your flock levels up.</p>
      </button>`;
    }
    const def = ITEM_DEFS.find((entry) => entry.id === item.itemId);
    return `<button class="entry${active}" data-bag-index="${index}" type="button">
      <h3>${def.name}</h3>
      <p>${def.desc}</p>
    </button>`;
  }).join("");
  return `<div class="inventory-list">${entries}</div>`;
}

function rosterMarkup() {
  if (!state.birds.length) {
    return `<div class="entry"><h3>No Birds Yet</h3><p>Hatch eggs to begin building your flock and unlocking rarer species.</p></div>`;
  }
  const entries = state.birds.map((bird, index) => {
    const active = index === state.selectedBirdIndex ? " active" : "";
    return `<button class="entry${active}" data-bird-index="${index}" type="button">
      <h3>${bird.name} Lv.${bird.level}</h3>
      <p>${capitalize(bird.rarity)} · Speed ${bird.speed.toFixed(2)} · Lift ${bird.lift.toFixed(2)} · Growth ${bird.growth.toFixed(2)}</p>
      <div class="chip-row">${bird.abilities.map((ability) => `<span class="chip">${ability}</span>`).join("")}</div>
    </button>`;
  }).join("");
  return `<div class="roster-list">${entries}</div>`;
}

function portraitMarkup() {
  const hair = CHARACTER_COLORS.hair[state.character.hair];
  const jacket = CHARACTER_COLORS.jacket[state.character.jacket];
  const pack = CHARACTER_COLORS.pack[state.character.pack];
  return `
    <svg viewBox="0 0 220 100" aria-hidden="true">
      <rect x="0" y="0" width="220" height="100" rx="18" fill="rgba(255,255,255,0.04)" />
      <circle cx="110" cy="34" r="16" fill="#ffd7b4" />
      <path d="M92 35c2-14 34-20 36 2v-6c0-12-28-16-36 4z" fill="${hair}" />
      <path d="M84 56c16-14 36-14 52 0v25H84z" fill="${jacket}" />
      <rect x="141" y="56" width="24" height="28" rx="8" fill="${pack}" />
      <rect x="155" y="58" width="4" height="18" rx="2" fill="rgba(255,255,255,0.45)" />
    </svg>
    <p>The sanctuary now uses a live three.js scene, so these colors update the in-world explorer too.</p>
  `;
}

function refreshUI() {
  const bird = selectedBird();
  ui.sceneStat.textContent = state.scene === "land" ? "Sanctuary" : "Flight Training";
  ui.bagStat.textContent = `${state.backpack.length} / 10`;
  ui.flockStat.textContent = `${totalFlockLevel()}`;
  ui.tierStat.textContent = capitalize(currentTier());
  ui.promptStat.textContent = currentPromptText();
  ui.overlayCard.innerHTML = overlayMarkup();
  ui.inventoryPanel.innerHTML = inventoryMarkup();
  ui.rosterPanel.innerHTML = rosterMarkup();
  ui.portrait.innerHTML = portraitMarkup();
  ui.hatchBtn.disabled = !state.backpack.some((item) => item.type === "egg");
  ui.useItemBtn.disabled = !bird || !state.backpack.some((item) => item.type === "item");
  ui.sendFlightBtn.disabled = !bird || state.scene !== "land";
}

function syncCustomizationUI() {
  ui.hairSelect.value = state.character.hair;
  ui.jacketSelect.value = state.character.jacket;
  ui.packSelect.value = state.character.pack;
}

function nearestInteraction() {
  let best = null;
  for (const mesh of interactables) {
    const dist = mesh.position.distanceTo(new THREE.Vector3(state.player.x, mesh.position.y, state.player.z));
    if (dist < INTERACT_DISTANCE && (!best || dist < best.distance)) {
      best = { kind: mesh.userData.kind, mesh, distance: dist };
    }
  }
  for (const [key, landmark] of Object.entries(LANDMARKS)) {
    const dist = Math.hypot(state.player.x - landmark.x, state.player.z - landmark.z);
    if (dist < INTERACT_DISTANCE && (!best || dist < best.distance)) {
      best = { kind: landmark.type, key, distance: dist };
    }
  }
  return best;
}

function interactNearby() {
  const nearby = nearestInteraction();
  if (!nearby) {
    state.message = "Nothing close enough to interact with.";
    return;
  }

  if (nearby.kind === "egg" || nearby.kind === "item") {
    const entityId = nearby.mesh.userData.entityId;
    const entity = state.worldEntities.find((entry) => entry.id === entityId);
    if (!entity) return;
    const collected = nearby.kind === "egg" ? collectEgg(entity) : collectItem(entity);
    if (!collected) return;
    worldRoot.remove(nearby.mesh);
    disposeHierarchy(nearby.mesh);
    const index = interactables.indexOf(nearby.mesh);
    if (index >= 0) interactables.splice(index, 1);
  } else if (nearby.kind === "nest") {
    hatchSelectedEgg();
  } else if (nearby.kind === "perch") {
    startFlight();
  } else if (nearby.kind === "tailor") {
    state.message = "Use the ranger panel on the right to customize your explorer.";
  }
}

function collectEgg(entity) {
  if (state.backpack.length >= 10) {
    state.message = "Backpack full. Hatch eggs or use items before gathering more.";
    return false;
  }
  state.backpack.push({ type: "egg", speciesId: entity.speciesId, rarity: entity.rarity, label: entity.label });
  state.worldEntities = state.worldEntities.filter((entry) => entry.id !== entity.id);
  state.selectedBagIndex = state.backpack.length - 1;
  state.prompt = "Egg stored. Use the Hatch button or return to the Star Nest.";
  state.message = `${entity.label} added to your backpack.`;
  return true;
}

function collectItem(entity) {
  if (state.backpack.length >= 10) {
    state.message = "Backpack full. Use an item or hatch an egg first.";
    return false;
  }
  const def = ITEM_DEFS.find((item) => item.id === entity.itemId);
  state.backpack.push({ type: "item", itemId: def.id, label: def.name });
  state.worldEntities = state.worldEntities.filter((entry) => entry.id !== entity.id);
  state.selectedBagIndex = state.backpack.length - 1;
  state.prompt = "Growth item stored. Use it on your selected bird from the side panel.";
  state.message = `${def.name} added to your backpack.`;
  return true;
}

function ensureWorldSpawns() {
  if (state.spawnCooldown > 0) return;
  const eggCount = state.worldEntities.filter((entity) => entity.type === "egg").length;
  const itemCount = state.worldEntities.filter((entity) => entity.type === "item").length;
  const openSpots = FORAGE_SPOTS.filter(
    (spot) => !state.worldEntities.some((entity) => Math.hypot(entity.x - spot.x, entity.z - spot.z) < 5),
  );
  if (!openSpots.length) return;
  if (eggCount < 6) {
    const entity = makeEggEntity(state, openSpots[Math.floor(Math.random() * openSpots.length)]);
    state.worldEntities.push(entity);
    placeInteractableMesh(entity);
    state.spawnCooldown = 5;
    return;
  }
  if (itemCount < 5) {
    const entity = makeItemEntity(state, openSpots[Math.floor(Math.random() * openSpots.length)]);
    state.worldEntities.push(entity);
    placeInteractableMesh(entity);
    state.spawnCooldown = 7;
  }
}

function startFlight() {
  const bird = selectedBird();
  if (!bird) {
    state.message = "Hatch a bird before starting flight training.";
    return;
  }
  state.scene = "flight";
  playerMesh.visible = false;
  state.flight = {
    timer: 34,
    laneX: 0,
    altitude: 0,
    velocityY: 0,
    energy: 100,
    speed: 22 + bird.speed * 4.6,
    runXp: 0,
    combo: 0,
    birdId: bird.id,
  };
  buildFlightCourse();
  state.prompt = `${bird.name} launched. Clear rings and stars to earn XP.`;
}

function buildFlightCourse() {
  for (const object of flightObjects) {
    scene.remove(object.mesh);
    disposeHierarchy(object.mesh);
  }
  flightObjects.length = 0;

  for (let i = 0; i < 26; i += 1) {
    flightObjects.push(makeFlightObject("ring", i));
    if (i % 2 === 0) flightObjects.push(makeFlightObject("star", i));
    if (i % 3 === 0) flightObjects.push(makeFlightObject("gust", i));
  }
}

function makeFlightObject(kind, i) {
  let mesh;
  if (kind === "ring") {
    mesh = new THREE.Mesh(
      new THREE.TorusGeometry(1.9, 0.22, 10, 24),
      new THREE.MeshStandardMaterial({ color: 0xffe28b, emissive: 0xc49d3a, emissiveIntensity: 0.25, roughness: 0.3 }),
    );
  } else if (kind === "star") {
    mesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.05),
      new THREE.MeshStandardMaterial({ color: 0xfff0c4, emissive: 0xe7cc83, emissiveIntensity: 0.3, roughness: 0.2 }),
    );
  } else {
    mesh = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.65, 0.16, 40, 6, 2, 3),
      new THREE.MeshStandardMaterial({ color: 0xd8f6ff, emissive: 0x88d5ff, emissiveIntensity: 0.25, roughness: 0.3 }),
    );
    mesh.scale.set(1.2, 1.2, 0.5);
  }
  mesh.castShadow = true;
  scene.add(mesh);
  return {
    kind,
    mesh,
    z: 48 + i * 18 + (kind === "star" ? 5 : kind === "gust" ? 9 : 0),
    x: Math.sin(i * (kind === "gust" ? 0.95 : 0.72)) * (kind === "gust" ? 7.5 : kind === "star" ? 6.4 : 5.6),
    y: kind === "gust" ? 4 + Math.cos(i * 0.8) * 3 : 5 + Math.cos(i * 0.55) * 3.5,
    hit: false,
    value: kind === "ring" ? 16 : kind === "star" ? 12 : 10,
  };
}

function finishFlight() {
  const bird = selectedBird();
  const totalXp = Math.max(18, Math.round(state.flight.runXp + 10 + bird.level * 2));
  gainBirdXp(bird, totalXp);
  state.scene = "land";
  playerMesh.visible = true;
  state.flight = null;
  for (const object of flightObjects) {
    scene.remove(object.mesh);
    disposeHierarchy(object.mesh);
  }
  flightObjects.length = 0;
  state.prompt = `${bird.name} landed with ${totalXp} XP. Stronger flocks reveal stronger eggs.`;
  state.message = `${bird.name} completed a flight run.`;
  updateCompanionBird();
}

function updateFlight(dt) {
  const flight = state.flight;
  const bird = selectedBird();
  flight.timer -= dt;
  flight.energy = Math.min(100, flight.energy + dt * (8 + bird.growth * 2) + (bird.abilities.includes("Tailwind") ? 5 * dt : 0));

  if (keys.has("KeyA")) flight.laneX -= dt * 8.8;
  if (keys.has("KeyD")) flight.laneX += dt * 8.8;
  flight.laneX = clamp(flight.laneX, -8.5, 8.5);

  if (keys.has("Space") && flight.energy > 8) {
    flight.velocityY += 18 * bird.lift * dt;
    flight.energy -= 18 * dt;
  }
  if (keys.has("ShiftLeft") || keys.has("ShiftRight")) {
    if (flight.energy > 16) {
      flight.speed = Math.min(44 + bird.speed * 6, flight.speed + 18 * dt);
      flight.energy -= 24 * dt;
      flight.runXp += dt * (bird.name === "Sunflare" ? 7 : 3);
    }
  } else {
    const cruise = 22 + bird.speed * 4.6;
    flight.speed += (cruise - flight.speed) * 0.9 * dt;
  }

  flight.velocityY -= 6.4 * dt;
  flight.altitude = clamp(flight.altitude + flight.velocityY * dt, 1.5, 14);
  if (flight.altitude <= 1.5) flight.velocityY = 0;

  if (bird.name === "Rose Phoenix") flight.runXp += 2.2 * dt;
  if (bird.name === "Bloomtail" || bird.name === "Verdant Seraph") flight.runXp += 1.1 * dt;

  for (const object of flightObjects) {
    object.z -= flight.speed * dt;
    if (!object.hit) {
      object.mesh.position.set(object.x, object.y, object.z);
      object.mesh.rotation.x += dt * 0.5;
      object.mesh.rotation.y += dt * 0.8;
    }
    if (!object.hit && object.z < 4) {
      const hitX = Math.abs(object.x - flight.laneX) < (object.kind === "ring" ? 2.3 : 1.8);
      const hitY = Math.abs(object.y - flight.altitude) < (object.kind === "ring" ? 2.1 : 1.6);
      if (hitX && hitY) {
        object.hit = true;
        object.mesh.visible = false;
        if (object.kind === "ring") {
          flight.combo += 1;
          flight.runXp += object.value + flight.combo * 2;
        } else if (object.kind === "star") {
          flight.runXp += object.value + (bird.name === "Bloomtail" ? 6 : 0);
          flight.energy = Math.min(100, flight.energy + 12);
        } else if (object.kind === "gust") {
          flight.runXp += bird.name === "Stormwing" ? 18 : object.value;
          flight.velocityY += 2.2 + bird.lift * 0.5;
        }
      } else if (object.kind === "ring") {
        flight.combo = 0;
      }
    }
  }

  if (flight.timer <= 0) finishFlight();
}

function updateAnimals(dt) {
  for (const animal of animalMeshes) {
    animal.userData.wander += dt * 0.1;
    animal.rotation.y += Math.sin(animal.userData.wander) * 0.002;
  }
}

function updateGrass(dt) {
  for (let i = 0; i < grassBlades.length; i += 1) {
    const blade = grassBlades[i];
    blade.rotation.z = Math.sin(state.time * 1.8 + blade.userData.sway) * 0.14;
  }
}

function updateInteractables(dt) {
  for (const mesh of interactables) {
    mesh.position.y = getTerrainHeight(mesh.position.x, mesh.position.z) + 1.2 + Math.sin(state.time * 2 + mesh.userData.floatOffset) * 0.35;
    mesh.rotation.y += dt * 0.8;
  }
}

function updatePlayer(dt) {
  const sprint = keys.has("ShiftLeft") || keys.has("ShiftRight");
  const speed = MOVE_SPEED * (sprint ? 1.48 : 1);
  let moveX = 0;
  let moveZ = 0;
  if (keys.has("KeyW")) moveZ += 1;
  if (keys.has("KeyS")) moveZ -= 1;
  if (keys.has("KeyA")) moveX -= 1;
  if (keys.has("KeyD")) moveX += 1;

  if (!state.pointerLocked) {
    if (keys.has("KeyQ") || keys.has("ArrowLeft")) state.player.yaw += TURN_SPEED * dt;
    if (keys.has("ArrowRight")) state.player.yaw -= TURN_SPEED * dt;
  }

  if (moveX || moveZ) {
    const forward = new THREE.Vector3(Math.sin(state.player.yaw), 0, Math.cos(state.player.yaw));
    const right = new THREE.Vector3(forward.z, 0, -forward.x);
    const move = forward.multiplyScalar(moveZ).add(right.multiplyScalar(moveX)).normalize().multiplyScalar(speed * dt);
    state.player.x += move.x;
    state.player.z += move.z;
    state.player.bob += dt * speed * 0.22;
    state.player.moveBlend = Math.min(1, state.player.moveBlend + dt * 5);
  } else {
    state.player.moveBlend = Math.max(0, state.player.moveBlend - dt * 4);
  }

  const radius = Math.hypot(state.player.x, state.player.z);
  if (radius > WORLD_RADIUS - 4) {
    const scale = (WORLD_RADIUS - 4) / radius;
    state.player.x *= scale;
    state.player.z *= scale;
  }

  state.player.y = getTerrainHeight(state.player.x, state.player.z);
  playerMesh.position.set(state.player.x, state.player.y, state.player.z);
  playerMesh.rotation.y = -state.player.yaw + Math.PI;
  playerMesh.position.y += Math.sin(state.player.bob * 2) * 0.1 * state.player.moveBlend;

  if (companionMesh) {
    const offsetAngle = state.time * 0.6;
    const tx = state.player.x + Math.cos(offsetAngle) * 3.6;
    const tz = state.player.z + Math.sin(offsetAngle) * 3.6;
    companionMesh.position.lerp(new THREE.Vector3(tx, getTerrainHeight(tx, tz) + 2.6 + Math.sin(state.time * 4) * 0.3, tz), 0.06);
    companionMesh.lookAt(playerMesh.position.x, companionMesh.position.y + 0.2, playerMesh.position.z);
  }

  updateLandCamera(dt);
}

function updateLandCamera(dt) {
  const forward = new THREE.Vector3(Math.sin(state.player.yaw), 0, Math.cos(state.player.yaw));
  const desired = new THREE.Vector3(
    state.player.x - forward.x * CAMERA_DISTANCE,
    state.player.y + CAMERA_HEIGHT,
    state.player.z - forward.z * CAMERA_DISTANCE,
  );
  desired.y += 2 * Math.max(0, Math.sin(state.player.bob * 2) * state.player.moveBlend);
  camera.position.lerp(desired, 0.1);
  const target = new THREE.Vector3(
    state.player.x,
    state.player.y + CAMERA_LOOK_HEIGHT,
    state.player.z,
  );
  camera.lookAt(target);
}

function updateFlightCamera(dt) {
  const flight = state.flight;
  const bird = selectedBird();
  if (!bird) return;

  if (!companionMesh) updateCompanionBird();
  if (companionMesh) {
    companionMesh.visible = true;
    companionMesh.position.set(flight.laneX, flight.altitude, 0);
    companionMesh.rotation.y = Math.PI;
    companionMesh.rotation.z = Math.sin(state.time * 18) * 0.12;
  }

  camera.position.lerp(new THREE.Vector3(flight.laneX, flight.altitude + 4.5, -12), 0.12);
  camera.lookAt(new THREE.Vector3(flight.laneX, flight.altitude + 1, 10));
}

function update(dt) {
  state.time += dt;
  if (keys.has("KeyR")) {
    resetGame();
    keys.delete("KeyR");
    return;
  }

  if (state.scene === "land") {
    updatePlayer(dt);
    updateInteractables(dt);
    updateAnimals(dt);
    updateGrass(dt);
    state.spawnCooldown -= dt;
    ensureWorldSpawns();
  } else {
    updateFlight(dt);
    updateFlightCamera(dt);
  }

  refreshUI();
}

function render() {
  renderer.render(scene, camera);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function shuffle(list, seed) {
  const clone = list.slice();
  let currentSeed = seed;
  for (let i = clone.length - 1; i > 0; i -= 1) {
    currentSeed = (currentSeed * 1664525 + 1013904223) % 4294967296;
    const j = currentSeed % (i + 1);
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

document.addEventListener("keydown", (event) => {
  keys.add(event.code);
  if (event.code === "KeyE" && state.scene === "land") {
    interactNearby();
  }
  if (event.code === "Space" && state.scene === "land") {
    const nearby = nearestInteraction();
    if (nearby && nearby.kind === "perch") startFlight();
  }
  for (let i = 0; i < 6; i += 1) {
    if (event.code === `Digit${i + 1}`) selectBird(i);
  }
});

document.addEventListener("keyup", (event) => {
  keys.delete(event.code);
});

canvas.addEventListener("click", () => {
  if (document.pointerLockElement !== canvas) canvas.requestPointerLock();
});

document.addEventListener("pointerlockchange", () => {
  state.pointerLocked = document.pointerLockElement === canvas;
});

document.addEventListener("mousemove", (event) => {
  if (document.pointerLockElement !== canvas || state.scene !== "land") return;
  state.player.yaw -= event.movementX * 0.0022;
});

ui.hairSelect.addEventListener("change", () => {
  state.character.hair = ui.hairSelect.value;
  recolorPlayer();
  refreshUI();
});

ui.jacketSelect.addEventListener("change", () => {
  state.character.jacket = ui.jacketSelect.value;
  recolorPlayer();
  refreshUI();
});

ui.packSelect.addEventListener("change", () => {
  state.character.pack = ui.packSelect.value;
  recolorPlayer();
  refreshUI();
});

ui.hatchBtn.addEventListener("click", () => {
  hatchSelectedEgg();
  refreshUI();
});

ui.useItemBtn.addEventListener("click", () => {
  useSelectedItem();
  refreshUI();
});

ui.cycleBagBtn.addEventListener("click", () => {
  if (!state.backpack.length) return;
  state.selectedBagIndex = (state.selectedBagIndex + 1) % state.backpack.length;
  refreshUI();
});

ui.sendFlightBtn.addEventListener("click", () => {
  startFlight();
  refreshUI();
});

ui.inventoryPanel.addEventListener("click", (event) => {
  const button = event.target.closest("[data-bag-index]");
  if (!button) return;
  state.selectedBagIndex = Number(button.dataset.bagIndex);
  refreshUI();
});

ui.rosterPanel.addEventListener("click", (event) => {
  const button = event.target.closest("[data-bird-index]");
  if (!button || state.scene !== "land") return;
  selectBird(Number(button.dataset.birdIndex));
  refreshUI();
});

window.addEventListener("resize", () => {
  const width = canvas.clientWidth || canvas.width;
  const height = canvas.clientHeight || canvas.height;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});

let lastFrame = performance.now();
function frame(now) {
  const dt = Math.min(0.033, (now - lastFrame) / 1000);
  lastFrame = now;
  update(dt);
  render();
  requestAnimationFrame(frame);
}

function showRuntimeError(error) {
  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  ui.promptStat.textContent = `Runtime error: ${message}`;
  ui.overlayCard.innerHTML = `<strong>Renderer Error</strong>${message}`;
  console.error(error);
}

window.addEventListener("error", (event) => {
  showRuntimeError(event.error || event.message);
});

window.addEventListener("unhandledrejection", (event) => {
  showRuntimeError(event.reason);
});

try {
  seedWorld(state);
  rebuildWorld();
  syncCustomizationUI();
  refreshUI();
  requestAnimationFrame(frame);
} catch (error) {
  showRuntimeError(error);
}

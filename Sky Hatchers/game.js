const canvas = document.getElementById("game");

const ui = {
  sceneStat: document.getElementById("sceneStat"),
  bagStat: document.getElementById("bagStat"),
  flockStat: document.getElementById("flockStat"),
  tierStat: document.getElementById("tierStat"),
  promptStat: document.getElementById("promptStat"),
  overlayCard: document.getElementById("overlayCard"),
  evolutionScreen: document.getElementById("evolutionScreen"),
  openInventoryBtn: document.getElementById("openInventoryBtn"),
  openFolioBtn: document.getElementById("openFolioBtn"),
  openMapBtn: document.getElementById("openMapBtn"),
  openSettingsBtn: document.getElementById("openSettingsBtn"),
  closeInventoryBtn: document.getElementById("closeInventoryBtn"),
  closeFolioBtn: document.getElementById("closeFolioBtn"),
  closeMapBtn: document.getElementById("closeMapBtn"),
  closeSettingsBtn: document.getElementById("closeSettingsBtn"),
  inventoryDrawer: document.getElementById("inventoryDrawer"),
  folioDrawer: document.getElementById("folioDrawer"),
  mapDrawer: document.getElementById("mapDrawer"),
  settingsDrawer: document.getElementById("settingsDrawer"),
  inventoryPanel: document.getElementById("inventoryPanel"),
  activeBirdPanel: document.getElementById("activeBirdPanel"),
  rosterPanel: document.getElementById("rosterPanel"),
  folioSummary: document.getElementById("folioSummary"),
  folioGrid: document.getElementById("folioGrid"),
  folioDetail: document.getElementById("folioDetail"),
  mapSummary: document.getElementById("mapSummary"),
  mapPanel: document.getElementById("mapPanel"),
  portrait: document.getElementById("portrait"),
  hatchBtn: document.getElementById("hatchBtn"),
  useItemBtn: document.getElementById("useItemBtn"),
  sendFlightBtn: document.getElementById("sendFlightBtn"),
  restBirdBtn: document.getElementById("restBirdBtn"),
  releaseBirdBtn: document.getElementById("releaseBirdBtn"),
  releaseDuplicatesBtn: document.getElementById("releaseDuplicatesBtn"),
  musicToggleBtn: document.getElementById("musicToggleBtn"),
  manualSaveBtn: document.getElementById("manualSaveBtn"),
  resetSaveBtn: document.getElementById("resetSaveBtn"),
  settingsNote: document.getElementById("settingsNote"),
  hairSelect: document.getElementById("hairSelect"),
  hairStyleSelect: document.getElementById("hairStyleSelect"),
  skinSelect: document.getElementById("skinSelect"),
  jacketSelect: document.getElementById("jacketSelect"),
  packSelect: document.getElementById("packSelect"),
};

const keys = new Set();
const WORLD_RADIUS = 720;
const MOVE_SPEED = 18;
const INTERACT_DISTANCE = 11;
const NPC_INTERACT_DISTANCE = 15;
const CAMERA_DISTANCE = 14;
const CAMERA_HEIGHT = 7;
const CAMERA_LOOK_HEIGHT = 3;
const TURN_SPEED = 1.8;
const FLIGHT_UNLOCK_LEVEL = 10;
const EVOLUTION_LEVELS = [10, 30, 50];
const PLAYER_COLLIDER_RADIUS = 1.25;
const STARTER_SPECIES_IDS = ["sunflare", "stormwing", "bloomtail"];
const SAVE_KEY = "sky-hatchers-save-v1";

const CHARACTER_COLORS = {
  hair: { ember: "#7a3928", midnight: "#1d2438", mint: "#60a899" },
  jacket: { gold: "#c99834", teal: "#2b7f88", rose: "#b46577" },
  pack: { tan: "#8f6c43", navy: "#33506b", forest: "#446c48" },
  skin: { fair: "#f1d2ba", warm: "#c9956d", deep: "#75492f" },
};

const SPECIES = [
  { id: "sunflare", name: "Sunflare", rarity: "common", unlockLevel: 0, color: "#f29a2f", accent: "#ffe39b", perk: "Flame-feather dashes score extra XP.", base: { speed: 1.05, lift: 0.95, growth: 1.02 }, look: "flame", stages: ["Flicker", "Sunspark", "Sunflare", "Solarflare"] },
  { id: "stormwing", name: "Stormwing", rarity: "common", unlockLevel: 0, color: "#bfc7cf", accent: "#ffffff", perk: "Gray-white wings hold altitude through gusts.", base: { speed: 0.98, lift: 1.12, growth: 0.96 }, look: "storm", stages: ["Cloudling", "Stormwing", "Thundercrest", "Tempest Lord"] },
  { id: "bloomtail", name: "Bloomtail", rarity: "common", unlockLevel: 0, color: "#72c86d", accent: "#f097bb", perk: "Flower-bright feathers pull stars and grow fast.", base: { speed: 0.94, lift: 0.98, growth: 1.14 }, look: "bloom", stages: ["Budtail", "Bloomtail", "Roseplume", "Verdant Crown"] },
  { id: "embercrest", name: "Embercrest", rarity: "uncommon", unlockLevel: 6, color: "#cd632f", accent: "#ffd06f", perk: "Molten crest boosts launch speed.", base: { speed: 1.12, lift: 0.92, growth: 1.02 }, look: "crest", stages: ["Coalcrest", "Embercrest", "Cindercrest", "Inferno Crest"] },
  { id: "mistfinch", name: "Mistfinch", rarity: "uncommon", unlockLevel: 6, color: "#7fbdd2", accent: "#dff8ff", perk: "Mist feathers recover flight energy faster.", base: { speed: 0.99, lift: 1.08, growth: 1.02 }, look: "mist", stages: ["Dewfinch", "Mistfinch", "Fogwing", "Pale Nimbus"] },
  { id: "thornbeak", name: "Thornbeak", rarity: "uncommon", unlockLevel: 6, color: "#698f42", accent: "#d3f79c", perk: "Forest plumage stacks strong growth gains.", base: { speed: 0.92, lift: 0.95, growth: 1.18 }, look: "thorn", stages: ["Sprigbeak", "Thornbeak", "Briar Talon", "Wildthorn King"] },
  { id: "glimmerowl", name: "Glimmerowl", rarity: "rare", unlockLevel: 14, color: "#7066d2", accent: "#fff1be", perk: "Moon-dusted wings widen ring pickups.", base: { speed: 1.06, lift: 1.06, growth: 1.08 }, look: "glimmer", stages: ["Gleamlet", "Glimmerowl", "Moonwatch", "Star Oracle"] },
  { id: "tempestkite", name: "Tempest Kite", rarity: "rare", unlockLevel: 14, color: "#547bd0", accent: "#f4fbff", perk: "Storm fins turn gusts into bigger score bursts.", base: { speed: 1.14, lift: 1.12, growth: 0.98 }, look: "tempest", stages: ["Squall Kite", "Tempest Kite", "Storm Lance", "Sky Tyrant"] },
  { id: "rosephoenix", name: "Rose Phoenix", rarity: "rare", unlockLevel: 14, color: "#f06182", accent: "#ffd4e0", perk: "Floral fire plumage grants passive flight XP.", base: { speed: 1.05, lift: 0.98, growth: 1.18 }, look: "phoenix", stages: ["Rosekindle", "Rose Phoenix", "Blazebloom", "Petal Pyre"] },
  { id: "auroraseraph", name: "Aurora Seraph", rarity: "epic", unlockLevel: 24, color: "#61d0f6", accent: "#ffe47d", perk: "Aurora ribbons widen rings and accelerate growth.", base: { speed: 1.14, lift: 1.14, growth: 1.2 }, look: "aurora", stages: ["Dawn Wisp", "Aurora Seraph", "Polar Archon", "Heaven Aurora"] },
  { id: "titanroc", name: "Titan Roc", rarity: "epic", unlockLevel: 24, color: "#b67939", accent: "#fff2bd", perk: "Massive feathers push speed and size higher.", base: { speed: 1.16, lift: 1.02, growth: 1.18 }, look: "roc", stages: ["Stone Chick", "Titan Roc", "Crag Sovereign", "World Roc"] },
  { id: "verdantseraph", name: "Verdant Seraph", rarity: "epic", unlockLevel: 24, color: "#4fb06c", accent: "#f0a9ff", perk: "Sacred bloom-feathers amplify item bonuses.", base: { speed: 1.02, lift: 1.08, growth: 1.24 }, look: "seraph", stages: ["Leafling", "Verdant Seraph", "Bloom Saint", "Evergarden"] },
];

const ITEM_DEFS = [
  { id: "sunfruit", name: "Sunfruit", effect: "growth", amount: 42, color: "#f4b547", desc: "A glowing fruit that grants quick growth XP." },
  { id: "gust_crystal", name: "Gust Crystal", effect: "lift", amount: 0.14, color: "#86d8ff", desc: "Improves lift and flap height." },
  { id: "feather_charm", name: "Feather Charm", effect: "ability", ability: "Tailwind", color: "#dcb8ff", desc: "Unlocks Tailwind for better energy regen." },
  { id: "bloom_nectar", name: "Bloom Nectar", effect: "growth", amount: 58, color: "#ff88b4", desc: "Rare nectar that strongly accelerates growth." },
  { id: "ember_relic", name: "Ember Relic", effect: "speed", amount: 0.15, color: "#ff8a52", desc: "Ancient relic that increases launch speed." },
];

function makeVillageNpcs(cx, cz, names) {
  return names.map((name, index) => ({
    id: `${name.toLowerCase().replace(/\s+/g, "-")}`,
    name,
    x: cx + Math.cos((index / names.length) * Math.PI * 2 + Math.PI * 0.25) * 7.5,
    z: cz + Math.sin((index / names.length) * Math.PI * 2 + Math.PI * 0.25) * 6.5,
  }));
}

function makeForageSpots(cx, cz, radius, count) {
  const spots = [];
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2 + (cx + cz) * 0.0017;
    const ring = 0.32 + ((i * 37) % 100) / 100 * 0.55;
    spots.push({
      x: cx + Math.cos(angle) * radius * ring,
      z: cz + Math.sin(angle * 1.07) * radius * ring * 0.88,
    });
  }
  return spots;
}

const ISLANDS = {
  tutorial: {
    id: "tutorial",
    name: "Tutorial Isle",
    center: { x: 0, z: 0 },
    radius: 68,
    rarityCap: "common",
    theme: "meadow",
    biome: "Sunlit meadows and starter groves",
    enemies: ["Mischief foxes"],
    birdsHint: "Starter flock",
    groundSpawn: { x: 0, z: 10 },
    nest: { x: 0, z: 0, label: "Star Nest", type: "nest", color: "#f3c97c" },
    perch: { x: 18, z: -10, label: "Sky Perch", type: "perch", color: "#bceeff" },
    tailor: { x: -16, z: 12, label: "Wanderer's Camp", type: "tailor", color: "#f1a0ac" },
    forageSpots: makeForageSpots(0, 0, 40, 24),
  },
  moonfen: {
    id: "moonfen",
    name: "Moonfen Atoll",
    center: { x: 276, z: -146 },
    radius: 132,
    rarityCap: "rare",
    theme: "moonfen",
    biome: "Silver marshes, mist pools, and moonstone ruins",
    enemies: ["Fen stalkers", "Marsh wraiths"],
    birdsHint: "Mistfinch, Glimmerowl, Tempest Kite",
    groundSpawn: { x: 286, z: -98 },
    nest: { x: 248, z: -152, label: "Moon Nest", type: "nest", color: "#d9d3ff" },
    perch: { x: 318, z: -122, label: "Wind Spire", type: "perch", color: "#bceeff" },
    tailor: { x: 236, z: -102, label: "Moon Camp", type: "tailor", color: "#e8b4ff" },
    village: { x: 294, z: -164, label: "Fenwatch Hamlet", npcs: makeVillageNpcs(294, -164, ["Mira Reed", "Old Pell", "Sable"]) },
    forageSpots: makeForageSpots(276, -146, 98, 64),
  },
  emberreach: {
    id: "emberreach",
    name: "Emberreach",
    center: { x: -324, z: 196 },
    radius: 148,
    rarityCap: "epic",
    theme: "ember",
    biome: "Volcanic cliffs, ash fields, lava vents, and broken giant nests",
    enemies: ["Ash wolves", "Cinder drakes"],
    birdsHint: "Embercrest, Rose Phoenix, Titan Roc",
    groundSpawn: { x: -306, z: 252 },
    nest: { x: -352, z: 194, label: "Ember Nest", type: "nest", color: "#ffca8b" },
    perch: { x: -258, z: 228, label: "Roc Perch", type: "perch", color: "#ffd9a0" },
    tailor: { x: -372, z: 264, label: "Reef Camp", type: "tailor", color: "#f1a0ac" },
    forageSpots: makeForageSpots(-324, 196, 112, 68),
  },
  verdantwilds: {
    id: "verdantwilds",
    name: "Verdant Wilds",
    center: { x: 238, z: 314 },
    radius: 156,
    rarityCap: "epic",
    theme: "verdant",
    biome: "Massive forest canopies, bloom glades, and overgrown ruins",
    enemies: ["Bramble boars", "Thorn cats"],
    birdsHint: "Bloomtail, Thornbeak, Verdant Seraph",
    groundSpawn: { x: 224, z: 362 },
    nest: { x: 204, z: 304, label: "Canopy Nest", type: "nest", color: "#ffd9ea" },
    perch: { x: 286, z: 326, label: "Bloom Perch", type: "perch", color: "#bff0ce" },
    tailor: { x: 180, z: 366, label: "Grove Camp", type: "tailor", color: "#f1a0ac" },
    village: { x: 272, z: 338, label: "Petal Hollow", npcs: makeVillageNpcs(272, 338, ["Auri", "Thorn Sage", "Linn"]) },
    forageSpots: makeForageSpots(238, 314, 118, 76),
  },
  stormchain: {
    id: "stormchain",
    name: "Stormchain Keys",
    center: { x: -76, z: -356 },
    radius: 122,
    rarityCap: "rare",
    theme: "storm",
    biome: "Wind-cut islets, slate rock, and storm arches",
    enemies: ["Razor gulls", "Skyray hunters"],
    birdsHint: "Stormwing, Tempest Kite, Aurora Seraph",
    groundSpawn: { x: -58, z: -310 },
    nest: { x: -104, z: -360, label: "Storm Nest", type: "nest", color: "#d5ebff" },
    perch: { x: -26, z: -340, label: "Tempest Roost", type: "perch", color: "#bceeff" },
    tailor: { x: -118, z: -304, label: "Storm Camp", type: "tailor", color: "#c0d8ff" },
    village: { x: -34, z: -384, label: "Chainport", npcs: makeVillageNpcs(-34, -384, ["Captain Vey", "Neri", "Torch"]) },
    forageSpots: makeForageSpots(-76, -356, 92, 58),
  },
};

function islandInfluenceAt(x, z) {
  let best = null;
  for (const island of Object.values(ISLANDS)) {
    const dx = x - island.center.x;
    const dz = z - island.center.z;
    const dist = Math.hypot(dx, dz);
    const falloff = Math.max(0, 1 - dist / island.radius);
    if (!best || falloff > best.falloff) best = { island, falloff, dist };
  }
  return best;
}

function biomePalette(island) {
  const theme = island?.theme || "meadow";
  if (theme === "ember") {
    return {
      groundLow: new THREE.Color(0x5f4630),
      groundHigh: new THREE.Color(0x8a5b39),
      grass: [0x6b5237, 0x7e5e3b, 0x925c34],
      rockA: 0x4a3934,
      rockB: 0x7b4b36,
      treeTrunk: 0x4a2c1d,
      treeLeaf: [0x6b3822, 0x8b4a26, 0xb85d28],
      bush: [0x6b4b2e, 0x8c5d34, 0x9d6a30],
      water: 0x6e3221,
      evoTheme: "fire",
    };
  }
  if (theme === "moonfen") {
    return {
      groundLow: new THREE.Color(0x4a5a5f),
      groundHigh: new THREE.Color(0x7e8fa2),
      grass: [0x68818b, 0x829ba5, 0x9ab6bf],
      rockA: 0x4a4e60,
      rockB: 0x79809a,
      treeTrunk: 0x4d4658,
      treeLeaf: [0x708ca0, 0x95a9bf, 0xb8c1d1],
      bush: [0x667e8b, 0x839aa7, 0xa1b7c2],
      water: 0x58748f,
      evoTheme: "arcane",
    };
  }
  if (theme === "storm") {
    return {
      groundLow: new THREE.Color(0x44505b),
      groundHigh: new THREE.Color(0x6b7b87),
      grass: [0x556774, 0x748897, 0x8fa4b2],
      rockA: 0x384651,
      rockB: 0x60707c,
      treeTrunk: 0x3e3536,
      treeLeaf: [0x677887, 0x889cac, 0xb8ceda],
      bush: [0x5a6c78, 0x738994, 0x8ea2ae],
      water: 0x436d8a,
      evoTheme: "storm",
    };
  }
  if (theme === "verdant") {
    return {
      groundLow: new THREE.Color(0x356038),
      groundHigh: new THREE.Color(0x689552),
      grass: [0x4a7a3f, 0x68a452, 0x84bf63],
      rockA: 0x50634d,
      rockB: 0x7e8f67,
      treeTrunk: 0x5a4024,
      treeLeaf: [0x3f7a3d, 0x63a451, 0x8cc96b],
      bush: [0x558247, 0x72ad5d, 0x9bd07a],
      water: 0x4b8d5d,
      evoTheme: "bloom",
    };
  }
  return {
    groundLow: new THREE.Color(0x54753f),
    groundHigh: new THREE.Color(0x95bb69),
    grass: [0x5f8d4b, 0x7eaf5c, 0xa3ce79],
    rockA: 0x6a675f,
    rockB: 0x7c786f,
    treeTrunk: 0x6d4a2b,
    treeLeaf: [0x315d35, 0x416f3e, 0x557d4d],
    bush: [0x45683b, 0x5d7a46, 0x6b8952],
    water: 0x3f7695,
    evoTheme: "bloom",
  };
}

function evolutionThemeForLook(look) {
  if (["flame", "phoenix", "crest"].includes(look)) return "fire";
  if (["storm", "tempest", "mist"].includes(look)) return "storm";
  if (["glimmer", "aurora", "roc"].includes(look)) return "arcane";
  return "bloom";
}

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
const obstacleColliders = [];
const villageNpcs = [];

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
let activeDrawer = null;
let musicContext = null;
let musicTimer = null;
let musicStep = 0;
let mountedGroup = null;

function createState() {
  const defaultDiscovered = STARTER_SPECIES_IDS.slice();
  return {
    scene: "land",
    time: 0,
    pointerLocked: false,
    prompt: "Click the game view to lock the mouse and explore the sanctuary.",
    message: "This is a mythical bird sanctuary. Wander, collect eggs, and build your flock.",
    player: {
      x: ISLANDS.tutorial.groundSpawn.x,
      z: ISLANDS.tutorial.groundSpawn.z,
      y: 0,
      yaw: Math.PI,
      facingYaw: Math.PI,
      pitch: -0.18,
      bob: 0,
      moveBlend: 0,
    },
    currentIsland: "tutorial",
    character: { hair: "ember", hairStyle: "windswept", skin: "fair", jacket: "gold", pack: "tan" },
    backpack: [],
    selectedBagIndex: 0,
    birds: [],
    selectedBirdIndex: 0,
    nextEntityId: 1,
    worldEntities: [],
    spawnCooldown: 0,
    exploreProgress: 0,
    nestRestCooldown: 0,
    musicEnabled: true,
    discoveredSpecies: defaultDiscovered,
    selectedFolioSpeciesId: SPECIES[0].id,
    discoveredIslands: ["tutorial"],
    completedNpcQuests: {},
    evolution: null,
    flight: null,
  };
}

let state = createState();
let saveQueued = false;

function snapshotState(sourceState = state) {
  return {
    currentIsland: sourceState.currentIsland,
    character: sourceState.character,
    backpack: sourceState.backpack,
    selectedBagIndex: sourceState.selectedBagIndex,
    birds: sourceState.birds,
    selectedBirdIndex: sourceState.selectedBirdIndex,
    nextEntityId: sourceState.nextEntityId,
    worldEntities: sourceState.worldEntities,
    spawnCooldown: sourceState.spawnCooldown,
    exploreProgress: sourceState.exploreProgress,
    nestRestCooldown: sourceState.nestRestCooldown,
    musicEnabled: sourceState.musicEnabled,
    discoveredSpecies: sourceState.discoveredSpecies,
    selectedFolioSpeciesId: sourceState.selectedFolioSpeciesId,
    discoveredIslands: sourceState.discoveredIslands,
    completedNpcQuests: sourceState.completedNpcQuests,
    player: {
      x: sourceState.player.x,
      z: sourceState.player.z,
      yaw: sourceState.player.yaw,
      facingYaw: sourceState.player.facingYaw,
      pitch: sourceState.player.pitch,
    },
  };
}

function queueSave() {
  saveQueued = true;
}

function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(snapshotState()));
    saveQueued = false;
  } catch (error) {
    console.warn("Save failed", error);
  }
}

function discoverSpecies(speciesId) {
  if (!speciesId || state.discoveredSpecies.includes(speciesId)) return;
  state.discoveredSpecies.push(speciesId);
  queueSave();
}

function discoverIsland(islandId) {
  if (!islandId || state.discoveredIslands.includes(islandId)) return;
  state.discoveredIslands.push(islandId);
  queueSave();
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed) return null;
    const islandMap = { moon: "moonfen", ember: "emberreach" };
    const currentIslandId = ISLANDS[parsed.currentIsland] ? parsed.currentIsland : islandMap[parsed.currentIsland] || "tutorial";
    const fresh = createState();
    fresh.currentIsland = currentIslandId;
    fresh.character = { ...fresh.character, ...(parsed.character || {}) };
    fresh.backpack = Array.isArray(parsed.backpack) ? parsed.backpack : [];
    fresh.selectedBagIndex = clamp(parsed.selectedBagIndex || 0, 0, Math.max(fresh.backpack.length - 1, 0));
    fresh.birds = Array.isArray(parsed.birds) ? parsed.birds : [];
    fresh.birds.forEach((bird) => {
      bird.evolutionStage = typeof bird.evolutionStage === "number" ? bird.evolutionStage : getEvolutionStage(bird.level || 1);
    });
    fresh.selectedBirdIndex = clamp(parsed.selectedBirdIndex || 0, 0, Math.max(fresh.birds.length - 1, 0));
    const selectedBirdId = fresh.birds[fresh.selectedBirdIndex]?.id;
    fresh.birds.sort((a, b) => {
      const progressDiff = b.level * 10000 + Math.round((b.xp || 0) * 100) + Math.round((b.growth || 0) * 1000)
        - (a.level * 10000 + Math.round((a.xp || 0) * 100) + Math.round((a.growth || 0) * 1000));
      if (progressDiff !== 0) return progressDiff;
      return a.name.localeCompare(b.name);
    });
    fresh.selectedBirdIndex = Math.max(0, fresh.birds.findIndex((bird) => bird.id === selectedBirdId));
    fresh.nextEntityId = Number.isFinite(parsed.nextEntityId) ? parsed.nextEntityId : 1;
    fresh.worldEntities = Array.isArray(parsed.worldEntities) ? parsed.worldEntities : [];
    fresh.spawnCooldown = typeof parsed.spawnCooldown === "number" ? parsed.spawnCooldown : 0;
    fresh.exploreProgress = typeof parsed.exploreProgress === "number" ? parsed.exploreProgress : 0;
    fresh.nestRestCooldown = typeof parsed.nestRestCooldown === "number" ? parsed.nestRestCooldown : 0;
    fresh.musicEnabled = typeof parsed.musicEnabled === "boolean" ? parsed.musicEnabled : true;
    fresh.discoveredSpecies = [
      ...new Set([
        ...STARTER_SPECIES_IDS,
        ...(Array.isArray(parsed.discoveredSpecies) ? parsed.discoveredSpecies.filter((id) => SPECIES.some((species) => species.id === id)) : []),
      ]),
    ];
    fresh.selectedFolioSpeciesId = SPECIES.some((species) => species.id === parsed.selectedFolioSpeciesId) ? parsed.selectedFolioSpeciesId : SPECIES[0].id;
    fresh.discoveredIslands = [
      ...new Set([
        "tutorial",
        ...(Array.isArray(parsed.discoveredIslands) ? parsed.discoveredIslands.filter((id) => ISLANDS[id]) : []),
      ]),
    ];
    fresh.completedNpcQuests = parsed.completedNpcQuests && typeof parsed.completedNpcQuests === "object" ? parsed.completedNpcQuests : {};
    if (parsed.player) {
      fresh.player.x = typeof parsed.player.x === "number" ? parsed.player.x : fresh.player.x;
      fresh.player.z = typeof parsed.player.z === "number" ? parsed.player.z : fresh.player.z;
      fresh.player.yaw = typeof parsed.player.yaw === "number" ? parsed.player.yaw : fresh.player.yaw;
      fresh.player.facingYaw = typeof parsed.player.facingYaw === "number" ? parsed.player.facingYaw : fresh.player.yaw;
      fresh.player.pitch = typeof parsed.player.pitch === "number" ? parsed.player.pitch : fresh.player.pitch;
    }
    return fresh;
  } catch (error) {
    console.warn("Load failed", error);
    return null;
  }
}

function applyDrawerState() {
  const inventoryOpen = activeDrawer === "inventory";
  const folioOpen = activeDrawer === "folio";
  const mapOpen = activeDrawer === "map";
  const settingsOpen = activeDrawer === "settings";
  ui.inventoryDrawer.classList.toggle("open", inventoryOpen);
  ui.folioDrawer.classList.toggle("open", folioOpen);
  ui.mapDrawer.classList.toggle("open", mapOpen);
  ui.settingsDrawer.classList.toggle("open", settingsOpen);
  ui.inventoryDrawer.setAttribute("aria-hidden", inventoryOpen ? "false" : "true");
  ui.folioDrawer.setAttribute("aria-hidden", folioOpen ? "false" : "true");
  ui.mapDrawer.setAttribute("aria-hidden", mapOpen ? "false" : "true");
  ui.settingsDrawer.setAttribute("aria-hidden", settingsOpen ? "false" : "true");
  document.body.classList.toggle("drawer-open", Boolean(activeDrawer));
}

function closeDrawers() {
  activeDrawer = null;
  applyDrawerState();
}

function openDrawer(name) {
  activeDrawer = activeDrawer === name ? null : name;
  keys.clear();
  if (document.pointerLockElement === canvas) safeExitPointerLock();
  applyDrawerState();
}

function isIgnorablePointerLockError(error) {
  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  return message.includes("SecurityError") && message.toLowerCase().includes("lock");
}

function safeExitPointerLock() {
  try {
    const result = document.exitPointerLock();
    if (result && typeof result.catch === "function") {
      result.catch((error) => {
        if (!isIgnorablePointerLockError(error)) showRuntimeError(error);
      });
    }
  } catch (error) {
    if (!isIgnorablePointerLockError(error)) showRuntimeError(error);
  }
}

function safeRequestPointerLock() {
  try {
    const result = canvas.requestPointerLock();
    if (result && typeof result.catch === "function") {
      result.catch((error) => {
        if (!isIgnorablePointerLockError(error)) showRuntimeError(error);
      });
    }
  } catch (error) {
    if (!isIgnorablePointerLockError(error)) showRuntimeError(error);
  }
}

function ensureMusicContext() {
  if (musicContext) return musicContext;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  musicContext = new AudioCtx();
  return musicContext;
}

function playMusicPulse(frequency, when, duration, gainValue) {
  if (!musicContext) return;
  const osc = musicContext.createOscillator();
  const pad = musicContext.createOscillator();
  const gain = musicContext.createGain();
  const padGain = musicContext.createGain();
  osc.type = "triangle";
  pad.type = "sine";
  osc.frequency.setValueAtTime(frequency, when);
  pad.frequency.setValueAtTime(frequency * 0.5, when);
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(gainValue, when + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
  padGain.gain.setValueAtTime(0.0001, when);
  padGain.gain.exponentialRampToValueAtTime(gainValue * 0.45, when + 0.08);
  padGain.gain.exponentialRampToValueAtTime(0.0001, when + duration + 0.25);
  osc.connect(gain).connect(musicContext.destination);
  pad.connect(padGain).connect(musicContext.destination);
  osc.start(when);
  pad.start(when);
  osc.stop(when + duration + 0.05);
  pad.stop(when + duration + 0.3);
}

function startMusic() {
  const ctx = ensureMusicContext();
  if (!ctx || musicTimer) return;
  if (ctx.state === "suspended") ctx.resume();
  const melody = [220, 261.63, 329.63, 392, 329.63, 293.66, 246.94, 293.66];
  musicTimer = window.setInterval(() => {
    const now = ctx.currentTime + 0.03;
    playMusicPulse(melody[musicStep % melody.length], now, 0.7, 0.03);
    playMusicPulse(melody[(musicStep + 3) % melody.length] * 0.5, now + 0.2, 1.1, 0.018);
    musicStep += 1;
  }, 900);
}

function stopMusic() {
  if (musicTimer) {
    window.clearInterval(musicTimer);
    musicTimer = null;
  }
  if (musicContext && musicContext.state === "running") musicContext.suspend();
}

function syncMusicState() {
  ui.musicToggleBtn.textContent = `Music: ${state.musicEnabled ? "On" : "Off"}`;
  if (state.musicEnabled) startMusic();
  else stopMusic();
}

function noiseHeight(x, z) {
  return (
    Math.sin(x * 0.06) * 3.6 +
    Math.cos(z * 0.05) * 2.8 +
    Math.sin((x + z) * 0.035) * 5.2 +
    Math.cos((x - z) * 0.025) * 2.2
  );
}

function getTerrainHeight(x, z) {
  let height = -7.5;
  for (const island of Object.values(ISLANDS)) {
    const dx = x - island.center.x;
    const dz = z - island.center.z;
    const dist = Math.hypot(dx, dz);
    const falloff = Math.max(0, 1 - dist / island.radius);
    if (falloff > 0) {
      const plateau = Math.pow(falloff, 1.8) * 11;
      const detail =
        Math.sin((x + island.center.x) * 0.08) * 1.6 +
        Math.cos((z - island.center.z) * 0.09) * 1.4 +
        Math.sin((x + z) * 0.04) * 1.2;
      let islandHeight = plateau + detail;
      if (island.theme === "ember") {
        const volcanoX = island.center.x + 10;
        const volcanoZ = island.center.z - 12;
        const volcanoDist = Math.hypot(x - volcanoX, z - volcanoZ);
        const cone = Math.max(0, 1 - volcanoDist / 34) * 38;
        const crater = Math.max(0, 1 - volcanoDist / 11) * 20;
        islandHeight = Math.max(islandHeight, plateau * 0.8 + detail * 0.5 + cone - crater);
      }
      height = Math.max(height, islandHeight);
    }
  }
  return height;
}

function clearWorld() {
  while (worldRoot.children.length) {
    const child = worldRoot.children.pop();
    disposeHierarchy(child);
  }
  interactables.length = 0;
  obstacleColliders.length = 0;
  animalMeshes.length = 0;
  villageNpcs.length = 0;
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
  const island = ISLANDS[sourceState.currentIsland];
  const shuffled = shuffle(island.forageSpots.slice(), 77 + totalFlockLevel(sourceState));
  if (sourceState.currentIsland === "tutorial") {
    let eggSpotIndex = 0;
    for (const speciesId of STARTER_SPECIES_IDS) {
      if (sourceState.birds.some((bird) => bird.speciesId === speciesId)) continue;
      if (sourceState.backpack.some((item) => item.type === "egg" && item.speciesId === speciesId)) continue;
      sourceState.worldEntities.push(makeSpecificEggEntity(sourceState, shuffled[eggSpotIndex], speciesId));
      eggSpotIndex += 1;
    }
    for (let i = eggSpotIndex; i < eggSpotIndex + 3; i += 1) sourceState.worldEntities.push(makeItemEntity(sourceState, shuffled[i]));
    return;
  }
  for (let i = 0; i < 10; i += 1) sourceState.worldEntities.push(makeEggEntity(sourceState, shuffled[i]));
  for (let i = 10; i < 16; i += 1) sourceState.worldEntities.push(makeItemEntity(sourceState, shuffled[i]));
}

function totalFlockLevel(sourceState = state) {
  return sourceState.birds.reduce((sum, bird) => sum + bird.level, 0);
}

function nearestIsland(x, z, buffer = 10) {
  let best = null;
  for (const island of Object.values(ISLANDS)) {
    const dist = Math.hypot(x - island.center.x, z - island.center.z);
    const edgeDistance = dist - island.radius;
    if (edgeDistance > buffer) continue;
    if (!best || edgeDistance < best.edgeDistance) best = { island, edgeDistance };
  }
  return best ? best.island : null;
}

function isBlocked(x, z) {
  for (const collider of obstacleColliders) {
    const dx = x - collider.x;
    const dz = z - collider.z;
    if (Math.hypot(dx, dz) < collider.radius + PLAYER_COLLIDER_RADIUS) return true;
  }
  return false;
}

function nextTutorialSpeciesId(sourceState) {
  const claimedSpecies = new Set([
    ...sourceState.worldEntities.filter((entity) => entity.type === "egg").map((entity) => entity.speciesId),
    ...sourceState.backpack.filter((item) => item.type === "egg").map((item) => item.speciesId),
    ...sourceState.birds.map((bird) => bird.speciesId),
  ]);
  return STARTER_SPECIES_IDS.find((speciesId) => !claimedSpecies.has(speciesId)) || null;
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
  let rarity = rollRarity(sourceState);
  const island = ISLANDS[sourceState.currentIsland];
  const rarityIndex = ["common", "uncommon", "rare", "epic"];
  if (rarityIndex.indexOf(rarity) > rarityIndex.indexOf(island.rarityCap)) {
    rarity = island.rarityCap;
  }
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

function makeSpecificEggEntity(sourceState, spot, speciesId) {
  const species = SPECIES.find((entry) => entry.id === speciesId) || SPECIES[0];
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
  localStorage.removeItem(SAVE_KEY);
  state = createState();
  seedWorld(state);
  rebuildWorld();
  syncCustomizationUI();
  refreshUI();
  queueSave();
}

function selectedBird() {
  return state.birds[state.selectedBirdIndex] || null;
}

function birdProgressScore(bird) {
  if (!bird) return 0;
  return bird.level * 10000 + Math.round((bird.xp || 0) * 100) + Math.round((bird.growth || 0) * 1000);
}

function sortBirdsPreserveSelection(selectedId = selectedBird()?.id) {
  state.birds.sort((a, b) => {
    const progressDiff = birdProgressScore(b) - birdProgressScore(a);
    if (progressDiff !== 0) return progressDiff;
    return a.name.localeCompare(b.name);
  });
  state.selectedBirdIndex = Math.max(0, state.birds.findIndex((bird) => bird.id === selectedId));
}

function getEvolutionStage(level) {
  if (level >= EVOLUTION_LEVELS[2]) return 3;
  if (level >= EVOLUTION_LEVELS[1]) return 2;
  if (level >= EVOLUTION_LEVELS[0]) return 1;
  return 0;
}

function evolutionLabel(stage) {
  return ["Hatchling", "Ascended", "Mythic", "Elder"][stage] || "Hatchling";
}

function getSpeciesStageName(species, stage) {
  if (!species) return evolutionLabel(stage);
  return species.stages?.[stage] || species.name;
}

function getBirdDisplayName(bird) {
  const species = SPECIES.find((entry) => entry.id === bird.speciesId);
  return getSpeciesStageName(species, bird.evolutionStage || getEvolutionStage(bird.level));
}

function startEvolutionSequence(bird, stage) {
  const species = SPECIES.find((entry) => entry.id === bird.speciesId);
  state.evolution = {
    birdId: bird.id,
    name: bird.name,
    formName: getSpeciesStageName(species, stage),
    stage,
    timer: 2.6,
    duration: 2.6,
  };
  state.prompt = `${bird.name} is evolving.`;
  state.message = `${bird.name} evolved into ${getSpeciesStageName(species, stage)}.`;
}

function selectBird(index) {
  if (index >= state.birds.length) return;
  state.selectedBirdIndex = index;
  state.message = `${state.birds[index].name} selected.`;
  updateCompanionBird();
}

function gainBirdXp(bird, amount, quiet = false) {
  bird.xp += amount;
  let leveledUp = false;
  let evolvedStage = null;
  while (bird.xp >= bird.xpToNext) {
    bird.xp -= bird.xpToNext;
    bird.level += 1;
    bird.size = +(bird.size + 0.08).toFixed(2);
    bird.speed = +(bird.speed + 0.04).toFixed(2);
    bird.lift = +(bird.lift + 0.05).toFixed(2);
    bird.growth = +(bird.growth + 0.06).toFixed(2);
    bird.xpToNext = Math.round(bird.xpToNext * 1.28);
    leveledUp = true;
    const nextStage = getEvolutionStage(bird.level);
    if (nextStage > (bird.evolutionStage || 0)) {
      bird.evolutionStage = nextStage;
      bird.size = +(bird.size + 0.18).toFixed(2);
      bird.speed = +(bird.speed + 0.08).toFixed(2);
      bird.lift = +(bird.lift + 0.08).toFixed(2);
      bird.growth = +(bird.growth + 0.1).toFixed(2);
      evolvedStage = nextStage;
    }
    state.message = `${bird.name} reached level ${bird.level} and grew larger.`;
  }
  if (evolvedStage !== null) {
    startEvolutionSequence(bird, evolvedStage);
    if (selectedBird() && selectedBird().id === bird.id) updateCompanionBird();
  }
  sortBirdsPreserveSelection(bird.id);
  if (!leveledUp && !quiet) state.message = `${bird.name} gained ${Math.round(amount)} XP.`;
  queueSave();
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
    evolutionStage: 0,
    abilities: [],
  };
  state.birds.push(bird);
  discoverSpecies(species.id);
  sortBirdsPreserveSelection(bird.id);
  state.backpack.splice(state.selectedBagIndex, 1);
  state.selectedBagIndex = clamp(state.selectedBagIndex, 0, Math.max(state.backpack.length - 1, 0));
  state.prompt =
    bird.level >= FLIGHT_UNLOCK_LEVEL
      ? `${bird.name} is old enough to fly across the archipelago.`
      : `${bird.name} hatched. Raise it to level ${FLIGHT_UNLOCK_LEVEL} to fly between islands.`;
  state.message = `${bird.name} hatched successfully.`;
  updateCompanionBird();
  queueSave();
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
  queueSave();
}

function restBirdAtNest() {
  const bird = selectedBird();
  if (!bird) {
    state.message = "Select a bird first.";
    return;
  }
  if (state.scene !== "land") {
    state.message = "Land before sending a bird to rest.";
    return;
  }
  const nearby = nearestInteraction();
  if (!nearby || nearby.kind !== "nest") {
    state.message = "Bring your bird to the nest before letting it rest.";
    return;
  }
  if (state.nestRestCooldown > 0) {
    state.message = `The nest is still settling. Rest will be ready in ${Math.ceil(state.nestRestCooldown)}s.`;
    return;
  }
  const xp = Math.round(26 + bird.growth * 10 + bird.level * 2);
  gainBirdXp(bird, xp, true);
  state.nestRestCooldown = 24;
  state.prompt = `${bird.name} rested in the nest and feels stronger.`;
  state.message = `${bird.name} rested at the nest and gained ${xp} XP.`;
  queueSave();
}

function releaseSelectedBird() {
  const bird = selectedBird();
  if (!bird) {
    state.message = "Select a bird first.";
    return;
  }
  if (state.scene !== "land") {
    state.message = "Land before releasing a bird.";
    return;
  }
  const releasedBird = bird;
  state.birds.splice(state.selectedBirdIndex, 1);
  state.selectedBirdIndex = clamp(state.selectedBirdIndex, 0, Math.max(state.birds.length - 1, 0));

  if (!state.birds.length) {
    state.message = `${releasedBird.name} was released back into the wild. No flock remained to receive its blessing.`;
    updateCompanionBird();
    queueSave();
    return;
  }

  const sharedXp = Math.max(10, Math.round(10 + releasedBird.level * 4 + releasedBird.growth * 8));
  for (const flockBird of [...state.birds]) gainBirdXp(flockBird, sharedXp, true);
  sortBirdsPreserveSelection(selectedBird()?.id);
  state.prompt = `${releasedBird.name} returned to the wild and inspired the flock.`;
  state.message = `${releasedBird.name} was released. The rest of your birds each gained ${sharedXp} XP.`;
  updateCompanionBird();
  queueSave();
}

function releaseDuplicateBirds() {
  if (state.scene !== "land") {
    state.message = "Land before managing your flock.";
    return;
  }

  const groups = new Map();
  state.birds.forEach((bird, index) => {
    if (!groups.has(bird.speciesId)) groups.set(bird.speciesId, []);
    groups.get(bird.speciesId).push({ bird, index });
  });

  const indexesToRemove = [];
  let totalSharedXp = 0;
  for (const entries of groups.values()) {
    if (entries.length <= 1) continue;
    entries.sort((a, b) => {
      if (b.bird.level !== a.bird.level) return b.bird.level - a.bird.level;
      return (b.bird.xp || 0) - (a.bird.xp || 0);
    });
    for (let i = 1; i < entries.length; i += 1) {
      indexesToRemove.push(entries[i].index);
      totalSharedXp += Math.max(10, Math.round(10 + entries[i].bird.level * 4 + entries[i].bird.growth * 8));
    }
  }

  if (!indexesToRemove.length) {
    state.message = "You do not have any duplicate birds to release.";
    return;
  }

  indexesToRemove.sort((a, b) => b - a);
  for (const index of indexesToRemove) state.birds.splice(index, 1);

  const recipients = state.birds.length;
  const xpPerBird = recipients ? Math.max(6, Math.round(totalSharedXp / recipients)) : 0;
  if (xpPerBird > 0) {
    for (const bird of [...state.birds]) gainBirdXp(bird, xpPerBird, true);
  }

  sortBirdsPreserveSelection(selectedBird()?.id);
  updateCompanionBird();
  state.prompt = "Duplicate birds were released back into the wild.";
  state.message = `Released ${indexesToRemove.length} duplicate birds. The remaining flock each gained ${xpPerBird} XP.`;
  queueSave();
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
    const influence = islandInfluenceAt(x, z);
    const palette = biomePalette(influence?.island);
    const blend = Math.max(0, influence?.falloff || 0);
    const moisture = 0.5 + Math.sin(x * 0.08 + z * 0.03) * 0.25;
    const color = palette.groundLow.clone().lerp(palette.groundHigh, clamp(0.35 + moisture * 0.45 + blend * 0.28 + y * 0.015, 0, 1));
    if (influence?.island?.theme === "ember" && y > 6) color.lerp(new THREE.Color(0xba7034), 0.28);
    if (influence?.island?.theme === "moonfen" && y < 2) color.lerp(new THREE.Color(0x71859d), 0.22);
    if (influence?.island?.theme === "storm" && y > 4) color.lerp(new THREE.Color(0xa8b7c4), 0.18);
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
    const influence = islandInfluenceAt(x, z);
    if (!influence || influence.falloff <= 0 || y < -2.5) continue;
    if (influence.island.theme === "ember" && Math.random() > 0.18) continue;
    const palette = biomePalette(influence.island);
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(palette.grass[i % palette.grass.length]).offsetHSL(0, 0, Math.random() * 0.05),
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
  const cloudSea = new THREE.Mesh(
    new THREE.CircleGeometry(420, 120),
    new THREE.MeshStandardMaterial({
      color: 0xe8eef3,
      transparent: true,
      opacity: 0.92,
      roughness: 1,
      metalness: 0,
    }),
  );
  cloudSea.rotation.x = -Math.PI / 2;
  cloudSea.position.set(0, -8.1, 0);
  cloudSea.receiveShadow = true;
  worldRoot.add(cloudSea);

  const mistRing = new THREE.Mesh(
    new THREE.RingGeometry(300, 620, 96),
    new THREE.MeshStandardMaterial({
      color: 0xd7e0e7,
      transparent: true,
      opacity: 0.38,
      side: THREE.DoubleSide,
      roughness: 1,
    }),
  );
  mistRing.rotation.x = -Math.PI / 2;
  mistRing.position.set(0, -7.7, 0);
  worldRoot.add(mistRing);

  for (let i = 0; i < 22; i += 1) {
    const puff = new THREE.Mesh(
      new THREE.SphereGeometry(10 + Math.random() * 18, 14, 14),
      new THREE.MeshStandardMaterial({
        color: 0xf4f7fa,
        transparent: true,
        opacity: 0.78,
        roughness: 1,
      }),
    );
    const angle = (i / 22) * Math.PI * 2 + Math.random() * 0.35;
    const radius = 80 + Math.random() * 320;
    puff.position.set(Math.cos(angle) * radius, -2.5 - Math.random() * 6, Math.sin(angle) * radius);
    puff.scale.set(1.45 + Math.random() * 1.4, 0.34 + Math.random() * 0.22, 1.1 + Math.random() * 1.1);
    puff.receiveShadow = false;
    worldRoot.add(puff);
  }

  const emberIsland = Object.values(ISLANDS).find((island) => island.theme === "ember");
  if (emberIsland) {
    const lava = new THREE.Mesh(
      new THREE.CircleGeometry(18, 32),
      new THREE.MeshStandardMaterial({
        color: 0xc04a20,
        emissive: 0xff7b30,
        emissiveIntensity: 0.45,
        transparent: true,
        opacity: 0.9,
      }),
    );
    lava.rotation.x = -Math.PI / 2;
    lava.position.set(emberIsland.center.x + 8, getTerrainHeight(emberIsland.center.x + 8, emberIsland.center.z - 6) - 0.35, emberIsland.center.z - 6);
    worldRoot.add(lava);
  }
}

function createCliffs() {
  for (const island of Object.values(ISLANDS)) {
    const palette = biomePalette(island);
    const rockCount = island.theme === "ember" ? 22 : 9;
    for (let i = 0; i < rockCount; i += 1) {
      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(2 + Math.random() * 3.2, 0),
        new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? palette.rockA : palette.rockB, roughness: 1 }),
      );
      const radius = island.radius * (0.6 + Math.random() * 0.32);
      const angle = i * 0.78 + island.center.x * 0.03 + island.center.z * 0.02 + Math.random() * 0.35;
      rock.position.set(island.center.x + Math.cos(angle) * radius, 0, island.center.z + Math.sin(angle) * radius);
      rock.position.y = getTerrainHeight(rock.position.x, rock.position.z) + 1.3;
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      rock.scale.setScalar(0.9 + Math.random() * 1.7);
      rock.castShadow = true;
      rock.receiveShadow = true;
      worldRoot.add(rock);
      obstacleColliders.push({ x: rock.position.x, z: rock.position.z, radius: 2.5 * rock.scale.x });
    }
  }
}

function createTree(position, scale = 1, island = null) {
  const group = new THREE.Group();
  const palette = biomePalette(island || islandInfluenceAt(position.x, position.z)?.island);
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45 * scale, 0.7 * scale, 8 * scale, 7),
    new THREE.MeshStandardMaterial({ color: palette.treeTrunk, roughness: 1 }),
  );
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  trunk.position.y = 4 * scale;
  group.add(trunk);

  const canopyColors = palette.treeLeaf;
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
  group.userData.collider = { x: position.x, z: position.z, radius: 1.6 * scale };
  obstacleColliders.push(group.userData.collider);
  return group;
}

function createBush(position, scale = 1, island = null) {
  const group = new THREE.Group();
  const colors = biomePalette(island || islandInfluenceAt(position.x, position.z)?.island).bush;
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
  group.userData.collider = { x: position.x, z: position.z, radius: 1.2 * scale };
  obstacleColliders.push(group.userData.collider);
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
  const island = ISLANDS[state.currentIsland];
  createVolcanoFeature(island);
  nestMesh = createNestMesh();
  nestMesh.position.set(island.nest.x, getTerrainHeight(island.nest.x, island.nest.z), island.nest.z);
  worldRoot.add(nestMesh);
  obstacleColliders.push({ x: island.nest.x, z: island.nest.z, radius: 3.2 });

  perchMesh = createPerchMesh();
  perchMesh.position.set(island.perch.x, getTerrainHeight(island.perch.x, island.perch.z), island.perch.z);
  worldRoot.add(perchMesh);
  obstacleColliders.push({ x: island.perch.x, z: island.perch.z, radius: 2.5 });

  campMesh = createCampMesh();
  campMesh.position.set(island.tailor.x, getTerrainHeight(island.tailor.x, island.tailor.z), island.tailor.z);
  worldRoot.add(campMesh);
  obstacleColliders.push({ x: island.tailor.x, z: island.tailor.z, radius: 4.4 });
  createVillage(island);
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

function createVolcanoFeature(island) {
  if (island.theme !== "ember") return;
  const volcano = new THREE.Group();
  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(24, 34, 24, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x5a4037, roughness: 1 }),
  );
  cone.position.y = 17;
  cone.castShadow = true;
  cone.receiveShadow = true;
  volcano.add(cone);
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(8.5, 1.8, 10, 20),
    new THREE.MeshStandardMaterial({ color: 0x3b2d2b, roughness: 1 }),
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 34;
  volcano.add(rim);
  const lava = new THREE.Mesh(
    new THREE.CircleGeometry(6.8, 20),
    new THREE.MeshStandardMaterial({ color: 0xff7b30, emissive: 0xff7b30, emissiveIntensity: 0.7 }),
  );
  lava.rotation.x = -Math.PI / 2;
  lava.position.y = 34.3;
  volcano.add(lava);
  const vx = island.center.x + 10;
  const vz = island.center.z - 12;
  volcano.position.set(vx, getTerrainHeight(vx, vz) - 3, vz);
  worldRoot.add(volcano);
  obstacleColliders.push({ x: vx, z: vz, radius: 18 });

  for (let i = 0; i < 46; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const ring = 18 + Math.random() * (island.radius - 18);
    const rx = island.center.x + Math.cos(angle) * ring;
    const rz = island.center.z + Math.sin(angle) * ring;
    const shard = new THREE.Mesh(
      new THREE.DodecahedronGeometry(1.8 + Math.random() * 3.1, 0),
      new THREE.MeshStandardMaterial({ color: 0x433432, roughness: 1 }),
    );
    shard.position.set(rx, getTerrainHeight(rx, rz) + 1.2 + Math.random() * 1.8, rz);
    shard.rotation.set(Math.random() * 0.8, Math.random() * Math.PI, Math.random() * 0.8);
    shard.castShadow = true;
    shard.receiveShadow = true;
    worldRoot.add(shard);
    obstacleColliders.push({ x: rx, z: rz, radius: 1.8 + Math.random() * 1.6 });
  }
}

function createHairStyleMesh(style, hairMat) {
  const group = new THREE.Group();
  if (style === "braid") {
    const crown = new THREE.Mesh(new THREE.SphereGeometry(0.88, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.62), hairMat);
    crown.scale.set(0.98, 1.02, 0.98);
    crown.castShadow = true;
    group.add(crown);
    for (let i = 0; i < 4; i += 1) {
      const braid = new THREE.Mesh(new THREE.SphereGeometry(0.16 + i * 0.015, 10, 10), hairMat);
      braid.position.set(-0.08, -0.55 - i * 0.26, -0.74);
      braid.castShadow = true;
      group.add(braid);
    }
  } else if (style === "short") {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.84, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.52), hairMat);
    cap.scale.set(0.96, 0.84, 0.96);
    cap.castShadow = true;
    group.add(cap);
  } else if (style === "wild") {
    for (let i = 0; i < 6; i += 1) {
      const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.48 + Math.random() * 0.18, 5), hairMat);
      tuft.position.set((Math.random() - 0.5) * 0.9, 0.2 + Math.random() * 0.55, (Math.random() - 0.5) * 0.8);
      tuft.rotation.z = (Math.random() - 0.5) * 0.8;
      tuft.rotation.x = (Math.random() - 0.5) * 0.45;
      tuft.castShadow = true;
      group.add(tuft);
    }
    const base = new THREE.Mesh(new THREE.SphereGeometry(0.84, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.56), hairMat);
    base.castShadow = true;
    group.add(base);
  } else {
    const windswept = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.66), hairMat);
    windswept.scale.set(0.98, 1.06, 1.02);
    windswept.position.x = -0.05;
    windswept.castShadow = true;
    group.add(windswept);
    const swoop = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.62, 5), hairMat);
    swoop.position.set(0.4, 0.42, 0.14);
    swoop.rotation.z = -0.7;
    swoop.rotation.x = 0.2;
    swoop.castShadow = true;
    group.add(swoop);
  }
  return group;
}

function createNpcMesh(npc, island) {
  const group = new THREE.Group();
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xc68d62, roughness: 1 });
  const clothMat = new THREE.MeshStandardMaterial({ color: island.theme === "storm" ? 0x6b8395 : island.theme === "moonfen" ? 0x7c6998 : 0x73965b, roughness: 1 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.7, 2.65, 4, 10), clothMat);
  body.position.y = 3.1;
  body.castShadow = true;
  group.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.7, 14, 14), skinMat);
  head.scale.set(0.96, 1.06, 0.92);
  head.position.y = 5.15;
  head.castShadow = true;
  group.add(head);
  const leftArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 1.4, 4, 8), skinMat);
  const rightArm = leftArm.clone();
  leftArm.position.set(-0.95, 3.35, 0);
  rightArm.position.set(0.95, 3.35, 0);
  leftArm.rotation.z = 0.28;
  rightArm.rotation.z = -0.28;
  leftArm.castShadow = true;
  rightArm.castShadow = true;
  group.add(leftArm, rightArm);
  const marker = new THREE.Mesh(
    new THREE.RingGeometry(0.72, 1.05, 24),
    new THREE.MeshBasicMaterial({ color: 0xfff0bf, side: THREE.DoubleSide }),
  );
  marker.rotation.x = -Math.PI / 2;
  marker.position.y = 0.18;
  group.add(marker);
  group.position.set(npc.x, getTerrainHeight(npc.x, npc.z), npc.z);
  group.userData.npcId = npc.id;
  group.userData.kind = "npc";
  worldRoot.add(group);
  villageNpcs.push({ ...npc, islandId: island.id, mesh: group });
}

function createVillage(island) {
  if (!island.village) return;
  const plaza = new THREE.Mesh(
    new THREE.CylinderGeometry(16, 18, 1.6, 18),
    new THREE.MeshStandardMaterial({ color: island.theme === "storm" ? 0x58616c : island.theme === "moonfen" ? 0x6e6d83 : 0x90765a, roughness: 1 }),
  );
  plaza.position.set(island.village.x, getTerrainHeight(island.village.x, island.village.z) + 0.35, island.village.z);
  plaza.receiveShadow = true;
  worldRoot.add(plaza);

  for (let i = 0; i < 5; i += 1) {
    const hut = new THREE.Group();
    const angle = (i / 5) * Math.PI * 2;
    const x = island.village.x + Math.cos(angle) * 18.5;
    const z = island.village.z + Math.sin(angle) * 15.5;
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(4.2, 4.9, 5.8, 8),
      new THREE.MeshStandardMaterial({ color: island.theme === "storm" ? 0x64707a : 0x8a6b4a, roughness: 1 }),
    );
    base.position.y = 2.95;
    base.castShadow = true;
    base.receiveShadow = true;
    hut.add(base);
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(5.8, 5.2, 8),
      new THREE.MeshStandardMaterial({ color: island.theme === "moonfen" ? 0x7b6a8d : island.theme === "verdant" ? 0x56723a : 0x5e4a38, roughness: 1 }),
    );
    roof.position.y = 8;
    roof.rotation.y = angle * 0.5;
    roof.castShadow = true;
    hut.add(roof);
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 2.8, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x3b2c25, roughness: 1 }),
    );
    door.position.set(0, 1.5, 4.18);
    hut.add(door);
    const chimney = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 2.8, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x6a615f, roughness: 1 }),
    );
    chimney.position.set(-1.5, 8.8, -0.6);
    hut.add(chimney);
    hut.position.set(x, getTerrainHeight(x, z), z);
    hut.lookAt(island.village.x, hut.position.y + 2, island.village.z);
    worldRoot.add(hut);
    obstacleColliders.push({ x, z, radius: 4.2 });
  }

  for (let i = 0; i < 7; i += 1) {
    const pathStone = new THREE.Mesh(
      new THREE.CylinderGeometry(1.8, 2.2, 0.35, 7),
      new THREE.MeshStandardMaterial({ color: island.theme === "storm" ? 0x737f89 : 0xb29a7d, roughness: 1 }),
    );
    const x = island.village.x - 22 + i * 6.8;
    const z = island.village.z + Math.sin(i * 0.7) * 1.8;
    pathStone.position.set(x, getTerrainHeight(x, z) + 0.1, z);
    pathStone.rotation.y = Math.random() * Math.PI;
    pathStone.receiveShadow = true;
    worldRoot.add(pathStone);
  }

  for (let i = 0; i < 4; i += 1) {
    const pole = new THREE.Group();
    const angle = (i / 4) * Math.PI * 2 + Math.PI * 0.25;
    const x = island.village.x + Math.cos(angle) * 9.5;
    const z = island.village.z + Math.sin(angle) * 8.5;
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.28, 4.6, 6),
      new THREE.MeshStandardMaterial({ color: 0x5b4131, roughness: 1 }),
    );
    post.position.y = 2.3;
    post.castShadow = true;
    pole.add(post);
    const lantern = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0xffcf8a, emissive: 0xffb45c, emissiveIntensity: 0.5, roughness: 0.7 }),
    );
    lantern.position.y = 4.6;
    pole.add(lantern);
    pole.position.set(x, getTerrainHeight(x, z), z);
    worldRoot.add(pole);
  }
  island.village.npcs.forEach((npc) => createNpcMesh(npc, island));
}

function createPlayerMesh() {
  const group = new THREE.Group();
  const skinMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(CHARACTER_COLORS.skin[state.character.skin]), roughness: 1 });
  const clothMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(CHARACTER_COLORS.jacket[state.character.jacket]), roughness: 1 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x3f3228, roughness: 1 });
  const hairMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(CHARACTER_COLORS.hair[state.character.hair]), roughness: 1 });

  const hips = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.05, 1.08), clothMat);
  hips.position.y = 2.85;
  hips.castShadow = true;
  group.add(hips);

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.84, 2.55, 6, 12), clothMat);
  torso.position.y = 5.15;
  torso.castShadow = true;
  group.add(torso);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.48, 8), skinMat);
  neck.position.y = 6.95;
  neck.castShadow = true;
  group.add(neck);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.82, 16, 16), skinMat);
  head.scale.set(0.94, 1.08, 0.88);
  head.position.y = 7.88;
  head.castShadow = true;
  group.add(head);

  const hairStyleGroup = createHairStyleMesh(state.character.hairStyle, hairMat);
  hairStyleGroup.position.y = 7.95;
  group.add(hairStyleGroup);

  const shoulderBar = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.38, 1.04), clothMat);
  shoulderBar.position.y = 6.05;
  shoulderBar.castShadow = true;
  group.add(shoulderBar);

  const leftUpperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 1.22, 4, 8), clothMat);
  const rightUpperArm = leftUpperArm.clone();
  leftUpperArm.position.set(-1.18, 5.55, 0);
  rightUpperArm.position.set(1.18, 5.55, 0);
  leftUpperArm.rotation.z = 0.24;
  rightUpperArm.rotation.z = -0.24;
  leftUpperArm.castShadow = true;
  rightUpperArm.castShadow = true;
  group.add(leftUpperArm, rightUpperArm);

  const leftForearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.19, 1.12, 4, 8), skinMat);
  const rightForearm = leftForearm.clone();
  leftForearm.position.set(-1.5, 4.38, 0);
  rightForearm.position.set(1.5, 4.38, 0);
  leftForearm.rotation.z = 0.1;
  rightForearm.rotation.z = -0.1;
  leftForearm.castShadow = true;
  rightForearm.castShadow = true;
  group.add(leftForearm, rightForearm);

  const leftThigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 1.55, 4, 8), darkMat);
  const rightThigh = leftThigh.clone();
  leftThigh.position.set(-0.4, 1.78, 0);
  rightThigh.position.set(0.4, 1.78, 0);
  leftThigh.castShadow = true;
  rightThigh.castShadow = true;
  group.add(leftThigh, rightThigh);

  const leftCalf = new THREE.Mesh(new THREE.CapsuleGeometry(0.26, 1.45, 4, 8), darkMat);
  const rightCalf = leftCalf.clone();
  leftCalf.position.set(-0.4, 0.48, 0.04);
  rightCalf.position.set(0.4, 0.48, 0.04);
  leftCalf.castShadow = true;
  rightCalf.castShadow = true;
  group.add(leftCalf, rightCalf);

  const leftFoot = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.22, 1.02), darkMat);
  const rightFoot = leftFoot.clone();
  leftFoot.position.set(-0.4, -0.55, 0.28);
  rightFoot.position.set(0.4, -0.55, 0.28);
  leftFoot.castShadow = true;
  rightFoot.castShadow = true;
  group.add(leftFoot, rightFoot);

  backpackMesh = new THREE.Mesh(new THREE.BoxGeometry(1.7, 2.3, 0.95), new THREE.MeshStandardMaterial({ color: new THREE.Color(CHARACTER_COLORS.pack[state.character.pack]), roughness: 1 }));
  backpackMesh.position.set(0, 5.0, -1.06);
  backpackMesh.castShadow = true;
  group.add(backpackMesh);

  group.position.set(state.player.x, getTerrainHeight(state.player.x, state.player.z), state.player.z);
  playerMesh = group;
  worldRoot.add(group);
}

function recolorPlayer() {
  if (!playerMesh) return;
  const hips = playerMesh.children[0];
  const torso = playerMesh.children[1];
  const neck = playerMesh.children[2];
  const head = playerMesh.children[3];
  const hair = playerMesh.children[4];
  const shoulderBar = playerMesh.children[5];
  const leftUpperArm = playerMesh.children[6];
  const rightUpperArm = playerMesh.children[7];
  torso.material.color.set(CHARACTER_COLORS.jacket[state.character.jacket]);
  hips.material.color.set(CHARACTER_COLORS.jacket[state.character.jacket]);
  neck.material.color.set(CHARACTER_COLORS.skin[state.character.skin]);
  head.material.color.set(CHARACTER_COLORS.skin[state.character.skin]);
  shoulderBar.material.color.set(CHARACTER_COLORS.jacket[state.character.jacket]);
  leftUpperArm.material.color.set(CHARACTER_COLORS.jacket[state.character.jacket]);
  rightUpperArm.material.color.set(CHARACTER_COLORS.jacket[state.character.jacket]);
  hair.traverse((child) => {
    if (child.material?.color) child.material.color.set(CHARACTER_COLORS.hair[state.character.hair]);
  });
  backpackMesh.material.color.set(CHARACTER_COLORS.pack[state.character.pack]);
}

function createSpeciesBirdMesh(species, scale = 1, evolutionStage = 0) {
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(species.color), roughness: 0.95 });
  const accentMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(species.accent), roughness: 0.8, emissive: new THREE.Color(species.accent).multiplyScalar(0.08) });
  const beakMat = new THREE.MeshStandardMaterial({ color: 0xe3b558, roughness: 0.7 });
  const isFire = ["flame", "phoenix", "crest"].includes(species.look);
  const isStorm = ["storm", "tempest", "mist", "glimmer", "aurora"].includes(species.look);
  const isBloom = ["bloom", "thorn", "seraph"].includes(species.look);
  const isRoc = species.look === "roc";

  const body = new THREE.Mesh(new THREE.SphereGeometry(1.2, 12, 12), bodyMat);
  body.scale.set(1.45 + evolutionStage * 0.14, 1 + evolutionStage * 0.04, 1 + evolutionStage * 0.08);
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
  leftWing.position.set(-0.3 - evolutionStage * 0.18, 0.2 + evolutionStage * 0.08, -1.15 - evolutionStage * 0.18);
  rightWing.position.set(-0.3 - evolutionStage * 0.18, 0.2 + evolutionStage * 0.08, 1.15 + evolutionStage * 0.18);
  leftWing.scale.set(1 + evolutionStage * 0.18, 1, 1 + evolutionStage * 0.12);
  rightWing.scale.copy(leftWing.scale);
  leftWing.rotation.x = 0.2 + evolutionStage * 0.08;
  rightWing.rotation.x = -0.2 - evolutionStage * 0.08;
  leftWing.castShadow = true;
  rightWing.castShadow = true;
  group.add(leftWing, rightWing);

  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.2, 5), accentMat);
  tail.rotation.z = Math.PI / 2;
  tail.position.set(-1.4, -0.1, 0);
  tail.castShadow = true;
  group.add(tail);

  if (isFire) {
    const crest = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.95, 5), accentMat);
    crest.position.set(0.95, 1.05 + evolutionStage * 0.18, 0);
    crest.rotation.z = 0.18;
    group.add(crest);
  } else if (isStorm) {
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

  for (let i = 0; i < evolutionStage; i += 1) {
    const plume = new THREE.Mesh(
      new THREE.ConeGeometry(0.14 + i * 0.03, 1 + i * 0.2, 5),
      accentMat,
    );
    plume.position.set(-0.35 - i * 0.45, 0.6 + i * 0.22, i % 2 === 0 ? -0.45 : 0.45);
    plume.rotation.z = -0.7 - i * 0.08;
    plume.rotation.x = i % 2 === 0 ? 0.22 : -0.22;
    plume.castShadow = true;
    group.add(plume);
  }

  if (isFire) {
    for (let i = 0; i < 1 + evolutionStage; i += 1) {
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.18 + i * 0.04, 0.7 + i * 0.18, 5), accentMat);
      flame.position.set(-1.35 - i * 0.28, 0.2 + i * 0.06, 0);
      flame.rotation.z = Math.PI / 2;
      flame.rotation.y = (i % 2 === 0 ? 0.25 : -0.25);
      group.add(flame);
    }
  }

  if (isStorm) {
    for (let i = 0; i < evolutionStage; i += 1) {
      const arc = new THREE.Mesh(new THREE.TorusGeometry(0.5 + i * 0.14, 0.04, 6, 16), accentMat);
      arc.position.set(-0.25 - i * 0.15, 0.62 + i * 0.12, 0);
      arc.rotation.y = Math.PI / 2;
      arc.rotation.z = 0.6;
      group.add(arc);
    }
  }

  if (isBloom) {
    for (let i = 0; i < evolutionStage; i += 1) {
      const thorn = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.48 + i * 0.1, 5), bodyMat);
      thorn.position.set(-0.55 - i * 0.28, 0.3 + i * 0.08, i % 2 === 0 ? -0.55 : 0.55);
      thorn.rotation.z = -0.55;
      group.add(thorn);
    }
  }

  if (isRoc) {
    const chestPlate = new THREE.Mesh(new THREE.BoxGeometry(0.86 + evolutionStage * 0.12, 0.26, 1.2), accentMat);
    chestPlate.position.set(0.3, -0.18, 0);
    chestPlate.rotation.z = 0.12;
    group.add(chestPlate);
  }

  if (evolutionStage >= 1) {
    const hornA = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.55, 5), accentMat);
    const hornB = hornA.clone();
    hornA.position.set(0.74, 1.08, -0.26);
    hornB.position.set(0.74, 1.08, 0.26);
    hornA.rotation.z = -0.25;
    hornB.rotation.z = -0.25;
    group.add(hornA, hornB);
  }

  if (evolutionStage >= 2) {
    const chest = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.24, 1.12), accentMat);
    chest.position.set(0.38, -0.35, 0);
    chest.rotation.z = 0.12;
    group.add(chest);
  }

  if (evolutionStage >= 3) {
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(0.95, 0.08, 6, 18),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(species.accent),
        emissive: new THREE.Color(species.accent).multiplyScalar(0.35),
        roughness: 0.45,
      }),
    );
    halo.position.set(0.1, 1.65, 0);
    halo.rotation.x = Math.PI / 2;
    group.add(halo);
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
  for (const island of Object.values(ISLANDS)) {
    const treeCount = island.theme === "ember" ? 0 : island.id === "tutorial" ? 24 : Math.round(island.radius * 0.95);
    const bushCount = island.theme === "ember" ? 0 : island.id === "tutorial" ? 34 : Math.round(island.radius * 1.35);
    const animalCount = island.id === "tutorial" ? 2 : Math.max(5, Math.round(island.radius / 10));
    const keepClear = [
      { x: island.groundSpawn.x, z: island.groundSpawn.z, radius: 7 },
      { x: island.nest.x, z: island.nest.z, radius: 8 },
      { x: island.perch.x, z: island.perch.z, radius: 8 },
      { x: island.tailor.x, z: island.tailor.z, radius: 8 },
      ...(island.village ? [{ x: island.village.x, z: island.village.z, radius: 18 }] : []),
      ...island.forageSpots.map((spot) => ({ x: spot.x, z: spot.z, radius: 5 })),
    ];

    for (let i = 0; i < treeCount; i += 1) {
      const radius = 5 + Math.sqrt(Math.random()) * (island.radius - 4);
      const angle = Math.random() * Math.PI * 2;
      const position = { x: island.center.x + Math.cos(angle) * radius, z: island.center.z + Math.sin(angle) * radius };
      if (keepClear.some((spot) => Math.hypot(position.x - spot.x, position.z - spot.z) < spot.radius)) continue;
      worldRoot.add(createTree(position, 0.85 + Math.random() * 1.2, island));
    }

    for (let i = 0; i < bushCount; i += 1) {
      const radius = 3 + Math.sqrt(Math.random()) * (island.radius - 2);
      const angle = Math.random() * Math.PI * 2;
      const position = { x: island.center.x + Math.cos(angle) * radius, z: island.center.z + Math.sin(angle) * radius };
      if (keepClear.some((spot) => Math.hypot(position.x - spot.x, position.z - spot.z) < spot.radius - 1)) continue;
      worldRoot.add(createBush(position, 0.72 + Math.random() * 0.78, island));
    }

    for (let i = 0; i < animalCount; i += 1) {
      const radius = 6 + Math.sqrt(Math.random()) * (island.radius - 6);
      const angle = Math.random() * Math.PI * 2;
      const position = { x: island.center.x + Math.cos(angle) * radius, z: island.center.z + Math.sin(angle) * radius };
      if (keepClear.some((spot) => Math.hypot(position.x - spot.x, position.z - spot.z) < spot.radius + 4)) continue;
      worldRoot.add(createAnimal(position, i % 3 === 0 ? "deer" : "wolf"));
    }
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
    companionMesh = createSpeciesBirdMesh(species, 0.85 * bird.size, bird.evolutionStage || getEvolutionStage(bird.level));
    companionMesh.castShadow = true;
    companionMesh.traverse((child) => {
      if (child.isMesh) child.castShadow = true;
    });
    worldRoot.add(companionMesh);
    currentCompanionBirdId = bird.id;
  } else {
    const targetStage = bird.evolutionStage || getEvolutionStage(bird.level);
    if (companionMesh.userData.evolutionStage !== targetStage) {
      worldRoot.remove(companionMesh);
      disposeHierarchy(companionMesh);
      const species = SPECIES.find((entry) => entry.id === bird.speciesId);
      companionMesh = createSpeciesBirdMesh(species, 0.85 * bird.size, targetStage);
      companionMesh.traverse((child) => {
        if (child.isMesh) child.castShadow = true;
      });
      worldRoot.add(companionMesh);
    } else {
      companionMesh.scale.setScalar(0.85 * bird.size);
    }
  }
  if (companionMesh) companionMesh.userData.evolutionStage = bird.evolutionStage || getEvolutionStage(bird.level);
}

function currentPromptText() {
  if (state.scene === "flight") return "Move the mouse to steer, W/S adjust speed, Space climb, Shift boost, E land on an island.";
  const nearby = nearestInteraction();
  if (!nearby) return state.prompt;
  if (nearby.kind === "egg") return "Press E to place the egg into your backpack.";
  if (nearby.kind === "item") return "Press E to collect the growth item.";
  if (nearby.kind === "nest") return state.backpack[state.selectedBagIndex]?.type === "egg" ? "Press E or use the Hatch button to hatch the selected egg." : "Birds can rest at the nest for bonus XP.";
  if (nearby.kind === "perch") return selectedBird() && selectedBird().level >= FLIGHT_UNLOCK_LEVEL ? "Press E, Space, or Launch Bird to fly to another island." : `Raise a bird to level ${FLIGHT_UNLOCK_LEVEL} to unlock island flight.`;
  if (nearby.kind === "npc") return "Press E to speak with the villager and receive local help.";
  return "Use the right panel to customize your explorer.";
}

function nearestVillageNpc() {
  const island = ISLANDS[state.currentIsland];
  if (!island?.village?.npcs?.length) return null;
  const villageDist = Math.hypot(state.player.x - island.village.x, state.player.z - island.village.z);
  if (villageDist > 30) return null;
  let best = null;
  for (const npc of island.village.npcs) {
    const dist = Math.hypot(state.player.x - npc.x, state.player.z - npc.z);
    if (!best || dist < best.distance) best = { npc, distance: dist };
  }
  return best;
}

function overlayMarkup() {
  const bird = selectedBird();
  const island = ISLANDS[state.currentIsland];
  if (state.scene === "flight" && bird) {
    const islandBelow = nearestIsland(state.flight.x, state.flight.z);
    const altitude = islandBelow ? Math.max(0, state.flight.y - getTerrainHeight(state.flight.x, state.flight.z)) : state.flight.y + 7;
    return `<strong>${bird.name} In Flight</strong>
      Altitude ${altitude.toFixed(1)} · Energy ${Math.round(state.flight.energy)} · Speed ${state.flight.speed.toFixed(1)}
      <br />Flight XP ${Math.round(state.flight.runXp)} · ${state.flight.destinationHint}`;
  }
  if (!bird) {
    return `<strong>${island.name}</strong>${island.biome}<br />Threats: ${island.enemies.join(", ")} · Birds: ${island.birdsHint}`;
  }
  const species = SPECIES.find((entry) => entry.id === bird.speciesId);
  const flightStatus = bird.level >= FLIGHT_UNLOCK_LEVEL ? "Can fly between islands" : `Flight unlock at level ${FLIGHT_UNLOCK_LEVEL}`;
  const restStatus = state.nestRestCooldown > 0 ? `Nest rest in ${Math.ceil(state.nestRestCooldown)}s` : "Nest rest ready";
  return `<strong>${bird.name}</strong>${species.perk}<br />${getSpeciesStageName(species, bird.evolutionStage || getEvolutionStage(bird.level))} · Level ${bird.level} · XP ${Math.round(bird.xp)}/${bird.xpToNext} · Size ${(bird.size * 100).toFixed(0)}% · ${flightStatus}<br />${island.name}: ${island.biome} · ${restStatus}`;
}

function evolutionScreenMarkup() {
  if (!state.evolution) return "";
  const progress = 1 - state.evolution.timer / state.evolution.duration;
  return `<div class="evolution-card">
    <p class="evolution-overline">Evolution</p>
    <div class="evolution-burst"></div>
    <h2 class="evolution-name">${state.evolution.formName}</h2>
    <p class="evolution-line">${state.evolution.name} is evolving!</p>
    <p class="evolution-line">Its power is surging into a stronger elemental form.</p>
    <p class="evolution-stage">Stage ${state.evolution.stage + 1} · Radiance ${(progress * 100).toFixed(0)}%</p>
  </div>`;
}

function syncEvolutionScreen() {
  if (!state.evolution) {
    ui.evolutionScreen.className = "evolution-screen";
    ui.evolutionScreen.setAttribute("aria-hidden", "true");
    ui.evolutionScreen.innerHTML = "";
    return;
  }
  const bird = state.birds.find((entry) => entry.id === state.evolution.birdId) || selectedBird();
  const species = bird ? SPECIES.find((entry) => entry.id === bird.speciesId) : null;
  const theme = evolutionThemeForLook(species?.look || "bloom");
  ui.evolutionScreen.className = `evolution-screen open theme-${theme}`;
  ui.evolutionScreen.setAttribute("aria-hidden", "false");
  ui.evolutionScreen.innerHTML = evolutionScreenMarkup();
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
        <h3>${species.name} Egg ${active ? "• Selected" : ""}</h3>
        <p>${capitalize(item.rarity)} egg from ${ISLANDS[state.currentIsland].name}. The rare pool expands as your flock levels up and as you reach later islands.</p>
      </button>`;
    }
    const def = ITEM_DEFS.find((entry) => entry.id === item.itemId);
    return `<button class="entry${active}" data-bag-index="${index}" type="button">
      <h3>${def.name} ${active ? "• Selected" : ""}</h3>
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
    const species = SPECIES.find((entry) => entry.id === bird.speciesId);
    return `<button class="entry${active}" data-bird-index="${index}" type="button">
      <h3>${getBirdDisplayName(bird)} Lv.${bird.level} ${active ? "• Active" : ""}</h3>
      <p>${capitalize(bird.rarity)} · ${getSpeciesStageName(species, bird.evolutionStage || getEvolutionStage(bird.level))} · Speed ${bird.speed.toFixed(2)} · Lift ${bird.lift.toFixed(2)} · Growth ${bird.growth.toFixed(2)}</p>
      <p class="entry-action">${active ? "Current bird" : "Click to use this bird"}</p>
      <div class="chip-row">${bird.abilities.map((ability) => `<span class="chip">${ability}</span>`).join("")}</div>
    </button>`;
  }).join("");
  return `<div class="roster-list">${entries}</div>`;
}

function activeBirdMarkup() {
  const bird = selectedBird();
  if (!bird) {
    return `<div class="entry current-bird"><h3>No Active Bird</h3><p>Hatch a bird, then click it in the flock list to make it your current companion.</p></div>`;
  }
  const species = SPECIES.find((entry) => entry.id === bird.speciesId);
  return `<div class="entry current-bird active">
    <h3>Current Bird: ${getBirdDisplayName(bird)}</h3>
    <p>${capitalize(bird.rarity)} ${species.name} · ${getSpeciesStageName(species, bird.evolutionStage || getEvolutionStage(bird.level))} · Level ${bird.level} · XP ${Math.round(bird.xp)}/${bird.xpToNext}</p>
    <p class="entry-action">This is the bird used for items, rest, and flight.</p>
  </div>`;
}

function folioSummaryMarkup() {
  const unlocked = state.discoveredSpecies.length;
  const locked = Math.max(0, SPECIES.length - unlocked);
  return `<div class="entry current-bird active">
    <h3>${unlocked} Species Discovered</h3>
    <p>${locked} still hidden in the archipelago.</p>
    <p class="entry-action">Click an entry below to read about the species.</p>
  </div>`;
}

function folioGridMarkup() {
  return SPECIES.map((species) => {
    const unlocked = state.discoveredSpecies.includes(species.id);
    const active = state.selectedFolioSpeciesId === species.id ? " active" : "";
    const sigil = unlocked ? species.name.charAt(0) : "●";
    const title = unlocked ? species.name : "Unknown Bird";
    const subtitle = unlocked ? `${capitalize(species.rarity)} · ${species.look}` : "Undiscovered silhouette";
    return `<button class="entry folio-entry${active}${unlocked ? "" : " locked"}" data-folio-species="${species.id}" type="button">
      <div class="folio-sigil${unlocked ? "" : " locked"}" style="${unlocked ? `background:${species.color};color:#12273c;` : ""}">${sigil}</div>
      <h3>${title}</h3>
      <p>${subtitle}</p>
    </button>`;
  }).join("");
}

function folioDetailMarkup() {
  const species = SPECIES.find((entry) => entry.id === state.selectedFolioSpeciesId) || SPECIES[0];
  const unlocked = state.discoveredSpecies.includes(species.id);
  if (!unlocked) {
    return `<div class="entry">
      <h3>Unknown Bird</h3>
      <p>A shadow in the folio. Discover this species by finding one of its eggs or hatching it somewhere in the archipelago.</p>
      <p class="entry-action">Rarity: Hidden</p>
    </div>`;
  }
  return `<div class="entry current-bird active">
    <div class="folio-sigil" style="background:${species.color};color:#12273c;">${species.name.charAt(0)}</div>
    <h3>${species.name}</h3>
    <p>${capitalize(species.rarity)} bird · ${species.perk}</p>
    <p>${species.name} tends to appear around islands suited to its nature.</p>
    <p class="entry-action">Base Speed ${species.base.speed.toFixed(2)} · Lift ${species.base.lift.toFixed(2)} · Growth ${species.base.growth.toFixed(2)}</p>
  </div>`;
}

function mapSummaryMarkup() {
  return `<div class="entry current-bird active">
    <h3>${state.discoveredIslands.length} Islands Landed On</h3>
    <p>Unknown islands remain shrouded on the map until you land on them.</p>
  </div>`;
}

function minimapMarkup() {
  const islands = Object.values(ISLANDS);
  const scale = 0.82;
  const dots = islands.map((island) => {
    const discovered = state.discoveredIslands.includes(island.id);
    const x = 180 + island.center.x * scale;
    const y = 180 + island.center.z * scale;
    const rx = Math.max(16, island.radius * 0.34);
    const ry = Math.max(10, island.radius * 0.24);
    return discovered
      ? `<g>
          <ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="rgba(132, 205, 145, 0.9)" stroke="rgba(255,240,191,0.65)" stroke-width="2" />
          <text x="${x}" y="${y - ry - 6}" fill="#fff0bf" font-size="12" text-anchor="middle">${island.name}</text>
        </g>`
      : `<g>
          <ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="rgba(8, 13, 20, 0.95)" stroke="rgba(120,140,158,0.22)" stroke-width="2" />
        </g>`;
  }).join("");
  return `<svg class="map-svg" viewBox="0 0 360 360" aria-hidden="true">
    <rect x="0" y="0" width="360" height="360" rx="24" fill="rgba(6,16,28,0.98)" />
    <circle cx="180" cy="180" r="152" fill="rgba(18,44,65,0.72)" />
    ${dots}
  </svg>`;
}

function portraitMarkup() {
  const hair = CHARACTER_COLORS.hair[state.character.hair];
  const skin = CHARACTER_COLORS.skin[state.character.skin];
  const jacket = CHARACTER_COLORS.jacket[state.character.jacket];
  const pack = CHARACTER_COLORS.pack[state.character.pack];
  return `
    <svg viewBox="0 0 220 100" aria-hidden="true">
      <rect x="0" y="0" width="220" height="100" rx="18" fill="rgba(255,255,255,0.04)" />
      <circle cx="110" cy="34" r="16" fill="${skin}" />
      <path d="${state.character.hairStyle === "braid" ? "M92 33c6-15 31-16 36 0v-5c0-12-28-14-36 5z M109 49c3 7 5 12 5 18" : state.character.hairStyle === "short" ? "M94 34c4-9 28-10 32 0v-4c0-9-24-11-32 4z" : state.character.hairStyle === "wild" ? "M92 36c2-16 33-23 37 0l-6-13-7 7-7-8-7 10z" : "M92 35c2-14 34-20 36 2v-6c0-12-28-16-36 4z"}" fill="${hair}" stroke="${hair}" stroke-width="2" />
      <path d="M84 56c16-14 36-14 52 0v25H84z" fill="${jacket}" />
      <rect x="141" y="56" width="24" height="28" rx="8" fill="${pack}" />
      <rect x="155" y="58" width="4" height="18" rx="2" fill="rgba(255,255,255,0.45)" />
    </svg>
    <p>The sanctuary now uses a live three.js scene, so these colors update the in-world explorer too.</p>
  `;
}

function refreshUI() {
  const bird = selectedBird();
  ui.sceneStat.textContent = state.scene === "land" ? ISLANDS[state.currentIsland].name : "Island Flight";
  ui.bagStat.textContent = `${state.backpack.length} / 10`;
  ui.flockStat.textContent = `${totalFlockLevel()}`;
  ui.tierStat.textContent = capitalize(currentTier());
  ui.promptStat.textContent = currentPromptText();
  ui.overlayCard.innerHTML = overlayMarkup();
  ui.inventoryPanel.innerHTML = inventoryMarkup();
  ui.activeBirdPanel.innerHTML = activeBirdMarkup();
  ui.rosterPanel.innerHTML = rosterMarkup();
  ui.folioSummary.innerHTML = folioSummaryMarkup();
  ui.folioGrid.innerHTML = `<div class="folio-grid">${folioGridMarkup()}</div>`;
  ui.folioDetail.innerHTML = folioDetailMarkup();
  ui.mapSummary.innerHTML = mapSummaryMarkup();
  ui.mapPanel.innerHTML = minimapMarkup();
  ui.portrait.innerHTML = portraitMarkup();
  syncEvolutionScreen();
  ui.hatchBtn.disabled = !state.backpack.some((item) => item.type === "egg");
  ui.useItemBtn.disabled = !bird || !state.backpack.some((item) => item.type === "item");
  ui.sendFlightBtn.disabled = !bird || bird.level < FLIGHT_UNLOCK_LEVEL || state.scene !== "land";
  ui.restBirdBtn.disabled = !bird || state.scene !== "land";
  ui.releaseBirdBtn.disabled = !bird || state.scene !== "land";
  ui.releaseDuplicatesBtn.disabled = state.scene !== "land" || state.birds.length < 2;
  ui.settingsNote.textContent = saveQueued ? "Unsaved changes queued. Autosave will apply shortly." : "Progress autosaves while you play.";
  syncMusicState();
  applyDrawerState();
  bindDynamicPanels();
}

function bindDynamicPanels() {
  ui.inventoryPanel.querySelectorAll("[data-bag-index]").forEach((button) => {
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      state.selectedBagIndex = Number(button.dataset.bagIndex);
      refreshUI();
    });
  });
  ui.rosterPanel.querySelectorAll("[data-bird-index]").forEach((button) => {
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      selectBird(Number(button.dataset.birdIndex));
      queueSave();
      refreshUI();
    });
  });
  ui.folioGrid.querySelectorAll("[data-folio-species]").forEach((button) => {
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      state.selectedFolioSpeciesId = button.dataset.folioSpecies;
      refreshUI();
    });
  });
}

function syncCustomizationUI() {
  ui.hairSelect.value = state.character.hair;
  ui.hairStyleSelect.value = state.character.hairStyle;
  ui.skinSelect.value = state.character.skin;
  ui.jacketSelect.value = state.character.jacket;
  ui.packSelect.value = state.character.pack;
}

function nearestInteraction() {
  let best = null;
  const island = ISLANDS[state.currentIsland];
  for (const npc of villageNpcs) {
    const dist = Math.hypot(state.player.x - npc.x, state.player.z - npc.z);
    if (dist < NPC_INTERACT_DISTANCE && (!best || dist < best.distance)) {
      best = { kind: "npc", npc, distance: dist };
    }
  }
  for (const mesh of interactables) {
    const dist = mesh.position.distanceTo(new THREE.Vector3(state.player.x, mesh.position.y, state.player.z));
    if (dist < INTERACT_DISTANCE && (!best || dist < best.distance)) {
      best = { kind: mesh.userData.kind, mesh, distance: dist };
    }
  }
  for (const [key, landmark] of Object.entries({ nest: island.nest, perch: island.perch, tailor: island.tailor })) {
    const dist = Math.hypot(state.player.x - landmark.x, state.player.z - landmark.z);
    if (dist < INTERACT_DISTANCE && (!best || dist < best.distance)) {
      best = { kind: landmark.type, key, distance: dist };
    }
  }
  if (!best) {
    const villageNpc = nearestVillageNpc();
    if (villageNpc) best = { kind: "npc", npc: villageNpc.npc, distance: villageNpc.distance };
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
    if (state.backpack[state.selectedBagIndex]?.type === "egg") hatchSelectedEgg();
    else restBirdAtNest();
  } else if (nearby.kind === "perch") {
    startFlight();
  } else if (nearby.kind === "npc") {
    talkToNpc(nearby.npc);
  } else if (nearby.kind === "tailor") {
    state.message = "Open Settings with O to change your explorer's look.";
  }
}

function collectEgg(entity) {
  if (state.backpack.length >= 10) {
    state.message = "Backpack full. Hatch eggs or use items before gathering more.";
    return false;
  }
  state.backpack.push({ type: "egg", speciesId: entity.speciesId, rarity: entity.rarity, label: entity.label });
  discoverSpecies(entity.speciesId);
  state.worldEntities = state.worldEntities.filter((entry) => entry.id !== entity.id);
  state.selectedBagIndex = state.backpack.length - 1;
  state.prompt = "Egg stored. Use the Hatch button or return to the Star Nest.";
  state.message = `${entity.label} added to your backpack.`;
  queueSave();
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
  queueSave();
  return true;
}

function grantNpcReward(npc) {
  const island = ISLANDS[state.currentIsland];
  const rewardPool = island.theme === "ember"
    ? ["ember_relic", "sunfruit"]
    : island.theme === "storm"
      ? ["gust_crystal", "feather_charm"]
      : island.theme === "moonfen"
        ? ["feather_charm", "bloom_nectar"]
        : ["sunfruit", "bloom_nectar"];
  const itemId = rewardPool[(npc.name.length + totalFlockLevel()) % rewardPool.length];
  if (state.backpack.length < 10) {
    const def = ITEM_DEFS.find((item) => item.id === itemId);
    state.backpack.push({ type: "item", itemId: def.id, label: def.name });
    state.selectedBagIndex = state.backpack.length - 1;
    state.message = `${npc.name} shared ${def.name} with you.`;
  } else {
    const bird = selectedBird();
    if (bird) {
      gainBirdXp(bird, 24, true);
      state.message = `${npc.name} trained ${bird.name} because your pack was full.`;
    } else {
      state.message = `${npc.name} offered help, but your pack was full.`;
    }
  }
}

function talkToNpc(npc) {
  if (!npc) return;
  const island = ISLANDS[state.currentIsland];
  if (!state.completedNpcQuests[npc.id]) {
    state.completedNpcQuests[npc.id] = true;
    grantNpcReward(npc);
    state.prompt = `${npc.name} from ${island.village?.label || island.name} gave you guidance.`;
    queueSave();
    return;
  }
  state.message = `${npc.name}: "${island.birdsHint} are often seen deeper in ${island.name}."`;
}

function ensureWorldSpawns() {
  if (state.spawnCooldown > 0) return;
  const island = ISLANDS[state.currentIsland];
  const tutorialMissingEggs = island.id === "tutorial"
    ? STARTER_SPECIES_IDS.filter((speciesId) => !state.birds.some((bird) => bird.speciesId === speciesId) && !state.backpack.some((item) => item.type === "egg" && item.speciesId === speciesId)).length
    : 0;
  const eggTarget = island.id === "tutorial" ? tutorialMissingEggs : 10;
  const itemTarget = island.id === "tutorial" ? 3 : 6;
  const eggCount = state.worldEntities.filter((entity) => entity.type === "egg").length;
  const itemCount = state.worldEntities.filter((entity) => entity.type === "item").length;
  const openSpots = island.forageSpots.filter(
    (spot) => !state.worldEntities.some((entity) => Math.hypot(entity.x - spot.x, entity.z - spot.z) < 5),
  );
  if (!openSpots.length) return;
  if (eggCount < eggTarget) {
    const speciesId = island.id === "tutorial" ? nextTutorialSpeciesId(state) : null;
    const entity = island.id === "tutorial"
      ? (speciesId ? makeSpecificEggEntity(state, openSpots[Math.floor(Math.random() * openSpots.length)], speciesId) : null)
      : makeEggEntity(state, openSpots[Math.floor(Math.random() * openSpots.length)]);
    if (!entity) return;
    state.worldEntities.push(entity);
    placeInteractableMesh(entity);
    state.spawnCooldown = 5;
    return;
  }
  if (itemCount < itemTarget) {
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
  if (bird.level < FLIGHT_UNLOCK_LEVEL) {
    state.message = `${bird.name} needs to reach level ${FLIGHT_UNLOCK_LEVEL} before it can carry you between islands.`;
    return;
  }
  state.scene = "flight";
  updateCompanionBird();
  playerMesh.visible = true;
  state.flight = {
    x: state.player.x,
    y: getTerrainHeight(state.player.x, state.player.z) + 14,
    z: state.player.z,
    yaw: state.player.yaw,
    pitch: clamp(state.player.pitch, -0.45, 0.2),
    velocityY: 0,
    energy: 100,
    speed: 24 + bird.speed * 5.2,
    runXp: 0,
    birdId: bird.id,
    destinationHint: "Fly low over another island and press E to land.",
  };
  state.prompt = `${bird.name} is carrying you across the archipelago. Find a new island and press E to land.`;
}

function finishFlight() {
  const bird = selectedBird();
  const totalXp = Math.max(12, Math.round(state.flight.runXp + 4 + bird.level));
  gainBirdXp(bird, totalXp);
  state.scene = "land";
  playerMesh.visible = true;
  const island = nearestIsland(state.flight.x, state.flight.z) || ISLANDS[state.currentIsland];
  discoverIsland(island.id);
  state.currentIsland = island.id;
  state.player.x = island.groundSpawn.x;
  state.player.z = island.groundSpawn.z;
  state.player.yaw = 0;
  state.player.pitch = -0.18;
  state.flight = null;
  seedWorld(state);
  rebuildWorld();
  state.prompt = `${bird.name} landed on ${island.name} with ${totalXp} XP.`;
  state.message = `${island.name} is now open for exploration.`;
  updateCompanionBird();
}

function updateFlight(dt) {
  const flight = state.flight;
  const bird = selectedBird();
  flight.energy = Math.min(100, flight.energy + dt * (8 + bird.growth * 2) + (bird.abilities.includes("Tailwind") ? 5 * dt : 0));
  if (document.pointerLockElement === canvas) {
    // yaw/pitch updated in mousemove
  }

  if (keys.has("KeyW")) flight.speed = Math.min(42 + bird.speed * 7, flight.speed + 16 * dt);
  if (keys.has("KeyS")) flight.speed = Math.max(10, flight.speed - 18 * dt);

  const forward = new THREE.Vector3(
    Math.sin(flight.yaw) * Math.cos(flight.pitch),
    Math.sin(-flight.pitch),
    Math.cos(flight.yaw) * Math.cos(flight.pitch),
  ).normalize();

  if (keys.has("Space") && flight.energy > 8) {
    flight.velocityY += 20 * bird.lift * dt;
    flight.energy -= 18 * dt;
  }
  if (keys.has("ShiftLeft") || keys.has("ShiftRight")) {
    if (flight.energy > 16) {
      flight.speed = Math.min(52 + bird.speed * 7, flight.speed + 22 * dt);
      flight.energy -= 24 * dt;
      flight.runXp += dt * (bird.name === "Sunflare" ? 7 : 3);
    }
  } else {
    const cruise = 24 + bird.speed * 5.2;
    flight.speed += (cruise - flight.speed) * 0.9 * dt;
  }

  flight.velocityY += Math.sin(-flight.pitch) * 12 * dt;
  flight.velocityY -= 7.2 * dt;
  flight.y = clamp(flight.y + flight.velocityY * dt, 6, 42);
  const islandBelow = nearestIsland(flight.x, flight.z);
  const groundHeight = islandBelow ? getTerrainHeight(flight.x, flight.z) : -7.5;
  if (flight.y <= groundHeight + 6) {
    flight.y = groundHeight + 6;
    flight.velocityY = 0;
  }

  flight.x += forward.x * flight.speed * dt;
  flight.y += forward.y * flight.speed * dt * 0.3;
  flight.z += forward.z * flight.speed * dt;

  if (bird.name === "Rose Phoenix") flight.runXp += 2.2 * dt;
  if (bird.name === "Bloomtail" || bird.name === "Verdant Seraph") flight.runXp += 1.1 * dt;
  if ((keys.has("KeyE") || keys.has("Enter")) && islandBelow && flight.y <= getTerrainHeight(flight.x, flight.z) + 8) {
    keys.delete("KeyE");
    finishFlight();
  }
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

function updateEvolution(dt) {
  if (!state.evolution) return;
  state.evolution.timer -= dt;
  if (companionMesh) {
    const pulse = 1 + Math.sin((1 - state.evolution.timer / state.evolution.duration) * Math.PI * 12) * 0.08;
    companionMesh.scale.setScalar(0.85 * selectedBird().size * pulse);
    companionMesh.traverse((child) => {
      if (child.material && child.material.emissive) {
        child.material.emissiveIntensity = 0.1 + Math.max(0, Math.sin(state.time * 24)) * 0.8;
      }
    });
  }
  if (state.evolution.timer <= 0) {
    if (companionMesh) {
      companionMesh.traverse((child) => {
        if (child.material && child.material.emissiveIntensity !== undefined) child.material.emissiveIntensity = 0.08;
      });
      companionMesh.scale.setScalar(0.85 * selectedBird().size);
    }
    state.evolution = null;
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
  let moveZ = 0;
  if (keys.has("KeyW")) moveZ += 1;
  if (keys.has("KeyS")) moveZ -= 1;

  if (!state.pointerLocked) {
    if (keys.has("KeyQ") || keys.has("ArrowLeft")) state.player.yaw += TURN_SPEED * dt;
    if (keys.has("ArrowRight")) state.player.yaw -= TURN_SPEED * dt;
  }

  if (moveZ) {
    const forward = new THREE.Vector3(Math.sin(state.player.yaw), 0, Math.cos(state.player.yaw));
    const move = forward.multiplyScalar(moveZ).normalize().multiplyScalar(speed * dt);
    state.player.facingYaw = Math.atan2(move.x, move.z);
    const candidateX = state.player.x + move.x;
    const candidateZ = state.player.z + move.z;
    if (!isBlocked(candidateX, candidateZ)) {
      state.player.x = candidateX;
      state.player.z = candidateZ;
    }
    state.player.bob += dt * speed * 0.22;
    state.player.moveBlend = Math.min(1, state.player.moveBlend + dt * 5);
    const bird = selectedBird();
    if (bird) {
      state.exploreProgress += speed * dt;
      while (state.exploreProgress >= 20) {
        state.exploreProgress -= 20;
        gainBirdXp(bird, Math.round(5 + bird.growth * 4), true);
      }
    }
  } else {
    state.player.moveBlend = Math.max(0, state.player.moveBlend - dt * 4);
  }

  const island = ISLANDS[state.currentIsland];
  const dxIsland = state.player.x - island.center.x;
  const dzIsland = state.player.z - island.center.z;
  const islandRadius = Math.hypot(dxIsland, dzIsland);
  if (islandRadius > island.radius - 2.5) {
    const scale = (island.radius - 2.5) / islandRadius;
    state.player.x = island.center.x + dxIsland * scale;
    state.player.z = island.center.z + dzIsland * scale;
  }

  state.player.y = getTerrainHeight(state.player.x, state.player.z);
  playerMesh.position.set(state.player.x, state.player.y, state.player.z);
  playerMesh.rotation.x = 0;
  playerMesh.rotation.y = -state.player.facingYaw + Math.PI;
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
  const pivot = new THREE.Vector3(state.player.x, state.player.y, state.player.z);
  const offset = new THREE.Vector3(0, CAMERA_HEIGHT, -CAMERA_DISTANCE);
  offset.applyEuler(new THREE.Euler(state.player.pitch, state.player.yaw, 0, "YXZ"));
  const desired = pivot.clone().add(offset);
  desired.y += 2 * Math.max(0, Math.sin(state.player.bob * 2) * state.player.moveBlend);
  camera.position.lerp(desired, 0.1);
  const targetOffset = new THREE.Vector3(0, CAMERA_LOOK_HEIGHT, 5.5);
  targetOffset.applyEuler(new THREE.Euler(state.player.pitch, state.player.yaw, 0, "YXZ"));
  const target = pivot.clone().add(targetOffset);
  camera.lookAt(target);
}

function updateFlightCamera(dt) {
  const flight = state.flight;
  const bird = selectedBird();
  if (!bird) return;

  if (!companionMesh) updateCompanionBird();
  if (companionMesh) {
    companionMesh.visible = true;
    companionMesh.position.set(flight.x, flight.y, flight.z);
    companionMesh.rotation.y = -flight.yaw + Math.PI;
    companionMesh.rotation.z = Math.sin(state.time * 18) * 0.12;
    companionMesh.rotation.x = flight.pitch * 0.28;
  }

  const riderOffset = new THREE.Vector3(0, 1.35 + bird.size * 0.35, -0.05);
  riderOffset.applyEuler(new THREE.Euler(flight.pitch * 0.35, flight.yaw, 0, "YXZ"));
  playerMesh.position.copy(new THREE.Vector3(flight.x, flight.y, flight.z).add(riderOffset));
  playerMesh.rotation.y = -flight.yaw + Math.PI;
  playerMesh.rotation.x = flight.pitch * 0.12;

  const offset = new THREE.Vector3(0, 4.8, -10);
  offset.applyEuler(new THREE.Euler(flight.pitch, flight.yaw, 0, "YXZ"));
  const desired = new THREE.Vector3(flight.x, flight.y, flight.z).add(offset);
  camera.position.lerp(desired, 0.12);
  const targetOffset = new THREE.Vector3(0, 1.4, 7);
  targetOffset.applyEuler(new THREE.Euler(flight.pitch, flight.yaw, 0, "YXZ"));
  camera.lookAt(new THREE.Vector3(flight.x, flight.y, flight.z).add(targetOffset));
}

function update(dt) {
  state.time += dt;
  state.nestRestCooldown = Math.max(0, state.nestRestCooldown - dt);
  if (state.scene === "land") {
    updatePlayer(dt);
    updateInteractables(dt);
    updateAnimals(dt);
    updateGrass(dt);
    updateEvolution(dt);
    state.spawnCooldown -= dt;
    ensureWorldSpawns();
  } else {
    updateFlight(dt);
    if (state.scene === "flight" && state.flight) updateFlightCamera(dt);
    else updateLandCamera(0);
    updateEvolution(dt);
  }

  if (saveQueued && state.scene === "land") saveGame();
  if (!activeDrawer) refreshUI();
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
  if (event.code === "KeyI") {
    event.preventDefault();
    openDrawer("inventory");
    refreshUI();
    return;
  }
  if (event.code === "KeyF") {
    event.preventDefault();
    openDrawer("folio");
    refreshUI();
    return;
  }
  if (event.code === "KeyM") {
    event.preventDefault();
    openDrawer("map");
    refreshUI();
    return;
  }
  if (event.code === "KeyO") {
    event.preventDefault();
    openDrawer("settings");
    refreshUI();
    return;
  }
  if (event.code === "Escape" && activeDrawer) {
    closeDrawers();
    refreshUI();
    return;
  }
  if (activeDrawer) return;
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
  if (activeDrawer) return;
  if (document.pointerLockElement !== canvas) safeRequestPointerLock();
});

document.addEventListener("pointerlockchange", () => {
  state.pointerLocked = document.pointerLockElement === canvas;
});

document.addEventListener("mousemove", (event) => {
  if (document.pointerLockElement !== canvas) return;
  if (state.scene === "land") {
    state.player.yaw -= event.movementX * 0.0022;
    state.player.pitch = clamp(state.player.pitch - event.movementY * 0.0017, -0.72, 0.38);
  } else if (state.scene === "flight") {
    state.flight.yaw -= event.movementX * 0.0022;
    state.flight.pitch = clamp(state.flight.pitch - event.movementY * 0.0017, -0.9, 0.45);
  }
});

ui.hairSelect.addEventListener("change", () => {
  state.character.hair = ui.hairSelect.value;
  rebuildWorld();
  queueSave();
  refreshUI();
});

ui.hairStyleSelect.addEventListener("change", () => {
  state.character.hairStyle = ui.hairStyleSelect.value;
  rebuildWorld();
  queueSave();
  refreshUI();
});

ui.skinSelect.addEventListener("change", () => {
  state.character.skin = ui.skinSelect.value;
  rebuildWorld();
  queueSave();
  refreshUI();
});

ui.jacketSelect.addEventListener("change", () => {
  state.character.jacket = ui.jacketSelect.value;
  recolorPlayer();
  queueSave();
  refreshUI();
});

ui.packSelect.addEventListener("change", () => {
  state.character.pack = ui.packSelect.value;
  recolorPlayer();
  queueSave();
  refreshUI();
});

ui.openInventoryBtn.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  event.stopPropagation();
  openDrawer("inventory");
  refreshUI();
});

ui.openFolioBtn.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  event.stopPropagation();
  openDrawer("folio");
  refreshUI();
});

ui.openMapBtn.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  event.stopPropagation();
  openDrawer("map");
  refreshUI();
});

ui.openSettingsBtn.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  event.stopPropagation();
  openDrawer("settings");
  refreshUI();
});

ui.closeInventoryBtn.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  event.stopPropagation();
  closeDrawers();
  refreshUI();
});

ui.closeFolioBtn.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  event.stopPropagation();
  closeDrawers();
  refreshUI();
});

ui.closeMapBtn.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  event.stopPropagation();
  closeDrawers();
  refreshUI();
});

ui.closeSettingsBtn.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  event.stopPropagation();
  closeDrawers();
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

ui.sendFlightBtn.addEventListener("click", () => {
  startFlight();
  refreshUI();
});

ui.restBirdBtn.addEventListener("click", () => {
  restBirdAtNest();
  refreshUI();
});

ui.releaseBirdBtn.addEventListener("click", () => {
  releaseSelectedBird();
  refreshUI();
});

ui.releaseDuplicatesBtn.addEventListener("click", () => {
  releaseDuplicateBirds();
  refreshUI();
});

ui.musicToggleBtn.addEventListener("click", async () => {
  state.musicEnabled = !state.musicEnabled;
  queueSave();
  syncMusicState();
  refreshUI();
});

ui.manualSaveBtn.addEventListener("click", () => {
  saveGame();
  ui.settingsNote.textContent = "Progress saved.";
});

ui.resetSaveBtn.addEventListener("click", () => {
  resetGame();
  closeDrawers();
  ui.settingsNote.textContent = "Save reset. A fresh sanctuary has been created.";
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
  if (isIgnorablePointerLockError(error)) {
    console.warn(error);
    return;
  }
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

window.addEventListener("beforeunload", () => {
  if (saveQueued) saveGame();
});

try {
  state = loadGame() || createState();
  if (!state.worldEntities.length) seedWorld(state);
  rebuildWorld();
  syncCustomizationUI();
  refreshUI();
  requestAnimationFrame(frame);
} catch (error) {
  showRuntimeError(error);
}

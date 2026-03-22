const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

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

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const FOV = 860;
const WORLD_RADIUS = 34;
const MOVE_SPEED = 8.8;
const TURN_SPEED = 1.7;
const keys = new Set();

const CHARACTER_COLORS = {
  hair: { ember: "#7a3928", midnight: "#1d2438", mint: "#60a899" },
  jacket: { gold: "#d7a33b", teal: "#2a8891", rose: "#bc6170" },
  pack: { tan: "#8f6c43", navy: "#33506b", forest: "#446c48" },
};

const SPECIES = [
  { id: "sunflare", name: "Sunflare", rarity: "common", unlockLevel: 0, color: "#f59b2e", accent: "#ffe59f", perk: "Flame-feather dashes score extra XP.", base: { speed: 1.05, lift: 0.95, growth: 1.02 }, look: "flame" },
  { id: "stormwing", name: "Stormwing", rarity: "common", unlockLevel: 0, color: "#c4cdd8", accent: "#ffffff", perk: "Gray-white wings hold altitude through gusts.", base: { speed: 0.98, lift: 1.12, growth: 0.96 }, look: "storm" },
  { id: "bloomtail", name: "Bloomtail", rarity: "common", unlockLevel: 0, color: "#7fd57d", accent: "#ff9bc6", perk: "Flower-bright feathers pull stars and grow fast.", base: { speed: 0.94, lift: 0.98, growth: 1.14 }, look: "bloom" },
  { id: "embercrest", name: "Embercrest", rarity: "uncommon", unlockLevel: 6, color: "#d66131", accent: "#ffd06f", perk: "Molten crest boosts launch speed.", base: { speed: 1.12, lift: 0.92, growth: 1.02 }, look: "crest" },
  { id: "mistfinch", name: "Mistfinch", rarity: "uncommon", unlockLevel: 6, color: "#80c9da", accent: "#dff8ff", perk: "Mist feathers recover flight energy faster.", base: { speed: 0.99, lift: 1.08, growth: 1.02 }, look: "mist" },
  { id: "thornbeak", name: "Thornbeak", rarity: "uncommon", unlockLevel: 6, color: "#6f9a45", accent: "#d3f79c", perk: "Forest plumage stacks strong growth gains.", base: { speed: 0.92, lift: 0.95, growth: 1.18 }, look: "thorn" },
  { id: "glimmerowl", name: "Glimmerowl", rarity: "rare", unlockLevel: 14, color: "#7f78de", accent: "#fff1be", perk: "Moon-dusted wings widen ring pickups.", base: { speed: 1.06, lift: 1.06, growth: 1.08 }, look: "glimmer" },
  { id: "tempestkite", name: "Tempest Kite", rarity: "rare", unlockLevel: 14, color: "#5681d8", accent: "#f4fbff", perk: "Storm fins turn gusts into bigger score bursts.", base: { speed: 1.14, lift: 1.12, growth: 0.98 }, look: "tempest" },
  { id: "rosephoenix", name: "Rose Phoenix", rarity: "rare", unlockLevel: 14, color: "#ff6986", accent: "#ffd4e0", perk: "Floral fire plumage grants passive flight XP.", base: { speed: 1.05, lift: 0.98, growth: 1.18 }, look: "phoenix" },
  { id: "auroraseraph", name: "Aurora Seraph", rarity: "epic", unlockLevel: 24, color: "#63d7ff", accent: "#ffe47d", perk: "Aurora ribbons widen rings and accelerate growth.", base: { speed: 1.14, lift: 1.14, growth: 1.2 }, look: "aurora" },
  { id: "titanroc", name: "Titan Roc", rarity: "epic", unlockLevel: 24, color: "#c47b38", accent: "#fff2bd", perk: "Massive feathers push speed and size higher.", base: { speed: 1.16, lift: 1.02, growth: 1.18 }, look: "roc" },
  { id: "verdantseraph", name: "Verdant Seraph", rarity: "epic", unlockLevel: 24, color: "#59be72", accent: "#f0a9ff", perk: "Sacred bloom-feathers amplify item bonuses.", base: { speed: 1.02, lift: 1.08, growth: 1.24 }, look: "seraph" },
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
  perch: { x: 13, z: -8, label: "Sky Perch", type: "perch", color: "#bceeff" },
  tailor: { x: -12, z: 9, label: "Wanderer's Camp", type: "tailor", color: "#f1a0ac" },
};

const FORAGE_SPOTS = [
  { x: -19, z: -21 }, { x: -12, z: -16 }, { x: -4, z: -23 }, { x: 5, z: -20 }, { x: 12, z: -18 }, { x: 20, z: -12 },
  { x: 24, z: -3 }, { x: 22, z: 8 }, { x: 15, z: 16 }, { x: 7, z: 22 }, { x: -3, z: 24 }, { x: -11, z: 19 },
  { x: -20, z: 12 }, { x: -23, z: 2 }, { x: -18, z: -6 }, { x: -8, z: 11 }, { x: 4, z: 12 }, { x: 9, z: 3 },
];

const TREES = createDecor(42, 1.8, 3.4, 3.8, "tree");
const CRYSTALS = createDecor(12, 1, 1.8, 1.2, "crystal");
const FIREFLIES = new Array(34).fill(null).map((_, index) => ({
  seed: index * 0.77 + 1,
  radius: 12 + index % 11,
  height: 1.4 + (index % 7) * 0.16,
}));

function createState() {
  const current = {
    scene: "land",
    time: 0,
    pointerLocked: false,
    prompt: "Click the viewport to lock the mouse, then explore the sanctuary for eggs.",
    message: "This is a mythical bird sanctuary. Wander, collect eggs, and build your flock.",
    player: {
      x: 0,
      z: 18,
      yaw: Math.PI,
      pitch: -0.14,
      bob: 0,
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
  seedWorld(current);
  return current;
}

let state = createState();

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

function terrainHeight(x, z) {
  return Math.sin(x * 0.16) * 0.75 + Math.cos(z * 0.14) * 0.65 + Math.sin((x + z) * 0.07) * 0.45;
}

function clampPlayerToWorld() {
  const radius = Math.hypot(state.player.x, state.player.z);
  if (radius > WORLD_RADIUS) {
    const scale = WORLD_RADIUS / radius;
    state.player.x *= scale;
    state.player.z *= scale;
  }
}

function update(dt) {
  state.time += dt;
  if (keys.has("KeyR")) {
    resetGame();
    keys.delete("KeyR");
    return;
  }

  if (state.scene === "land") updateLand(dt);
  else updateFlight(dt);

  refreshUI();
}

function updateLand(dt) {
  const sprint = keys.has("ShiftLeft") || keys.has("ShiftRight");
  const speed = MOVE_SPEED * (sprint ? 1.42 : 1);
  let moveX = 0;
  let moveZ = 0;

  if (keys.has("KeyW")) moveZ += 1;
  if (keys.has("KeyS")) moveZ -= 1;
  if (keys.has("KeyA")) moveX -= 1;
  if (keys.has("KeyD")) moveX += 1;

  if (!state.pointerLocked) {
    if (keys.has("KeyQ") || keys.has("ArrowLeft")) state.player.yaw -= TURN_SPEED * dt;
    if (keys.has("ArrowRight")) state.player.yaw += TURN_SPEED * dt;
  }

  if (moveX || moveZ) {
    const angle = state.player.yaw;
    const forwardX = Math.sin(angle);
    const forwardZ = Math.cos(angle);
    const rightX = Math.cos(angle);
    const rightZ = -Math.sin(angle);
    state.player.x += (forwardX * moveZ + rightX * moveX) * speed * dt;
    state.player.z += (forwardZ * moveZ + rightZ * moveX) * speed * dt;
    state.player.bob += dt * speed * 0.8;
  }
  clampPlayerToWorld();

  if (keys.has("KeyE")) {
    interactNearby();
    keys.delete("KeyE");
  }

  for (let i = 0; i < 6; i += 1) {
    if (keys.has(`Digit${i + 1}`)) {
      selectBird(i);
      keys.delete(`Digit${i + 1}`);
    }
  }

  if (keys.has("Space")) {
    if (selectedBird()) startFlight();
    keys.delete("Space");
  }

  state.spawnCooldown -= dt;
  ensureWorldSpawns();
}

function interactNearby() {
  const nearby = nearestWorldObject();
  if (!nearby) {
    state.message = "Nothing close enough to interact with.";
    return;
  }

  if (nearby.kind === "egg") collectEgg(nearby.entity);
  else if (nearby.kind === "item") collectItem(nearby.entity);
  else if (nearby.kind === "nest") hatchSelectedEgg();
  else if (nearby.kind === "perch") startFlight();
  else if (nearby.kind === "tailor") state.message = "Use the ranger panel on the right to customize your explorer.";
}

function nearestWorldObject() {
  let best = null;
  for (const entity of state.worldEntities) {
    const dist = distance2D(state.player.x, state.player.z, entity.x, entity.z);
    if (dist < 3 && (!best || dist < best.distance)) {
      best = { kind: entity.type, entity, distance: dist };
    }
  }
  for (const landmark of Object.values(LANDMARKS)) {
    const dist = distance2D(state.player.x, state.player.z, landmark.x, landmark.z);
    if (dist < 3.8 && (!best || dist < best.distance)) {
      best = { kind: landmark.type, entity: landmark, distance: dist };
    }
  }
  return best;
}

function collectEgg(entity) {
  if (state.backpack.length >= 10) {
    state.message = "Backpack full. Hatch eggs or use items before gathering more.";
    return;
  }
  state.backpack.push({ type: "egg", speciesId: entity.speciesId, rarity: entity.rarity, label: entity.label });
  state.worldEntities = state.worldEntities.filter((entry) => entry.id !== entity.id);
  state.selectedBagIndex = state.backpack.length - 1;
  state.prompt = "Egg stored. Use the Hatch button or return to the Star Nest.";
  state.message = `${entity.label} added to your backpack.`;
}

function collectItem(entity) {
  if (state.backpack.length >= 10) {
    state.message = "Backpack full. Use an item or hatch an egg first.";
    return;
  }
  const def = ITEM_DEFS.find((item) => item.id === entity.itemId);
  state.backpack.push({ type: "item", itemId: def.id, label: def.name });
  state.worldEntities = state.worldEntities.filter((entry) => entry.id !== entity.id);
  state.selectedBagIndex = state.backpack.length - 1;
  state.prompt = "Growth item stored. Use it on your selected bird from the side panel.";
  state.message = `${def.name} added to your backpack.`;
}

function selectedBird() {
  return state.birds[state.selectedBirdIndex] || null;
}

function selectBird(index) {
  if (index >= state.birds.length) return;
  state.selectedBirdIndex = index;
  state.message = `${state.birds[index].name} selected.`;
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

function startFlight() {
  const bird = selectedBird();
  if (!bird) {
    state.message = "Hatch a bird before starting flight training.";
    return;
  }
  state.scene = "flight";
  state.flight = {
    timer: 34,
    laneX: 0,
    altitude: 0,
    velocityY: 0,
    energy: 100,
    speed: 17 + bird.speed * 3.5,
    runXp: 0,
    combo: 0,
    objects: createFlightObjects(),
  };
  state.prompt = `${bird.name} launched. Use mouse look in the sanctuary and A/D + Space in flight.`;
}

function createFlightObjects() {
  const objects = [];
  for (let i = 0; i < 26; i += 1) {
    objects.push({ kind: "ring", z: 34 + i * 14, x: Math.sin(i * 0.75) * 1.05, y: Math.cos(i * 0.55) * 0.48, value: 16, hit: false });
    if (i % 2 === 0) objects.push({ kind: "star", z: 40 + i * 14, x: Math.cos(i * 1.3) * 1.35, y: Math.sin(i * 0.8) * 0.58, value: 12, hit: false });
    if (i % 3 === 0) objects.push({ kind: "gust", z: 46 + i * 14, x: Math.sin(i * 1.1) * 1.55, y: 0.12 + Math.cos(i * 0.9) * 0.4, value: 10, hit: false });
  }
  return objects;
}

function updateFlight(dt) {
  const flight = state.flight;
  const bird = selectedBird();
  flight.timer -= dt;
  flight.energy = Math.min(100, flight.energy + dt * (8 + bird.growth * 2) + (bird.abilities.includes("Tailwind") ? 5 * dt : 0));

  if (keys.has("KeyA")) flight.laneX -= dt * 2;
  if (keys.has("KeyD")) flight.laneX += dt * 2;
  flight.laneX = clamp(flight.laneX, -1.9, 1.9);

  if (keys.has("Space") && flight.energy > 8) {
    flight.velocityY += 12 * bird.lift * dt;
    flight.energy -= 18 * dt;
  }
  if (keys.has("ShiftLeft") || keys.has("ShiftRight")) {
    if (flight.energy > 16) {
      flight.speed = Math.min(31 + bird.speed * 4, flight.speed + 18 * dt);
      flight.energy -= 24 * dt;
      flight.runXp += dt * (bird.name === "Sunflare" ? 7 : 3);
    }
  } else {
    const cruise = 17 + bird.speed * 3.5;
    flight.speed += (cruise - flight.speed) * 0.9 * dt;
  }

  flight.velocityY -= 4.6 * dt;
  flight.altitude = clamp(flight.altitude + flight.velocityY * dt, -1.1, 1.3);
  if (flight.altitude <= -1.1) flight.velocityY = 0;

  if (bird.name === "Rose Phoenix") flight.runXp += 2.2 * dt;
  if (bird.name === "Bloomtail" || bird.name === "Verdant Seraph") flight.runXp += 1.1 * dt;

  for (const object of flight.objects) {
    object.z -= flight.speed * dt;
    if (!object.hit && object.z < 2.4) {
      const hitX = Math.abs(object.x - flight.laneX) < (object.kind === "ring" ? 0.52 : 0.38);
      const hitY = Math.abs(object.y - flight.altitude) < (object.kind === "ring" ? 0.38 : 0.3);
      if (hitX && hitY) {
        object.hit = true;
        if (object.kind === "ring") {
          flight.combo += 1;
          flight.runXp += object.value + flight.combo * 2;
        } else if (object.kind === "star") {
          flight.runXp += object.value + (bird.name === "Bloomtail" ? 6 : 0);
          flight.energy = Math.min(100, flight.energy + 12);
        } else if (object.kind === "gust") {
          flight.runXp += bird.name === "Stormwing" ? 18 : object.value;
          flight.velocityY += 0.8 + bird.lift * 0.35;
        }
      } else if (object.kind === "ring") {
        flight.combo = 0;
      }
    }
  }

  if (flight.timer <= 0) finishFlight();
}

function finishFlight() {
  const bird = selectedBird();
  const totalXp = Math.max(18, Math.round(state.flight.runXp + 10 + bird.level * 2));
  gainBirdXp(bird, totalXp);
  state.scene = "land";
  state.flight = null;
  state.prompt = `${bird.name} landed with ${totalXp} XP. Stronger flocks reveal stronger eggs.`;
  state.message = `${bird.name} completed a flight run.`;
}

function ensureWorldSpawns() {
  if (state.spawnCooldown > 0) return;
  const eggCount = state.worldEntities.filter((entity) => entity.type === "egg").length;
  const itemCount = state.worldEntities.filter((entity) => entity.type === "item").length;
  const openSpots = FORAGE_SPOTS.filter(
    (spot) => !state.worldEntities.some((entity) => distance2D(entity.x, entity.z, spot.x, spot.z) < 2),
  );
  if (!openSpots.length) return;
  if (eggCount < 6) {
    state.worldEntities.push(makeEggEntity(state, openSpots[Math.floor(Math.random() * openSpots.length)]));
    state.spawnCooldown = 3.2;
    return;
  }
  if (itemCount < 5) {
    state.worldEntities.push(makeItemEntity(state, openSpots[Math.floor(Math.random() * openSpots.length)]));
    state.spawnCooldown = 4.5;
  }
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

function currentPromptText() {
  if (state.scene === "flight") return "A/D steer, Space flap, Shift dash. Clear rings for XP.";
  const nearby = nearestWorldObject();
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
    return `<strong>Sanctuary Brief</strong>This is a mythical open sanctuary, not a maze. Explore meadows, ruins, and glowing groves to find eggs and form your first bond.`;
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
        <p>${capitalize(item.rarity)} egg. Only the common three appear at the start, then rarer eggs begin to show up as your flock levels rise.</p>
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
    <p>Your ranger colors also show up on the third-person explorer in the world.</p>
  `;
}

function buildCamera() {
  const forward = {
    x: Math.sin(state.player.yaw) * Math.cos(state.player.pitch),
    y: Math.sin(state.player.pitch),
    z: Math.cos(state.player.yaw) * Math.cos(state.player.pitch),
  };
  const right = { x: Math.cos(state.player.yaw), y: 0, z: -Math.sin(state.player.yaw) };
  const up = {
    x: -right.z * forward.y,
    y: right.x * forward.z - right.z * forward.x,
    z: right.x * -forward.y,
  };
  const playerY = terrainHeight(state.player.x, state.player.z) + 1.7;
  const cam = {
    x: state.player.x - forward.x * 6 + right.x * 0.8,
    y: playerY + 3.4,
    z: state.player.z - forward.z * 6 + right.z * 0.8,
  };
  return { cam, forward, right, up };
}

function projectPoint(point, camera) {
  const dx = point.x - camera.cam.x;
  const dy = point.y - camera.cam.y;
  const dz = point.z - camera.cam.z;
  const cx = dx * camera.right.x + dy * camera.right.y + dz * camera.right.z;
  const cy = dx * camera.up.x + dy * camera.up.y + dz * camera.up.z;
  const cz = dx * camera.forward.x + dy * camera.forward.y + dz * camera.forward.z;
  if (cz <= 0.25) return null;
  return {
    x: WIDTH * 0.5 + (cx / cz) * FOV,
    y: HEIGHT * 0.5 - (cy / cz) * FOV,
    depth: cz,
  };
}

function render() {
  if (state.scene === "land") renderLand();
  else renderFlight();
}

function renderLand() {
  const camera = buildCamera();
  drawModernSky();
  drawMountains(camera);
  drawMythicalGround(camera);
  drawProjectedWorld(camera);
  drawFireflies(camera);
  drawExplorer();
}

function drawModernSky() {
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, "#fbffff");
  gradient.addColorStop(0.48, "#9dd8ff");
  gradient.addColorStop(1, "#d2f0ff");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = "rgba(255, 241, 177, 0.85)";
  ctx.beginPath();
  ctx.arc(WIDTH - 170, 120, 62, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 6; i += 1) {
    const x = ((state.time * 10 + i * 220) % (WIDTH + 260)) - 130;
    const y = 96 + (i % 3) * 38;
    ctx.fillStyle = "rgba(255,255,255,0.72)";
    ctx.beginPath();
    ctx.ellipse(x, y, 96, 26, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 56, y + 8, 80, 24, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawMountains(camera) {
  const base = HEIGHT * 0.54;
  for (let layer = 0; layer < 3; layer += 1) {
    ctx.beginPath();
    ctx.moveTo(0, base + layer * 30);
    for (let x = 0; x <= WIDTH; x += 80) {
      const worldX = (x / WIDTH - 0.5) * 90 + state.player.x * 0.2 * (layer + 1);
      const peak = Math.sin(worldX * 0.12 + layer * 2.2) * 42 + Math.cos(worldX * 0.07) * 28;
      ctx.lineTo(x, base - peak + layer * 38);
    }
    ctx.lineTo(WIDTH, HEIGHT);
    ctx.lineTo(0, HEIGHT);
    ctx.closePath();
    ctx.fillStyle = layer === 0 ? "rgba(112, 177, 161, 0.45)" : layer === 1 ? "rgba(81, 129, 140, 0.42)" : "rgba(45, 75, 97, 0.32)";
    ctx.fill();
  }
}

function drawMythicalGround(camera) {
  const horizon = HEIGHT * 0.58;
  const ground = ctx.createLinearGradient(0, horizon, 0, HEIGHT);
  ground.addColorStop(0, "#a3db8b");
  ground.addColorStop(1, "#45754b");
  ctx.fillStyle = ground;
  ctx.fillRect(0, horizon, WIDTH, HEIGHT - horizon);

  for (let i = 0; i < 24; i += 1) {
    const depth = i + 1;
    const y = horizon + depth * depth * 0.56;
    const alpha = clamp(0.2 - depth * 0.006, 0.02, 0.18);
    ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WIDTH, y);
    ctx.stroke();
  }
}

function projectedObjects(camera) {
  const objects = [];
  for (const tree of TREES) objects.push({ kind: "tree", x: tree.x, y: terrainHeight(tree.x, tree.z), z: tree.z, scale: tree.scale, color: tree.color });
  for (const crystal of CRYSTALS) objects.push({ kind: "crystal", x: crystal.x, y: terrainHeight(crystal.x, crystal.z), z: crystal.z, scale: crystal.scale, color: crystal.color });
  for (const entity of state.worldEntities) objects.push({ ...entity, y: terrainHeight(entity.x, entity.z) });
  for (const landmark of Object.values(LANDMARKS)) objects.push({ ...landmark, y: terrainHeight(landmark.x, landmark.z) });
  const bird = selectedBird();
  if (bird && state.scene === "land") {
    const offset = 2.8;
    const followX = state.player.x - Math.cos(state.time * 1.2) * offset;
    const followZ = state.player.z - Math.sin(state.time * 1.2) * offset;
    objects.push({ kind: "companion", speciesId: bird.speciesId, x: followX, y: terrainHeight(followX, followZ) + 1.8 + Math.sin(state.time * 3) * 0.2, z: followZ, scale: 1.2 * bird.size });
  }
  return objects
    .map((object) => {
      const point = projectPoint({ x: object.x, y: object.y + (object.kind === "tree" ? object.scale * 2.3 : 0), z: object.z }, camera);
      if (!point) return null;
      return { object, point };
    })
    .filter(Boolean)
    .sort((a, b) => b.point.depth - a.point.depth);
}

function drawProjectedWorld(camera) {
  for (const entry of projectedObjects(camera)) {
    const { object, point } = entry;
    const size = clamp((220 / point.depth) * (object.scale || 1.2), 18, 280);
    if (object.kind === "tree") drawTreeBillboard(point.x, point.y, size, object.color);
    else if (object.kind === "crystal") drawCrystalBillboard(point.x, point.y, size, object.color);
    else if (object.kind === "egg") drawEggBillboard(point.x, point.y, size, object);
    else if (object.kind === "item") drawItemBillboard(point.x, point.y, size, object);
    else if (object.kind === "nest") drawNestBillboard(point.x, point.y, size * 1.2, object);
    else if (object.kind === "perch") drawPerchBillboard(point.x, point.y, size * 1.25, object);
    else if (object.kind === "tailor") drawCampBillboard(point.x, point.y, size * 1.2, object);
    else if (object.kind === "companion") drawBirdBillboard(point.x, point.y, size * 1.2, SPECIES.find((species) => species.id === object.speciesId));
  }
}

function drawTreeBillboard(x, y, size, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#6d4d33";
  ctx.fillRect(-size * 0.08, 0, size * 0.16, size * 0.5);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, -size * 0.1, size * 0.34, 0, Math.PI * 2);
  ctx.arc(size * 0.18, -size * 0.18, size * 0.28, 0, Math.PI * 2);
  ctx.arc(-size * 0.18, -size * 0.16, size * 0.24, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCrystalBillboard(x, y, size, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.4);
  ctx.lineTo(size * 0.2, 0);
  ctx.lineTo(0, size * 0.45);
  ctx.lineTo(-size * 0.2, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawEggBillboard(x, y, size, egg) {
  const species = SPECIES.find((entry) => entry.id === egg.speciesId);
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.2, size * 0.24, size * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = species.accent;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.18, size * 0.24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = species.color;
  ctx.lineWidth = Math.max(2, size * 0.03);
  ctx.beginPath();
  if (species.look === "flame" || species.look === "phoenix" || species.look === "crest") {
    ctx.moveTo(-size * 0.08, size * 0.08);
    ctx.quadraticCurveTo(0, -size * 0.22, size * 0.09, size * 0.04);
  } else if (species.look === "storm" || species.look === "tempest" || species.look === "mist") {
    ctx.moveTo(-size * 0.12, -size * 0.04);
    ctx.lineTo(size * 0.12, -size * 0.04);
    ctx.moveTo(-size * 0.1, size * 0.08);
    ctx.lineTo(size * 0.1, size * 0.08);
  } else {
    ctx.arc(0, 0, size * 0.08, 0, Math.PI * 2);
  }
  ctx.stroke();
  ctx.restore();
}

function drawItemBillboard(x, y, size, item) {
  const def = ITEM_DEFS.find((entry) => entry.id === item.itemId);
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = def.color;
  if (def.effect === "growth") {
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillRect(-size * 0.03, -size * 0.28, size * 0.06, size * 0.16);
  } else if (def.effect === "ability") {
    ctx.beginPath();
    for (let i = 0; i < 5; i += 1) {
      const outer = -Math.PI / 2 + (i * Math.PI * 2) / 5;
      const inner = outer + Math.PI / 5;
      ctx.lineTo(Math.cos(outer) * size * 0.22, Math.sin(outer) * size * 0.22);
      ctx.lineTo(Math.cos(inner) * size * 0.09, Math.sin(inner) * size * 0.09);
    }
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.24);
    ctx.lineTo(size * 0.18, 0);
    ctx.lineTo(0, size * 0.24);
    ctx.lineTo(-size * 0.18, 0);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawNestBillboard(x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(255, 240, 184, 0.18)";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.28, size * 0.36, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#8d5d38";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.12, size * 0.34, size * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#d7a26d";
  ctx.lineWidth = Math.max(2, size * 0.025);
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.18, Math.PI * 0.2, Math.PI * 0.8);
  ctx.stroke();
  ctx.restore();
}

function drawPerchBillboard(x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#604832";
  ctx.fillRect(-size * 0.05, -size * 0.1, size * 0.1, size * 0.5);
  ctx.fillStyle = "#d8f6ff";
  ctx.fillRect(-size * 0.2, -size * 0.2, size * 0.4, size * 0.08);
  ctx.strokeStyle = "#fff4be";
  ctx.lineWidth = Math.max(2, size * 0.022);
  ctx.strokeRect(-size * 0.2, -size * 0.2, size * 0.4, size * 0.08);
  ctx.restore();
}

function drawCampBillboard(x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#87694c";
  ctx.fillRect(-size * 0.18, 0, size * 0.36, size * 0.22);
  ctx.fillStyle = "#c06a77";
  ctx.beginPath();
  ctx.moveTo(-size * 0.24, 0);
  ctx.lineTo(0, -size * 0.2);
  ctx.lineTo(size * 0.24, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawBirdBillboard(x, y, size, species) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 80, size / 80);
  drawBirdArt(species);
  ctx.restore();
}

function drawBirdArt(species) {
  ctx.fillStyle = species.color;
  ctx.beginPath();
  ctx.ellipse(0, 0, 24, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = species.accent;
  ctx.beginPath();
  ctx.ellipse(8, -3, 11, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(13, -5, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#182838";
  ctx.beginPath();
  ctx.arc(14, -5, 1.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f6ca69";
  ctx.beginPath();
  ctx.moveTo(21, -1);
  ctx.lineTo(30, 2);
  ctx.lineTo(21, 6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = species.accent;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-4, 0);
  ctx.quadraticCurveTo(-28, -22, -38, -2);
  ctx.moveTo(-2, 5);
  ctx.quadraticCurveTo(-24, 18, -35, 10);
  ctx.stroke();

  if (species.look === "flame" || species.look === "phoenix" || species.look === "crest") {
    ctx.fillStyle = "#ffdb74";
    ctx.beginPath();
    ctx.moveTo(-8, -10);
    ctx.lineTo(-4, -24);
    ctx.lineTo(0, -10);
    ctx.lineTo(5, -20);
    ctx.lineTo(6, -6);
    ctx.closePath();
    ctx.fill();
  } else if (species.look === "storm" || species.look === "tempest" || species.look === "mist") {
    ctx.strokeStyle = "#f5fcff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-6, -9);
    ctx.lineTo(6, -12);
    ctx.moveTo(-3, 12);
    ctx.lineTo(6, 9);
    ctx.stroke();
  } else {
    ctx.fillStyle = "#f7a3cb";
    ctx.beginPath();
    ctx.arc(-7, -12, 5, 0, Math.PI * 2);
    ctx.arc(0, -16, 5, 0, Math.PI * 2);
    ctx.arc(6, -11, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFireflies(camera) {
  for (const firefly of FIREFLIES) {
    const angle = state.time * 0.25 + firefly.seed;
    const point = {
      x: Math.cos(angle) * firefly.radius,
      y: terrainHeight(Math.cos(angle) * firefly.radius, Math.sin(angle) * firefly.radius) + firefly.height + Math.sin(state.time * 2 + firefly.seed) * 0.25,
      z: Math.sin(angle) * firefly.radius,
    };
    const projected = projectPoint(point, camera);
    if (!projected) continue;
    const alpha = clamp(0.8 - projected.depth * 0.03, 0.08, 0.7);
    ctx.fillStyle = `rgba(255, 247, 176, ${alpha})`;
    ctx.beginPath();
    ctx.arc(projected.x, projected.y, clamp(5 / projected.depth * 20, 1, 4), 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawExplorer() {
  const hair = CHARACTER_COLORS.hair[state.character.hair];
  const jacket = CHARACTER_COLORS.jacket[state.character.jacket];
  const pack = CHARACTER_COLORS.pack[state.character.pack];
  const bob = Math.sin(state.player.bob * 6) * 6;
  const cx = WIDTH * 0.5;
  const cy = HEIGHT * 0.79 + bob;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(0, 54, 82, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = pack;
  ctx.fillRect(-34, -8, 68, 82);
  ctx.fillStyle = jacket;
  ctx.beginPath();
  ctx.moveTo(-54, 6);
  ctx.quadraticCurveTo(0, -42, 54, 6);
  ctx.lineTo(42, 90);
  ctx.lineTo(-42, 90);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ffd7b4";
  ctx.beginPath();
  ctx.arc(0, -34, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = hair;
  ctx.beginPath();
  ctx.moveTo(-18, -38);
  ctx.quadraticCurveTo(0, -62, 18, -38);
  ctx.lineTo(18, -26);
  ctx.lineTo(-18, -26);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function renderFlight() {
  const bird = selectedBird();
  const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  sky.addColorStop(0, "#f8fdff");
  sky.addColorStop(0.52, "#91ceff");
  sky.addColorStop(1, "#d7f0ff");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  drawFlightBackdrop();
  drawFlightTrack();
  drawFlightPickups();
  drawFlightBird(bird);
  drawFlightHud();
}

function drawFlightBackdrop() {
  for (let i = 0; i < 7; i += 1) {
    const drift = (state.time * 28 + i * 190) % (WIDTH + 220) - 110;
    ctx.fillStyle = "rgba(255,255,255,0.76)";
    ctx.beginPath();
    ctx.ellipse(drift, 110 + (i % 3) * 36, 96, 26, 0, 0, Math.PI * 2);
    ctx.ellipse(drift + 60, 122 + (i % 3) * 36, 82, 24, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFlightTrack() {
  ctx.fillStyle = "rgba(110, 196, 124, 0.72)";
  ctx.beginPath();
  ctx.moveTo(0, HEIGHT);
  ctx.lineTo(WIDTH * 0.22, HEIGHT * 0.58);
  ctx.lineTo(WIDTH * 0.78, HEIGHT * 0.58);
  ctx.lineTo(WIDTH, HEIGHT);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.34)";
  ctx.lineWidth = 3;
  for (let i = 1; i < 5; i += 1) {
    const t = i / 5;
    const y = HEIGHT * (0.58 + t * 0.38);
    const width = WIDTH * (0.56 + t * 0.5);
    ctx.beginPath();
    ctx.moveTo(WIDTH * 0.5 - width * 0.5, y);
    ctx.lineTo(WIDTH * 0.5 + width * 0.5, y);
    ctx.stroke();
  }
}

function drawFlightPickups() {
  const objects = state.flight.objects.filter((object) => !object.hit && object.z > 0 && object.z < 72).sort((a, b) => b.z - a.z);
  for (const object of objects) {
    const scale = clamp(1 / object.z * 880, 10, 180);
    const x = WIDTH * 0.5 + object.x * (WIDTH * 0.2) / Math.max(object.z / 16, 0.52);
    const y = HEIGHT * 0.6 - object.y * (HEIGHT * 0.18) / Math.max(object.z / 16, 0.52);
    ctx.save();
    ctx.translate(x, y);
    if (object.kind === "ring") {
      ctx.strokeStyle = "#ffe48b";
      ctx.lineWidth = Math.max(4, scale * 0.08);
      ctx.beginPath();
      ctx.arc(0, 0, scale * 0.45, 0, Math.PI * 2);
      ctx.stroke();
    } else if (object.kind === "star") {
      ctx.fillStyle = "#fff3c6";
      ctx.beginPath();
      for (let i = 0; i < 5; i += 1) {
        const outer = -Math.PI / 2 + (i * Math.PI * 2) / 5;
        const inner = outer + Math.PI / 5;
        ctx.lineTo(Math.cos(outer) * scale * 0.35, Math.sin(outer) * scale * 0.35);
        ctx.lineTo(Math.cos(inner) * scale * 0.14, Math.sin(inner) * scale * 0.14);
      }
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.strokeStyle = "#dff8ff";
      ctx.lineWidth = Math.max(4, scale * 0.08);
      ctx.beginPath();
      ctx.moveTo(-scale * 0.32, 0);
      ctx.quadraticCurveTo(0, -scale * 0.22, scale * 0.32, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-scale * 0.22, scale * 0.12);
      ctx.quadraticCurveTo(scale * 0.02, -scale * 0.08, scale * 0.28, scale * 0.12);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawFlightBird(bird) {
  const species = SPECIES.find((entry) => entry.id === bird.speciesId);
  const x = WIDTH * 0.5 + state.flight.laneX * 170;
  const y = HEIGHT * 0.7 - state.flight.altitude * 130;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(2.8 * bird.size / 1.2, 2.8 * bird.size / 1.2);
  drawBirdArt(species);
  ctx.restore();
}

function drawFlightHud() {
  const bird = selectedBird();
  ctx.fillStyle = "rgba(10, 27, 40, 0.74)";
  ctx.fillRect(24, 22, 300, 90);
  ctx.fillStyle = "#fff5c8";
  ctx.font = "700 16px sans-serif";
  ctx.fillText(bird.name, 38, 46);
  ctx.fillStyle = "#ffffff";
  ctx.font = "14px sans-serif";
  ctx.fillText(`Energy ${Math.round(state.flight.energy)}`, 38, 70);
  ctx.fillText(`Run XP ${Math.round(state.flight.runXp)}`, 38, 92);
  ctx.fillStyle = "#69d2ff";
  ctx.fillRect(138, 58, Math.max(0, state.flight.energy) * 1.5, 12);
  ctx.strokeStyle = "rgba(255,255,255,0.45)";
  ctx.strokeRect(138, 58, 150, 12);

  ctx.fillStyle = "rgba(10, 27, 40, 0.74)";
  ctx.fillRect(WIDTH - 182, 22, 158, 90);
  ctx.fillStyle = "#ffffff";
  ctx.fillText(`Time ${state.flight.timer.toFixed(1)}`, WIDTH - 166, 46);
  ctx.fillText(`Combo ${state.flight.combo}`, WIDTH - 166, 68);
  ctx.fillText(`Altitude ${state.flight.altitude.toFixed(1)}`, WIDTH - 166, 90);
}

function resetGame() {
  state = createState();
  syncCustomizationUI();
  refreshUI();
}

function distance2D(ax, az, bx, bz) {
  return Math.hypot(ax - bx, az - bz);
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

function createDecor(count, radiusMin, radiusMax, scaleBase, type) {
  const entries = [];
  for (let i = 0; i < count; i += 1) {
    const angle = i * 1.67 + (type === "crystal" ? 0.4 : 0);
    const radius = radiusMin + (i % 9) * radiusMax;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    if (distance2D(x, z, 0, 0) < 8) continue;
    entries.push({
      x,
      z,
      scale: scaleBase + (i % 4) * 0.22,
      color: type === "tree" ? ["#4d8a52", "#5b9d5e", "#76b77a"][i % 3] : ["#89d9ff", "#d7a9ff", "#9ee6c7"][i % 3],
    });
  }
  return entries;
}

function syncCustomizationUI() {
  ui.hairSelect.value = state.character.hair;
  ui.jacketSelect.value = state.character.jacket;
  ui.packSelect.value = state.character.pack;
}

document.addEventListener("keydown", (event) => {
  keys.add(event.code);
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
  state.player.yaw += event.movementX * 0.0025;
  state.player.pitch = clamp(state.player.pitch - event.movementY * 0.0018, -0.45, 0.12);
});

ui.hairSelect.addEventListener("change", () => {
  state.character.hair = ui.hairSelect.value;
  refreshUI();
});

ui.jacketSelect.addEventListener("change", () => {
  state.character.jacket = ui.jacketSelect.value;
  refreshUI();
});

ui.packSelect.addEventListener("change", () => {
  state.character.pack = ui.packSelect.value;
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

let lastFrame = performance.now();
function frame(now) {
  const dt = Math.min(0.033, (now - lastFrame) / 1000);
  lastFrame = now;
  update(dt);
  render();
  requestAnimationFrame(frame);
}

syncCustomizationUI();
refreshUI();
requestAnimationFrame(frame);

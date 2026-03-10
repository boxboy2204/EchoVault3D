const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
const hud = document.getElementById("hud");
const mission = document.getElementById("mission");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const keys = new Set();

const GRAVITY = 1800;
const MOVE_SPEED = 265;
const JUMP_SPEED = 690;
const GLIDE_GRAVITY = 320;
const GLIDE_FALL_SPEED = 170;
const WORLD_FLOOR = 512;

const scenes = {
  title: "title",
  map: "map",
  story: "story",
  playing: "playing",
  levelClear: "levelClear",
  gameOver: "gameOver",
  win: "win",
};

const storyBeats = [
  {
    title: "Rooftop Declaration",
    body:
      "Box Boy has no powers, no sponsor, and no functioning gadgets. What he does have is a bright blue checkered cape, cardboard armor, and a refusal to quit.",
  },
  {
    title: "The First Witnesses",
    body:
      "A city only believes in heroes after somebody sees the work. Rescue civilians, stop petty threats, and leave with proof that Box Boy belongs in the skyline.",
  },
  {
    title: "Proof Of Heroism",
    body:
      "Every broken gadget is still a promise. Box Boy keeps climbing until even the biggest boss in the city has to admit he showed up.",
  },
];

const levels = [
  {
    id: "alley-run",
    name: "Level 1: Lantern Alley",
    chapter: "Story Mode",
    goal: "Reach the radio tower and rescue 2 civilians.",
    story:
      "A blackout hits the Old Market blocks. Box Boy starts where every self-appointed hero starts: a dangerous alley and no backup.",
    background: "market-night",
    heroTarget: 5,
    civiliansTarget: 2,
    endX: 2300,
    platforms: [
      { x: 0, y: 520, w: 2500, h: 140, type: "ground" },
      { x: 190, y: 430, w: 180, h: 20, type: "roof" },
      { x: 470, y: 360, w: 160, h: 20, type: "roof" },
      { x: 720, y: 320, w: 140, h: 20, type: "sign" },
      { x: 940, y: 390, w: 150, h: 20, type: "ac" },
      { x: 1180, y: 300, w: 180, h: 20, type: "roof" },
      { x: 1480, y: 246, w: 170, h: 20, type: "roof" },
      { x: 1730, y: 340, w: 160, h: 20, type: "fireescape" },
      { x: 1990, y: 270, w: 190, h: 20, type: "roof" },
    ],
    charges: [
      { x: 250, y: 382 }, { x: 552, y: 314 }, { x: 760, y: 272 }, { x: 1012, y: 340 }, { x: 1540, y: 198 },
    ],
    civilians: [
      { x: 1240, y: 252, name: "Riley" },
      { x: 2050, y: 222, name: "Mrs. Vega" },
    ],
    enemies: [
      { x: 610, y: 486, type: "walker" },
      { x: 1120, y: 486, type: "walker" },
      { x: 1840, y: 306, type: "drone" },
    ],
  },
  {
    id: "train-yard",
    name: "Level 2: Freightline Sprint",
    chapter: "Story Mode",
    goal: "Cross the freight district and rescue 2 civilians.",
    story:
      "The city rumors start here. If Box Boy can cross the freight rooftops and bring people back, the neighborhood might stop laughing long enough to notice.",
    background: "freight-dawn",
    heroTarget: 6,
    civiliansTarget: 2,
    endX: 2600,
    platforms: [
      { x: 0, y: 520, w: 2800, h: 140, type: "ground" },
      { x: 160, y: 430, w: 210, h: 20, type: "container" },
      { x: 430, y: 350, w: 190, h: 20, type: "container" },
      { x: 700, y: 280, w: 180, h: 20, type: "crane" },
      { x: 1010, y: 390, w: 170, h: 20, type: "train" },
      { x: 1300, y: 320, w: 160, h: 20, type: "container" },
      { x: 1560, y: 250, w: 200, h: 20, type: "crane" },
      { x: 1890, y: 350, w: 190, h: 20, type: "container" },
      { x: 2210, y: 280, w: 220, h: 20, type: "train" },
    ],
    charges: [
      { x: 230, y: 382 }, { x: 500, y: 302 }, { x: 750, y: 230 }, { x: 1100, y: 340 }, { x: 1370, y: 272 }, { x: 2260, y: 230 },
    ],
    civilians: [
      { x: 1650, y: 202, name: "Dockworker Lee" },
      { x: 2350, y: 232, name: "Nadia" },
    ],
    enemies: [
      { x: 560, y: 486, type: "walker" },
      { x: 1160, y: 356, type: "drone" },
      { x: 1750, y: 486, type: "walker" },
      { x: 2050, y: 306, type: "drone" },
    ],
  },
  {
    id: "signal-bridge",
    name: "Boss 1: Signal Bridge",
    chapter: "Story Mode",
    goal: "Beat the Signal Warden.",
    story:
      "A fake hero-killer drone is locking down the bridge and broadcasting that Box Boy is a joke. He takes that personally.",
    background: "bridge-storm",
    heroTarget: 5,
    civiliansTarget: 1,
    endX: 1800,
    boss: {
      name: "Signal Warden",
      hp: 6,
      arenaStart: 1240,
      arenaEnd: 1760,
    },
    platforms: [
      { x: 0, y: 520, w: 1900, h: 140, type: "ground" },
      { x: 240, y: 390, w: 180, h: 20, type: "beam" },
      { x: 540, y: 330, w: 180, h: 20, type: "beam" },
      { x: 840, y: 280, w: 170, h: 20, type: "beam" },
      { x: 1150, y: 330, w: 160, h: 20, type: "beam" },
      { x: 1420, y: 240, w: 160, h: 20, type: "beam" },
    ],
    charges: [
      { x: 300, y: 342 }, { x: 600, y: 282 }, { x: 900, y: 232 }, { x: 1200, y: 282 }, { x: 1490, y: 192 },
    ],
    civilians: [{ x: 1320, y: 474, name: "Courier Pru" }],
    enemies: [
      { x: 680, y: 486, type: "walker" },
      { x: 980, y: 236, type: "drone" },
    ],
  },
  {
    id: "midtown-rise",
    name: "Level 4: Midtown Rise",
    chapter: "Story Mode",
    goal: "Climb the district towers and rescue 3 civilians.",
    story:
      "Now people are watching. Box Boy pushes higher into the city, trying to look like he meant to be up there the whole time.",
    background: "midtown-noon",
    heroTarget: 7,
    civiliansTarget: 3,
    endX: 3000,
    platforms: [
      { x: 0, y: 520, w: 3200, h: 140, type: "ground" },
      { x: 200, y: 430, w: 150, h: 20, type: "roof" },
      { x: 440, y: 370, w: 150, h: 20, type: "roof" },
      { x: 650, y: 310, w: 150, h: 20, type: "roof" },
      { x: 910, y: 250, w: 180, h: 20, type: "roof" },
      { x: 1220, y: 330, w: 160, h: 20, type: "roof" },
      { x: 1450, y: 260, w: 170, h: 20, type: "sign" },
      { x: 1710, y: 190, w: 160, h: 20, type: "roof" },
      { x: 1990, y: 310, w: 160, h: 20, type: "roof" },
      { x: 2230, y: 240, w: 150, h: 20, type: "roof" },
      { x: 2460, y: 170, w: 170, h: 20, type: "roof" },
      { x: 2720, y: 260, w: 190, h: 20, type: "roof" },
    ],
    charges: [
      { x: 250, y: 382 }, { x: 490, y: 322 }, { x: 700, y: 262 }, { x: 980, y: 202 }, { x: 1500, y: 212 }, { x: 1760, y: 142 }, { x: 2500, y: 122 },
    ],
    civilians: [
      { x: 1290, y: 282, name: "Theo" },
      { x: 2280, y: 192, name: "Ava" },
      { x: 2780, y: 212, name: "Mr. Ortega" },
    ],
    enemies: [
      { x: 570, y: 486, type: "walker" },
      { x: 1090, y: 486, type: "walker" },
      { x: 1600, y: 216, type: "drone" },
      { x: 2370, y: 196, type: "drone" },
    ],
  },
  {
    id: "skyline-arc",
    name: "Level 5: Skyline Arc",
    chapter: "Story Mode",
    goal: "Glide across the skyline and rescue 2 civilians.",
    story:
      "This is the part where a real superhero would fly. Box Boy cannot fly, but he can absolutely leap, glide, panic, and still make it look intentional.",
    background: "skyline-sunset",
    heroTarget: 6,
    civiliansTarget: 2,
    endX: 2920,
    platforms: [
      { x: 0, y: 520, w: 3100, h: 140, type: "ground" },
      { x: 180, y: 390, w: 150, h: 20, type: "roof" },
      { x: 420, y: 320, w: 130, h: 20, type: "roof" },
      { x: 690, y: 260, w: 150, h: 20, type: "roof" },
      { x: 1010, y: 180, w: 160, h: 20, type: "roof" },
      { x: 1380, y: 260, w: 170, h: 20, type: "roof" },
      { x: 1690, y: 200, w: 180, h: 20, type: "roof" },
      { x: 2030, y: 260, w: 170, h: 20, type: "roof" },
      { x: 2350, y: 180, w: 170, h: 20, type: "roof" },
      { x: 2640, y: 280, w: 180, h: 20, type: "roof" },
    ],
    charges: [
      { x: 240, y: 342 }, { x: 460, y: 272 }, { x: 750, y: 212 }, { x: 1070, y: 132 }, { x: 1760, y: 152 }, { x: 2410, y: 132 },
    ],
    civilians: [
      { x: 1420, y: 212, name: "Paramedic Sloane" },
      { x: 2720, y: 232, name: "Jay" },
    ],
    enemies: [
      { x: 820, y: 486, type: "walker" },
      { x: 1550, y: 216, type: "drone" },
      { x: 2200, y: 486, type: "walker" },
    ],
  },
  {
    id: "city-hall",
    name: "Level 6: City Hall Run",
    chapter: "Story Mode",
    goal: "Rescue 3 civilians and reach the summit doors.",
    story:
      "The final district is locked down. If Box Boy wants the city to believe in him, he has to show up where everyone can see it.",
    background: "civic-night",
    heroTarget: 7,
    civiliansTarget: 3,
    endX: 3200,
    platforms: [
      { x: 0, y: 520, w: 3400, h: 140, type: "ground" },
      { x: 170, y: 430, w: 190, h: 20, type: "steps" },
      { x: 470, y: 360, w: 160, h: 20, type: "steps" },
      { x: 760, y: 290, w: 170, h: 20, type: "steps" },
      { x: 1070, y: 220, w: 180, h: 20, type: "steps" },
      { x: 1420, y: 320, w: 180, h: 20, type: "ledge" },
      { x: 1700, y: 250, w: 160, h: 20, type: "ledge" },
      { x: 1960, y: 180, w: 180, h: 20, type: "ledge" },
      { x: 2280, y: 280, w: 180, h: 20, type: "ledge" },
      { x: 2580, y: 210, w: 180, h: 20, type: "ledge" },
      { x: 2870, y: 150, w: 170, h: 20, type: "ledge" },
    ],
    charges: [
      { x: 240, y: 382 }, { x: 520, y: 312 }, { x: 820, y: 242 }, { x: 1150, y: 172 }, { x: 1780, y: 202 }, { x: 2020, y: 132 }, { x: 2930, y: 102 },
    ],
    civilians: [
      { x: 1460, y: 272, name: "Captain Imani" },
      { x: 2340, y: 232, name: "Lucia" },
      { x: 2920, y: 102, name: "Mayor's Aide Ben" },
    ],
    enemies: [
      { x: 660, y: 486, type: "walker" },
      { x: 1250, y: 486, type: "walker" },
      { x: 1860, y: 206, type: "drone" },
      { x: 2700, y: 156, type: "drone" },
    ],
  },
  {
    id: "finale",
    name: "Final Boss: Vacuum Dragon",
    chapter: "Story Mode",
    goal: "Defeat the Vacuum Dragon and prove yourself.",
    story:
      "The machine tearing up downtown is loud, mean, and very real. Box Boy walks in anyway, armed with a cape, stubbornness, and gadgets nobody would insure.",
    background: "finale-red",
    heroTarget: 6,
    civiliansTarget: 1,
    endX: 2200,
    boss: {
      name: "Vacuum Dragon",
      hp: 8,
      arenaStart: 1380,
      arenaEnd: 2140,
    },
    platforms: [
      { x: 0, y: 520, w: 2400, h: 140, type: "ground" },
      { x: 250, y: 410, w: 180, h: 20, type: "roof" },
      { x: 550, y: 330, w: 180, h: 20, type: "roof" },
      { x: 860, y: 260, w: 180, h: 20, type: "roof" },
      { x: 1210, y: 310, w: 180, h: 20, type: "roof" },
      { x: 1540, y: 240, w: 180, h: 20, type: "roof" },
      { x: 1820, y: 190, w: 180, h: 20, type: "roof" },
    ],
    charges: [
      { x: 300, y: 362 }, { x: 610, y: 282 }, { x: 920, y: 212 }, { x: 1280, y: 262 }, { x: 1600, y: 192 }, { x: 1890, y: 142 },
    ],
    civilians: [{ x: 1460, y: 474, name: "Mara" }],
    enemies: [
      { x: 760, y: 486, type: "walker" },
      { x: 1100, y: 216, type: "drone" },
      { x: 1730, y: 146, type: "drone" },
    ],
  },
];

const state = {
  scene: scenes.title,
  sceneIndex: 0,
  levelIndex: 0,
  highestUnlockedLevel: 0,
  mapSelection: 0,
  level: null,
  player: null,
  enemies: [],
  civilians: [],
  charges: [],
  projectiles: [],
  boss: null,
  particles: [],
  cameraX: 0,
  message: "Press Enter to begin Story Mode.",
  totalRescues: 0,
  totalCharges: 0,
  storyCard: 0,
  transitionTimer: 0,
  lastTime: 0,
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function aabb(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function makePlayer() {
  return {
    x: 80,
    y: 440,
    w: 34,
    h: 52,
    vx: 0,
    vy: 0,
    facing: 1,
    onGround: false,
    hp: 5,
    invuln: 0,
    heroMeter: 0,
    gadgetReady: false,
    rescues: 0,
    charges: 0,
    glideTime: 0,
  };
}

function makeEnemy(base) {
  return {
    x: base.x,
    y: base.type === "drone" ? base.y || 280 : 470,
    w: base.type === "drone" ? 34 : 38,
    h: base.type === "drone" ? 26 : 36,
    type: base.type,
    vx: base.type === "drone" ? 0 : (Math.random() > 0.5 ? 1 : -1) * 70,
    baseY: base.type === "drone" ? base.y || 280 : 470,
    phase: rand(0, Math.PI * 2),
    hp: 1,
  };
}

function makeBoss(def) {
  return {
    name: def.name,
    x: def.arenaStart + 220,
    y: def.name === "Vacuum Dragon" ? 390 : 280,
    w: def.name === "Vacuum Dragon" ? 170 : 120,
    h: def.name === "Vacuum Dragon" ? 98 : 72,
    hp: def.hp,
    maxHp: def.hp,
    dir: 1,
    cooldown: 0,
    phase: 0,
  };
}

function spawnParticles(x, y, color, count) {
  for (let i = 0; i < count; i += 1) {
    state.particles.push({
      x,
      y,
      vx: rand(-180, 180),
      vy: rand(-200, 60),
      size: rand(2, 5),
      life: rand(0.4, 0.9),
      color,
    });
  }
}

function resetLevel(index) {
  const level = levels[index];
  state.levelIndex = index;
  state.level = level;
  state.player = makePlayer();
  state.enemies = level.enemies.map(makeEnemy);
  state.civilians = level.civilians.map((civ) => ({ ...civ, rescued: false, w: 24, h: 36 }));
  state.charges = level.charges.map((charge) => ({ ...charge, taken: false, r: 10, bob: rand(0, Math.PI * 2) }));
  state.projectiles = [];
  state.boss = level.boss ? makeBoss(level.boss) : null;
  state.particles = [];
  state.cameraX = 0;
  state.message = level.story;
  state.transitionTimer = 2.8;
}

function setScene(scene) {
  state.scene = scene;
}

function advanceLevel() {
  state.highestUnlockedLevel = Math.max(state.highestUnlockedLevel, Math.min(levels.length - 1, state.levelIndex + 1));
  if (state.levelIndex + 1 >= levels.length) {
    setScene(scenes.win);
    state.message = "The city finally sees him. Box Boy did not get powers. He got proof.";
    return;
  }

  resetLevel(state.levelIndex + 1);
  setScene(scenes.story);
  state.storyCard = Math.min(storyBeats.length - 1, Math.floor((state.levelIndex + 1) / 2));
}

function startStoryMode() {
  state.totalRescues = 0;
  state.totalCharges = 0;
  state.highestUnlockedLevel = Math.max(state.highestUnlockedLevel, 0);
  resetLevel(0);
  setScene(scenes.story);
  state.storyCard = 0;
}

function getWorldWidth() {
  return state.level.endX + 320;
}

function getPlatforms() {
  return state.level.platforms;
}

function getPriorityText() {
  const player = state.player;
  if (!player) return state.message;

  if (player.charges < state.level.heroTarget) {
    return `Collect hero charge: ${player.charges}/${state.level.heroTarget}`;
  }
  if (player.rescues < state.level.civiliansTarget) {
    return `Rescue civilians: ${player.rescues}/${state.level.civiliansTarget}`;
  }
  if (state.boss) {
    return player.gadgetReady ? "Press F near the boss for Gadget Burst." : "Fill the hero meter, then use Gadget Burst on the boss.";
  }
  return "Reach the beacon at the end of the level.";
}

function updatePlayer(dt) {
  const player = state.player;
  const left = keys.has("ArrowLeft") || keys.has("KeyA");
  const right = keys.has("ArrowRight") || keys.has("KeyD");
  const move = (right ? 1 : 0) - (left ? 1 : 0);

  player.vx = move * MOVE_SPEED;
  if (move !== 0) player.facing = Math.sign(move);

  const holdingJump = keys.has("Space") || keys.has("KeyW") || keys.has("ArrowUp");
  const gliding = !player.onGround && player.vy > 0 && holdingJump;

  player.vy += (gliding ? GLIDE_GRAVITY : GRAVITY) * dt;
  if (gliding) {
    player.glideTime += dt;
    player.vy = Math.min(player.vy, GLIDE_FALL_SPEED);
  } else {
    player.glideTime = 0;
  }

  player.x += player.vx * dt;
  resolveHorizontal(player);
  player.y += player.vy * dt;
  resolveVertical(player);

  player.x = clamp(player.x, 0, getWorldWidth() - player.w);
  if (player.y > 760) {
    state.scene = scenes.gameOver;
    state.message = "Box Boy fell out of the route. Press Enter to try the level again.";
  }

  player.invuln = Math.max(0, player.invuln - dt);
}

function resolveHorizontal(player) {
  for (const platform of getPlatforms()) {
    if (!aabb(player.x, player.y, player.w, player.h, platform.x, platform.y, platform.w, platform.h)) continue;
    if (player.vx > 0) player.x = platform.x - player.w;
    if (player.vx < 0) player.x = platform.x + platform.w;
  }
}

function resolveVertical(player) {
  player.onGround = false;
  for (const platform of getPlatforms()) {
    if (!aabb(player.x, player.y, player.w, player.h, platform.x, platform.y, platform.w, platform.h)) continue;
    if (player.vy > 0) {
      player.y = platform.y - player.h;
      player.vy = 0;
      player.onGround = true;
    } else if (player.vy < 0) {
      player.y = platform.y + platform.h;
      player.vy = 0;
    }
  }
}

function collectCharge(charge) {
  charge.taken = true;
  state.player.charges += 1;
  state.totalCharges += 1;
  state.player.heroMeter = clamp(state.player.heroMeter + 20, 0, 100);
  state.player.gadgetReady = state.player.heroMeter >= 100;
  state.message = state.player.gadgetReady ? "Hero meter full. Gadget Burst is ready." : "Hero charge collected.";
  spawnParticles(charge.x, charge.y, "#ffe27e", 14);
}

function rescueCivilian(civ) {
  civ.rescued = true;
  state.player.rescues += 1;
  state.totalRescues += 1;
  state.player.heroMeter = clamp(state.player.heroMeter + 18, 0, 100);
  state.player.gadgetReady = state.player.heroMeter >= 100;
  state.message = `${civ.name} is safe. The city is starting to notice.`;
  spawnParticles(civ.x, civ.y, "#8be7b3", 18);
}

function damagePlayer(sourceX) {
  const player = state.player;
  if (player.invuln > 0) return;
  player.hp -= 1;
  player.invuln = 1;
  player.vx = sourceX < player.x ? 240 : -240;
  player.vy = -260;
  state.message = "That gadget definitely did not protect him.";
  spawnParticles(player.x + player.w / 2, player.y + player.h / 2, "#ff8f8f", 14);
  if (player.hp <= 0) {
    setScene(scenes.gameOver);
    state.message = "Box Boy is down. Press Enter to try the level again.";
  }
}

function triggerGadgetBurst() {
  const player = state.player;
  if (!player.gadgetReady) return;

  player.gadgetReady = false;
  player.heroMeter = 0;
  state.message = "Gadget Burst somehow works.";
  spawnParticles(player.x + 18, player.y + 24, "#7fd2ff", 30);

  for (const enemy of state.enemies) {
    const dx = Math.abs((enemy.x + enemy.w / 2) - (player.x + player.w / 2));
    const dy = Math.abs((enemy.y + enemy.h / 2) - (player.y + player.h / 2));
    if (dx < 180 && dy < 120) {
      enemy.hp = 0;
      spawnParticles(enemy.x, enemy.y, "#ffcf7e", 12);
    }
  }

  if (state.boss) {
    const boss = state.boss;
    const dx = Math.abs((boss.x + boss.w / 2) - (player.x + player.w / 2));
    const dy = Math.abs((boss.y + boss.h / 2) - (player.y + player.h / 2));
    if (dx < 220 && dy < 180) {
      boss.hp -= 2;
      state.message = boss.hp <= 0 ? `${boss.name} is finished.` : `${boss.name} took a direct Gadget Burst.`;
      spawnParticles(boss.x + boss.w / 2, boss.y + boss.h / 2, "#ff9a6e", 18);
    }
  }
}

function updateChargesAndCivilians(dt) {
  for (const charge of state.charges) {
    charge.bob += dt * 3;
    if (!charge.taken && aabb(state.player.x, state.player.y, state.player.w, state.player.h, charge.x - 10, charge.y - 10, 20, 20)) {
      collectCharge(charge);
    }
  }

  for (const civ of state.civilians) {
    if (!civ.rescued && aabb(state.player.x, state.player.y, state.player.w, state.player.h, civ.x, civ.y, civ.w, civ.h)) {
      rescueCivilian(civ);
    }
  }
}

function updateEnemies(dt) {
  for (const enemy of state.enemies) {
    if (enemy.hp <= 0) continue;
    if (enemy.type === "walker") {
      enemy.x += enemy.vx * dt;
      const nextBox = { x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h };
      let supported = false;
      for (const platform of getPlatforms()) {
        const feetY = enemy.y + enemy.h + 4;
        if (enemy.x + enemy.w > platform.x && enemy.x < platform.x + platform.w && Math.abs(feetY - platform.y) < 10) {
          supported = true;
        }
        if (aabb(nextBox.x, nextBox.y, nextBox.w, nextBox.h, platform.x, platform.y, platform.w, platform.h)) {
          enemy.vx *= -1;
        }
      }
      if (!supported) enemy.vx *= -1;
    } else {
      enemy.phase += dt * 2.4;
      enemy.x += Math.cos(enemy.phase) * 36 * dt;
      enemy.y = enemy.baseY + Math.sin(enemy.phase * 1.7) * 18;
    }

    if (aabb(state.player.x, state.player.y, state.player.w, state.player.h, enemy.x, enemy.y, enemy.w, enemy.h)) {
      damagePlayer(enemy.x);
    }
  }

  state.enemies = state.enemies.filter((enemy) => enemy.hp > 0);
}

function spawnProjectile(x, y, vx, vy, color) {
  state.projectiles.push({ x, y, vx, vy, w: 14, h: 14, color, life: 4 });
}

function updateBoss(dt) {
  if (!state.boss) return;
  const boss = state.boss;
  boss.cooldown -= dt;
  boss.phase += dt;

  if (boss.name === "Signal Warden") {
    boss.x += Math.cos(boss.phase) * 70 * dt;
    boss.y = 220 + Math.sin(boss.phase * 1.7) * 48;
    if (boss.cooldown <= 0) {
      boss.cooldown = 1.2;
      const dx = (state.player.x - boss.x) * 0.9;
      spawnProjectile(boss.x + boss.w / 2, boss.y + boss.h / 2, clamp(dx, -240, 240), 120, "#8ac6ff");
    }
  } else {
    boss.x += boss.dir * 86 * dt;
    if (boss.x < state.level.boss.arenaStart + 40 || boss.x + boss.w > state.level.boss.arenaEnd - 40) {
      boss.dir *= -1;
    }
    if (boss.cooldown <= 0) {
      boss.cooldown = 1.55;
      spawnProjectile(boss.x + 30, boss.y + 48, -180, 0, "#ff9f70");
      spawnProjectile(boss.x + 120, boss.y + 48, -90, -60, "#ffcf7e");
    }
  }

  if (aabb(state.player.x, state.player.y, state.player.w, state.player.h, boss.x, boss.y, boss.w, boss.h)) {
    damagePlayer(boss.x);
  }

  if (boss.hp <= 0) {
    state.boss = null;
  }
}

function updateProjectiles(dt) {
  for (const projectile of state.projectiles) {
    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;
    projectile.vy += 240 * dt;
    projectile.life -= dt;

    if (aabb(state.player.x, state.player.y, state.player.w, state.player.h, projectile.x, projectile.y, projectile.w, projectile.h)) {
      damagePlayer(projectile.x);
      projectile.life = 0;
    }

    for (const platform of getPlatforms()) {
      if (aabb(projectile.x, projectile.y, projectile.w, projectile.h, platform.x, platform.y, platform.w, platform.h)) {
        projectile.life = 0;
      }
    }
  }

  state.projectiles = state.projectiles.filter((projectile) => projectile.life > 0);
}

function updateParticles(dt) {
  for (const particle of state.particles) {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += 340 * dt;
    particle.life -= dt;
  }
  state.particles = state.particles.filter((particle) => particle.life > 0);
}

function updateCamera() {
  const focus = state.player.x + state.player.w / 2 - WIDTH / 2;
  state.cameraX = clamp(focus, 0, Math.max(0, getWorldWidth() - WIDTH));
}

function checkLevelCompletion() {
  const player = state.player;
  const readyForExit = player.charges >= state.level.heroTarget && player.rescues >= state.level.civiliansTarget && !state.boss;
  if (readyForExit && player.x > state.level.endX) {
    state.scene = scenes.levelClear;
    state.message = `${state.level.name} cleared.`;
  }
}

function updateGame(dt) {
  if (state.transitionTimer > 0) state.transitionTimer -= dt;
  updatePlayer(dt);
  updateChargesAndCivilians(dt);
  updateEnemies(dt);
  updateBoss(dt);
  updateProjectiles(dt);
  updateParticles(dt);
  updateCamera();
  checkLevelCompletion();
}

function drawWrappedText(text, x, y, maxWidth, lineHeight, color = null) {
  const paragraphs = String(text).split("\n");
  let cy = y;
  if (color) ctx.fillStyle = color;
  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    let line = "";
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width > maxWidth && line) {
        ctx.fillText(line, x, cy);
        cy += lineHeight;
        line = word;
      } else {
        line = next;
      }
    }
    if (line) {
      ctx.fillText(line, x, cy);
      cy += lineHeight;
    }
    if (!words.length) {
      cy += lineHeight;
    }
  }
  return cy;
}

function drawButton(x, y, w, h, label, font = "700 18px Trebuchet MS") {
  drawPanel(x, y, w, h, "rgba(255,220,118,0.96)");
  ctx.fillStyle = "#17345f";
  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x + w / 2, y + h / 2 + 1);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

function worldToScreen(x) {
  return x - state.cameraX;
}

function drawParallax(background) {
  const palettes = {
    "market-night": {
      skyTop: "#10203c", skyBottom: "#2d4f7f", glow: "#ffcf78", far: "#182b46", mid: "#254264", near: "#345a83",
    },
    "freight-dawn": {
      skyTop: "#6a7fd8", skyBottom: "#f4b282", glow: "#ffd9a6", far: "#48506f", mid: "#646f8c", near: "#7986a5",
    },
    "bridge-storm": {
      skyTop: "#1f253b", skyBottom: "#5c6693", glow: "#dce7ff", far: "#1e2536", mid: "#2c3952", near: "#3f516f",
    },
    "midtown-noon": {
      skyTop: "#82bfff", skyBottom: "#f6fbff", glow: "#ffffff", far: "#98b3d6", mid: "#6f91bc", near: "#5576a2",
    },
    "skyline-sunset": {
      skyTop: "#f28b67", skyBottom: "#5f79d6", glow: "#ffd59f", far: "#523863", mid: "#624c7c", near: "#7a6194",
    },
    "civic-night": {
      skyTop: "#112143", skyBottom: "#3757a4", glow: "#ffe083", far: "#1d2b4b", mid: "#26395c", near: "#345076",
    },
    "finale-red": {
      skyTop: "#3f1120", skyBottom: "#e46953", glow: "#ffd998", far: "#35131d", mid: "#4e1f2f", near: "#6d3145",
    },
  };

  const palette = palettes[background];
  const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  sky.addColorStop(0, palette.skyTop);
  sky.addColorStop(1, palette.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = palette.glow;
  ctx.beginPath();
  ctx.arc(WIDTH - 160, 86, 38, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.06)";
  for (let gx = 0; gx < WIDTH; gx += 8) ctx.fillRect(gx, 0, 1, HEIGHT);
  for (let gy = 0; gy < HEIGHT; gy += 8) ctx.fillRect(0, gy, WIDTH, 1);

  const layers = [
    { color: palette.far, speed: 0.2, height: 230, base: 280, detail: "#ffffff10" },
    { color: palette.mid, speed: 0.45, height: 290, base: 330, detail: "#ffffff18" },
    { color: palette.near, speed: 0.7, height: 360, base: 390, detail: "#ffffff22" },
  ];

  for (const layer of layers) {
    ctx.fillStyle = layer.color;
    for (let i = -1; i < 14; i += 1) {
      const width = 88 + ((i * 37) % 90);
      const height = layer.height - ((i * 53) % 120);
      const x = (i * 160) - ((state.cameraX * layer.speed) % 160);
      const y = layer.base - height;
      ctx.fillRect(x, y, width, height);
      ctx.fillStyle = "rgba(255, 241, 181, 0.18)";
      for (let wy = y + 12; wy < y + height - 10; wy += 18) {
        for (let wx = x + 10; wx < x + width - 12; wx += 18) {
          if (((wx + wy) / 18) % 3 < 1) ctx.fillRect(wx, wy, 8, 10);
        }
      }
      ctx.fillStyle = layer.detail;
      for (let sy = y + 8; sy < y + height; sy += 16) {
        ctx.fillRect(x, sy, width, 1);
      }
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      for (let wx = x + 6; wx < x + width; wx += 16) {
        ctx.fillRect(wx, y, 1, height);
      }
      if (i % 3 === 0) {
        ctx.fillStyle = "rgba(255,220,140,0.10)";
        ctx.fillRect(x + width - 18, y - 34, 6, 34);
        ctx.fillRect(x + width - 24, y - 30, 18, 4);
      }
      ctx.fillStyle = layer.color;
    }
  }

  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 154);
  ctx.bezierCurveTo(220, 122, 360, 204, 560, 168);
  ctx.bezierCurveTo(720, 140, 820, 190, WIDTH, 152);
  ctx.stroke();
}

function drawPlatform(platform) {
  const x = worldToScreen(platform.x);
  const colors = {
    ground: ["#353740", "#1f2026"],
    roof: ["#d8dde8", "#8d96a8"],
    sign: ["#7de4ff", "#2b628d"],
    ac: ["#bcc7d9", "#7a8498"],
    fireescape: ["#f3c77d", "#855f27"],
    container: ["#cb6b5b", "#7d332a"],
    crane: ["#f2bf58", "#906a23"],
    train: ["#6889b6", "#385274"],
    beam: ["#9bc9ff", "#436392"],
    steps: ["#d5d0c3", "#8b7f6a"],
    ledge: ["#c7ceda", "#778093"],
  };
  const [top, bottom] = colors[platform.type] || colors.roof;
  ctx.fillStyle = "rgba(0,0,0,0.16)";
  ctx.fillRect(x + 6, platform.y + platform.h - 2, platform.w - 8, 12);
  ctx.fillStyle = top;
  ctx.fillRect(x, platform.y, platform.w, platform.h);
  ctx.fillStyle = bottom;
  ctx.fillRect(x, platform.y + platform.h - 6, platform.w, 6);
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  for (let px = 4; px < platform.w - 2; px += 16) {
    ctx.fillRect(x + px, platform.y + 4, 8, 2);
  }
}

function drawCharge(charge) {
  const x = worldToScreen(charge.x);
  const y = charge.y + Math.sin(charge.bob) * 6;
  ctx.fillStyle = "rgba(255, 235, 152, 0.22)";
  ctx.beginPath();
  ctx.arc(x, y, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffe483";
  ctx.beginPath();
  ctx.moveTo(x, y - 12);
  ctx.lineTo(x + 8, y + 2);
  ctx.lineTo(x + 2, y + 2);
  ctx.lineTo(x + 12, y + 14);
  ctx.lineTo(x - 8, y);
  ctx.lineTo(x - 2, y);
  ctx.closePath();
  ctx.fill();
}

function drawCivilian(civ) {
  const x = worldToScreen(civ.x);
  ctx.fillStyle = "rgba(141, 235, 175, 0.18)";
  ctx.beginPath();
  ctx.arc(x + 13, civ.y + 16, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f3f6ff";
  ctx.fillRect(x + 8, civ.y + 10, 10, 20);
  ctx.fillStyle = "#e3b282";
  ctx.beginPath();
  ctx.arc(x + 13, civ.y + 8, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(131, 231, 173, 0.26)";
  ctx.beginPath();
  ctx.arc(x + 13, civ.y + 14, 26, 0, Math.PI * 2);
  ctx.fill();
}

function drawEnemy(enemy) {
  const x = worldToScreen(enemy.x);
  const palette = enemy.type === "walker"
    ? (Math.floor(enemy.x / 200) % 2 === 0
      ? { body: "#613543", accent: "#ffdd78", visor: "#2a1018", title: "Bandit" }
      : { body: "#243055", accent: "#7ee1ff", visor: "#12182e", title: "Henchman" })
    : { body: "#7cbef2", accent: "#f84f76", visor: "#24486f", title: "Scout Drone" };
  if (enemy.type === "walker") {
    ctx.fillStyle = "rgba(0,0,0,0.16)";
    ctx.fillRect(x + 6, enemy.y + enemy.h + 6, 24, 6);
    ctx.fillStyle = palette.body;
    ctx.fillRect(x + 4, enemy.y, enemy.w - 8, enemy.h);
    ctx.fillStyle = "#ffd8bf";
    ctx.fillRect(x + 10, enemy.y - 12, 18, 16);
    ctx.fillStyle = palette.accent;
    ctx.fillRect(x + 8, enemy.y + 8, 22, 6);
    ctx.fillStyle = palette.visor;
    ctx.fillRect(x + 8, enemy.y + 18, 22, 10);
    ctx.fillStyle = "#20121a";
    ctx.fillRect(x + 8, enemy.y + enemy.h, 7, 10);
    ctx.fillRect(x + 21, enemy.y + enemy.h, 7, 10);
    ctx.fillStyle = palette.accent;
    ctx.fillRect(x + 1, enemy.y + 18, 4, 14);
    ctx.fillRect(x + enemy.w - 5, enemy.y + 18, 4, 14);
  } else {
    ctx.fillStyle = "rgba(0,0,0,0.14)";
    ctx.fillRect(x + 6, enemy.y + enemy.h + 4, 24, 5);
    ctx.fillStyle = palette.body;
    ctx.beginPath();
    ctx.roundRect(x, enemy.y, enemy.w, enemy.h, 10);
    ctx.fill();
    ctx.fillStyle = palette.visor;
    ctx.fillRect(x + 7, enemy.y + 8, 20, 10);
    ctx.fillStyle = palette.accent;
    ctx.fillRect(x + 4, enemy.y + 4, 6, 18);
    ctx.fillRect(x + 24, enemy.y + 4, 6, 18);
    ctx.fillStyle = "#d8f0ff";
    ctx.fillRect(x + 10, enemy.y + 10, 14, 4);
  }
}

function drawBoss(boss) {
  const x = worldToScreen(boss.x);
  if (boss.name === "Vacuum Dragon") {
    ctx.fillStyle = "#8a8e9f";
    ctx.beginPath();
    ctx.roundRect(x, boss.y, boss.w, boss.h, 26);
    ctx.fill();
    ctx.strokeStyle = "#5a6070";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(x + boss.w - 16, boss.y + boss.h - 14);
    ctx.bezierCurveTo(x + boss.w + 60, boss.y + 30, x + boss.w + 100, boss.y + 120, x + boss.w + 132, boss.y + 90);
    ctx.stroke();
    ctx.fillStyle = "#ffcc8c";
    ctx.fillRect(x + 26, boss.y + 26, 22, 18);
    ctx.fillRect(x + 72, boss.y + 26, 22, 18);
  } else {
    ctx.fillStyle = "#5d8ad1";
    ctx.beginPath();
    ctx.roundRect(x, boss.y, boss.w, boss.h, 20);
    ctx.fill();
    ctx.fillStyle = "#d8f0ff";
    ctx.fillRect(x + 18, boss.y + 16, 24, 12);
    ctx.fillRect(x + 68, boss.y + 16, 24, 12);
  }
}

function drawProjectile(projectile) {
  const x = worldToScreen(projectile.x);
  ctx.fillStyle = projectile.color;
  ctx.beginPath();
  ctx.arc(x + projectile.w / 2, projectile.y + projectile.h / 2, projectile.w / 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlayer() {
  const player = state.player;
  const x = worldToScreen(player.x);
  ctx.save();
  if (player.invuln > 0 && Math.floor(player.invuln * 10) % 2 === 0) ctx.globalAlpha = 0.45;

  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(x + 18, player.y + player.h + 10, 18, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  const capeWidth = player.glideTime > 0 ? 54 : 36;
  const capeDrop = player.glideTime > 0 ? 8 : 18;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + 16, player.y + 16);
  ctx.lineTo(x - (capeWidth * player.facing), player.y + capeDrop);
  ctx.lineTo(x - (capeWidth * player.facing) + 12 * player.facing, player.y + 48);
  ctx.lineTo(x + 18, player.y + 38);
  ctx.closePath();
  ctx.clip();
  for (let cy = 0; cy < 40; cy += 8) {
    for (let cx = 0; cx < capeWidth; cx += 8) {
      ctx.fillStyle = ((cx + cy) / 8) % 2 === 0 ? "#63b7ff" : "#f5fbff";
      const drawX = player.facing === 1 ? x - cx : x + cx - capeWidth + 10;
      ctx.fillRect(drawX, player.y + 10 + cy, 8, 8);
    }
  }
  ctx.restore();

  ctx.fillStyle = "#c6925a";
  ctx.fillRect(x + 4, player.y, 28, 24);
  ctx.strokeStyle = "#7d552f";
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 4, player.y, 28, 24);
  ctx.beginPath();
  ctx.moveTo(x + 18, player.y);
  ctx.lineTo(x + 18, player.y + 24);
  ctx.moveTo(x + 4, player.y + 12);
  ctx.lineTo(x + 32, player.y + 12);
  ctx.stroke();

  ctx.fillStyle = "#e5b384";
  ctx.beginPath();
  ctx.arc(x + 18, player.y + 32, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1f2d4d";
  ctx.fillRect(x + 7, player.y + 42, 22, 18);

  ctx.fillStyle = "#c6925a";
  ctx.fillRect(x - 8, player.y + 40, 10, 10);
  ctx.fillRect(x + 34, player.y + 40, 10, 10);
  ctx.fillRect(x + 8, player.y + 60, 8, 12);
  ctx.fillRect(x + 20, player.y + 60, 8, 12);
  ctx.restore();
}

function drawParticles() {
  for (const particle of state.particles) {
    ctx.globalAlpha = particle.life;
    ctx.fillStyle = particle.color;
    ctx.fillRect(worldToScreen(particle.x), particle.y, particle.size, particle.size);
  }
  ctx.globalAlpha = 1;
}

function drawEndBeacon() {
  const x = worldToScreen(state.level.endX);
  ctx.fillStyle = "rgba(255,255,255,0.14)";
  ctx.fillRect(x - 10, 120, 20, 400);
  ctx.fillStyle = "#ffd86b";
  ctx.beginPath();
  ctx.arc(x, 138, 14, 0, Math.PI * 2);
  ctx.fill();
}

function drawOnScreenPrompt() {
  drawPanel(18, 18, 390, 98, "rgba(255,255,255,0.76)");
  ctx.fillStyle = "#17345f";
  ctx.font = "700 20px Trebuchet MS";
  ctx.fillText(state.level.name, 34, 46);
  ctx.font = "14px Trebuchet MS";
  drawWrappedText(getPriorityText(), 34, 72, 340, 16, "#17345f");

  if (state.boss) {
    drawPanel(632, 20, 278, 28, "rgba(255,255,255,0.82)");
    ctx.fillStyle = "#ff936e";
    ctx.fillRect(638, 26, (state.boss.hp / state.boss.maxHp) * 266, 16);
    ctx.fillStyle = "#17345f";
    ctx.font = "700 12px Trebuchet MS";
    ctx.fillText(state.boss.name.toUpperCase(), 644, 40);
  }

  if (state.player.gadgetReady) {
    drawPanel(384, 18, 216, 32, "rgba(255, 220, 118, 0.96)");
    ctx.fillStyle = "#17345f";
    ctx.font = "700 14px Trebuchet MS";
    ctx.fillText("GADGET BURST READY", 418, 39);
  }
}

function drawObjectiveArrow() {
  let targetX = null;
  let targetY = null;
  let label = "";
  if (state.player.charges < state.level.heroTarget) {
    const next = state.charges.find((charge) => !charge.taken);
    if (next) {
      targetX = next.x;
      targetY = next.y;
      label = "Hero Charge";
    }
  } else if (state.player.rescues < state.level.civiliansTarget) {
    const next = state.civilians.find((civ) => !civ.rescued);
    if (next) {
      targetX = next.x + 12;
      targetY = next.y;
      label = "Civilian";
    }
  } else if (state.boss) {
    targetX = state.boss.x + state.boss.w / 2;
    targetY = state.boss.y;
    label = state.boss.name;
  } else {
    targetX = state.level.endX;
    targetY = 150;
    label = "Finish";
  }

  if (targetX === null) return;
  const screenX = clamp(worldToScreen(targetX), 90, WIDTH - 90);
  const bob = Math.sin(state.lastTime * 0.008) * 5;
  ctx.fillStyle = state.boss ? "#ff8d72" : label === "Civilian" ? "#90ebaf" : "#ffe480";
  ctx.beginPath();
  ctx.moveTo(screenX, 110 + bob);
  ctx.lineTo(screenX - 14, 90 + bob);
  ctx.lineTo(screenX + 14, 90 + bob);
  ctx.closePath();
  ctx.fill();
  drawPanel(screenX - 54, 54 + bob, 108, 24, "rgba(20,35,61,0.86)");
  ctx.fillStyle = "#f6fbff";
  ctx.font = "700 12px Trebuchet MS";
  ctx.textAlign = "center";
  ctx.fillText(label, screenX, 70 + bob);
  ctx.textAlign = "left";
}

function drawPanel(x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(x + 18, y);
  ctx.arcTo(x + w, y, x + w, y + h, 18);
  ctx.arcTo(x + w, y + h, x, y + h, 18);
  ctx.arcTo(x, y + h, x, y, 18);
  ctx.arcTo(x, y, x + w, y, 18);
  ctx.closePath();
  ctx.fill();
}

function drawGame() {
  drawParallax(state.level.background);
  for (const platform of getPlatforms()) drawPlatform(platform);
  drawEndBeacon();
  for (const charge of state.charges) if (!charge.taken) drawCharge(charge);
  for (const civ of state.civilians) if (!civ.rescued) drawCivilian(civ);
  for (const enemy of state.enemies) drawEnemy(enemy);
  for (const projectile of state.projectiles) drawProjectile(projectile);
  if (state.boss) drawBoss(state.boss);
  drawObjectiveArrow();
  drawPlayer();
  drawParticles();
  drawOnScreenPrompt();

  if (state.transitionTimer > 0) {
    ctx.globalAlpha = clamp(state.transitionTimer / 2.8, 0, 1);
    drawPanel(170, 392, 620, 104, "rgba(16,29,54,0.88)");
    ctx.fillStyle = "#fff0bd";
    ctx.font = "700 16px Trebuchet MS";
    ctx.fillText(state.level.chapter, 204, 438);
    ctx.fillStyle = "#edf6ff";
    ctx.font = "14px Trebuchet MS";
    drawWrappedText(state.level.story, 204, 462, 548, 16, "#edf6ff");
    ctx.globalAlpha = 1;
  }
}

function drawStoryCard() {
  drawParallax(levels[Math.min(state.levelIndex, levels.length - 1)].background);
  drawPanel(112, 78, 736, 340, "rgba(255,255,255,0.82)");
  ctx.fillStyle = "#17345f";
  ctx.font = "800 42px Trebuchet MS";
  drawWrappedText(storyBeats[state.storyCard].title, 154, 142, 640, 42, "#17345f");
  ctx.font = "18px Trebuchet MS";
  let cy = drawWrappedText(storyBeats[state.storyCard].body, 154, 212, 640, 24, "#17345f");
  cy += 18;
  drawWrappedText(state.level.story, 154, cy, 640, 24, "#17345f");
  drawButton(248, 440, 464, 48, "PRESS ENTER TO PLAY THE NEXT LEVEL", "700 18px Trebuchet MS");
}

function drawTitle() {
  drawParallax("skyline-sunset");
  drawPanel(138, 84, 694, 336, "rgba(255,255,255,0.82)");
  ctx.fillStyle = "#17345f";
  ctx.font = "800 52px Trebuchet MS";
  ctx.fillText("BOX BOY", 352, 152);
  ctx.font = "800 28px Trebuchet MS";
  ctx.fillText("Story Mode Platformer", 330, 190);
  ctx.font = "18px Trebuchet MS";
  drawWrappedText("A 2D city platformer about a powerless hero trying to earn his place.", 188, 242, 598, 24, "#17345f");
  drawWrappedText("Run, jump, glide with the cape, rescue civilians, charge the gadgets, and beat the bosses.", 154, 280, 632, 24, "#17345f");
  drawWrappedText("Controls: move with WASD or arrows, jump with Space, glide by holding Space, Gadget Burst with F. Press Escape anytime to open the city map.", 146, 320, 644, 22, "#17345f");
  drawButton(322, 448, 314, 48, "PRESS ENTER TO START", "700 20px Trebuchet MS");
}

function drawStatusScreen(title, body) {
  drawParallax("civic-night");
  drawPanel(190, 140, 580, 240, "rgba(255,247,220,0.94)");
  ctx.fillStyle = "#17345f";
  ctx.font = "800 34px Trebuchet MS";
  ctx.textAlign = "center";
  ctx.fillText(title, 480, 212);
  ctx.textAlign = "left";
  ctx.font = "18px Trebuchet MS";
  const cy = drawWrappedText(body, 236, 256, 490, 24, "#17345f");
  ctx.fillText(`Total rescues: ${state.totalRescues}`, 236, cy + 10);
  ctx.fillText(`Hero charges: ${state.totalCharges}`, 236, cy + 38);
  ctx.fillText("Press Enter to continue.", 236, cy + 68);
}

function drawMapScreen() {
  drawParallax("civic-night");
  drawPanel(54, 42, 852, 456, "rgba(255,255,255,0.82)");
  ctx.fillStyle = "#17345f";
  ctx.font = "800 42px Trebuchet MS";
  ctx.fillText("City Map", 92, 98);
  ctx.font = "16px Trebuchet MS";
  drawWrappedText("Choose a level. Locked stages open after you clear the previous one. Press Enter to play. Press Escape to leave the map.", 92, 128, 780, 22, "#17345f");

  const nodes = [
    { x: 130, y: 300 }, { x: 220, y: 236 }, { x: 330, y: 180 }, { x: 468, y: 222 },
    { x: 574, y: 162 }, { x: 700, y: 228 }, { x: 802, y: 146 },
  ];

  ctx.strokeStyle = "#4b6da5";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(nodes[0].x, nodes[0].y);
  for (let i = 1; i < nodes.length; i += 1) ctx.lineTo(nodes[i].x, nodes[i].y);
  ctx.stroke();

  for (let i = 0; i < levels.length; i += 1) {
    const node = nodes[i];
    const unlocked = i <= state.highestUnlockedLevel;
    const selected = i === state.mapSelection;
    ctx.fillStyle = unlocked ? (selected ? "#ffd86b" : "#7ec3ff") : "#8190a6";
    ctx.beginPath();
    ctx.arc(node.x, node.y, selected ? 19 : 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = unlocked ? "#17345f" : "#dce4f1";
    ctx.font = "700 12px Trebuchet MS";
    ctx.textAlign = "center";
    ctx.fillText(String(i + 1), node.x, node.y + 4);
    ctx.textAlign = "left";
    drawPanel(node.x - 64, node.y + 28, 156, 54, unlocked ? "rgba(20,35,61,0.88)" : "rgba(70,79,98,0.88)");
    ctx.fillStyle = "#f4f8ff";
    ctx.font = "700 12px Trebuchet MS";
    drawWrappedText(unlocked ? levels[i].name : "LOCKED", node.x - 54, node.y + 48, 136, 15, "#f4f8ff");
  }

  const current = levels[state.mapSelection];
  drawPanel(76, 352, 360, 118, "rgba(20,35,61,0.90)");
  ctx.fillStyle = "#fff1b8";
  ctx.font = "700 18px Trebuchet MS";
  ctx.fillText(current.name, 96, 382);
  ctx.font = "14px Trebuchet MS";
  drawWrappedText(current.goal, 96, 408, 320, 18, "#edf6ff");
  ctx.fillStyle = "#8fd6ff";
  ctx.fillText(state.mapSelection <= state.highestUnlockedLevel ? "Status: Unlocked" : "Status: Locked", 96, 458);
}

function renderScene() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  if (state.scene === scenes.title) {
    drawTitle();
  } else if (state.scene === scenes.map) {
    drawMapScreen();
  } else if (state.scene === scenes.story) {
    drawStoryCard();
  } else if (state.scene === scenes.playing) {
    drawGame();
  } else if (state.scene === scenes.levelClear) {
    drawStatusScreen("Level Clear", `${state.level.name} is complete. Box Boy keeps climbing.`);
  } else if (state.scene === scenes.gameOver) {
    drawStatusScreen("Mission Failed", state.message);
  } else if (state.scene === scenes.win) {
    drawStatusScreen("Story Complete", state.message);
  }
}

function renderHud() {
  if (state.scene === scenes.title) {
    hud.innerHTML = `
      <div class="stat"><span class="label">Mode</span><span class="value">Story Mode</span></div>
      <div class="stat"><span class="label">Genre</span><span class="value">2D Platformer</span></div>
      <div class="stat"><span class="label">Setting</span><span class="value">Detailed city skyline</span></div>
      <div class="stat"><span class="label">Promise</span><span class="value">No powers. Still heroic.</span></div>
    `;
    return;
  }

  if (state.scene === scenes.map) {
    hud.innerHTML = `
      <div class="stat"><span class="label">Map</span><span class="value">City Route</span></div>
      <div class="stat"><span class="label">Unlocked</span><span class="value">${state.highestUnlockedLevel + 1}/${levels.length}</span></div>
      <div class="stat"><span class="label">Selection</span><span class="value">${levels[state.mapSelection].name}</span></div>
      <div class="stat"><span class="label">Controls</span><span class="value">A/D or arrows, Enter, Escape</span></div>
    `;
    return;
  }

  if (!state.player || !state.level) return;
  hud.innerHTML = `
    <div class="stat"><span class="label">Stage</span><span class="value">${state.level.name}</span></div>
    <div class="stat"><span class="label">Health</span><span class="value">${"BOX ".repeat(state.player.hp).trim()}</span></div>
    <div class="stat"><span class="label">Hero Meter</span><span class="value">${state.player.gadgetReady ? "READY" : `${state.player.heroMeter}%`}</span></div>
    <div class="stat"><span class="label">Next Step</span><span class="value">${getPriorityText()}</span></div>
  `;
}

function checklistItem(done, text) {
  return `<p class="check ${done ? "done" : ""}"><span>${done ? "✓" : "•"}</span>${text}</p>`;
}

function renderMission() {
  if (state.scene === scenes.title) {
    mission.innerHTML = `
      <h2>Story Mode</h2>
      <p>This version is now a side-scrolling platformer with city backgrounds, multiple levels, boss fights, and story cards between chapters.</p>
      <p class="tiny">Jump with <kbd>Space</kbd>. Hold <kbd>Space</kbd> while falling to glide with the blanket cape. Use <kbd>F</kbd> when the hero meter is full.</p>
      <div class="legend-grid">
        <div class="legend-chip legend-star">Yellow = hero charge</div>
        <div class="legend-chip legend-toy">Green = civilian</div>
        <div class="legend-chip legend-boss">Red = boss objective</div>
      </div>
    `;
    return;
  }

  if (state.scene === scenes.map) {
    const selected = levels[state.mapSelection];
    mission.innerHTML = `
      <h2>City Map</h2>
      <p class="mission-lead">${selected.name}</p>
      <p class="tiny">${selected.story}</p>
      <div class="callout">
        <strong>Selected Stage:</strong>
        <p>${selected.goal}</p>
      </div>
      ${checklistItem(state.mapSelection <= state.highestUnlockedLevel, `Unlocked`)}
      ${checklistItem(state.mapSelection === state.highestUnlockedLevel, `Furthest available stage`)}
      <p><strong>Status:</strong> ${state.mapSelection <= state.highestUnlockedLevel ? "Ready to play." : "Locked until earlier levels are cleared."}</p>
      <p class="tiny">Use left/right to move the selection. Press Enter to play the selected unlocked level.</p>
    `;
    return;
  }

  if (!state.player || !state.level) return;
  mission.innerHTML = `
    <h2>${state.level.name}</h2>
    <p class="mission-lead">${state.level.goal}</p>
    <p class="tiny">${state.level.story}</p>
    <div class="callout">
      <strong>Do this now:</strong>
      <p>${getPriorityText()}</p>
    </div>
    ${checklistItem(state.player.charges >= state.level.heroTarget, `Hero charge: ${state.player.charges}/${state.level.heroTarget}`)}
    ${checklistItem(state.player.rescues >= state.level.civiliansTarget, `Civilians rescued: ${state.player.rescues}/${state.level.civiliansTarget}`)}
    ${state.level.boss ? checklistItem(!state.boss, `Defeat ${state.level.boss.name}`) : ""}
    ${checklistItem(state.player.charges >= state.level.heroTarget && state.player.rescues >= state.level.civiliansTarget && !state.boss, `Reach the end beacon`)}
    <p><strong>Status:</strong> ${state.message}</p>
    <p class="tiny">The floating marker points to the most important target on screen. Keep moving right once the objectives are complete.</p>
  `;
}

function frame(time) {
  const dt = Math.min(0.033, (time - state.lastTime) / 1000 || 0.016);
  state.lastTime = time;
  if (state.scene === scenes.playing) updateGame(dt);
  renderScene();
  renderHud();
  renderMission();
  requestAnimationFrame(frame);
}

window.addEventListener("keydown", (event) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "Escape"].includes(event.code)) event.preventDefault();
  const wasHeld = keys.has(event.code);
  keys.add(event.code);

  if (event.code === "Escape") {
    if (state.scene === scenes.playing || state.scene === scenes.story || state.scene === scenes.levelClear || state.scene === scenes.gameOver || state.scene === scenes.win) {
      state.mapSelection = state.levelIndex;
      setScene(scenes.map);
      return;
    }
    if (state.scene === scenes.map) {
      setScene(state.level ? scenes.story : scenes.title);
      return;
    }
  }

  if (event.code === "Enter") {
    if (state.scene === scenes.title) {
      startStoryMode();
    } else if (state.scene === scenes.map) {
      if (state.mapSelection <= state.highestUnlockedLevel) {
        resetLevel(state.mapSelection);
        setScene(scenes.story);
        state.storyCard = Math.min(storyBeats.length - 1, Math.floor(state.mapSelection / 2));
      }
    } else if (state.scene === scenes.story) {
      setScene(scenes.playing);
    } else if (state.scene === scenes.levelClear) {
      advanceLevel();
    } else if (state.scene === scenes.gameOver) {
      resetLevel(state.levelIndex);
      setScene(scenes.playing);
    } else if (state.scene === scenes.win) {
      setScene(scenes.title);
    }
  }

  if (state.scene === scenes.map) {
    if (event.code === "ArrowLeft" || event.code === "KeyA") {
      state.mapSelection = clamp(state.mapSelection - 1, 0, levels.length - 1);
    }
    if (event.code === "ArrowRight" || event.code === "KeyD") {
      state.mapSelection = clamp(state.mapSelection + 1, 0, levels.length - 1);
    }
    return;
  }

  if (state.scene !== scenes.playing) return;

  if (event.code === "Space" && !wasHeld && state.player.onGround) {
    state.player.vy = -JUMP_SPEED;
    state.player.onGround = false;
  }

  if (event.code === "KeyF") {
    triggerGadgetBurst();
  }
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.code);
});

renderHud();
renderMission();
requestAnimationFrame(frame);

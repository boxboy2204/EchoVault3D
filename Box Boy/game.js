const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const hud = document.getElementById("hud");
const mission = document.getElementById("mission");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const FLOOR_Y = 432;
const keys = new Set();

const scenes = {
  title: "title",
  playing: "playing",
  win: "win",
  gameOver: "gameOver",
};

const levels = [
  {
    id: "fort",
    title: "Bedroom Fort Frontier",
    subtitle: "Dust Bunnies are swarming the fort launch bay.",
    objective: "Collect stars, rescue Captain Plush, then move on.",
    starsNeeded: 6,
    rescueNeeded: 1,
    enemyCount: 3,
    enemySpeed: 82,
    hazards: [
      { x: 164, y: 250, w: 156, h: 34, type: "toybox" },
      { x: 532, y: 142, w: 194, h: 32, type: "bed" },
      { x: 706, y: 310, w: 146, h: 30, type: "crate" },
    ],
    rescueTargets: [{ x: 836, y: 120, kind: "plush", name: "Captain Plush" }],
    starSpawns: [
      { x: 134, y: 130 },
      { x: 306, y: 168 },
      { x: 482, y: 116 },
      { x: 610, y: 360 },
      { x: 770, y: 286 },
      { x: 868, y: 98 },
    ],
    palette: {
      sky: "#fff4dd",
      sky2: "#d8ebff",
      floor: "#9dc487",
      floor2: "#6d9652",
      glow: "#ffd572",
      accent: "#4e8ed8",
    },
    flavor:
      "A lamp becomes a lighthouse, the toy box becomes a canyon, and the floor is obviously lava-adjacent.",
    deco: {
      cloudHue: "#ffffff",
      paperColor: "#fcf0cb",
      stripeColor: "#9bc0ec",
      roomLabel: "Blanket Fort Sector",
    },
  },
  {
    id: "hall",
    title: "Hallway of Wild Weather",
    subtitle: "Paper planes dive, laundry goblins roam, and the carpet feels a mile long.",
    objective: "Collect stars, rescue Admiral Squeak and Rocket Pup.",
    starsNeeded: 7,
    rescueNeeded: 2,
    enemyCount: 4,
    enemySpeed: 96,
    hazards: [
      { x: 230, y: 118, w: 150, h: 24, type: "bench" },
      { x: 472, y: 236, w: 220, h: 30, type: "laundry" },
      { x: 84, y: 334, w: 122, h: 24, type: "shoe" },
      { x: 752, y: 118, w: 104, h: 170, type: "dresser" },
    ],
    rescueTargets: [
      { x: 862, y: 402, kind: "mouse", name: "Admiral Squeak" },
      { x: 108, y: 78, kind: "rocket", name: "Rocket Pup" },
    ],
    starSpawns: [
      { x: 136, y: 208 },
      { x: 220, y: 82 },
      { x: 414, y: 144 },
      { x: 382, y: 392 },
      { x: 636, y: 110 },
      { x: 668, y: 358 },
      { x: 866, y: 332 },
    ],
    palette: {
      sky: "#edf6ff",
      sky2: "#bfdcff",
      floor: "#cfb48d",
      floor2: "#a27c51",
      glow: "#79dbff",
      accent: "#4a6dd8",
    },
    flavor:
      "In Box Boy's head, the hallway is a storm tunnel full of dive-bombing weather and hostile laundry.",
    deco: {
      cloudHue: "#f8fbff",
      paperColor: "#ffffff",
      stripeColor: "#dac390",
      roomLabel: "Thunder Carpet Run",
    },
  },
  {
    id: "lair",
    title: "Living Room Sky Kingdom",
    subtitle: "The Vacuum Dragon circles the room. It is very loud and very dramatic.",
    objective: "Collect stars, rescue Queen Buttons, then use Box Burst to drop the boss.",
    starsNeeded: 8,
    rescueNeeded: 1,
    enemyCount: 4,
    enemySpeed: 105,
    boss: true,
    hazards: [
      { x: 150, y: 252, w: 158, h: 30, type: "ottoman" },
      { x: 442, y: 118, w: 118, h: 160, type: "table" },
      { x: 650, y: 330, w: 202, h: 28, type: "couch" },
    ],
    rescueTargets: [{ x: 808, y: 92, kind: "button", name: "Queen Buttons" }],
    starSpawns: [
      { x: 100, y: 130 },
      { x: 276, y: 126 },
      { x: 382, y: 392 },
      { x: 600, y: 200 },
      { x: 612, y: 386 },
      { x: 826, y: 144 },
      { x: 880, y: 262 },
      { x: 854, y: 406 },
    ],
    palette: {
      sky: "#fff6e2",
      sky2: "#d8ebff",
      floor: "#90bf91",
      floor2: "#577f56",
      glow: "#ff936e",
      accent: "#4a78d8",
    },
    flavor:
      "The vacuum cleaner is no longer a vacuum cleaner. It is a dragon with a hose tail and carpet wind.",
    deco: {
      cloudHue: "#fff7ef",
      paperColor: "#faedd1",
      stripeColor: "#a0c4ef",
      roomLabel: "Vacuum Dragon Airspace",
    },
  },
];

const state = {
  scene: scenes.title,
  levelIndex: 0,
  message: "Press Enter to start the adventure.",
  player: null,
  stars: [],
  enemies: [],
  rescueTargets: [],
  boss: null,
  particles: [],
  cameraShake: 0,
  totalStars: 0,
  rescuedTotal: 0,
  lastTime: 0,
  introTimer: 0,
  objectivePulse: 0,
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function circleRectCollision(circle, rect) {
  const closestX = clamp(circle.x, rect.x, rect.x + rect.w);
  const closestY = clamp(circle.y, rect.y, rect.y + rect.h);
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  return dx * dx + dy * dy < circle.r * circle.r;
}

function makePlayer() {
  return {
    x: 94,
    y: FLOOR_Y - 26,
    r: 18,
    speed: 220,
    hp: 5,
    dashTimer: 0,
    dashCooldown: 0,
    invuln: 0,
    imagination: 0,
    boxBurstReady: false,
    rescued: 0,
    starsCollected: 0,
    facing: 1,
  };
}

function makeEnemy(level) {
  const side = Math.random() > 0.5 ? 1 : -1;
  return {
    x: side === 1 ? rand(560, 896) : rand(100, 340),
    y: rand(84, FLOOR_Y - 26),
    r: 16,
    speed: level.enemySpeed + rand(-12, 14),
    drift: rand(0.8, 1.8),
    angle: rand(0, Math.PI * 2),
    hp: 1,
  };
}

function makeBoss() {
  return {
    x: 724,
    y: 240,
    r: 44,
    hp: 6,
    breathTimer: 0,
    pulse: 0,
    orbit: 0,
  };
}

function level() {
  return levels[state.levelIndex];
}

function getObjectiveText() {
  if (state.scene !== scenes.playing) return state.message;

  const currentLevel = level();
  const player = state.player;
  const starsLeft = Math.max(0, currentLevel.starsNeeded - player.starsCollected);
  const rescuesLeft = Math.max(0, currentLevel.rescueNeeded - player.rescued);

  if (starsLeft > 0) {
    return `Collect ${starsLeft} more imagination ${starsLeft === 1 ? "star" : "stars"}.`;
  }

  if (rescuesLeft > 0) {
    return `Rescue ${rescuesLeft} more toy ${rescuesLeft === 1 ? "ally" : "allies"}.`;
  }

  if (currentLevel.boss && state.boss) {
    return state.player.boxBurstReady
      ? "Press F near the Vacuum Dragon to unload Box Burst."
      : "Keep moving, fill imagination, then hit the Vacuum Dragon with Box Burst.";
  }

  return "Objective complete. Box Boy is moving to the next room.";
}

function getPriorityTarget() {
  if (state.scene !== scenes.playing) return null;

  const currentLevel = level();
  const player = state.player;

  if (player.starsCollected < currentLevel.starsNeeded) {
    let best = null;
    let bestDistance = Infinity;
    for (const star of state.stars) {
      if (star.taken) continue;
      const d = dist(player, star);
      if (d < bestDistance) {
        best = { ...star, type: "star", label: "Collect this star" };
        bestDistance = d;
      }
    }
    return best;
  }

  if (player.rescued < currentLevel.rescueNeeded) {
    let best = null;
    let bestDistance = Infinity;
    for (const toy of state.rescueTargets) {
      if (toy.rescued) continue;
      const d = dist(player, toy);
      if (d < bestDistance) {
        best = { ...toy, type: "toy", label: `Rescue ${toy.name}` };
        bestDistance = d;
      }
    }
    return best;
  }

  if (currentLevel.boss && state.boss) {
    return { ...state.boss, type: "boss", label: "Defeat the Vacuum Dragon" };
  }

  return null;
}

function loadLevel(index) {
  state.levelIndex = index;
  state.player = makePlayer();
  state.player.imagination = index === 2 ? 20 : 0;
  state.stars = level().starSpawns.map((spawn) => ({
    ...spawn,
    r: 10,
    taken: false,
    bob: rand(0, Math.PI * 2),
  }));
  state.rescueTargets = level().rescueTargets.map((target) => ({
    ...target,
    r: 16,
    rescued: false,
  }));
  state.enemies = Array.from({ length: level().enemyCount }, () => makeEnemy(level()));
  state.boss = level().boss ? makeBoss() : null;
  state.particles = [];
  state.cameraShake = 0;
  state.message = level().subtitle;
  state.introTimer = 4;
  state.objectivePulse = 0;
}

function resetGame() {
  state.totalStars = 0;
  state.rescuedTotal = 0;
  loadLevel(0);
  state.scene = scenes.playing;
}

function nextLevel() {
  if (state.levelIndex + 1 >= levels.length) {
    state.scene = scenes.win;
    state.message = "The Vacuum Dragon retreats. Bedtime is saved.";
    return;
  }

  loadLevel(state.levelIndex + 1);
}

function spawnBurst(x, y, color, count, force = 180) {
  for (let i = 0; i < count; i += 1) {
    state.particles.push({
      x,
      y,
      vx: rand(-force, force),
      vy: rand(-force, force),
      life: rand(0.3, 0.8),
      color,
      size: rand(2, 6),
    });
  }
}

function hitPlayer(forceX, forceY) {
  const player = state.player;
  if (player.invuln > 0) return;

  player.hp -= 1;
  player.invuln = 1;
  state.cameraShake = 14;
  spawnBurst(player.x, player.y, "#ff8f8f", 16);
  player.x = clamp(player.x + forceX, 24, WIDTH - 24);
  player.y = clamp(player.y + forceY, 36, FLOOR_Y - 8);

  if (player.hp <= 0) {
    state.scene = scenes.gameOver;
    state.message = "Box Boy needs a nap. Press Enter to try again.";
  }
}

function tryBoxBurst() {
  const player = state.player;
  if (!player.boxBurstReady) return;

  player.boxBurstReady = false;
  player.imagination = 0;
  state.cameraShake = 20;
  spawnBurst(player.x, player.y, "#8ad1ff", 34, 230);

  for (const enemy of state.enemies) {
    if (dist(player, enemy) < 180) {
      enemy.hp = 0;
      spawnBurst(enemy.x, enemy.y, "#ffe38a", 12);
    }
  }

  state.enemies = state.enemies.filter((enemy) => enemy.hp > 0);

  if (state.boss && dist(player, state.boss) < 220) {
    state.boss.hp -= 2;
    spawnBurst(state.boss.x, state.boss.y, "#ffb07b", 20);
    state.message = state.boss.hp <= 0
      ? "Vacuum Dragon defeated. Box Boy is extremely pleased with himself."
      : "The Vacuum Dragon staggers. Hit it again.";
    if (state.boss.hp <= 0) {
      state.boss = null;
    }
  } else {
    state.message = "Box Burst clears the room.";
  }
}

function updatePlaying(dt) {
  const currentLevel = level();
  const player = state.player;
  state.introTimer = Math.max(0, state.introTimer - dt);
  state.objectivePulse += dt * 2.8;

  let moveX = 0;
  let moveY = 0;
  if (keys.has("ArrowLeft") || keys.has("KeyA")) moveX -= 1;
  if (keys.has("ArrowRight") || keys.has("KeyD")) moveX += 1;
  if (keys.has("ArrowUp") || keys.has("KeyW")) moveY -= 1;
  if (keys.has("ArrowDown") || keys.has("KeyS")) moveY += 1;

  const moving = moveX !== 0 || moveY !== 0;
  const length = moving ? Math.hypot(moveX, moveY) : 1;
  moveX /= length;
  moveY /= length;

  if (moveX !== 0) player.facing = Math.sign(moveX);

  player.dashTimer = Math.max(0, player.dashTimer - dt);
  player.dashCooldown = Math.max(0, player.dashCooldown - dt);
  player.invuln = Math.max(0, player.invuln - dt);

  const speedBoost = player.dashTimer > 0 ? 2.35 : 1;
  const nextX = player.x + moveX * player.speed * speedBoost * dt;
  const nextY = player.y + moveY * player.speed * speedBoost * dt;
  const candidate = { x: nextX, y: nextY, r: player.r };

  let blocked = false;
  for (const hazard of currentLevel.hazards) {
    if (circleRectCollision(candidate, hazard)) {
      blocked = true;
      break;
    }
  }

  if (!blocked) {
    player.x = clamp(nextX, player.r + 10, WIDTH - player.r - 10);
    player.y = clamp(nextY, player.r + 26, FLOOR_Y - player.r + 24);
  }

  for (const star of state.stars) {
    star.bob += dt * 2.4;
    if (!star.taken && dist(player, star) < player.r + star.r + 6) {
      star.taken = true;
      player.starsCollected += 1;
      state.totalStars += 1;
      player.imagination = clamp(player.imagination + 16, 0, 100);
      player.boxBurstReady = player.imagination >= 100;
      state.message = player.boxBurstReady
        ? "Imagination full. Press F near danger for Box Burst."
        : "Star collected. Keep going.";
      spawnBurst(star.x, star.y, "#fff0a8", 14);
    }
  }

  for (const toy of state.rescueTargets) {
    if (!toy.rescued && dist(player, toy) < player.r + toy.r + 10) {
      toy.rescued = true;
      player.rescued += 1;
      state.rescuedTotal += 1;
      player.imagination = clamp(player.imagination + 22, 0, 100);
      player.boxBurstReady = player.imagination >= 100;
      state.message = `${toy.name} is safe.`;
      spawnBurst(toy.x, toy.y, "#94f0c1", 18);
    }
  }

  for (const enemy of state.enemies) {
    enemy.angle += enemy.drift * dt;
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const d = Math.hypot(dx, dy) || 1;

    enemy.x += (dx / d) * enemy.speed * dt + Math.cos(enemy.angle) * 12 * dt;
    enemy.y += (dy / d) * enemy.speed * dt + Math.sin(enemy.angle * 1.35) * 10 * dt;

    for (const hazard of currentLevel.hazards) {
      if (circleRectCollision(enemy, hazard)) {
        enemy.x -= (dx / d) * enemy.speed * dt * 0.9;
        enemy.y -= (dy / d) * enemy.speed * dt * 0.9;
      }
    }

    if (dist(player, enemy) < player.r + enemy.r) {
      hitPlayer((-dx / d) * 18, (-dy / d) * 18);
    }
  }

  if (state.boss) {
    const boss = state.boss;
    boss.pulse += dt * 2;
    boss.breathTimer += dt;
    boss.orbit += dt * 0.85;
    boss.x = 698 + Math.cos(boss.orbit) * 134;
    boss.y = 214 + Math.sin(boss.orbit * 1.5) * 122;

    if (dist(player, boss) < player.r + boss.r + 4) {
      const dx = player.x - boss.x;
      const dy = player.y - boss.y;
      const d = Math.hypot(dx, dy) || 1;
      hitPlayer((dx / d) * 28, (dy / d) * 28);
    }

    if (boss.breathTimer > 2.2) {
      boss.breathTimer = 0;
      spawnBurst(boss.x - 18, boss.y + 12, "#ffd48a", 18);
      if (dist(player, boss) < 180) {
        const dx = player.x - boss.x;
        const dy = player.y - boss.y;
        const d = Math.hypot(dx, dy) || 1;
        hitPlayer((dx / d) * 32, (dy / d) * 32);
        state.message = "The Vacuum Dragon blasts carpet wind.";
      }
    }
  }

  for (const particle of state.particles) {
    particle.life -= dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vx *= 0.96;
    particle.vy *= 0.96;
  }
  state.particles = state.particles.filter((particle) => particle.life > 0);
  state.cameraShake = Math.max(0, state.cameraShake - dt * 24);

  const rescuedEnough = player.rescued >= currentLevel.rescueNeeded;
  const starsEnough = player.starsCollected >= currentLevel.starsNeeded;
  const bossDown = !currentLevel.boss || state.boss === null;
  if (rescuedEnough && starsEnough && bossDown) {
    nextLevel();
  }
}

function drawRoundedRect(x, y, w, h, radius, fillStyle, strokeStyle = null) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawBackdrop(levelData) {
  const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  sky.addColorStop(0, levelData.palette.sky);
  sky.addColorStop(0.45, levelData.palette.sky2);
  sky.addColorStop(0.451, levelData.palette.floor);
  sky.addColorStop(1, levelData.palette.floor2);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = "rgba(255,255,255,0.34)";
  for (let i = 0; i < 6; i += 1) {
    const x = 70 + i * 154;
    const y = 74 + (i % 2) * 12;
    ctx.beginPath();
    ctx.arc(x, y, 24, Math.PI, Math.PI * 2);
    ctx.arc(x + 28, y + 4, 18, Math.PI, Math.PI * 2);
    ctx.arc(x - 26, y + 8, 16, Math.PI, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 7; i += 1) {
    ctx.fillStyle = levelData.deco.paperColor;
    ctx.fillRect(40 + i * 132, 28 + (i % 2) * 6, 74, 10);
    ctx.fillStyle = levelData.deco.stripeColor;
    ctx.fillRect(40 + i * 132, 36 + (i % 2) * 6, 74, 3);
  }

  ctx.fillStyle = "rgba(255,255,255,0.14)";
  for (let i = 0; i < 10; i += 1) {
    ctx.fillRect(26 + i * 100, FLOOR_Y + 20 + (i % 3) * 7, 82, 5);
  }

  ctx.fillStyle = "rgba(22, 39, 72, 0.12)";
  ctx.fillRect(0, FLOOR_Y - 2, WIDTH, 2);
}

function drawRoomDetails(levelData) {
  drawRoundedRect(22, 20, 214, 44, 16, "rgba(255,255,255,0.58)");
  ctx.fillStyle = "#21406f";
  ctx.font = "700 16px Trebuchet MS";
  ctx.fillText(levelData.deco.roomLabel, 38, 48);

  ctx.save();
  ctx.globalAlpha = 0.34;
  ctx.strokeStyle = levelData.palette.accent;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(40, 116);
  ctx.lineTo(110, 132);
  ctx.lineTo(160, 110);
  ctx.lineTo(230, 144);
  ctx.stroke();
  ctx.restore();
}

function drawHazard(hazard) {
  const fills = {
    toybox: ["#d9a057", "#9d6b34"],
    bed: ["#9ac3ea", "#5d7fa7"],
    crate: ["#c48d46", "#845724"],
    bench: ["#efdb9a", "#a9864a"],
    laundry: ["#d9b2d7", "#92648b"],
    shoe: ["#e56f61", "#913d34"],
    dresser: ["#b48759", "#714a25"],
    ottoman: ["#f0c16e", "#986a27"],
    table: ["#a2c1e6", "#5b7b9a"],
    couch: ["#99d2a3", "#517b58"],
  };
  const [top, side] = fills[hazard.type] || ["#d4c39a", "#8e7b54"];

  ctx.fillStyle = "rgba(24, 31, 44, 0.18)";
  ctx.fillRect(hazard.x + 10, hazard.y + hazard.h - 2, hazard.w - 8, 14);
  drawRoundedRect(hazard.x, hazard.y, hazard.w, hazard.h, 12, top, side);
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.fillRect(hazard.x + 8, hazard.y + 8, hazard.w - 16, 6);

  if (hazard.type === "dresser" || hazard.type === "table") {
    ctx.fillStyle = "rgba(40, 26, 12, 0.18)";
    ctx.fillRect(hazard.x + 16, hazard.y + 16, hazard.w - 32, hazard.h - 32);
  }
}

function drawStar(star, glow = "#ffe789") {
  const bobY = Math.sin(star.bob) * 5;
  ctx.save();
  ctx.translate(star.x, star.y + bobY);
  ctx.fillStyle = "rgba(255, 237, 170, 0.22)";
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = glow;
  ctx.beginPath();
  for (let i = 0; i < 5; i += 1) {
    const a = -Math.PI / 2 + i * (Math.PI * 2 / 5);
    const outerX = Math.cos(a) * 10;
    const outerY = Math.sin(a) * 10;
    const innerA = a + Math.PI / 5;
    const innerX = Math.cos(innerA) * 4;
    const innerY = Math.sin(innerA) * 4;
    if (i === 0) ctx.moveTo(outerX, outerY);
    else ctx.lineTo(outerX, outerY);
    ctx.lineTo(innerX, innerY);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawToy(toy) {
  ctx.save();
  ctx.translate(toy.x, toy.y);
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f7f1dd";
  if (toy.kind === "plush") {
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#946648";
    ctx.fillRect(-8, 12, 16, 8);
  } else if (toy.kind === "mouse") {
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffcad8";
    ctx.beginPath();
    ctx.arc(-9, -8, 5, 0, Math.PI * 2);
    ctx.arc(8, -8, 5, 0, Math.PI * 2);
    ctx.fill();
  } else if (toy.kind === "rocket") {
    ctx.fillStyle = "#d13d4f";
    ctx.fillRect(-8, -18, 16, 36);
    ctx.fillStyle = "#8ed2ff";
    ctx.beginPath();
    ctx.arc(0, -4, 5, 0, Math.PI * 2);
    ctx.fill();
  } else if (toy.kind === "button") {
    ctx.fillStyle = "#fff4b8";
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#8a6b29";
    ctx.fillRect(-2, -8, 4, 16);
    ctx.fillRect(-8, -2, 16, 4);
  }
  ctx.restore();
}

function drawEnemy(enemy) {
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.fillStyle = "rgba(28, 33, 50, 0.22)";
  ctx.beginPath();
  ctx.ellipse(0, 16, 18, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#756d83";
  ctx.beginPath();
  ctx.arc(0, 0, enemy.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(-5, -3, 4, 0, Math.PI * 2);
  ctx.arc(6, -3, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1c1c1c";
  ctx.fillRect(-9, 7, 18, 3);
  ctx.fillStyle = "#9d93ae";
  ctx.beginPath();
  ctx.arc(-11, -11, 5, 0, Math.PI * 2);
  ctx.arc(11, -11, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBoss(boss) {
  ctx.save();
  ctx.translate(boss.x, boss.y);
  const glow = 0.72 + Math.sin(boss.pulse) * 0.18;
  ctx.fillStyle = `rgba(255, 168, 92, ${glow})`;
  ctx.beginPath();
  ctx.arc(0, 0, boss.r + 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#8d95a8";
  ctx.beginPath();
  ctx.arc(0, 0, boss.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#606879";
  ctx.fillRect(-18, -48, 36, 96);
  ctx.strokeStyle = "#445064";
  ctx.lineWidth = 11;
  ctx.beginPath();
  ctx.arc(28, 18, 56, -1.8, 0.76);
  ctx.stroke();
  ctx.fillStyle = "#ffecac";
  ctx.beginPath();
  ctx.arc(-10, -10, 7, 0, Math.PI * 2);
  ctx.arc(11, -10, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e56d57";
  ctx.fillRect(-12, 10, 24, 7);
  ctx.restore();
}

function drawCheckeredCape(player) {
  const sway = Math.sin(state.lastTime * 0.01) * 3;
  const capeWidth = player.dashTimer > 0 ? 44 : 34;
  const capeLength = player.dashTimer > 0 ? 34 : 26;
  const startX = -2;
  const endX = -capeWidth * player.facing;
  const topY = 8;
  const bottomY = 28 + sway;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(startX, topY);
  ctx.lineTo(endX, 2 + sway * 0.4);
  ctx.lineTo(endX + 10 * player.facing, bottomY);
  ctx.lineTo(0, 24);
  ctx.closePath();
  ctx.clip();

  const size = 8;
  for (let y = 0; y < capeLength; y += size) {
    for (let x = 0; x < capeWidth; x += size) {
      const isBlue = ((x / size) + (y / size)) % 2 === 0;
      ctx.fillStyle = isBlue ? "#66b8ff" : "#f4f8ff";
      const drawX = player.facing === 1 ? -x - 8 : x - capeWidth;
      ctx.fillRect(drawX, y, size, size);
    }
  }
  ctx.restore();
}

function drawPlayer(player) {
  ctx.save();
  ctx.translate(player.x, player.y);
  if (player.invuln > 0 && Math.floor(player.invuln * 14) % 2 === 0) {
    ctx.globalAlpha = 0.55;
  }

  ctx.fillStyle = "rgba(28, 38, 52, 0.22)";
  ctx.beginPath();
  ctx.ellipse(0, 22, 20, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  drawCheckeredCape(player);

  ctx.fillStyle = "#e4b37b";
  ctx.beginPath();
  ctx.arc(0, 4, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#c2915a";
  ctx.fillRect(-14, -24, 28, 24);
  ctx.strokeStyle = "#815a33";
  ctx.lineWidth = 2;
  ctx.strokeRect(-14, -24, 28, 24);
  ctx.beginPath();
  ctx.moveTo(-14, -12);
  ctx.lineTo(14, -12);
  ctx.moveTo(0, -24);
  ctx.lineTo(0, 0);
  ctx.stroke();

  ctx.fillStyle = "#24385f";
  ctx.fillRect(-11, 10, 22, 20);
  ctx.fillStyle = "#f0f7ff";
  ctx.fillRect(-5, -10, 4, 4);
  ctx.fillRect(3, -10, 4, 4);

  ctx.fillStyle = "#c2915a";
  ctx.fillRect(-24, 12, 10, 10);
  ctx.fillRect(14, 12, 10, 10);
  ctx.fillRect(-10, 30, 8, 10);
  ctx.fillRect(2, 30, 8, 10);

  if (player.dashTimer > 0) {
    ctx.fillStyle = "rgba(123, 192, 255, 0.45)";
    ctx.beginPath();
    ctx.ellipse(-28 * player.facing, 10, 28, 16, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawParticles() {
  for (const particle of state.particles) {
    ctx.globalAlpha = Math.max(0, particle.life * 1.4);
    ctx.fillStyle = particle.color;
    ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
  }
  ctx.globalAlpha = 1;
}

function drawPriorityTarget(target) {
  if (!target) return;

  const bob = Math.sin(state.objectivePulse * 2) * 5;
  const y = target.y - (target.type === "boss" ? target.r + 44 : 34) + bob;

  ctx.save();
  ctx.translate(target.x, y);
  ctx.fillStyle = target.type === "boss" ? "#ff936e" : target.type === "toy" ? "#8df1b3" : "#ffe789";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-14, -18);
  ctx.lineTo(14, -18);
  ctx.closePath();
  ctx.fill();
  drawRoundedRect(-72, -52, 144, 26, 13, "rgba(20, 35, 61, 0.85)");
  ctx.fillStyle = "#f4f8ff";
  ctx.font = "700 12px Trebuchet MS";
  ctx.textAlign = "center";
  ctx.fillText(target.label, 0, -34);
  ctx.textAlign = "left";
  ctx.restore();
}

function drawTopOverlay(currentLevel) {
  drawRoundedRect(20, 20, 316, 84, 18, "rgba(255,255,255,0.58)");
  ctx.fillStyle = "#18325b";
  ctx.font = "700 22px Trebuchet MS";
  ctx.fillText(currentLevel.title, 36, 48);
  ctx.font = "14px Trebuchet MS";
  ctx.fillText(getObjectiveText(), 36, 76);

  if (state.boss) {
    drawRoundedRect(626, 24, 274, 28, 14, "rgba(255,255,255,0.74)");
    ctx.fillStyle = "#ff8f62";
    ctx.fillRect(632, 30, (state.boss.hp / 6) * 262, 16);
    ctx.fillStyle = "#18263f";
    ctx.font = "700 12px Trebuchet MS";
    ctx.fillText("VACUUM DRAGON", 638, 45);
  }

  if (state.player.boxBurstReady) {
    drawRoundedRect(344, 20, 272, 34, 16, "rgba(255, 218, 115, 0.96)");
    ctx.fillStyle = "#18325b";
    ctx.font = "700 14px Trebuchet MS";
    ctx.fillText("BOX BURST READY - PRESS F", 376, 42);
  }
}

function drawIntroBanner(currentLevel) {
  if (state.introTimer <= 0) return;

  const alpha = clamp(state.introTimer / 4, 0, 1);
  ctx.globalAlpha = alpha;
  drawRoundedRect(244, 412, 472, 72, 20, "rgba(18, 33, 61, 0.88)");
  ctx.fillStyle = "#fff1b8";
  ctx.font = "700 16px Trebuchet MS";
  ctx.fillText(currentLevel.title, 270, 440);
  ctx.fillStyle = "#edf5ff";
  ctx.font = "14px Trebuchet MS";
  ctx.fillText(`Goal: ${getObjectiveText()}`, 270, 466);
  ctx.globalAlpha = 1;
}

function drawScene() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  if (state.scene === scenes.title) {
    drawBackdrop(levels[0]);
    drawRoomDetails(levels[0]);
    ctx.fillStyle = "rgba(14, 28, 52, 0.18)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    drawRoundedRect(150, 86, 660, 308, 28, "rgba(255,255,255,0.72)");
    ctx.fillStyle = "#17345f";
    ctx.font = "800 48px Trebuchet MS";
    ctx.fillText("BOX BOY", 346, 154);
    ctx.font = "800 30px Trebuchet MS";
    ctx.fillText("and the Blanket Cape", 302, 194);
    ctx.font = "18px Trebuchet MS";
    ctx.fillText("You are Box Boy.", 220, 246);
    ctx.fillText("1. Collect the glowing stars.", 220, 282);
    ctx.fillText("2. Rescue the toy friends with green markers.", 220, 314);
    ctx.fillText("3. When imagination is full, press F to use Box Burst.", 220, 346);
    drawRoundedRect(328, 418, 304, 48, 18, "rgba(255, 218, 115, 0.96)");
    ctx.fillStyle = "#17345f";
    ctx.font = "700 20px Trebuchet MS";
    ctx.fillText("PRESS ENTER TO START", 366, 448);
    return;
  }

  const currentLevel = level();
  const shakeX = state.cameraShake > 0 ? rand(-state.cameraShake, state.cameraShake) : 0;
  const shakeY = state.cameraShake > 0 ? rand(-state.cameraShake, state.cameraShake) : 0;
  ctx.save();
  ctx.translate(shakeX, shakeY);
  drawBackdrop(currentLevel);
  drawRoomDetails(currentLevel);
  for (const hazard of currentLevel.hazards) drawHazard(hazard);
  for (const star of state.stars) if (!star.taken) drawStar(star);
  for (const toy of state.rescueTargets) if (!toy.rescued) drawToy(toy);
  for (const enemy of state.enemies) drawEnemy(enemy);
  if (state.boss) drawBoss(state.boss);
  drawPriorityTarget(getPriorityTarget());
  drawPlayer(state.player);
  drawParticles();
  drawTopOverlay(currentLevel);
  drawIntroBanner(currentLevel);
  ctx.restore();

  if (state.scene === scenes.win || state.scene === scenes.gameOver) {
    ctx.fillStyle = "rgba(12, 20, 38, 0.56)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    drawRoundedRect(188, 160, 584, 198, 24, "rgba(255,247,220,0.95)");
    ctx.fillStyle = "#17345f";
    ctx.font = "800 32px Trebuchet MS";
    ctx.fillText(state.scene === scenes.win ? "Bedtime Victory" : "Mission Failed", 348, 214);
    ctx.font = "18px Trebuchet MS";
    ctx.fillText(state.message, 242, 254, 480);
    ctx.fillText(`Stars claimed: ${state.totalStars}`, 242, 294);
    ctx.fillText(`Toys rescued: ${state.rescuedTotal}`, 242, 324);
    ctx.fillText("Press Enter to play again.", 242, 354);
  }
}

function renderHud() {
  if (state.scene === scenes.title) {
    hud.innerHTML = `
      <div class="stat"><span class="label">Hero</span><span class="value">Box Boy</span></div>
      <div class="stat"><span class="label">Goal</span><span class="value">Save bedtime</span></div>
      <div class="stat"><span class="label">Power</span><span class="value">Imagination</span></div>
      <div class="stat"><span class="label">Best Move</span><span class="value">Box Burst</span></div>
    `;
    return;
  }

  const currentLevel = level();
  const player = state.player;
  const hearts = "BOX ".repeat(player.hp).trim() || "Out";
  const status = player.boxBurstReady ? "Ready" : `${player.imagination}%`;
  const objective = getObjectiveText();

  hud.innerHTML = `
    <div class="stat"><span class="label">Chapter</span><span class="value">${state.levelIndex + 1}. ${currentLevel.title}</span></div>
    <div class="stat"><span class="label">Health</span><span class="value">${hearts}</span></div>
    <div class="stat"><span class="label">Imagination</span><span class="value">${status}</span></div>
    <div class="stat"><span class="label">Next Step</span><span class="value">${objective}</span></div>
  `;
}

function checklistItem(done, text) {
  return `<p class="check ${done ? "done" : ""}"><span>${done ? "✓" : "•"}</span>${text}</p>`;
}

function renderMission() {
  if (state.scene === scenes.title) {
    mission.innerHTML = `
      <h2>How To Play</h2>
      <p>Follow the marker above the most important target. Yellow means star, green means rescue, red means boss.</p>
      <p class="tiny">Move with <kbd>WASD</kbd> or arrows. Dash with <kbd>Space</kbd>. When imagination is full, press <kbd>F</kbd> near enemies or the boss.</p>
      <div class="legend-grid">
        <div class="legend-chip legend-star">Stars = progress</div>
        <div class="legend-chip legend-toy">Green = rescue</div>
        <div class="legend-chip legend-boss">Red = boss target</div>
      </div>
    `;
    return;
  }

  const currentLevel = level();
  const player = state.player;
  const starsDone = player.starsCollected >= currentLevel.starsNeeded;
  const rescueDone = player.rescued >= currentLevel.rescueNeeded;
  const bossDone = !currentLevel.boss || state.boss === null;

  mission.innerHTML = `
    <h2>${currentLevel.title}</h2>
    <p class="mission-lead">${currentLevel.objective}</p>
    <p class="tiny">${currentLevel.flavor}</p>
    <div class="callout">
      <strong>Do this now:</strong>
      <p>${getObjectiveText()}</p>
    </div>
    ${checklistItem(starsDone, `Collect stars: ${player.starsCollected}/${currentLevel.starsNeeded}`)}
    ${checklistItem(rescueDone, `Rescue toys: ${player.rescued}/${currentLevel.rescueNeeded}`)}
    ${currentLevel.boss ? checklistItem(bossDone, `Defeat Vacuum Dragon`) : ""}
    <p><strong>Status:</strong> ${state.message}</p>
    <p class="tiny">Watch for the floating marker in the level. It points at the next thing you should handle.</p>
  `;
}

function frame(time) {
  const dt = Math.min(0.033, (time - state.lastTime) / 1000 || 0.016);
  state.lastTime = time;

  if (state.scene === scenes.playing) {
    updatePlaying(dt);
  }

  drawScene();
  renderHud();
  renderMission();
  requestAnimationFrame(frame);
}

window.addEventListener("keydown", (event) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(event.code)) {
    event.preventDefault();
  }

  keys.add(event.code);

  if (event.code === "Enter") {
    if (state.scene === scenes.title || state.scene === scenes.gameOver || state.scene === scenes.win) {
      resetGame();
    }
  }

  if (state.scene !== scenes.playing) return;

  if (event.code === "Space") {
    const player = state.player;
    if (player.dashCooldown <= 0) {
      player.dashTimer = 0.18;
      player.dashCooldown = 0.75;
      state.message = "Blanket cape dash!";
      spawnBurst(player.x, player.y, "#7ec9ff", 10);
    }
  }

  if (event.code === "KeyF") {
    tryBoxBurst();
  }
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.code);
});

renderHud();
renderMission();
requestAnimationFrame(frame);

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const hud = {
  health: document.getElementById("health"),
  cores: document.getElementById("cores"),
  ammo: document.getElementById("ammo"),
  time: document.getElementById("time"),
  prompt: document.getElementById("prompt")
};

const ui = {
  deployBtn: document.getElementById("deployBtn"),
  shopBtn: document.getElementById("shopBtn"),
  mapsBtn: document.getElementById("mapsBtn"),
  loadoutPanel: document.getElementById("loadoutPanel")
};

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const HALF_HEIGHT = HEIGHT * 0.5;
const FOV = Math.PI / 3;
const MAX_DEPTH = 26;
const MOVE_SPEED = 2.9;
const TURN_SPEED = 0.0024;
const PITCH_SPEED = 0.0034;
const PLAYER_RADIUS = 0.22;
const wallDepthBuffer = new Array(WIDTH).fill(MAX_DEPTH);
const keys = new Set();

const audio = { ctx: null };

const DIFFICULTIES = {
  rookie: { label: "Rookie", enemyCount: 0.8, speed: 0.9, timer: 150, damage: 0.8 },
  operative: { label: "Operative", enemyCount: 1, speed: 1, timer: 130, damage: 1 },
  nightmare: { label: "Nightmare", enemyCount: 1.2, speed: 1.15, timer: 110, damage: 1.25 }
};

const WEAPONS = {
  pistol: { name: "Pistol", price: 0, damage: 2, cooldown: 0.34, range: 8.2, spread: 0.03, pellets: 1, recoil: 0.8, ammoUse: 1, desc: "Balanced backup sidearm. Slow fire, solid medium damage." },
  machinegun: { name: "Machine Gun", price: 220, damage: 1, cooldown: 0.095, range: 10.4, spread: 0.07, pellets: 1, recoil: 0.48, ammoUse: 1, desc: "Fast stream of rounds. Medium damage, medium range." },
  shotgun: { name: "Shotgun", price: 280, damage: 2, cooldown: 0.72, range: 5.2, spread: 0.18, pellets: 6, recoil: 1.25, ammoUse: 2, desc: "Crushing close-range burst. Very high damage, very short reach." },
  sniper_rifle: { name: "Sniper Rifle", price: 360, damage: 7, cooldown: 1.18, range: 16.5, spread: 0.012, pellets: 1, recoil: 1.55, ammoUse: 1, desc: "Very slow but devastating and long-ranged." }
};

const MAPS = {
  echo_vault: {
    name: "Echo Vault",
    gimmick: "Balanced baseline vault with mixed enemies and standard visibility.",
    palette: { skyA: "#091018", skyB: "#14303d", skyC: "#21535f", wallA: [35, 151, 143], wallB: [12, 36, 40] },
    effects: { moveMult: 1, visibility: 26, fog: 0, heatWave: false },
    reward: 160,
    firstClearBonus: 120,
    hazards: {
      kind: "security_beams",
      beams: [
        { x1: 10.5, y1: 5.2, x2: 10.5, y2: 11.8, phase: 0.4, speed: 1.9 },
        { x1: 13.5, y1: 13.2, x2: 13.5, y2: 19.6, phase: 1.2, speed: 1.6 }
      ]
    },
    boss: {
      type: "warden",
      x: 18.5,
      y: 18.5,
      arenaX: 10.5,
      arenaY: 4.5,
      patrol: [{ x: 17.0, y: 18.5 }, { x: 20.0, y: 18.5 }],
      weakPoints: [
        { key: "eye_core", name: "Eye Core", dx: 0, dy: 0.2, radius: 0.08, color: "#ffb4c6" },
        { key: "left_relay", name: "Left Relay", dx: -0.18, dy: 0.48, radius: 0.07, color: "#ff7a94" },
        { key: "right_relay", name: "Right Relay", dx: 0.18, dy: 0.48, radius: 0.07, color: "#ff7a94" }
      ]
    },
    layout: [
      "######################",
      "#....A....#.....H....#",
      "#.######..#.#######..#",
      "#.#....#..#...C...#..#",
      "#.#.##.####.#####.#..#",
      "#...##....D.....#.#..#",
      "###.#####.#####.#.##.#",
      "#...#...#...#...#....#",
      "#.#.#.#####.#.######.#",
      "#.#.#.....#.#....S...#",
      "#.#.#####.#.#######..#",
      "#.#...C...#....#.....#",
      "#.#####.######.#.###.#",
      "#.....#....D...#.#...#",
      "#.###.##########.#.#.#",
      "#...#....H.......#.#.#",
      "###.#######.######.#.#",
      "#...#.....#...C..#.#.#",
      "#.###.###.#####.#.#..#",
      "#.....#...#.....#...X#",
      "#..A..#.S.#..C..#....#",
      "######################"
    ],
    enemySpawns: [
      { type: "drone", x: 4.5, y: 3.5, patrol: [{ x: 4.5, y: 3.5 }, { x: 7.4, y: 3.6 }] },
      { type: "drone", x: 16.5, y: 3.5, patrol: [{ x: 14.6, y: 3.5 }, { x: 18.2, y: 3.4 }] },
      { type: "sniper", x: 17.5, y: 7.5, patrol: [{ x: 17.5, y: 7.5 }, { x: 20.2, y: 7.4 }] },
      { type: "brute", x: 6.5, y: 9.5, patrol: [{ x: 5.5, y: 9.5 }, { x: 8.3, y: 9.5 }] },
      { type: "drone", x: 16.5, y: 11.5, patrol: [{ x: 15.3, y: 11.5 }, { x: 19.2, y: 11.4 }] },
      { type: "sniper", x: 3.5, y: 15.5, patrol: [{ x: 3.5, y: 15.5 }, { x: 8.2, y: 15.4 }] },
      { type: "brute", x: 11.5, y: 15.5, patrol: [{ x: 10.5, y: 15.5 }, { x: 14.3, y: 15.5 }] },
      { type: "drone", x: 15.5, y: 17.5, patrol: [{ x: 14.5, y: 17.5 }, { x: 17.2, y: 17.4 }] },
      { type: "sniper", x: 4.5, y: 19.5, patrol: [{ x: 2.5, y: 19.5 }, { x: 5.5, y: 20.2 }] },
      { type: "brute", x: 18.5, y: 19.5, patrol: [{ x: 17.5, y: 19.5 }, { x: 20.1, y: 19.5 }] }
    ]
  },
  frost_foundry: {
    name: "Frost Foundry",
    gimmick: "Long cryo sightlines favor snipers, with cold haze and slower movement through exposed lanes.",
    palette: { skyA: "#08121f", skyB: "#17344f", skyC: "#5ca7d1", wallA: [96, 178, 222], wallB: [16, 34, 48] },
    effects: { moveMult: 0.9, visibility: 22, fog: 0.16, heatWave: false },
    reward: 175,
    firstClearBonus: 140,
    hazards: {
      kind: "ice",
      zones: [
        { x: 7.5, y: 1.5, w: 10, h: 1.2 },
        { x: 11.5, y: 17.5, w: 6, h: 1.2 },
        { x: 16.5, y: 19.5, w: 4, h: 1.2 }
      ]
    },
    boss: {
      type: "frost_tyrant",
      x: 16.5,
      y: 17.5,
      arenaX: 10.5,
      arenaY: 4.5,
      patrol: [{ x: 13.0, y: 17.5 }, { x: 18.5, y: 17.5 }],
      weakPoints: [
        { key: "crown", name: "Cryo Crown", dx: 0, dy: 0.12, radius: 0.09, color: "#d4fbff" },
        { key: "left_joint", name: "Left Joint", dx: -0.2, dy: 0.5, radius: 0.075, color: "#8ee7ff" },
        { key: "right_joint", name: "Right Joint", dx: 0.2, dy: 0.5, radius: 0.075, color: "#8ee7ff" }
      ]
    },
    layout: [
      "######################",
      "#A....#...........C..#",
      "#.###.#.###########..#",
      "#.#...#.....H.....#..#",
      "#.#.###########.#.#..#",
      "#.#.......D.....#.#..#",
      "#.#########.#####.#..#",
      "#.......#...#.....#..#",
      "#######.#.###.#####..#",
      "#....C..#...#....S...#",
      "#.###############.##.#",
      "#.....#........#..A..#",
      "#.###.#.######.#.###.#",
      "#...#.#....D...#...#.#",
      "#.#.#.##########.#.#.#",
      "#.#.#....A.......#.#.#",
      "#.#.##############.#.#",
      "#.#......C......#..#X#",
      "#.######.######.#.##.#",
      "#..H.....#....#.#....#",
      "#..S.....#..C......A.#",
      "######################"
    ],
    enemySpawns: [
      { type: "sniper", x: 10.5, y: 1.5, patrol: [{ x: 7.5, y: 1.5 }, { x: 17.5, y: 1.5 }] },
      { type: "drone", x: 17.5, y: 3.5, patrol: [{ x: 15.5, y: 3.5 }, { x: 18.5, y: 3.5 }] },
      { type: "sniper", x: 6.5, y: 7.5, patrol: [{ x: 1.8, y: 7.5 }, { x: 6.5, y: 7.5 }] },
      { type: "brute", x: 17.5, y: 9.5, patrol: [{ x: 15.5, y: 9.5 }, { x: 19.5, y: 9.5 }] },
      { type: "drone", x: 11.5, y: 13.5, patrol: [{ x: 9.5, y: 13.5 }, { x: 13.5, y: 13.5 }] },
      { type: "sniper", x: 17.5, y: 17.5, patrol: [{ x: 11.5, y: 17.5 }, { x: 17.5, y: 17.5 }] },
      { type: "brute", x: 5.5, y: 19.5, patrol: [{ x: 2.5, y: 19.5 }, { x: 7.5, y: 19.5 }] },
      { type: "drone", x: 18.5, y: 20.5, patrol: [{ x: 15.5, y: 20.5 }, { x: 20.0, y: 20.5 }] }
    ]
  },
  ember_bastion: {
    name: "Ember Bastion",
    gimmick: "A wide open central arena and looping flanks favor machine guns and high-mobility fights.",
    palette: { skyA: "#170b08", skyB: "#4a1e15", skyC: "#8e4d2e", wallA: [186, 101, 62], wallB: [49, 20, 16] },
    effects: { moveMult: 1.02, visibility: 24, fog: 0.05, heatWave: true },
    reward: 185,
    firstClearBonus: 160,
    hazards: {
      kind: "lava_vents",
      vents: [
        { x: 10.5, y: 6.5, radius: 1.2, phase: 0.2 },
        { x: 12.5, y: 12.5, radius: 1.3, phase: 1.0 },
        { x: 9.5, y: 9.5, radius: 1.1, phase: 1.7 }
      ]
    },
    boss: {
      type: "infernal_guard",
      x: 10.5,
      y: 9.5,
      arenaX: 10.5,
      arenaY: 4.5,
      patrol: [{ x: 8.5, y: 9.5 }, { x: 13.5, y: 9.5 }],
      weakPoints: [
        { key: "furnace", name: "Furnace Heart", dx: 0, dy: 0.42, radius: 0.1, color: "#ffd08a" },
        { key: "left_vent", name: "Left Vent", dx: -0.22, dy: 0.2, radius: 0.075, color: "#ffb06b" },
        { key: "right_vent", name: "Right Vent", dx: 0.22, dy: 0.2, radius: 0.075, color: "#ffb06b" }
      ]
    },
    layout: [
      "######################",
      "#A....#.......H....C.#",
      "#.##..#.#######.##...#",
      "#.#...#...C...#..#...#",
      "#.#.#####...#.#..#...#",
      "#...#....D..#.#..#...#",
      "###.#............##..#",
      "#...#....####....#...#",
      "#.#.#...##..##...#.#.#",
      "#.#.....#S..C#.....#.#",
      "#.#.#...##..##...#.#.#",
      "#...#....####....#...#",
      "###.#............##..#",
      "#...#....D..#....#...#",
      "#.#.#####...#.##.#.#.#",
      "#.#...A.....#..#.#.#.#",
      "#.######.###.#.#.###.#",
      "#...C....#...#.#...A.#",
      "#.#####.##...#.#####.#",
      "#.....#....H.#.....X.#",
      "#..S..#.A....#..C....#",
      "######################"
    ],
    enemySpawns: [
      { type: "brute", x: 10.5, y: 6.5, patrol: [{ x: 7.5, y: 6.5 }, { x: 14.5, y: 6.5 }] },
      { type: "drone", x: 9.5, y: 8.5, patrol: [{ x: 8.5, y: 8.5 }, { x: 12.5, y: 8.5 }] },
      { type: "drone", x: 13.5, y: 10.5, patrol: [{ x: 8.5, y: 10.5 }, { x: 13.5, y: 10.5 }] },
      { type: "sniper", x: 17.5, y: 3.5, patrol: [{ x: 16.5, y: 3.5 }, { x: 19.5, y: 3.5 }] },
      { type: "brute", x: 5.5, y: 13.5, patrol: [{ x: 3.5, y: 13.5 }, { x: 8.5, y: 13.5 }] },
      { type: "sniper", x: 15.5, y: 15.5, patrol: [{ x: 14.5, y: 15.5 }, { x: 18.5, y: 15.5 }] },
      { type: "drone", x: 4.5, y: 18.5, patrol: [{ x: 3.5, y: 18.5 }, { x: 7.5, y: 18.5 }] },
      { type: "brute", x: 18.5, y: 19.5, patrol: [{ x: 16.5, y: 19.5 }, { x: 20.0, y: 19.5 }] }
    ]
  }
};

const ENEMY_DEFS = {
  drone: { label: "Drone", color: "#66deff", speed: 1.8, health: 2, fireRate: 1.2, projectileSpeed: 4.5, projectileColor: "#7cf3ff", size: 0.17, range: 8.5, attack: "plasma", hover: true, damage: 8 },
  brute: { label: "Brute", color: "#ff8f63", speed: 1.02, health: 7, fireRate: 1.5, projectileSpeed: 0, projectileColor: "#ffae75", size: 0.28, range: 1, attack: "punch", hover: false, damage: 24 },
  sniper: { label: "Sniper", color: "#c38fff", speed: 1.18, health: 2, fireRate: 2.8, projectileSpeed: 7.2, projectileColor: "#d8a4ff", size: 0.14, range: 14, attack: "beam", hover: false, damage: 26 },
  warden: { label: "Vault Warden", color: "#ff646f", speed: 0.94, health: 72, fireRate: 1.1, projectileSpeed: 6.4, projectileColor: "#ff7a94", size: 0.56, range: 14, attack: "beam", hover: false, damage: 24 },
  frost_tyrant: { label: "Frost Tyrant", color: "#8ee7ff", speed: 0.98, health: 68, fireRate: 1.18, projectileSpeed: 5.9, projectileColor: "#aef6ff", size: 0.58, range: 14, attack: "beam", hover: false, damage: 23 },
  infernal_guard: { label: "Infernal Guard", color: "#ffb06b", speed: 1.02, health: 76, fireRate: 1.05, projectileSpeed: 6.2, projectileColor: "#ffc07e", size: 0.6, range: 14, attack: "beam", hover: false, damage: 26 }
};

const ARENA_BOUNDS = { minX: 1, minY: 1, maxX: 20, maxY: 20 };
const ARENA_COVER = [
  { x: 5, y: 8, w: 2, h: 3 },
  { x: 15, y: 8, w: 2, h: 3 },
  { x: 9, y: 6, w: 4, h: 2 },
  { x: 9, y: 13, w: 4, h: 2 }
];

const baseState = {
  player: { x: 1.5, y: 1.5, angle: 0, pitch: 0 },
  health: 100,
  shield: 0,
  ammo: 16,
  timeLeft: DIFFICULTIES.operative.timer,
  cooldown: 0,
  hurtFlash: 0,
  muzzleFlash: 0,
  recoil: 0,
  slideVX: 0,
  slideVY: 0,
  hazardClock: 0,
  status: "title",
  menuMode: "briefing",
  difficulty: "operative",
  mapId: "echo_vault",
  credits: 260,
  equippedGun: "pistol",
  ownedGuns: { pistol: true, machinegun: false, shotgun: false, sniper_rifle: false },
  exitUnlocked: false,
  message: "Press Enter to deploy into Echo Vault.",
  pickups: [],
  enemies: [],
  projectiles: [],
  enemyProjectiles: [],
  doorStates: {},
  coresCollected: 0,
  totalCores: 0
  ,
  bossDefeated: false,
  bossArenaActive: false,
  combatEffects: [],
  mapProgress: { echo_vault: 0, frost_foundry: 0, ember_bastion: 0 }
};

const state = structuredClone(baseState);

function getDifficulty() {
  return DIFFICULTIES[state.difficulty];
}

function getMapDef() {
  return MAPS[state.mapId];
}

function getWeaponDef() {
  return WEAPONS[state.equippedGun];
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy || 1;
  const t = clamp(((px - x1) * dx + (py - y1) * dy) / lenSq, 0, 1);
  const cx = x1 + dx * t;
  const cy = y1 + dy * t;
  return Math.hypot(px - cx, py - cy);
}

function spawnCombatEffect(x, y, color, size, life) {
  state.combatEffects.push({ x, y, color, size, life, maxLife: life });
}

function getArenaCellByIndex(tileX, tileY) {
  if (tileX < ARENA_BOUNDS.minX || tileX > ARENA_BOUNDS.maxX || tileY < ARENA_BOUNDS.minY || tileY > ARENA_BOUNDS.maxY) {
    return "#";
  }
  if (tileX === ARENA_BOUNDS.minX || tileX === ARENA_BOUNDS.maxX || tileY === ARENA_BOUNDS.minY || tileY === ARENA_BOUNDS.maxY) {
    return "#";
  }
  if (tileY === 19 && tileX === 10) return "X";
  for (const cover of ARENA_COVER) {
    if (tileX >= cover.x && tileX < cover.x + cover.w && tileY >= cover.y && tileY < cover.y + cover.h) {
      return "#";
    }
  }
  return ".";
}

function getCell(x, y) {
  if (state.bossArenaActive) {
    return getArenaCellByIndex(Math.floor(x), Math.floor(y));
  }
  const layout = getMapDef().layout;
  return layout[Math.floor(y)]?.[Math.floor(x)] ?? "#";
}

function doorKey(x, y) {
  return `${Math.floor(x)},${Math.floor(y)}`;
}

function ensureAudio() {
  if (!audio.ctx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    audio.ctx = new AudioContextClass();
  }
  if (audio.ctx.state === "suspended") {
    audio.ctx.resume();
  }
  return audio.ctx;
}

function playShotSound() {
  const audioCtx = ensureAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(0.22, now + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
  gain.connect(audioCtx.destination);

  const osc = audioCtx.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(210, now);
  osc.frequency.exponentialRampToValueAtTime(70, now + 0.12);
  osc.connect(gain);
  osc.start(now);
  osc.stop(now + 0.14);

  const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.22, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }

  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;
  const filter = audioCtx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1000;
  const noiseGain = audioCtx.createGain();
  noiseGain.gain.setValueAtTime(0.16, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(audioCtx.destination);
  noise.start(now);
  noise.stop(now + 0.14);
}

function playEnemyShotSound() {
  const audioCtx = ensureAudio();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(520, now);
  osc.frequency.exponentialRampToValueAtTime(180, now + 0.09);
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(0.045, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.12);
}

function getHorizon() {
  return HALF_HEIGHT + state.player.pitch * 220;
}

function syncHud() {
  const shieldText = state.shield > 0 ? ` +${Math.ceil(state.shield)}` : "";
  hud.health.textContent = `${Math.max(0, Math.ceil(state.health))}${shieldText}`;
  hud.cores.textContent = `${state.coresCollected} / ${state.totalCores}`;
  hud.ammo.textContent = state.ammo;
  hud.time.textContent = state.timeLeft.toFixed(1);
  hud.prompt.textContent = state.message;
}

function updateActionButtons() {
  const inRun = state.status === "playing";
  ui.deployBtn.textContent = inRun ? "In Run" : "Deploy";
  ui.deployBtn.disabled = inRun;
  ui.shopBtn.disabled = inRun;
  ui.mapsBtn.disabled = inRun;
}

function renderLoadoutPanel() {
  const map = getMapDef();
  const weapon = getWeaponDef();
  const difficulty = getDifficulty();
  const clears = state.mapProgress[state.mapId] || 0;

  if (state.menuMode === "shop") {
    ui.loadoutPanel.innerHTML = `
      <div class="panel-grid">
        <article class="info-card">
          <h2>Gun Shop</h2>
          <p class="meta">Credits: ${state.credits}. Buy or equip weapons before deployment.</p>
          <div class="tags">
            <span class="tag">Equipped: ${weapon.name}</span>
            <span class="tag">Map: ${map.name}</span>
          </div>
        </article>
      </div>
      <div class="shop-grid">
        ${Object.entries(WEAPONS).map(([key, item]) => {
          const owned = state.ownedGuns[key];
          const equipped = state.equippedGun === key;
          const canBuy = !owned && state.credits >= item.price;
          const action = equipped ? "Equipped" : owned ? "Equip" : `Buy (${item.price})`;
          return `
            <article class="shop-card ${equipped ? "active" : ""}">
              <h3>${item.name}</h3>
              <p class="meta">${item.desc}</p>
              <div class="tags">
                <span class="tag">Damage ${item.damage}</span>
                <span class="tag">Cooldown ${item.cooldown.toFixed(2)}s</span>
                <span class="tag">Range ${item.range.toFixed(1)}</span>
              </div>
              <button type="button" data-gun-action="${key}" ${equipped || (!owned && !canBuy) ? "disabled" : ""}>${action}</button>
            </article>
          `;
        }).join("")}
      </div>
    `;
    return;
  }

  ui.loadoutPanel.innerHTML = `
    <div class="panel-grid">
      <article class="info-card">
        <h2>Deployment Brief</h2>
        <p class="meta">${map.gimmick}</p>
        <div class="tags">
          <span class="tag">Map: ${map.name}</span>
          <span class="tag">Difficulty: ${difficulty.label}</span>
          <span class="tag">Credits: ${state.credits}</span>
          <span class="tag">Clears: ${clears}</span>
        </div>
      </article>
      <article class="info-card">
        <h2>Loadout</h2>
        <p class="meta">${weapon.desc}</p>
        <div class="tags">
          <span class="tag">Weapon: ${weapon.name}</span>
          <span class="tag">Damage ${weapon.damage}</span>
          <span class="tag">Range ${weapon.range.toFixed(1)}</span>
        </div>
      </article>
      <article class="info-card">
        <h2>Maps</h2>
        <p class="meta">Click Maps to cycle through vaults. Each one changes visibility, movement, hazards, and its boss elite.</p>
        <div class="tags">
          ${Object.values(MAPS).map((entry) => `<span class="tag">${entry.name}</span>`).join("")}
        </div>
      </article>
    </div>
  `;
}

function resetGame() {
  const persistent = {
    difficulty: state.difficulty,
    mapId: state.mapId,
    credits: state.credits,
    equippedGun: state.equippedGun,
    ownedGuns: { ...state.ownedGuns },
    mapProgress: { ...state.mapProgress }
  };
  Object.assign(state, structuredClone(baseState), persistent);
  state.menuMode = "briefing";
  state.timeLeft = getDifficulty().timer;
  state.status = "playing";
  state.message = `Sweep ${getMapDef().name}. ${getMapDef().gimmick}`;
  state.pickups = [];
  state.enemies = [];
  state.projectiles = [];
  state.enemyProjectiles = [];
  state.doorStates = {};
  state.combatEffects = [];
  state.bossDefeated = false;
  state.bossArenaActive = false;
  state.slideVX = 0;
  state.slideVY = 0;
  state.hazardClock = 0;
  const layout = getMapDef().layout;

  for (let y = 0; y < layout.length; y += 1) {
    for (let x = 0; x < layout[y].length; x += 1) {
      const cell = layout[y][x];
      if (cell === "C") state.pickups.push({ kind: "core", x: x + 0.5, y: y + 0.5, taken: false });
      if (cell === "H") state.pickups.push({ kind: "medkit", x: x + 0.5, y: y + 0.5, taken: false });
      if (cell === "A") state.pickups.push({ kind: "ammo", x: x + 0.5, y: y + 0.5, taken: false });
      if (cell === "S") state.pickups.push({ kind: "shield", x: x + 0.5, y: y + 0.5, taken: false });
      if (cell === "D") state.doorStates[doorKey(x, y)] = 0;
    }
  }

  const spawns = getMapDef().enemySpawns;
  const maxEnemies = Math.max(3, Math.floor(spawns.length * getDifficulty().enemyCount));
  state.enemies = spawns.slice(0, maxEnemies).map((spawn) => {
    const def = ENEMY_DEFS[spawn.type];
    return {
      type: spawn.type,
      x: spawn.x,
      y: spawn.y,
      health: def.health,
      cooldown: rand(0.1, def.fireRate),
      hoverPhase: rand(0, Math.PI * 2),
      patrol: spawn.patrol,
      patrolIndex: 1
    };
  });

  const bossSpawn = getMapDef().boss;
  if (bossSpawn) {
    const def = ENEMY_DEFS[bossSpawn.type];
    state.enemies.push({
      type: bossSpawn.type,
      isBoss: true,
      x: bossSpawn.x,
      y: bossSpawn.y,
      health: def.health,
      maxHealth: def.health,
      cooldown: rand(0.1, def.fireRate),
      hoverPhase: rand(0, Math.PI * 2),
      patrol: bossSpawn.patrol,
      patrolIndex: 1,
      hitFlash: 0,
      weakPoints: bossSpawn.weakPoints,
      weakPointHealth: Object.fromEntries((bossSpawn.weakPoints || []).map((point) => [point.key, 1]))
    });
  }

  state.totalCores = state.pickups.filter((pickup) => pickup.kind === "core").length;
  syncHud();
  updateActionButtons();
  renderLoadoutPanel();
}

function isDoor(x, y) {
  return getCell(x, y) === "D";
}

function isExit(x, y) {
  return getCell(x, y) === "X";
}

function activateBossArena() {
  const boss = state.enemies.find((enemy) => enemy.isBoss && enemy.health > 0);
  if (!boss) return;

  state.bossArenaActive = true;
  state.player.x = 10.5;
  state.player.y = 18.5;
  state.player.angle = -Math.PI / 2;
  state.slideVX = 0;
  state.slideVY = 0;
  state.enemyProjectiles = [];
  state.projectiles = [];
  state.combatEffects = [];
  state.enemies = [boss];
  boss.x = getMapDef().boss.arenaX || 10.5;
  boss.y = getMapDef().boss.arenaY || 4.5;
  boss.patrol = [{ x: 7.5, y: boss.y }, { x: 13.5, y: boss.y }];
  boss.patrolIndex = 1;
  state.message = "Arena breach. Boss isolated. Use the cover blocks.";
  syncHud();
}

function doorOpenAmount(x, y) {
  return state.doorStates[doorKey(x, y)] || 0;
}

function tileBlocked(x, y) {
  const cell = getCell(x, y);
  if (cell === "#") return true;
  if (cell === "X") return !(state.exitUnlocked || (state.coresCollected === state.totalCores && !state.bossDefeated));
  if (cell === "D") return doorOpenAmount(x, y) < 0.75;
  return false;
}

function canOccupy(x, y) {
  const samples = [
    [0, 0],
    [PLAYER_RADIUS, 0],
    [-PLAYER_RADIUS, 0],
    [0, PLAYER_RADIUS],
    [0, -PLAYER_RADIUS],
    [PLAYER_RADIUS * 0.7, PLAYER_RADIUS * 0.7],
    [-PLAYER_RADIUS * 0.7, PLAYER_RADIUS * 0.7],
    [PLAYER_RADIUS * 0.7, -PLAYER_RADIUS * 0.7],
    [-PLAYER_RADIUS * 0.7, -PLAYER_RADIUS * 0.7]
  ];

  for (const [sx, sy] of samples) {
    if (tileBlocked(x + sx, y + sy)) return false;
  }
  return true;
}

function resolvePlayerPosition() {
  if (canOccupy(state.player.x, state.player.y)) return;

  const originX = Math.floor(state.player.x) + 0.5;
  const originY = Math.floor(state.player.y) + 0.5;
  const candidates = [
    [originX, originY],
    [originX + 0.32, originY],
    [originX - 0.32, originY],
    [originX, originY + 0.32],
    [originX, originY - 0.32]
  ];

  for (const [cx, cy] of candidates) {
    if (canOccupy(cx, cy)) {
      state.player.x = cx;
      state.player.y = cy;
      return;
    }
  }
}

function movePlayer(dx, dy) {
  const distance = Math.hypot(dx, dy);
  const steps = Math.max(1, Math.ceil(distance / 0.04));
  const stepX = dx / steps;
  const stepY = dy / steps;

  for (let i = 0; i < steps; i += 1) {
    const nx = state.player.x + stepX;
    const ny = state.player.y + stepY;
    if (canOccupy(nx, state.player.y)) {
      state.player.x = nx;
    } else {
      state.slideVX = 0;
    }
    if (canOccupy(state.player.x, ny)) {
      state.player.y = ny;
    } else {
      state.slideVY = 0;
    }
  }

  resolvePlayerPosition();
}

function hasLineOfSight(x0, y0, x1, y1) {
  const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 14);
  for (let i = 1; i < steps; i += 1) {
    const t = i / steps;
    const x = x0 + (x1 - x0) * t;
    const y = y0 + (y1 - y0) * t;
    if (tileBlocked(x, y)) return false;
  }
  return true;
}

function updateDoors(dt) {
  if (state.bossArenaActive) return;
  for (const key of Object.keys(state.doorStates)) {
    const [tx, ty] = key.split(",").map(Number);
    const cx = tx + 0.5;
    const cy = ty + 0.5;
    const nearPlayer = Math.hypot(state.player.x - cx, state.player.y - cy) < 1.8;
    let nearEnemy = false;
    for (const enemy of state.enemies) {
      if (enemy.health > 0 && Math.hypot(enemy.x - cx, enemy.y - cy) < 1.35) {
        nearEnemy = true;
        break;
      }
    }
    const target = nearPlayer || nearEnemy ? 1 : 0;
    state.doorStates[key] = clamp(state.doorStates[key] + Math.sign(target - state.doorStates[key]) * dt * 2.1, 0, 1);
  }
}

function applyPickup(pickup) {
  if (pickup.kind === "core") {
    state.coresCollected += 1;
    state.ammo += 4;
    if (state.coresCollected === state.totalCores && state.bossDefeated) {
      state.exitUnlocked = true;
      state.message = "All cores secured. Boss down. Extraction lift unlocked.";
    } else if (state.coresCollected === state.totalCores) {
      state.message = "All cores secured. Boss elite still active.";
    } else {
      state.message = `Power core secured. ${state.totalCores - state.coresCollected} remaining.`;
    }
  }
  if (pickup.kind === "medkit") {
    state.health = clamp(state.health + 32, 0, 100);
    state.message = "Medkit injected.";
  }
  if (pickup.kind === "ammo") {
    state.ammo += 8;
    state.message = "Ammo cache collected.";
  }
  if (pickup.kind === "shield") {
    state.shield = clamp(state.shield + 35, 0, 60);
    state.message = "Shield buffer online.";
  }
  syncHud();
}

function updatePlayer(dt) {
  let moveX = 0;
  let moveY = 0;
  const forwardX = Math.cos(state.player.angle);
  const forwardY = Math.sin(state.player.angle);
  const strafeX = Math.cos(state.player.angle + Math.PI / 2);
  const strafeY = Math.sin(state.player.angle + Math.PI / 2);

  if (keys.has("KeyW")) {
    moveX += forwardX;
    moveY += forwardY;
  }
  if (keys.has("KeyS")) {
    moveX -= forwardX;
    moveY -= forwardY;
  }
  if (keys.has("KeyA")) {
    moveX -= strafeX;
    moveY -= strafeY;
  }
  if (keys.has("KeyD")) {
    moveX += strafeX;
    moveY += strafeY;
  }

  const length = Math.hypot(moveX, moveY) || 1;
  const moveSpeed = MOVE_SPEED * getMapDef().effects.moveMult;
  movePlayer((moveX / length) * moveSpeed * dt, (moveY / length) * moveSpeed * dt);
  movePlayer(state.slideVX * dt, state.slideVY * dt);
  state.slideVX *= 0.94;
  state.slideVY *= 0.94;

  for (const pickup of state.pickups) {
    if (!pickup.taken && Math.hypot(state.player.x - pickup.x, state.player.y - pickup.y) < 0.46) {
      pickup.taken = true;
      applyPickup(pickup);
    }
  }

  if (state.exitUnlocked && isExit(state.player.x, state.player.y)) {
    state.status = "won";
    const map = getMapDef();
    const firstClear = (state.mapProgress[state.mapId] || 0) === 0;
    const reward = map.reward + Math.floor(state.timeLeft * 1.4) + (firstClear ? map.firstClearBonus : 0);
    state.credits += reward;
    state.mapProgress[state.mapId] = (state.mapProgress[state.mapId] || 0) + 1;
    state.message = "Vault cleared. Press Enter for another run.";
    syncHud();
    updateActionButtons();
    renderLoadoutPanel();
    return;
  }

  if (!state.bossArenaActive && state.coresCollected === state.totalCores && !state.bossDefeated && isExit(state.player.x, state.player.y)) {
    activateBossArena();
  }
}

function dealDamage(amount, message) {
  let remaining = amount;
  if (state.shield > 0) {
    const absorbed = Math.min(state.shield, remaining);
    state.shield -= absorbed;
    remaining -= absorbed;
  }
  state.health -= remaining;
  state.hurtFlash = 0.65;
  state.message = message;
  if (state.health <= 0) {
    state.health = 0;
    state.status = "lost";
    state.message = "You were taken apart. Press Enter to redeploy.";
    updateActionButtons();
    renderLoadoutPanel();
  }
  syncHud();
}

function updateHazards(dt) {
  if (state.bossArenaActive) return;
  state.hazardClock += dt;
  const hazards = getMapDef().hazards;
  if (!hazards) return;

  if (hazards.kind === "security_beams") {
    for (const beam of hazards.beams) {
      const active = Math.sin(state.hazardClock * beam.speed + beam.phase) > 0.2;
      if (active && distToSegment(state.player.x, state.player.y, beam.x1, beam.y1, beam.x2, beam.y2) < 0.18) {
        dealDamage(7 * dt, "Security beam contact.");
      }
    }
  }

  if (hazards.kind === "ice") {
    for (const zone of hazards.zones) {
      if (state.player.x > zone.x - zone.w / 2 && state.player.x < zone.x + zone.w / 2 && state.player.y > zone.y - zone.h / 2 && state.player.y < zone.y + zone.h / 2) {
        const dirX = (keys.has("KeyD") ? 1 : 0) - (keys.has("KeyA") ? 1 : 0);
        const dirY = (keys.has("KeyS") ? 1 : 0) - (keys.has("KeyW") ? 1 : 0);
        state.slideVX += dirX * 0.12;
        state.slideVY += dirY * 0.12;
      }
    }
  }

  if (hazards.kind === "lava_vents") {
    for (const vent of hazards.vents) {
      const pulse = (Math.sin(state.hazardClock * 2.2 + vent.phase) + 1) * 0.5;
      if (pulse > 0.72 && Math.hypot(state.player.x - vent.x, state.player.y - vent.y) < vent.radius) {
        dealDamage(10 * dt, "Lava vent flare. Move.");
      }
    }
  }
}

function enemyCanUse(enemy, distance) {
  return distance < ENEMY_DEFS[enemy.type].range;
}

function fireEnemyProjectile(enemy) {
  const def = ENEMY_DEFS[enemy.type];
  if (def.attack === "punch") return;
  const angle = Math.atan2(state.player.y - enemy.y, state.player.x - enemy.x);
  const shots = [];

  if (enemy.isBoss) {
    if (enemy.type === "warden") {
      shots.push({ angle: angle - 0.14, damageScale: 0.7, life: 2.2 });
      shots.push({ angle, damageScale: 1, life: 2.6 });
      shots.push({ angle: angle + 0.14, damageScale: 0.7, life: 2.2 });
    } else if (enemy.type === "frost_tyrant") {
      shots.push({ angle: angle - 0.08, damageScale: 0.95, speedScale: 0.92, life: 2.8, color: "#d7fdff" });
      shots.push({ angle: angle + 0.08, damageScale: 0.95, speedScale: 0.92, life: 2.8, color: "#d7fdff" });
    } else if (enemy.type === "infernal_guard") {
      shots.push({ angle, damageScale: 1.05, speedScale: 1, life: 2.5, color: "#ffd29a" });
      shots.push({ angle: angle - 0.24, damageScale: 0.72, speedScale: 0.9, life: 2.1, color: "#ffb06b" });
      shots.push({ angle: angle + 0.24, damageScale: 0.72, speedScale: 0.9, life: 2.1, color: "#ffb06b" });
    }
  }

  if (shots.length === 0) shots.push({ angle, damageScale: 1, speedScale: 1, life: 2.6 });

  for (const shot of shots) {
    state.enemyProjectiles.push({
      x: enemy.x,
      y: enemy.y,
      vx: Math.cos(shot.angle) * def.projectileSpeed * (shot.speedScale || 1),
      vy: Math.sin(shot.angle) * def.projectileSpeed * (shot.speedScale || 1),
      color: shot.color || def.projectileColor,
      radius: def.size,
      kind: def.attack,
      damage: def.damage * (shot.damageScale || 1) * getDifficulty().damage,
      life: shot.life || 2.6
    });
  }
  playEnemyShotSound();
}

function killEnemy(enemy) {
  enemy.health = 0;
  enemy.dead = true;
  spawnCombatEffect(enemy.x, enemy.y, ENEMY_DEFS[enemy.type].projectileColor, enemy.isBoss ? 1.4 : 0.9, enemy.isBoss ? 0.8 : 0.45);
  if (enemy.isBoss) {
    state.bossDefeated = true;
    state.message = `${ENEMY_DEFS[enemy.type].label} destroyed.`;
    if (state.coresCollected === state.totalCores) {
      state.exitUnlocked = true;
      state.message = "Boss down. Extraction lift unlocked.";
    }
  }
}

function updateEnemies(dt) {
  for (const enemy of state.enemies) {
    if (enemy.health <= 0) continue;

    const def = ENEMY_DEFS[enemy.type];
    const distance = Math.hypot(state.player.x - enemy.x, state.player.y - enemy.y);
    const seesPlayer = distance < 13 && hasLineOfSight(enemy.x, enemy.y, state.player.x, state.player.y);
    let target = enemy.patrol[enemy.patrolIndex];
    let speed = def.speed * getDifficulty().speed;

    if (seesPlayer) {
      target = state.player;
      if (enemy.isBoss) {
        const idealRange = enemy.type === "frost_tyrant" ? 6.8 : enemy.type === "infernal_guard" ? 5.4 : 6.0;
        if (distance < idealRange - 0.8) {
          const retreat = Math.atan2(enemy.y - state.player.y, enemy.x - state.player.x);
          target = { x: enemy.x + Math.cos(retreat) * 1.4, y: enemy.y + Math.sin(retreat) * 1.4 };
        } else if (distance < idealRange) {
          target = { x: enemy.x, y: enemy.y };
        }
      }
      if (enemy.type === "sniper" && distance < 4.2) {
        const fleeAngle = Math.atan2(enemy.y - state.player.y, enemy.x - state.player.x);
        target = { x: enemy.x + Math.cos(fleeAngle), y: enemy.y + Math.sin(fleeAngle) };
      }
    } else if (Math.hypot(enemy.x - target.x, enemy.y - target.y) < 0.2) {
      enemy.patrolIndex = (enemy.patrolIndex + 1) % enemy.patrol.length;
      target = enemy.patrol[enemy.patrolIndex];
    }

    const angle = Math.atan2(target.y - enemy.y, target.x - enemy.x);
    const nx = enemy.x + Math.cos(angle) * speed * dt;
    const ny = enemy.y + Math.sin(angle) * speed * dt;
    if (!tileBlocked(nx, enemy.y)) enemy.x = nx;
    if (!tileBlocked(enemy.x, ny)) enemy.y = ny;

    enemy.cooldown = Math.max(0, enemy.cooldown - dt);
    if (seesPlayer && def.attack !== "punch" && enemyCanUse(enemy, distance) && enemy.cooldown === 0) {
      enemy.cooldown = def.fireRate;
      fireEnemyProjectile(enemy);
    }

    if (distance < 0.9 && enemy.type === "brute" && enemy.cooldown < def.fireRate - 0.65) {
      enemy.cooldown = def.fireRate;
      dealDamage(def.damage * getDifficulty().damage, "Brute punch. Back off.");
    }

    enemy.hitFlash = Math.max(0, (enemy.hitFlash || 0) - dt * 2.2);
  }
}

function updateEnemyProjectiles(dt) {
  state.enemyProjectiles = state.enemyProjectiles.filter((projectile) => {
    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;
    projectile.life -= dt;
    if (tileBlocked(projectile.x, projectile.y) || projectile.life <= 0) {
      return false;
    }
    if (Math.hypot(state.player.x - projectile.x, state.player.y - projectile.y) < 0.38) {
      dealDamage(projectile.damage, "Incoming fire. Dodge the plasma.");
      return false;
    }
    return true;
  });
}

function updateProjectiles(dt) {
  state.projectiles = state.projectiles.filter((projectile) => {
    projectile.life -= dt;
    return projectile.life > 0;
  });
}

function updateCombatEffects(dt) {
  state.combatEffects = state.combatEffects.filter((effect) => {
    effect.life -= dt;
    return effect.life > 0;
  });
}

function castRay(angle) {
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);
  const depthLimit = getMapDef().effects.visibility;
  for (let depth = 0; depth < depthLimit; depth += 0.02) {
    const x = state.player.x + cos * depth;
    const y = state.player.y + sin * depth;
    if (tileBlocked(x, y)) {
      return { depth, x, y, cell: getCell(x, y) };
    }
  }
  return { depth: depthLimit, x: state.player.x, y: state.player.y, cell: "." };
}

function getMuzzleAnchor() {
  const bob = Math.sin(performance.now() * 0.008) * 4;
  const pitchLift = state.player.pitch * 120;
  const weapon = getWeaponDef();
  const x = weapon.name === "Sniper Rifle" ? WIDTH * 0.69 : weapon.name === "Shotgun" ? WIDTH * 0.65 : WIDTH * 0.63;
  return { x, y: HEIGHT - 140 + bob - pitchLift };
}

function shoot() {
  if (state.status !== "playing" || state.ammo <= 0 || state.cooldown > 0) return;
  const weapon = getWeaponDef();
  if (state.ammo < weapon.ammoUse) return;
  state.ammo -= weapon.ammoUse;
  state.cooldown = weapon.cooldown;
  state.muzzleFlash = 0.11;
  state.recoil = weapon.recoil;
  state.message = `${weapon.name} fired.`;
  playShotSound();

  const muzzle = getMuzzleAnchor();
  let hitCount = 0;

  for (let pellet = 0; pellet < weapon.pellets; pellet += 1) {
    let projectileTargetX = WIDTH / 2;
    let projectileTargetY = HALF_HEIGHT;
    const shootAngle = state.player.angle + rand(-weapon.spread, weapon.spread);
    let bestEnemy = null;
    let bestDelta = Math.max(weapon.spread * 1.8, 0.04);

    for (const enemy of state.enemies) {
      if (enemy.health <= 0) continue;
      const dx = enemy.x - state.player.x;
      const dy = enemy.y - state.player.y;
      const distance = Math.hypot(dx, dy);
      const angleToEnemy = Math.atan2(dy, dx);
      let delta = angleToEnemy - shootAngle;
      delta = Math.atan2(Math.sin(delta), Math.cos(delta));
      if (Math.abs(delta) < bestDelta && distance < weapon.range && hasLineOfSight(state.player.x, state.player.y, enemy.x, enemy.y)) {
        bestDelta = Math.abs(delta);
        bestEnemy = enemy;
      }
    }

    if (bestEnemy) {
      let damage = weapon.damage;
      bestEnemy.hitFlash = 1;
      hitCount += 1;
      let weakHit = null;
      if (bestEnemy.isBoss) {
        const projected = projectSprite(bestEnemy.x, bestEnemy.y, 2.35);
        if (projected) {
          const weakPoints = getBossWeakpointScreenPositions(projected, bestEnemy);
          weakHit = weakPoints.find((point) => point.active && Math.hypot(point.screenX - WIDTH / 2, point.screenY - HALF_HEIGHT) < Math.max(point.screenRadius, 18));
        }
        if (weakHit) {
          damage = Math.ceil(weapon.damage * 2.4);
          bestEnemy.weakPointHealth[weakHit.key] = 0;
          state.message = `${weakHit.name} shattered.`;
        } else {
          damage = Math.max(1, Math.ceil(weapon.damage * 0.35));
          state.message = "Armor hit. Find a weak point.";
        }
      }
      bestEnemy.health -= damage;
      spawnCombatEffect(bestEnemy.x, bestEnemy.y, weakHit ? weakHit.color : ENEMY_DEFS[bestEnemy.type].projectileColor, weakHit ? 0.8 : 0.45, 0.18);
      if (bestEnemy.health <= 0) {
        killEnemy(bestEnemy);
      }
      const projected = projectSprite(bestEnemy.x, bestEnemy.y, 1.1);
      if (projected) {
        projectileTargetX = projected.screenX + rand(-4, 4);
        projectileTargetY = HALF_HEIGHT - projected.size * 0.1 + rand(-4, 4);
      }
    }

    state.projectiles.push({
      x0: muzzle.x,
      y0: muzzle.y,
      x1: projectileTargetX,
      y1: projectileTargetY,
      life: 0.12,
      maxLife: 0.12
    });
  }

  if (hitCount > 0 && state.message === `${weapon.name} fired.`) {
    state.message = "Direct hit.";
  }
  syncHud();
}

function projectSprite(x, y, scale = 1) {
  const dx = x - state.player.x;
  const dy = y - state.player.y;
  const distance = Math.hypot(dx, dy);
  let angle = Math.atan2(dy, dx) - state.player.angle;
  angle = Math.atan2(Math.sin(angle), Math.cos(angle));
  if (Math.abs(angle) > FOV * 0.68) return null;
  return {
    distance,
    screenX: (0.5 + angle / FOV) * WIDTH,
    screenY: getHorizon(),
    size: Math.min(HEIGHT, (420 / Math.max(distance, 0.1)) * scale)
  };
}

function getEnemyPose(projected, enemy) {
  const def = ENEMY_DEFS[enemy.type];
  const hoverOffset = def.hover ? Math.sin(performance.now() * 0.006 + enemy.hoverPhase) * projected.size * 0.08 : 0;
  const bodyW = projected.size * (enemy.isBoss ? 0.58 : enemy.type === "brute" ? 0.4 : enemy.type === "drone" ? 0.31 : 0.2);
  const bodyH = projected.size * (enemy.isBoss ? 0.86 : enemy.type === "brute" ? 0.62 : enemy.type === "drone" ? 0.34 : 0.58);
  const groundY = projected.screenY + projected.size * 0.5;
  const top = def.hover ? projected.screenY - projected.size * 0.3 + hoverOffset : groundY - bodyH;
  return { def, hoverOffset, bodyW, bodyH, groundY, top, left: projected.screenX - bodyW / 2 };
}

function getBossWeakpointScreenPositions(projected, enemy) {
  if (!enemy.isBoss || !enemy.weakPoints) return [];
  const pose = getEnemyPose(projected, enemy);
  return enemy.weakPoints.map((point) => ({
    ...point,
    screenX: projected.screenX + point.dx * projected.size,
    screenY: pose.top + point.dy * projected.size,
    screenRadius: point.radius * projected.size,
    active: enemy.weakPointHealth?.[point.key] !== 0
  }));
}

function spriteHiddenByWall(projected, widthScale = 0.2) {
  const halfWidth = projected.size * widthScale;
  const start = Math.max(0, Math.floor(projected.screenX - halfWidth));
  const end = Math.min(WIDTH - 1, Math.ceil(projected.screenX + halfWidth));
  for (let x = start; x <= end; x += 1) {
    if (projected.distance <= wallDepthBuffer[x] + 0.05) return false;
  }
  return true;
}

function renderBackground() {
  const horizon = getHorizon();
  const map = getMapDef();
  const sky = ctx.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, map.palette.skyA);
  sky.addColorStop(0.52, map.palette.skyB);
  sky.addColorStop(1, map.palette.skyC);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WIDTH, horizon);

  ctx.fillStyle = "rgba(180, 240, 255, 0.2)";
  for (let i = 0; i < 18; i += 1) {
    const x = 40 + i * 54 + Math.sin(i * 11.3) * 12;
    const y = 26 + (i % 5) * 22;
    ctx.fillRect(x, y, 2, 2);
  }

  ctx.fillStyle = "rgba(150, 255, 214, 0.05)";
  for (let i = 0; i < 28; i += 1) {
    ctx.fillRect((i / 28) * WIDTH, 0, 1, horizon * 0.78);
  }

  ctx.fillStyle = "rgba(110, 255, 224, 0.08)";
  for (let i = 0; i < 5; i += 1) {
    const px = 90 + i * 180;
    ctx.beginPath();
    ctx.arc(px, horizon * 0.32 + i * 4, 22 + i * 6, 0, Math.PI * 2);
    ctx.fill();
  }

  const floor = ctx.createLinearGradient(0, horizon, 0, HEIGHT);
  floor.addColorStop(0, "#132027");
  floor.addColorStop(0.58, "#081118");
  floor.addColorStop(1, "#020507");
  ctx.fillStyle = floor;
  ctx.fillRect(0, horizon, WIDTH, HEIGHT - horizon);

  for (let i = 1; i < 11; i += 1) {
    const y = horizon + (i / 11) ** 1.8 * (HEIGHT - horizon);
    ctx.strokeStyle = `rgba(149, 255, 214, ${0.18 - i * 0.012})`;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WIDTH, y);
    ctx.stroke();
  }

  if (map.effects.fog > 0) {
    ctx.fillStyle = `rgba(180, 225, 255, ${map.effects.fog})`;
    ctx.fillRect(0, horizon * 0.32, WIDTH, HEIGHT - horizon * 0.32);
  }
}

function renderHazards() {
  if (state.status !== "playing") return;
  const hazards = getMapDef().hazards;
  if (!hazards) return;

  if (hazards.kind === "security_beams") {
    for (const beam of hazards.beams) {
      const active = Math.sin(state.hazardClock * beam.speed + beam.phase) > 0.2;
      if (!active) continue;
      const a = projectSprite(beam.x1, beam.y1, 0.2);
      const b = projectSprite(beam.x2, beam.y2, 0.2);
      if (!a || !b) continue;
      ctx.strokeStyle = "rgba(255, 86, 128, 0.75)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(a.screenX, a.screenY + 10);
      ctx.lineTo(b.screenX, b.screenY + 10);
      ctx.stroke();
    }
  }

  if (hazards.kind === "lava_vents") {
    for (const vent of hazards.vents) {
      const pulse = (Math.sin(state.hazardClock * 2.2 + vent.phase) + 1) * 0.5;
      const projected = projectSprite(vent.x, vent.y, 1.1);
      if (!projected || spriteHiddenByWall(projected, 0.18)) continue;
      ctx.fillStyle = `rgba(255, 120, 60, ${0.18 + pulse * 0.22})`;
      ctx.beginPath();
      ctx.arc(projected.screenX, projected.screenY + projected.size * 0.42, projected.size * (0.12 + pulse * 0.06), 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function renderWalls() {
  const horizon = getHorizon();
  const map = getMapDef();
  wallDepthBuffer.fill(MAX_DEPTH);

  for (let x = 0; x < WIDTH; x += 1) {
    const rayAngle = state.player.angle - FOV / 2 + (x / WIDTH) * FOV;
    const hit = castRay(rayAngle);
    const correctedDepth = hit.depth * Math.cos(rayAngle - state.player.angle);
    const wallHeight = Math.min(HEIGHT, (HEIGHT / Math.max(correctedDepth, 0.0001)) * 0.98);
    const shade = Math.max(0.18, 1 - correctedDepth / MAX_DEPTH);
    const wallTop = horizon - wallHeight / 2;
    wallDepthBuffer[x] = correctedDepth;

    const tx = hit.cell === "D" ? hit.x - Math.floor(hit.x) : hit.y - Math.floor(hit.y);
    const stripe = Math.floor(tx * 8) % 2;
    const edgeBand = tx < 0.08 || tx > 0.92;
    const seamBand = Math.abs(tx - 0.5) < 0.035;
    let colorA = map.palette.wallA;
    let colorB = map.palette.wallB;
    if (hit.cell === "D") {
      colorA = [110, 196, 255];
      colorB = [18, 34, 58];
    }
    if (hit.cell === "X") {
      colorA = [255, 212, 118];
      colorB = [61, 45, 16];
    }
    const mix = stripe ? 0.78 : 1.02;
    ctx.fillStyle = `rgb(${Math.floor(colorA[0] * shade * mix + colorB[0] * (1 - shade))}, ${Math.floor(colorA[1] * shade * mix + colorB[1] * (1 - shade))}, ${Math.floor(colorA[2] * shade * mix + colorB[2] * (1 - shade))})`;
    ctx.fillRect(x, wallTop, 1, wallHeight);

    if (edgeBand) {
      ctx.fillStyle = `rgba(6, 10, 14, ${0.5 + (1 - shade) * 0.18})`;
      ctx.fillRect(x, wallTop, 1, wallHeight);
    } else if (seamBand) {
      ctx.fillStyle = `rgba(10, 14, 18, ${0.32 + (1 - shade) * 0.12})`;
      ctx.fillRect(x, wallTop + wallHeight * 0.04, 1, wallHeight * 0.92);
    }

    if (hit.cell === "D") {
      const panelGlow = 0.1 + doorOpenAmount(hit.x, hit.y) * 0.18;
      ctx.fillStyle = `rgba(164, 228, 255, ${panelGlow * shade})`;
      ctx.fillRect(x, wallTop + wallHeight * 0.22, 1, wallHeight * 0.1);
    } else {
      ctx.fillStyle = `rgba(210, 255, 242, ${0.08 * shade})`;
      ctx.fillRect(x, wallTop + wallHeight * 0.18, 1, 1);
      ctx.fillStyle = `rgba(149, 255, 214, ${0.16 * shade})`;
      ctx.fillRect(x, wallTop + wallHeight * 0.38, 1, 2);
    }

    ctx.fillStyle = `rgba(8, 18, 20, ${0.48 - shade * 0.18})`;
    ctx.fillRect(x, wallTop + wallHeight * 0.8, 1, wallHeight * 0.2);
  }
}

function drawPickup(projected, pickup) {
  const alpha = Math.max(0.32, 1 - projected.distance / MAX_DEPTH);
  const centerY = projected.screenY + projected.size * 0.05;
  let glowColor = "149,255,214";
  if (pickup.kind === "medkit") glowColor = "255,120,120";
  if (pickup.kind === "ammo") glowColor = "255,215,116";
  if (pickup.kind === "shield") glowColor = "114,173,255";

  const halo = ctx.createRadialGradient(projected.screenX, centerY, 0, projected.screenX, centerY, projected.size * 0.34);
  halo.addColorStop(0, `rgba(${glowColor}, ${alpha})`);
  halo.addColorStop(1, `rgba(${glowColor}, 0)`);
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(projected.screenX, centerY, projected.size * 0.34, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.ellipse(projected.screenX, projected.screenY + projected.size * 0.34, projected.size * 0.16, projected.size * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();

  if (pickup.kind === "core") {
    ctx.strokeStyle = `rgba(232,255,248,${alpha * 0.86})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(projected.screenX, centerY - projected.size * 0.18);
    ctx.lineTo(projected.screenX + projected.size * 0.18, centerY);
    ctx.lineTo(projected.screenX, centerY + projected.size * 0.18);
    ctx.lineTo(projected.screenX - projected.size * 0.18, centerY);
    ctx.closePath();
    ctx.stroke();
  } else {
    ctx.fillStyle = `rgba(${glowColor}, ${alpha})`;
    ctx.fillRect(projected.screenX - projected.size * 0.12, centerY - projected.size * 0.12, projected.size * 0.24, projected.size * 0.24);
  }
}

function drawEnemy(projected, enemy) {
  const def = ENEMY_DEFS[enemy.type];
  const alpha = Math.max(0.35, 1 - projected.distance / MAX_DEPTH);
  const hitBoost = (enemy.hitFlash || 0) * 0.35;
  const pose = getEnemyPose(projected, enemy);
  const { bodyW, bodyH, left, groundY, top } = pose;
  const pulse = 0.75 + Math.sin(performance.now() * 0.008 + enemy.x + enemy.y) * 0.25;

  const colorR = parseInt(def.color.slice(1, 3), 16);
  const colorG = parseInt(def.color.slice(3, 5), 16);
  const colorB = parseInt(def.color.slice(5, 7), 16);

  if (enemy.isBoss) {
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.26})`;
    ctx.beginPath();
    ctx.ellipse(projected.screenX, groundY + projected.size * 0.04, bodyW * 0.98, projected.size * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    if (enemy.type === "warden") {
      ctx.fillStyle = `rgba(20, 24, 36, ${alpha + hitBoost})`;
      ctx.fillRect(projected.screenX - bodyW * 0.24, top + bodyH * 0.16, bodyW * 0.48, bodyH * 0.5);
      ctx.fillRect(projected.screenX - bodyW * 0.12, top + bodyH * 0.66, bodyW * 0.08, bodyH * 0.28);
      ctx.fillRect(projected.screenX + bodyW * 0.04, top + bodyH * 0.66, bodyW * 0.08, bodyH * 0.28);
      ctx.fillStyle = `rgba(52, 58, 78, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(projected.screenX, top);
      ctx.lineTo(projected.screenX + bodyW * 0.38, top + bodyH * 0.13);
      ctx.lineTo(projected.screenX + bodyW * 0.24, top + bodyH * 0.3);
      ctx.lineTo(projected.screenX - bodyW * 0.24, top + bodyH * 0.3);
      ctx.lineTo(projected.screenX - bodyW * 0.38, top + bodyH * 0.13);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = `rgba(96, 108, 126, ${alpha})`;
      ctx.fillRect(projected.screenX - bodyW * 0.56, top + bodyH * 0.22, bodyW * 0.18, bodyH * 0.4);
      ctx.fillRect(projected.screenX + bodyW * 0.38, top + bodyH * 0.22, bodyW * 0.18, bodyH * 0.4);
      ctx.strokeStyle = `rgba(${colorR},${colorG},${colorB},${alpha * 0.9})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(projected.screenX - bodyW * 0.47, top + bodyH * 0.6);
      ctx.lineTo(projected.screenX - bodyW * 0.7, top + bodyH * 0.86);
      ctx.moveTo(projected.screenX + bodyW * 0.47, top + bodyH * 0.6);
      ctx.lineTo(projected.screenX + bodyW * 0.7, top + bodyH * 0.86);
      ctx.stroke();
    } else if (enemy.type === "frost_tyrant") {
      ctx.fillStyle = `rgba(16, 28, 40, ${alpha + hitBoost})`;
      ctx.beginPath();
      ctx.moveTo(projected.screenX, top - bodyH * 0.06);
      ctx.lineTo(projected.screenX + bodyW * 0.24, top + bodyH * 0.16);
      ctx.lineTo(projected.screenX + bodyW * 0.31, top + bodyH * 0.54);
      ctx.lineTo(projected.screenX, top + bodyH * 0.74);
      ctx.lineTo(projected.screenX - bodyW * 0.31, top + bodyH * 0.54);
      ctx.lineTo(projected.screenX - bodyW * 0.24, top + bodyH * 0.16);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = `rgba(72, 118, 138, ${alpha})`;
      ctx.fillRect(projected.screenX - bodyW * 0.48, top + bodyH * 0.24, bodyW * 0.16, bodyH * 0.28);
      ctx.fillRect(projected.screenX + bodyW * 0.32, top + bodyH * 0.24, bodyW * 0.16, bodyH * 0.28);
      ctx.strokeStyle = `rgba(214, 250, 255, ${alpha * 0.82})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(projected.screenX - bodyW * 0.24, top + bodyH * 0.7);
      ctx.lineTo(projected.screenX - bodyW * 0.16, groundY);
      ctx.moveTo(projected.screenX + bodyW * 0.24, top + bodyH * 0.7);
      ctx.lineTo(projected.screenX + bodyW * 0.16, groundY);
      ctx.moveTo(projected.screenX - bodyW * 0.1, top + bodyH * 0.62);
      ctx.lineTo(projected.screenX - bodyW * 0.36, top + bodyH * 0.92);
      ctx.moveTo(projected.screenX + bodyW * 0.1, top + bodyH * 0.62);
      ctx.lineTo(projected.screenX + bodyW * 0.36, top + bodyH * 0.92);
      ctx.stroke();
    } else {
      ctx.fillStyle = `rgba(34, 20, 14, ${alpha + hitBoost})`;
      ctx.fillRect(projected.screenX - bodyW * 0.28, top + bodyH * 0.14, bodyW * 0.56, bodyH * 0.56);
      ctx.fillStyle = `rgba(82, 44, 28, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(projected.screenX, top - bodyH * 0.04);
      ctx.lineTo(projected.screenX + bodyW * 0.24, top + bodyH * 0.12);
      ctx.lineTo(projected.screenX + bodyW * 0.18, top + bodyH * 0.28);
      ctx.lineTo(projected.screenX - bodyW * 0.18, top + bodyH * 0.28);
      ctx.lineTo(projected.screenX - bodyW * 0.24, top + bodyH * 0.12);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = `rgba(116, 80, 48, ${alpha})`;
      ctx.fillRect(projected.screenX - bodyW * 0.54, top + bodyH * 0.2, bodyW * 0.16, bodyH * 0.42);
      ctx.fillRect(projected.screenX + bodyW * 0.38, top + bodyH * 0.2, bodyW * 0.16, bodyH * 0.42);
      ctx.fillRect(projected.screenX - bodyW * 0.22, top + bodyH * 0.7, bodyW * 0.12, bodyH * 0.26);
      ctx.fillRect(projected.screenX + bodyW * 0.1, top + bodyH * 0.7, bodyW * 0.12, bodyH * 0.26);
      ctx.strokeStyle = `rgba(255, 194, 128, ${alpha * 0.88})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(projected.screenX - bodyW * 0.46, top + bodyH * 0.62);
      ctx.lineTo(projected.screenX - bodyW * 0.62, top + bodyH * 0.92);
      ctx.moveTo(projected.screenX + bodyW * 0.46, top + bodyH * 0.62);
      ctx.lineTo(projected.screenX + bodyW * 0.62, top + bodyH * 0.92);
      ctx.stroke();
    }

    const weakPoints = getBossWeakpointScreenPositions(projected, enemy);
    for (const point of weakPoints) {
      const active = point.active;
      const halo = ctx.createRadialGradient(point.screenX, point.screenY, 0, point.screenX, point.screenY, point.screenRadius * 2.2);
      halo.addColorStop(0, `${point.color}${active ? "ff" : "44"}`);
      halo.addColorStop(1, `${point.color}00`);
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(point.screenX, point.screenY, point.screenRadius * 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = active ? point.color : "rgba(90,90,90,0.75)";
      ctx.beginPath();
      ctx.arc(point.screenX, point.screenY, point.screenRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = "rgba(255,255,255,0.82)";
    ctx.strokeRect(projected.screenX - projected.size * 0.22, top - 18, projected.size * 0.44, 6);
    ctx.fillStyle = `rgba(255, 120, 120, 0.85)`;
    const healthRatio = Math.max(0, enemy.health / (enemy.maxHealth || enemy.health));
    ctx.fillRect(projected.screenX - projected.size * 0.22, top - 18, projected.size * 0.44 * healthRatio, 6);
    return;
  }

  if (enemy.type === "drone") {
    ctx.fillStyle = `rgba(4, 9, 12, ${alpha * 0.32})`;
    ctx.beginPath();
    ctx.ellipse(projected.screenX, groundY + projected.size * 0.02, bodyW * 0.86, projected.size * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(16, 24, 38, ${alpha + hitBoost})`;
    ctx.beginPath();
    ctx.ellipse(projected.screenX, top + bodyH * 0.46, bodyW * 0.58, bodyH * 0.46, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(${colorR},${colorG},${colorB},${alpha * 0.95})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(projected.screenX, top + bodyH * 0.42, bodyW * 0.42, Math.PI * 0.18, Math.PI * 0.82);
    ctx.stroke();

    ctx.fillStyle = `rgba(${colorR},${colorG},${colorB},${alpha * pulse})`;
    ctx.beginPath();
    ctx.ellipse(projected.screenX - bodyW * 0.5, top + bodyH * 0.42, bodyW * 0.16, bodyH * 0.09, -0.3, 0, Math.PI * 2);
    ctx.ellipse(projected.screenX + bodyW * 0.5, top + bodyH * 0.42, bodyW * 0.16, bodyH * 0.09, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(170, 250, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(projected.screenX, top + bodyH * 0.44, projected.size * 0.055, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(${colorR},${colorG},${colorB},${alpha * 0.5})`;
    ctx.beginPath();
    ctx.moveTo(projected.screenX - bodyW * 0.52, top + bodyH * 0.7);
    ctx.lineTo(projected.screenX - bodyW * 0.82, top + bodyH * 0.92);
    ctx.moveTo(projected.screenX - bodyW * 0.18, top + bodyH * 0.72);
    ctx.lineTo(projected.screenX - bodyW * 0.38, top + bodyH * 1.04);
    ctx.moveTo(projected.screenX + bodyW * 0.52, top + bodyH * 0.7);
    ctx.lineTo(projected.screenX + bodyW * 0.82, top + bodyH * 0.92);
    ctx.moveTo(projected.screenX + bodyW * 0.18, top + bodyH * 0.72);
    ctx.lineTo(projected.screenX + bodyW * 0.38, top + bodyH * 1.04);
    ctx.stroke();
  } else if (enemy.type === "brute") {
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.22})`;
    ctx.beginPath();
    ctx.ellipse(projected.screenX, groundY + projected.size * 0.02, bodyW * 0.6, projected.size * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();
    const torsoTop = top + bodyH * 0.18;
    const torsoH = bodyH * 0.38;
    const legTop = torsoTop + torsoH;
    ctx.fillStyle = `rgba(18, 22, 29, ${alpha + hitBoost})`;
    ctx.fillRect(projected.screenX - bodyW * 0.24, torsoTop, bodyW * 0.48, torsoH);
    ctx.fillStyle = `rgba(55, 31, 28, ${alpha})`;
    ctx.beginPath();
    ctx.moveTo(projected.screenX, top);
    ctx.lineTo(projected.screenX + bodyW * 0.28, top + bodyH * 0.14);
    ctx.lineTo(projected.screenX + bodyW * 0.2, top + bodyH * 0.26);
    ctx.lineTo(projected.screenX - bodyW * 0.2, top + bodyH * 0.26);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = `rgba(${colorR},${colorG},${colorB},${alpha * pulse})`;
    ctx.fillRect(projected.screenX - bodyW * 0.14, torsoTop + torsoH * 0.18, bodyW * 0.28, torsoH * 0.24);
    ctx.fillStyle = `rgba(82, 91, 102, ${alpha})`;
    ctx.fillRect(projected.screenX - bodyW * 0.48, torsoTop + torsoH * 0.05, bodyW * 0.18, torsoH * 0.46);
    ctx.fillRect(projected.screenX + bodyW * 0.3, torsoTop + torsoH * 0.05, bodyW * 0.18, torsoH * 0.46);
    ctx.fillRect(projected.screenX - bodyW * 0.22, legTop, bodyW * 0.14, bodyH * 0.34);
    ctx.fillRect(projected.screenX + bodyW * 0.08, legTop, bodyW * 0.14, bodyH * 0.34);
    ctx.strokeStyle = `rgba(255, 169, 123, ${alpha * 0.88})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(projected.screenX - bodyW * 0.16, legTop + bodyH * 0.34);
    ctx.lineTo(projected.screenX - bodyW * 0.22, groundY);
    ctx.moveTo(projected.screenX + bodyW * 0.16, legTop + bodyH * 0.34);
    ctx.lineTo(projected.screenX + bodyW * 0.22, groundY);
    ctx.stroke();
  } else {
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.18})`;
    ctx.beginPath();
    ctx.ellipse(projected.screenX, groundY + projected.size * 0.02, bodyW * 0.44, projected.size * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();
    const torsoTop = top + bodyH * 0.18;
    const torsoH = bodyH * 0.42;
    ctx.fillStyle = `rgba(22, 18, 34, ${alpha + hitBoost})`;
    ctx.fillRect(left + bodyW * 0.12, torsoTop, bodyW * 0.76, torsoH);
    ctx.fillStyle = `rgba(48, 40, 68, ${alpha})`;
    ctx.beginPath();
    ctx.moveTo(projected.screenX, top);
    ctx.lineTo(left + bodyW, top + bodyH * 0.18);
    ctx.lineTo(left + bodyW * 0.78, top + bodyH * 0.3);
    ctx.lineTo(left + bodyW * 0.22, top + bodyH * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = `rgba(${colorR},${colorG},${colorB},${alpha * pulse})`;
    ctx.fillRect(projected.screenX - bodyW * 0.1, torsoTop + torsoH * 0.12, bodyW * 0.2, torsoH * 0.5);
    ctx.strokeStyle = `rgba(222, 212, 255, ${alpha * 0.85})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(projected.screenX - bodyW * 0.56, torsoTop + torsoH * 0.2);
    ctx.lineTo(projected.screenX - bodyW * 0.1, torsoTop + torsoH * 0.34);
    ctx.moveTo(projected.screenX + bodyW * 0.56, torsoTop + torsoH * 0.2);
    ctx.lineTo(projected.screenX + bodyW * 0.1, torsoTop + torsoH * 0.34);
    ctx.moveTo(projected.screenX - bodyW * 0.14, torsoTop + torsoH);
    ctx.lineTo(projected.screenX - bodyW * 0.22, groundY);
    ctx.moveTo(projected.screenX + bodyW * 0.14, torsoTop + torsoH);
    ctx.lineTo(projected.screenX + bodyW * 0.22, groundY);
    ctx.stroke();
    ctx.fillStyle = `rgba(180, 170, 255, ${alpha * 0.86})`;
    ctx.fillRect(projected.screenX - bodyW * 0.05, groundY - bodyH * 0.04, bodyW * 0.1, bodyH * 0.16);
  }

  ctx.fillStyle = "rgba(255,255,255,0.82)";
  for (let i = 0; i < enemy.health; i += 1) {
    ctx.fillRect(projected.screenX - projected.size * 0.16 + i * 7, top - 10, 5, 3);
  }
}

function drawEnemyProjectile(projected, projectile) {
  const alpha = Math.max(0.32, 1 - projected.distance / MAX_DEPTH);
  const color = projectile.color;
  const centerY = projected.screenY + projected.size * 0.08;
  if (projectile.kind === "beam") {
    ctx.strokeStyle = `${color}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`;
    ctx.lineWidth = Math.max(2, projected.size * 0.08);
    ctx.beginPath();
    ctx.moveTo(projected.screenX, centerY - projected.size * 0.22);
    ctx.lineTo(projected.screenX, centerY + projected.size * 0.22);
    ctx.stroke();
    ctx.fillStyle = `${color}${Math.round(alpha * 200).toString(16).padStart(2, "0")}`;
    ctx.fillRect(projected.screenX - projected.size * 0.04, centerY - projected.size * 0.2, projected.size * 0.08, projected.size * 0.4);
    return;
  }

  const halo = ctx.createRadialGradient(projected.screenX, centerY, 0, projected.screenX, centerY, projected.size * 0.28);
  halo.addColorStop(0, `${color}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`);
  halo.addColorStop(1, `${color}00`);
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(projected.screenX, centerY, projected.size * 0.28, 0, Math.PI * 2);
  ctx.fill();
}

function renderSprites() {
  const sprites = [];

  for (const pickup of state.pickups) {
    if (!pickup.taken) sprites.push({ kind: "pickup", pickup, x: pickup.x, y: pickup.y, scale: 0.7 });
  }
  for (const enemy of state.enemies) {
    if (enemy.health > 0) sprites.push({ kind: "enemy", enemy, x: enemy.x, y: enemy.y, scale: enemy.isBoss ? 1.95 : enemy.type === "brute" ? 1.28 : 1 });
  }
  for (const projectile of state.enemyProjectiles) {
    sprites.push({ kind: "enemyProjectile", projectile, x: projectile.x, y: projectile.y, scale: 0.55 });
  }

  sprites.sort((a, b) => Math.hypot(state.player.x - b.x, state.player.y - b.y) - Math.hypot(state.player.x - a.x, state.player.y - a.y));

  for (const sprite of sprites) {
    const projected = projectSprite(sprite.x, sprite.y, sprite.scale);
    if (!projected) continue;
    if (spriteHiddenByWall(projected, sprite.kind === "enemyProjectile" ? 0.12 : 0.22)) continue;

    if (sprite.kind === "pickup") drawPickup(projected, sprite.pickup);
    if (sprite.kind === "enemy") drawEnemy(projected, sprite.enemy);
    if (sprite.kind === "enemyProjectile") drawEnemyProjectile(projected, sprite.projectile);
  }
}

function renderProjectiles() {
  for (const projectile of state.projectiles) {
    const t = projectile.life / projectile.maxLife;
    ctx.strokeStyle = `rgba(146, 255, 231, ${t * 0.92})`;
    ctx.lineWidth = 2 + t * 2;
    ctx.beginPath();
    ctx.moveTo(projectile.x0, projectile.y0);
    ctx.lineTo(projectile.x1, projectile.y1);
    ctx.stroke();
    ctx.fillStyle = `rgba(255, 214, 120, ${t})`;
    ctx.beginPath();
    ctx.arc(projectile.x1, projectile.y1, 4 + t * 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255, 244, 177, ${t * 0.45})`;
    ctx.beginPath();
    ctx.arc(projectile.x1, projectile.y1, 8 + t * 7, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderCombatEffects() {
  for (const effect of state.combatEffects) {
    const projected = projectSprite(effect.x, effect.y, effect.size);
    if (!projected) continue;
    const t = effect.life / effect.maxLife;
    const centerY = projected.screenY + projected.size * 0.1;
    const halo = ctx.createRadialGradient(projected.screenX, centerY, 0, projected.screenX, centerY, projected.size * 0.3);
    halo.addColorStop(0, `${effect.color}${Math.round(t * 255).toString(16).padStart(2, "0")}`);
    halo.addColorStop(1, `${effect.color}00`);
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(projected.screenX, centerY, projected.size * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderMinimap() {
  if (state.status !== "playing") return;

  const size = 156;
  const padding = 16;
  const mapX = WIDTH - size - padding;
  const mapY = HEIGHT - size - padding;
  const layout = getMapDef().layout;
  const tileW = size / layout[0].length;
  const tileH = size / layout.length;

  ctx.fillStyle = "rgba(6, 11, 14, 0.82)";
  ctx.fillRect(mapX, mapY, size, size);
  ctx.strokeStyle = "rgba(149, 255, 214, 0.28)";
  ctx.strokeRect(mapX, mapY, size, size);
  ctx.fillStyle = "rgba(6, 11, 14, 0.88)";
  ctx.fillRect(mapX, mapY - 24, 74, 20);
  ctx.strokeStyle = "rgba(149, 255, 214, 0.18)";
  ctx.strokeRect(mapX, mapY - 24, 74, 20);
  ctx.fillStyle = "#95ffd6";
  ctx.font = "12px Trebuchet MS";
  ctx.textAlign = "left";
  ctx.fillText("CORE MAP", mapX + 8, mapY - 10);

  for (let y = 0; y < layout.length; y += 1) {
    for (let x = 0; x < layout[y].length; x += 1) {
      const cell = state.bossArenaActive ? getArenaCellByIndex(x, y) : layout[y][x];
      if (cell === "#") {
        ctx.fillStyle = "#183238";
        ctx.fillRect(mapX + x * tileW, mapY + y * tileH, tileW, tileH);
      } else if (cell === "D") {
        ctx.fillStyle = "#31556b";
        ctx.fillRect(mapX + x * tileW, mapY + y * tileH, tileW, tileH);
      } else if (cell === "X") {
        ctx.fillStyle = state.exitUnlocked ? "#d8b45c" : "#56431b";
        ctx.fillRect(mapX + x * tileW, mapY + y * tileH, tileW, tileH);
      }
    }
  }

  for (const pickup of state.pickups) {
    if (!state.bossArenaActive && !pickup.taken && pickup.kind === "core") {
      ctx.fillStyle = "#95ffd6";
      ctx.beginPath();
      ctx.arc(mapX + pickup.x * tileW, mapY + pickup.y * tileH, Math.max(2, tileW * 0.3), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.fillStyle = "#ff8f63";
  for (const enemy of state.enemies) {
    if (enemy.health > 0) {
      ctx.fillRect(mapX + enemy.x * tileW - 1.5, mapY + enemy.y * tileH - 1.5, 3, 3);
    }
  }

  ctx.save();
  ctx.translate(mapX + state.player.x * tileW, mapY + state.player.y * tileH);
  ctx.rotate(state.player.angle);
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(4, 0);
  ctx.lineTo(-3, -2.5);
  ctx.lineTo(-1, 0);
  ctx.lineTo(-3, 2.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function renderWeapon() {
  const bob = Math.sin(performance.now() * 0.008) * 4;
  const flash = state.muzzleFlash > 0;
  const pitchLift = state.player.pitch * 120;
  const recoilKick = state.recoil * 14;
  const gripY = HEIGHT - 94 + bob - pitchLift + recoilKick;
  const muzzle = getMuzzleAnchor();

  const weaponKey = state.equippedGun;
  const bodyColor = weaponKey === "shotgun" ? "#4e3d2e" : weaponKey === "sniper_rifle" ? "#263343" : "#202d39";
  const accentColor = weaponKey === "machinegun" ? "rgba(110, 220, 255, 0.26)" : weaponKey === "shotgun" ? "rgba(255, 196, 108, 0.24)" : weaponKey === "sniper_rifle" ? "rgba(205, 165, 255, 0.24)" : "rgba(149, 255, 214, 0.22)";

  ctx.fillStyle = "#111821";
  ctx.beginPath();
  ctx.moveTo(WIDTH * 0.43, gripY + 48);
  ctx.lineTo(WIDTH * 0.5, gripY + 26);
  ctx.lineTo(WIDTH * 0.55, gripY + 84);
  ctx.lineTo(WIDTH * 0.49, gripY + 96);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(WIDTH * 0.46, gripY + 24);
  ctx.lineTo(WIDTH * 0.62, gripY - 6);
  ctx.lineTo(weaponKey === "sniper_rifle" ? WIDTH * 0.79 : weaponKey === "shotgun" ? WIDTH * 0.71 : WIDTH * 0.72, gripY + 12);
  ctx.lineTo(WIDTH * 0.56, gripY + 40);
  ctx.closePath();
  ctx.fill();

  if (weaponKey === "machinegun") {
    ctx.fillStyle = "#31424f";
    ctx.fillRect(WIDTH * 0.49, gripY + 6, WIDTH * 0.18, 15);
    ctx.fillRect(WIDTH * 0.6, gripY - 4, WIDTH * 0.11, 11);
    ctx.fillRect(WIDTH * 0.65, gripY + 12, WIDTH * 0.08, 8);
    ctx.fillStyle = "#0e1319";
    ctx.fillRect(WIDTH * 0.53, gripY + 10, WIDTH * 0.05, 46);
  } else if (weaponKey === "shotgun") {
    ctx.fillStyle = "#7c6c58";
    ctx.fillRect(WIDTH * 0.5, gripY + 7, WIDTH * 0.16, 15);
    ctx.fillRect(WIDTH * 0.6, gripY - 2, WIDTH * 0.12, 12);
    ctx.fillRect(WIDTH * 0.645, gripY + 10, WIDTH * 0.07, 11);
    ctx.fillStyle = "#2d2017";
    ctx.fillRect(WIDTH * 0.52, gripY + 18, WIDTH * 0.04, 44);
  } else if (weaponKey === "sniper_rifle") {
    ctx.fillStyle = "#44556d";
    ctx.fillRect(WIDTH * 0.49, gripY + 7, WIDTH * 0.22, 13);
    ctx.fillRect(WIDTH * 0.61, gripY - 6, WIDTH * 0.15, 9);
    ctx.fillRect(WIDTH * 0.67, gripY + 7, WIDTH * 0.12, 7);
    ctx.fillStyle = "#0e1319";
    ctx.fillRect(WIDTH * 0.55, gripY + 10, WIDTH * 0.04, 42);
    ctx.fillStyle = "#3f2f50";
    ctx.fillRect(WIDTH * 0.56, gripY - 10, WIDTH * 0.07, 8);
  } else {
    ctx.fillStyle = "#31424f";
    ctx.fillRect(WIDTH * 0.5, gripY + 6, WIDTH * 0.15, 15);
    ctx.fillRect(WIDTH * 0.58, gripY - 3, WIDTH * 0.12, 11);
    ctx.fillRect(WIDTH * 0.63, gripY + 10, WIDTH * 0.095, 9);
    ctx.fillStyle = "#617684";
    ctx.fillRect(WIDTH * 0.66, gripY - 1, WIDTH * 0.07, 10);
    ctx.fillStyle = "#0e1319";
    ctx.fillRect(WIDTH * 0.52, gripY + 10, WIDTH * 0.045, 40);
  }

  ctx.fillStyle = accentColor;
  ctx.fillRect(WIDTH * 0.54, gripY + 9, WIDTH * 0.07, 5);
  ctx.fillRect(WIDTH * 0.605, gripY + 1, WIDTH * 0.045, 4);

  ctx.fillStyle = "rgba(10, 14, 18, 0.36)";
  ctx.beginPath();
  ctx.ellipse(WIDTH * 0.59, gripY + 90, 86, 14, -0.12, 0, Math.PI * 2);
  ctx.fill();

  if (flash) {
    const flashGradient = ctx.createRadialGradient(muzzle.x, muzzle.y, 0, muzzle.x, muzzle.y, 52);
    flashGradient.addColorStop(0, "rgba(255, 244, 177, 0.96)");
    flashGradient.addColorStop(0.36, "rgba(255, 190, 76, 0.8)");
    flashGradient.addColorStop(1, "rgba(255, 130, 40, 0)");
    ctx.fillStyle = flashGradient;
    ctx.beginPath();
    ctx.arc(muzzle.x, muzzle.y, 52, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderCrosshair() {
  ctx.strokeStyle = "rgba(237, 247, 243, 0.82)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(WIDTH / 2 - 10, HALF_HEIGHT);
  ctx.lineTo(WIDTH / 2 + 10, HALF_HEIGHT);
  ctx.moveTo(WIDTH / 2, HALF_HEIGHT - 10);
  ctx.lineTo(WIDTH / 2, HALF_HEIGHT + 10);
  ctx.stroke();
  ctx.strokeStyle = "rgba(149, 255, 214, 0.32)";
  ctx.beginPath();
  ctx.arc(WIDTH / 2, HALF_HEIGHT, 16, 0, Math.PI * 2);
  ctx.stroke();
}

function renderOverlay() {
  if (state.hurtFlash > 0) {
    ctx.fillStyle = `rgba(255, 70, 70, ${state.hurtFlash * 0.28})`;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

  if (state.status === "playing") {
    ctx.strokeStyle = "rgba(149, 255, 214, 0.08)";
    ctx.strokeRect(10, 10, WIDTH - 20, HEIGHT - 20);

    if (getMapDef().effects.heatWave) {
      const pulse = (Math.sin(performance.now() * 0.0032) + 1) * 0.5;
      ctx.fillStyle = `rgba(255, 122, 68, ${pulse * 0.06})`;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
  }

  if (state.status === "title" || state.status === "paused" || state.status === "won" || state.status === "lost") {
    ctx.fillStyle = "rgba(2, 6, 9, 0.7)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.textAlign = "center";
    ctx.fillStyle = "#edf7f3";
    ctx.font = "700 42px Trebuchet MS";

    if (state.status === "title") ctx.fillText("Echo Vault 3D", WIDTH / 2, HEIGHT / 2 - 92);
    if (state.status === "paused") ctx.fillText("Paused", WIDTH / 2, HEIGHT / 2 - 92);
    if (state.status === "won") ctx.fillText("Vault Cleared", WIDTH / 2, HEIGHT / 2 - 92);
    if (state.status === "lost") ctx.fillText("Run Failed", WIDTH / 2, HEIGHT / 2 - 92);

    ctx.font = "22px Trebuchet MS";
    ctx.fillStyle = "#9ab8b0";
    const diff = getDifficulty().label;
    const map = getMapDef().name;
    const weapon = getWeaponDef().name;
    const lines = [];
    if (state.status === "title") {
      lines.push("Collect all four power cores, survive the sentries, and reach extraction.");
      lines.push(`Map: ${map}  |  Weapon: ${weapon}  |  Credits: ${state.credits}`);
      lines.push(`Difficulty: ${diff}  |  Use the lobby buttons to deploy, shop, and swap maps.`);
    } else if (state.status === "paused") {
      lines.push(`Map: ${map}  |  Weapon: ${weapon}`);
      lines.push(`Difficulty: ${diff}  |  Press 1, 2, or 3 to change for the next run.`);
      lines.push("Press Esc to resume.");
    } else if (state.status === "won") {
      lines.push(`Map: ${map} cleared. Credits: ${state.credits}`);
      lines.push("Use the shop or deploy again.");
    } else {
      lines.push(`Weapon: ${weapon}  |  Credits: ${state.credits}`);
      lines.push("Use the shop, change maps, or redeploy.");
    }

    lines.forEach((line, index) => ctx.fillText(line, WIDTH / 2, HEIGHT / 2 - 24 + index * 30));
  }
}

function render() {
  renderBackground();
  renderWalls();
  renderHazards();
  renderSprites();
  renderCrosshair();
  renderProjectiles();
  renderCombatEffects();
  renderWeapon();
  renderMinimap();
  renderOverlay();
}

let lastFrame = performance.now();

function frame(now) {
  const dt = Math.min(0.033, (now - lastFrame) / 1000);
  lastFrame = now;

  if (state.status === "playing") {
    state.timeLeft -= dt;
    state.cooldown = Math.max(0, state.cooldown - dt);
    state.hurtFlash = Math.max(0, state.hurtFlash - dt);
    state.muzzleFlash = Math.max(0, state.muzzleFlash - dt);
    state.recoil = Math.max(0, state.recoil - dt * 6);
    updateDoors(dt);
    updateHazards(dt);
    updateProjectiles(dt);
    updateEnemyProjectiles(dt);
    updateCombatEffects(dt);

    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.status = "lost";
      state.message = "Vault sealed shut. Press Enter to redeploy.";
      syncHud();
    } else {
      updatePlayer(dt);
      updateEnemies(dt);
      hud.time.textContent = state.timeLeft.toFixed(1);
      hud.health.textContent = `${Math.max(0, Math.ceil(state.health))}${state.shield > 0 ? ` +${Math.ceil(state.shield)}` : ""}`;
    }
  }

  render();
  requestAnimationFrame(frame);
}

function setDifficultyByKey(code) {
  if (code === "Digit1") state.difficulty = "rookie";
  if (code === "Digit2") state.difficulty = "operative";
  if (code === "Digit3") state.difficulty = "nightmare";
  if (state.status !== "playing") {
    state.message = `Difficulty set to ${getDifficulty().label}.`;
    syncHud();
    renderLoadoutPanel();
  }
}

function cycleMap() {
  const ids = Object.keys(MAPS);
  const index = ids.indexOf(state.mapId);
  state.mapId = ids[(index + 1) % ids.length];
  state.message = `Selected ${getMapDef().name}.`;
  syncHud();
  renderLoadoutPanel();
}

function toggleShop() {
  state.menuMode = state.menuMode === "shop" ? "briefing" : "shop";
  renderLoadoutPanel();
}

function handleGunAction(gunKey) {
  const weapon = WEAPONS[gunKey];
  if (!weapon) return;
  if (!state.ownedGuns[gunKey]) {
    if (state.credits < weapon.price) return;
    state.credits -= weapon.price;
    state.ownedGuns[gunKey] = true;
  }
  state.equippedGun = gunKey;
  state.message = `${weapon.name} equipped.`;
  syncHud();
  renderLoadoutPanel();
}

document.addEventListener("keydown", (event) => {
  keys.add(event.code);
  if (event.code === "Enter" && state.status !== "playing") {
    resetGame();
    updateActionButtons();
  }
  if (event.code === "Escape") {
    if (state.status === "playing") {
      state.status = "paused";
      state.message = "Run paused.";
      document.exitPointerLock?.();
      syncHud();
      updateActionButtons();
    } else if (state.status === "paused") {
      state.status = "playing";
      state.message = "Run resumed.";
      syncHud();
      updateActionButtons();
    }
  }
  if (event.code === "KeyR") {
    resetGame();
  }
  if (event.code === "Digit1" || event.code === "Digit2" || event.code === "Digit3") {
    setDifficultyByKey(event.code);
  }
});

document.addEventListener("keyup", (event) => {
  keys.delete(event.code);
});

canvas.addEventListener("click", () => {
  if (state.status === "title") {
    resetGame();
    updateActionButtons();
  }
  if (state.status === "playing" && document.pointerLockElement !== canvas) {
    canvas.requestPointerLock();
  }
});

document.addEventListener("mousedown", () => {
  if (state.status === "playing") {
    ensureAudio();
  }
  if (document.pointerLockElement === canvas && state.status === "playing") {
    shoot();
  }
});

document.addEventListener("mousemove", (event) => {
  if (document.pointerLockElement === canvas && state.status === "playing") {
    state.player.angle += event.movementX * TURN_SPEED;
    state.player.pitch = clamp(state.player.pitch - event.movementY * PITCH_SPEED, -1.05, 1.05);
  }
});

document.addEventListener("pointerlockchange", () => {
  if (document.pointerLockElement === canvas && state.status === "playing") {
    state.message = `Vault live. ${getWeaponDef().name} online.`;
  } else if (state.status === "playing") {
    state.message = "Click the viewport to re-enter combat.";
  }
  syncHud();
});

ui.deployBtn.addEventListener("click", () => {
  if (state.status !== "playing") {
    resetGame();
    updateActionButtons();
  }
});

ui.shopBtn.addEventListener("click", () => {
  if (state.status !== "playing") {
    toggleShop();
  }
});

ui.mapsBtn.addEventListener("click", () => {
  if (state.status !== "playing") {
    cycleMap();
  }
});

ui.loadoutPanel.addEventListener("click", (event) => {
  const button = event.target.closest("[data-gun-action]");
  if (!button || state.status === "playing") return;
  handleGunAction(button.dataset.gunAction);
});

syncHud();
renderLoadoutPanel();
updateActionButtons();
requestAnimationFrame(frame);
